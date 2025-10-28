/**
 * 應用程式常數定義
 */

// 驗證規則
export const VALIDATION = {
  JOIN_CODE_LENGTH: 6,
  NICKNAME_MIN_LENGTH: 2,
  NICKNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_MAX_LENGTH: 255,
  DISPLAY_NAME_MAX_LENGTH: 100,
} as const;

// React Query 快取鍵
export const QUERY_KEYS = {
  EVENTS: 'events',
  EVENT: 'event',
  QUIZZES: 'quizzes',
  QUIZ: 'quiz',
  QUIZ_QUESTIONS: 'quiz-questions',
} as const;

// 本地儲存鍵
export const STORAGE_KEYS = {
  PARTICIPANT_EVENT_ID: 'participant_event_id',
  PARTICIPANT_ID: 'participant_id',
} as const;

// 事件模式
export const EVENT_MODES = {
  LOBBY: 'lobby',
  QNA: 'qna',
  POLL: 'poll',
  QUIZ: 'quiz',
} as const;

// 事件類型
export const EVENT_TYPES = {
  QNA: 'qna',
  QUIZ: 'quiz',
} as const;
