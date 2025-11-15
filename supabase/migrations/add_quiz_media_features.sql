-- 為 quiz_questions 添加圖片 URL 欄位
ALTER TABLE quiz_questions
ADD COLUMN image_url TEXT;

-- 創建 quiz_content_slides 表（用於內容穿插/串場）
CREATE TABLE quiz_content_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  content_order INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT,
  youtube_url TEXT,
  duration INTEGER DEFAULT 10, -- 顯示秒數，預設 10 秒
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 建立索引
CREATE INDEX idx_quiz_content_slides_quiz_id ON quiz_content_slides(quiz_id);
CREATE INDEX idx_quiz_content_slides_order ON quiz_content_slides(quiz_id, content_order);

-- 添加 RLS 策略
ALTER TABLE quiz_content_slides ENABLE ROW LEVEL SECURITY;

-- 主持人可以管理自己活動的內容穿插
CREATE POLICY "Hosts can manage their quiz content slides"
  ON quiz_content_slides
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN events e ON q.event_id = e.id
      WHERE q.id = quiz_content_slides.quiz_id
      AND e.host_id = auth.uid()
    )
  );

-- 參與者可以讀取活動的內容穿插
CREATE POLICY "Participants can view quiz content slides"
  ON quiz_content_slides
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN events e ON q.event_id = e.id
      JOIN event_participants ep ON e.id = ep.event_id
      WHERE q.id = quiz_content_slides.quiz_id
      AND ep.user_id = auth.uid()
    )
  );

-- 添加註釋
COMMENT ON TABLE quiz_content_slides IS '測驗內容穿插/串場卡片，可包含圖片或 YouTube 影片';
COMMENT ON COLUMN quiz_questions.image_url IS '題目輔助圖片 URL';
COMMENT ON COLUMN quiz_content_slides.content_order IS '內容順序（與 question_order 搭配使用）';
COMMENT ON COLUMN quiz_content_slides.duration IS '內容顯示秒數';
COMMENT ON COLUMN quiz_content_slides.youtube_url IS 'YouTube 影片網址';
