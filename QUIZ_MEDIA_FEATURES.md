# Quiz 媒體功能說明

## 新功能概述

Quiz 功能已升級支援以下新特性：

###  1. 選擇題圖片輔助
- 在新增或編輯選擇題時，可以上傳圖片作為輔助
- 支援兩種方式：上傳本地圖片 或 貼上圖片網址
- 圖片會顯示在題目上方，幫助參與者更好理解題目

### 2. 內容穿插功能
- 可以在測驗中插入非題目的展示內容（串場、說明等）
- 支援以下內容類型：
  - 標題文字
  - 說明文字
  - 圖片
  - YouTube 影片（自動嵌入）
- 可設定顯示時長（5-60 秒）

## 資料庫變更

需要執行以下 SQL 遷移：

```sql
-- 檔案：supabase/migrations/add_quiz_media_features.sql
```

這會：
1. 為 `quiz_questions` 表添加 `image_url` 欄位
2. 創建新表 `quiz_content_slides` 存放內容穿插

## 使用方式

### 在選擇題中添加圖片

1. 點擊「新增題目」或編輯現有題目
2. 填寫題目內容
3. 在「輔助圖片（選填）」區域：
   - **上傳圖片**：點擊上傳區域，選擇圖片檔案（最大 5MB）
   - **貼上網址**：切換到「貼上網址」，輸入圖片完整 URL
4. 圖片會顯示預覽，可隨時刪除
5. 儲存題目

### 新增內容穿插

1. 在 Quiz 編輯頁面點擊「**新增內容穿插**」按鈕
2. 填寫以下內容（至少一項）：
   - **標題**：大標題文字（最多 100 字）
   - **說明文字**：詳細說明或串場文字（最多 500 字）
   - **圖片**：上傳或貼上圖片網址
   - **YouTube 影片**：貼上 YouTube 影片連結
3. 設定顯示時長（預設 10 秒）
4. 儲存內容

### YouTube 影片支援

支援以下格式的 YouTube 連結：
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

系統會自動轉換為嵌入格式並顯示預覽。

## 圖片儲存

圖片上傳到 Supabase Storage 的 `quiz-images` bucket：
- 自動生成唯一檔名
- 檔案大小限制：5MB
- 支援格式：JPG, PNG, GIF 等所有圖片格式

### 設定 Supabase Storage

1. 在 Supabase 控制台創建 Storage bucket：
   - Bucket 名稱：`quiz-images`
   - 設為 Public bucket（允許公開讀取）

2. 設定 Storage 政策：
```sql
-- 允許已認證使用者上傳
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quiz-images');

-- 允許所有人讀取
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'quiz-images');

-- 允許上傳者刪除自己的圖片
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'quiz-images' AND auth.uid() = owner);
```

## 組件說明

### 新增組件

1. **ImageUpload** (`src/components/ui/image-upload.tsx`)
   - 圖片上傳組件
   - 支援上傳和貼上網址兩種模式
   - 自動預覽和錯誤處理

2. **ContentSlideEditor** (`src/components/quiz/ContentSlideEditor.tsx`)
   - 內容穿插編輯器
   - 支援標題、說明、圖片和 YouTube 影片
   - 即時預覽 YouTube 影片

### 更新組件

1. **QuestionEditor**
   - 新增圖片上傳區域
   - 更新資料結構包含 `image_url`

2. **QuizEditor**
   - 新增「新增內容穿插」按鈕
   - 整合內容穿插管理

## 資料結構

### QuizQuestion（更新）

```typescript
interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: Array<{
    id: number;
    text: string;
    isCorrect: boolean;
  }>;
  question_order: number;
  time_limit: number;
  points: number;
  image_url?: string; // 新增
  created_at: string;
}
```

### ContentSlide（新增）

```typescript
interface ContentSlide {
  id: string;
  quiz_id: string;
  content_order: number;
  title?: string;
  description?: string;
  image_url?: string;
  youtube_url?: string;
  duration: number;
  created_at: string;
}
```

## Hooks API

### 題目相關（更新）

- `useQuizQuestions(quizId)` - 獲取題目列表（現包含 image_url）
- `useCreateQuestion()` - 新增題目（支援 image_url）
- `useUpdateQuestion()` - 更新題目（支援 image_url）
- `useDeleteQuestion()` - 刪除題目

### 內容穿插相關（新增）

- `useContentSlides(quizId)` - 獲取內容穿插列表
- `useCreateContentSlide()` - 新增內容穿插
- `useUpdateContentSlide()` - 更新內容穿插
- `useDeleteContentSlide()` - 刪除內容穿插

## 使用場景

### 教育測驗
- 題目中添加示意圖、圖表
- 穿插知識點講解影片
- 添加激勵性質的串場卡片

### 互動活動
- 添加活動主視覺圖片
- 穿插贊助商 Logo 或宣傳
- 播放活動精華影片

### 企業培訓
- 題目附上產品圖片
- 穿插教學影片
- 添加政策說明卡片

## 注意事項

1. **圖片大小**：建議圖片寬度 800-1200px，確保清晰度
2. **YouTube 影片**：確保影片為公開或不公開（但可嵌入）
3. **顯示時長**：內容穿插的時長會影響整體測驗時間
4. **權限**：只有測驗創建者可以編輯題目和內容穿插
5. **Storage 配額**：注意 Supabase Storage 的使用配額

## 未來擴展

可能的功能增強：
- 支援圖片編輯（裁切、調整大小）
- 支援更多影片平台（Vimeo、Bilibili）
- 題目選項也能添加圖片
- 內容穿插支援音訊檔案
- 拖放排序功能（題目與內容穿插混合排序）

## 故障排除

### 圖片上傳失敗
- 檢查 Supabase Storage bucket 是否正確設定
- 確認圖片大小不超過 5MB
- 檢查網路連線

### YouTube 影片無法顯示
- 確認影片為公開或可嵌入
- 檢查網址格式是否正確
- 某些影片可能限制嵌入

### 圖片無法顯示
- 檢查圖片 URL 是否有效
- 確認 Storage bucket 為 Public
- 檢查瀏覽器控制台錯誤訊息

## 技術架構

- **前端**：React + TypeScript
- **UI 組件**：shadcn/ui
- **狀態管理**：TanStack Query (React Query)
- **儲存**：Supabase Storage
- **資料庫**：Supabase PostgreSQL

## 支援

如有問題或建議，請聯繫開發團隊。
