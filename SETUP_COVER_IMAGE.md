# 封面圖片功能設置說明

本文件說明如何設置封面圖片上傳功能所需的數據庫和 Storage 配置。

## 1. 數據庫 Schema 更新

需要在 `events` 表中添加 `cover_image_url` 欄位：

```sql
-- 添加封面圖片 URL 欄位
ALTER TABLE events
ADD COLUMN cover_image_url TEXT;

-- 添加註解
COMMENT ON COLUMN events.cover_image_url IS '活動封面圖片 URL';
```

## 2. Supabase Storage 設置

### 創建 Storage Bucket

1. 前往 Supabase Dashboard
2. 選擇 Storage 選單
3. 點擊「New bucket」
4. 設置如下：
   - Name: `event-images`
   - Public bucket: ✅ (勾選)
   - File size limit: 5 MB
   - Allowed MIME types: `image/*`

### 設置 Storage Policies

為了讓用戶可以上傳和刪除自己的圖片，需要設置 RLS 策略：

```sql
-- 允許已認證用戶上傳圖片
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- 允許所有人讀取圖片（因為是公開 bucket）
CREATE POLICY "Public can view event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- 允許用戶刪除自己上傳的圖片
CREATE POLICY "Users can delete their own event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images' AND auth.uid() = owner);
```

## 3. 功能說明

### 封面圖片上傳

- **位置**: CreateEvent 頁面
- **格式**: 支援所有圖片格式 (JPEG, PNG, GIF, WebP 等)
- **大小限制**: 5 MB
- **建議尺寸**: 1200 x 675 px (16:9 比例)
- **功能**:
  - 拖曳上傳
  - 點擊選擇
  - 預覽
  - 更換/移除

### 封面圖片顯示

- **Dashboard**: 活動卡片顯示封面（如果沒有封面則顯示預設漸層背景）
- **EventDetail**: 可在未來添加封面編輯功能

## 4. 參與者頭像

已創建 `ParticipantAvatar` 組件，可用於：
- 參與者列表
- 排行榜
- 聊天訊息
- Q&A 問題顯示

### 使用方式

```tsx
import { ParticipantAvatar } from '@/components/ParticipantAvatar';

// 使用頭像圖片
<ParticipantAvatar
  name="王小明"
  imageUrl="https://..."
  size="md"
/>

// 使用首字母頭像（自動生成顏色）
<ParticipantAvatar
  name="王小明"
  size="lg"
/>
```

### 尺寸選項
- `sm`: 32px (適合列表)
- `md`: 40px (預設)
- `lg`: 48px (適合詳情頁)
- `xl`: 64px (適合個人資料)

## 5. 後續改進建議

1. **圖片優化**
   - 自動壓縮上傳的圖片
   - 生成多種尺寸的縮圖
   - 使用 WebP 格式

2. **編輯功能**
   - 在 EventDetail 頁面添加封面編輯功能
   - 圖片裁切功能

3. **參與者頭像上傳**
   - 讓參與者可以上傳自己的頭像
   - 整合到參與者個人資料設置

4. **圖片管理**
   - 清理未使用的圖片
   - 定期壓縮舊圖片
   - 圖片使用統計
