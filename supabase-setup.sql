-- LivePulse Supabase 資料庫完整設置
-- 請在 Supabase SQL Editor 中執行此檔案

-- =====================================================
-- 1. 建立資料表
-- =====================================================

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

-- 增加問題投票數
CREATE OR REPLACE FUNCTION increment_upvote_count(question_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE questions
  SET upvote_count = upvote_count + 1
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- 減少問題投票數
CREATE OR REPLACE FUNCTION decrement_upvote_count(question_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE questions
  SET upvote_count = GREATEST(0, upvote_count - 1)
  WHERE id = question_id;
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
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvote_count INTEGER DEFAULT 0,
  is_highlighted BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'answered', 'rejected')),
  answered_at TIMESTAMPTZ,
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
  selected_options JSONB,
  text_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. 設定 Row Level Security (RLS) 政策
-- =====================================================

-- 啟用 RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;

-- user_roles 政策
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- events 政策
CREATE POLICY "Anyone can view active events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Hosts can insert their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = host_id);

-- event_participants 政策
CREATE POLICY "Anyone can view participants"
  ON event_participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert participants"
  ON event_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participants can update their own data"
  ON event_participants FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- quizzes 政策
CREATE POLICY "Anyone can view quizzes"
  ON quizzes FOR SELECT
  USING (true);

CREATE POLICY "Event hosts can manage quizzes"
  ON quizzes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE events.id = quizzes.event_id
    AND events.host_id = auth.uid()
  ));

-- quiz_questions 政策
CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Event hosts can manage quiz questions"
  ON quiz_questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM quizzes
    JOIN events ON events.id = quizzes.event_id
    WHERE quizzes.id = quiz_questions.quiz_id
    AND events.host_id = auth.uid()
  ));

-- quiz_responses 政策
CREATE POLICY "Anyone can view quiz responses"
  ON quiz_responses FOR SELECT
  USING (true);

CREATE POLICY "Participants can insert their responses"
  ON quiz_responses FOR INSERT
  WITH CHECK (true);

-- questions 政策
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Participants can insert questions"
  ON questions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Event hosts can update questions"
  ON questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE events.id = questions.event_id
    AND events.host_id = auth.uid()
  ));

CREATE POLICY "Event hosts can delete questions"
  ON questions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE events.id = questions.event_id
    AND events.host_id = auth.uid()
  ));

-- question_upvotes 政策
CREATE POLICY "Anyone can view upvotes"
  ON question_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Participants can insert upvotes"
  ON question_upvotes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participants can delete their own upvotes"
  ON question_upvotes FOR DELETE
  USING (participant_id IN (
    SELECT id FROM event_participants WHERE user_id = auth.uid()
  ));

-- polls 政策
CREATE POLICY "Anyone can view polls"
  ON polls FOR SELECT
  USING (true);

CREATE POLICY "Event hosts can manage polls"
  ON polls FOR ALL
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE events.id = polls.event_id
    AND events.host_id = auth.uid()
  ));

-- poll_responses 政策
CREATE POLICY "Anyone can view poll responses"
  ON poll_responses FOR SELECT
  USING (true);

CREATE POLICY "Participants can insert poll responses"
  ON poll_responses FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 3. 啟用 Realtime
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE questions;
ALTER PUBLICATION supabase_realtime ADD TABLE question_upvotes;
ALTER PUBLICATION supabase_realtime ADD TABLE polls;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_responses;

-- =====================================================
-- 4. 建立索引（提升查詢效能）
-- =====================================================

CREATE INDEX idx_events_host_id ON events(host_id);
CREATE INDEX idx_events_join_code ON events(join_code);
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_quizzes_event_id ON quizzes(event_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_questions_event_id ON questions(event_id);
CREATE INDEX idx_polls_event_id ON polls(event_id);
