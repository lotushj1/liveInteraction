# LivePulse 部署指南 - Zeabur

本指南將協助你將 LivePulse 即時互動平台部署到 Zeabur。

## 📋 前置準備

### 1. Supabase 專案設定

在開始部署前，你需要先設定 Supabase 後端：

1. **建立 Supabase 專案**
   - 前往 [Supabase Dashboard](https://supabase.com/dashboard)
   - 點擊 "New Project"
   - 填寫專案資訊並建立專案

2. **設定資料庫 Schema**

   你需要在 Supabase SQL Editor 中執行以下 SQL 來建立資料表：

   ```sql
   -- 使用者角色表
   CREATE TABLE user_roles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     role TEXT NOT NULL CHECK (role IN ('host', 'participant')),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(user_id, role)
   );

   -- 活動表
   CREATE TABLE events (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT,
     join_code TEXT UNIQUE NOT NULL,
     is_active BOOLEAN DEFAULT false,
     event_type TEXT CHECK (event_type IN ('qna', 'quiz')),
     qna_enabled BOOLEAN DEFAULT true,
     current_mode TEXT DEFAULT 'lobby' CHECK (current_mode IN ('lobby', 'qna', 'poll', 'quiz')),
     current_quiz_id UUID,
     current_poll_id UUID,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW(),
     started_at TIMESTAMPTZ,
     ended_at TIMESTAMPTZ
   );

   -- Join Code 生成函數
   CREATE OR REPLACE FUNCTION generate_join_code()
   RETURNS TEXT AS $$
   BEGIN
     RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
   END;
   $$ LANGUAGE plpgsql;

   -- 活動表 trigger（自動生成 join code）
   CREATE OR REPLACE FUNCTION set_join_code()
   RETURNS TRIGGER AS $$
   BEGIN
     IF NEW.join_code IS NULL OR NEW.join_code = '' THEN
       NEW.join_code := generate_join_code();
       WHILE EXISTS (SELECT 1 FROM events WHERE join_code = NEW.join_code) LOOP
         NEW.join_code := generate_join_code();
       END LOOP;
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER before_insert_event
   BEFORE INSERT ON events
   FOR EACH ROW
   EXECUTE FUNCTION set_join_code();

   -- 參與者表
   CREATE TABLE event_participants (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     event_id UUID REFERENCES events(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
     nickname TEXT NOT NULL,
     joined_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(event_id, nickname)
   );

   -- 測驗表
   CREATE TABLE quizzes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     event_id UUID REFERENCES events(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     is_active BOOLEAN DEFAULT false,
     current_question_index INTEGER DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- 測驗題目表
   CREATE TABLE quiz_questions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
     question_text TEXT NOT NULL,
     options JSONB NOT NULL,
     question_order INTEGER NOT NULL,
     time_limit INTEGER DEFAULT 30,
     points INTEGER DEFAULT 100,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- 測驗回答表
   CREATE TABLE quiz_responses (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
     question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
     participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
     selected_option_id INTEGER NOT NULL,
     is_correct BOOLEAN NOT NULL,
     response_time INTEGER NOT NULL,
     points_earned INTEGER DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Q&A 問題表
   CREATE TABLE questions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     event_id UUID REFERENCES events(id) ON DELETE CASCADE,
     participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     upvote_count INTEGER DEFAULT 0,
     is_highlighted BOOLEAN DEFAULT false,
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'answered', 'rejected')),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- 問題投票表
   CREATE TABLE question_upvotes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
     participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(question_id, participant_id)
   );

   -- 投票表
   CREATE TABLE polls (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     event_id UUID REFERENCES events(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     poll_type TEXT CHECK (poll_type IN ('single', 'multiple', 'word_cloud', 'rating')),
     options JSONB,
     is_active BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     ended_at TIMESTAMPTZ
   );

   -- 投票回應表
   CREATE TABLE poll_responses (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
     participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
     response JSONB NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(poll_id, participant_id)
   );

   -- 使用者個人資料表（可選）
   CREATE TABLE profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     display_name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **設定 Row Level Security (RLS)**

   為了安全性，需要啟用 RLS 並設定政策：

   ```sql
   -- 啟用 RLS
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;
   ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
   ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE question_upvotes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
   ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;

   -- Events 政策
   CREATE POLICY "Host 可以建立活動" ON events
     FOR INSERT TO authenticated
     WITH CHECK (auth.uid() = host_id);

   CREATE POLICY "所有人可以讀取啟用的活動" ON events
     FOR SELECT TO authenticated, anon
     USING (is_active = true OR host_id = auth.uid());

   CREATE POLICY "Host 可以更新自己的活動" ON events
     FOR UPDATE TO authenticated
     USING (host_id = auth.uid());

   CREATE POLICY "Host 可以刪除自己的活動" ON events
     FOR DELETE TO authenticated
     USING (host_id = auth.uid());

   -- Event Participants 政策
   CREATE POLICY "任何人都可以加入活動" ON event_participants
     FOR INSERT TO authenticated, anon
     WITH CHECK (true);

   CREATE POLICY "參與者可以看到同活動的其他參與者" ON event_participants
     FOR SELECT TO authenticated, anon
     USING (true);

   -- 其他表格的政策類似設定...
   ```

4. **獲取 Supabase 憑證**
   - 在 Supabase Dashboard，前往 `Settings` > `API`
   - 複製以下資訊：
     - **Project URL** (例如：`https://xxxxx.supabase.co`)
     - **anon/public key**

### 2. Zeabur 帳號

- 前往 [Zeabur](https://zeabur.com) 註冊帳號
- 連接你的 GitHub 帳號

## 🚀 部署步驟

### 方法 1: 使用 Zeabur Dashboard（推薦）

1. **登入 Zeabur**
   - 前往 [Zeabur Dashboard](https://dash.zeabur.com)
   - 使用 GitHub 登入

2. **建立新專案**
   - 點擊 "Create Project"
   - 選擇專案區域（建議選擇離你用戶最近的區域）

3. **新增服務**
   - 點擊 "Add Service"
   - 選擇 "GitHub"
   - 選擇你的 `liveInteraction` repository
   - Zeabur 會自動檢測到這是 Vite 專案

4. **配置環境變數**
   - 在服務設定中，找到 "Environment Variables"
   - 新增以下環境變數：
     ```
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
     ```

5. **等待部署完成**
   - Zeabur 會自動開始建置和部署
   - 完成後會提供一個 `.zeabur.app` 的網址

6. **綁定自訂域名（可選）**
   - 在服務設定中，找到 "Domain"
   - 可以綁定你自己的域名

### 方法 2: 使用 Zeabur CLI

1. **安裝 Zeabur CLI**
   ```bash
   npm install -g @zeabur/cli
   ```

2. **登入**
   ```bash
   zeabur auth login
   ```

3. **初始化專案**
   ```bash
   cd /path/to/liveInteraction
   zeabur init
   ```

4. **設定環境變數**
   ```bash
   zeabur env set VITE_SUPABASE_URL https://your-project-id.supabase.co
   zeabur env set VITE_SUPABASE_PUBLISHABLE_KEY your-anon-key-here
   ```

5. **部署**
   ```bash
   zeabur deploy
   ```

## 🔧 進階配置

### 自動部署

Zeabur 支援自動部署，每次你推送到 GitHub 的特定分支時會自動重新部署：

1. 在 Zeabur Dashboard 中選擇你的服務
2. 前往 "Git" 設定
3. 選擇要監聽的分支（例如 `main` 或 `master`）
4. 啟用 "Auto Deploy"

### 自訂建置命令

如果需要自訂建置流程，可以修改 `zbpack.json`：

```json
{
  "build_command": "npm run build",
  "output_dir": "dist",
  "install_command": "npm install",
  "framework": "vite"
}
```

### 效能優化

1. **啟用 CDN**
   - Zeabur 會自動為你的靜態資源啟用 CDN

2. **環境變數快取**
   - 環境變數會在建置時注入，更改後需要重新部署

## 📝 部署檢查清單

部署完成後，請確認以下項目：

- [ ] 網站可以正常訪問
- [ ] 主持人可以註冊和登入
- [ ] 可以建立活動
- [ ] 參與者可以使用 Join Code 加入
- [ ] 即時功能正常運作（問答、投票等）
- [ ] 檢查 Supabase Realtime 連線狀態
- [ ] 測試所有互動模式（Quiz、Q&A、Poll）

## 🐛 常見問題排解

### 1. 環境變數未生效

**問題**：部署後顯示 Supabase 連線錯誤

**解決方案**：
- 確認環境變數名稱以 `VITE_` 開頭
- 在 Zeabur Dashboard 重新確認環境變數值
- 重新部署服務

### 2. 建置失敗

**問題**：建置過程中出現錯誤

**解決方案**：
```bash
# 在本地測試建置
npm install
npm run build

# 檢查建置日誌
# 在 Zeabur Dashboard 查看詳細的建置日誌
```

### 3. Realtime 功能無法使用

**問題**：即時更新不工作

**解決方案**：
- 確認 Supabase Realtime 已啟用
- 檢查 Supabase Dashboard > Database > Replication
- 確認需要即時更新的資料表已啟用 Realtime

### 4. CORS 錯誤

**問題**：前端無法連接 Supabase

**解決方案**：
- 在 Supabase Dashboard > Authentication > URL Configuration
- 將 Zeabur 提供的網址加入 "Site URL" 和 "Redirect URLs"

## 📚 其他資源

- [Zeabur 官方文件](https://zeabur.com/docs)
- [Supabase 官方文件](https://supabase.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

## 🆘 需要協助？

如果遇到問題：
1. 檢查 Zeabur 的建置日誌
2. 檢查瀏覽器的 Console 錯誤訊息
3. 確認 Supabase 連線狀態
4. 參考本專案的 GitHub Issues

---

**祝部署順利！** 🎉
