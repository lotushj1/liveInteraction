# AI Quiz 問題生成器功能說明

## 功能概述

AI Quiz 問題生成器是一個付費會員專屬功能，使用 Anthropic Claude API 自動生成測驗問題。支援兩種模式：

1. **主題生成模式**：輸入主題（如「台灣歷史」），AI 自動生成相關問題
2. **文本解析模式**：貼上文字內容，AI 根據內容生成理解測驗題目

## 環境設定

### 1. 設定 Anthropic API Key

在專案根目錄創建 `.env` 檔案，添加以下內容：

```env
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

取得 API Key：
- 訪問 https://console.anthropic.com/
- 註冊並創建 API Key
- 複製 Key 到 `.env` 檔案

### 2. 啟用付費會員功能（測試用）

目前使用 localStorage 模擬會員狀態。在瀏覽器控制台執行：

```javascript
localStorage.setItem('membership_tier', 'premium');
```

然後重新整理頁面。

要切換回免費版：

```javascript
localStorage.setItem('membership_tier', 'free');
// 或
localStorage.removeItem('membership_tier');
```

## 使用方式

### 在 Quiz 編輯器中使用

1. 進入任一活動的測驗編輯頁面
2. 點擊「AI 生成題目」按鈕
3. 選擇生成模式：

#### 主題生成模式
- 輸入主題（例如：「JavaScript 基礎」）
- 選擇要生成的題目數量（1-10 題）
- 點擊「生成題目」

#### 文本解析模式
- 貼上要出題的文字內容
- AI 會根據內容自動生成 3-5 道題目
- 點擊「生成題目」

4. 預覽生成的題目
5. 確認無誤後點擊「添加到測驗」

## 生成的問題格式

每道問題包含：
- 題目文字
- 4 個選項（A, B, C, D）
- 正確答案標記
- 答題時限（預設 30 秒）
- 題目分數（預設 100 分）

## 會員功能限制

### 免費會員
- ❌ 無法使用 AI 生成功能
- 每月最多 10 個活動
- 每個測驗最多 20 道題目

### 付費會員
- ✅ 完整 AI 生成功能
- 每月最多 100 個活動
- 每個測驗最多 100 道題目

## 未來規劃

### 付費系統整合

目前會員狀態是模擬的，未來可以整合：

1. **Stripe 訂閱**
   - 在 Supabase 中創建 `subscriptions` 表
   - 使用 Stripe Webhooks 更新會員狀態
   - 在 `MembershipContext` 中從資料庫讀取狀態

2. **Supabase 用戶 Metadata**
   ```typescript
   // 在註冊或升級時設定
   await supabase.auth.updateUser({
     data: { membership_tier: 'premium' }
   });

   // 在 MembershipContext 中讀取
   const tier = user?.user_metadata?.membership_tier || 'free';
   ```

3. **Edge Functions 保護**
   - 創建 Supabase Edge Function 來處理 AI API 請求
   - 在伺服器端驗證會員狀態
   - 防止客戶端繞過會員檢查

## 安全性建議

### 生產環境

⚠️ **重要**：不要在客戶端直接使用 Anthropic API Key！

建議架構：
1. 創建 Supabase Edge Function
2. 在 Edge Function 中呼叫 Anthropic API
3. 在 Edge Function 中驗證使用者會員狀態
4. 限制呼叫頻率（Rate Limiting）

範例 Edge Function：

```typescript
// supabase/functions/generate-quiz/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // 驗證使用者
  const authHeader = req.headers.get('Authorization')!
  const supabaseClient = createClient(/* ... */)
  const { data: { user } } = await supabaseClient.auth.getUser(authHeader)

  // 檢查會員狀態
  const { data: membership } = await supabaseClient
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .single()

  if (membership?.tier !== 'premium') {
    return new Response('Forbidden', { status: 403 })
  }

  // 呼叫 Anthropic API
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
  // ... 生成問題邏輯
})
```

## 故障排除

### API Key 無效
- 檢查 `.env` 檔案是否正確設定
- 確認 API Key 有效且有足夠額度
- 重新啟動開發伺服器

### 無法看到 AI 生成按鈕
- 確認已設定 `membership_tier` 為 `premium`
- 重新整理頁面

### 生成失敗
- 檢查瀏覽器控制台錯誤訊息
- 確認網路連線正常
- 檢查 Anthropic API 服務狀態

## 技術架構

### 相關檔案

- `src/contexts/MembershipContext.tsx` - 會員狀態管理
- `src/components/quiz/AIQuestionGenerator.tsx` - AI 生成器組件
- `src/components/quiz/QuizEditor.tsx` - 整合 AI 生成器
- `.env.example` - 環境變數範例

### 使用的技術

- **Anthropic Claude API** - AI 問題生成
- **React Context** - 會員狀態管理
- **shadcn/ui** - UI 組件庫
- **Tailwind CSS** - 樣式設計

## 授權與費用

- Anthropic API 使用會產生費用
- 建議在生產環境設定使用限制
- 考慮為使用者設定月度配額

## 支援

如有問題或建議，請聯繫開發團隊。
