// 統一的即時事件管理系統

export enum EventPriority {
  CRITICAL = 'P0', // 主持人切換模式、Quiz 題目發布
  HIGH = 'P1',     // 答題提交、投票提交、Q&A 新問題
  MEDIUM = 'P2',   // 按讚更新、參與者加入
  LOW = 'P3',      // 統計數據更新
}

export enum RealtimeEventType {
  // 模式控制
  MODE_CHANGED = 'mode_changed',
  EVENT_STARTED = 'event_started',
  EVENT_ENDED = 'event_ended',
  
  // Quiz 相關
  QUIZ_QUESTION_PUBLISHED = 'quiz_question_published',
  QUIZ_COUNTDOWN = 'quiz_countdown',
  QUIZ_ANSWER_SUBMITTED = 'quiz_answer_submitted',
  QUIZ_RESULTS_READY = 'quiz_results_ready',
  
  // Poll 相關
  POLL_STARTED = 'poll_started',
  POLL_VOTE_SUBMITTED = 'poll_vote_submitted',
  POLL_RESULTS_UPDATED = 'poll_results_updated',
  POLL_CLOSED = 'poll_closed',
  
  // Q&A 相關
  QUESTION_SUBMITTED = 'question_submitted',
  QUESTION_UPVOTED = 'question_upvoted',
  QUESTION_HIGHLIGHTED = 'question_highlighted',
  QUESTION_ANSWERED = 'question_answered',
  
  // 參與者相關
  PARTICIPANT_JOINED = 'participant_joined',
  PARTICIPANT_LEFT = 'participant_left',
  PARTICIPANT_COUNT_UPDATED = 'participant_count_updated',
}

export interface RealtimeEvent<T = any> {
  type: RealtimeEventType;
  priority: EventPriority;
  timestamp: number;
  eventId: string;
  data: T;
  version?: number;
}

export interface ModeChangedEvent {
  eventId: string;
  newMode: 'lobby' | 'quiz' | 'poll' | 'qna';
  oldMode: 'lobby' | 'quiz' | 'poll' | 'qna';
}

export interface QuizQuestionEvent {
  questionId: string;
  quizId: string;
  questionText: string;
  options: any;
  timeLimit: number;
  points: number;
}

export interface QuizCountdownEvent {
  questionId: string;
  remainingTime: number;
}

export interface PollVoteEvent {
  pollId: string;
  participantId: string;
  response: any;
}

export interface QuestionEvent {
  questionId: string;
  content: string;
  participantId: string;
  nickname: string;
}

export interface QuestionUpvoteEvent {
  questionId: string;
  upvoteCount: number;
  participantId: string;
}

// 事件優先級映射
export const EVENT_PRIORITY_MAP: Record<RealtimeEventType, EventPriority> = {
  [RealtimeEventType.MODE_CHANGED]: EventPriority.CRITICAL,
  [RealtimeEventType.EVENT_STARTED]: EventPriority.CRITICAL,
  [RealtimeEventType.EVENT_ENDED]: EventPriority.CRITICAL,
  
  [RealtimeEventType.QUIZ_QUESTION_PUBLISHED]: EventPriority.CRITICAL,
  [RealtimeEventType.QUIZ_COUNTDOWN]: EventPriority.HIGH,
  [RealtimeEventType.QUIZ_ANSWER_SUBMITTED]: EventPriority.HIGH,
  [RealtimeEventType.QUIZ_RESULTS_READY]: EventPriority.HIGH,
  
  [RealtimeEventType.POLL_STARTED]: EventPriority.HIGH,
  [RealtimeEventType.POLL_VOTE_SUBMITTED]: EventPriority.HIGH,
  [RealtimeEventType.POLL_RESULTS_UPDATED]: EventPriority.MEDIUM,
  [RealtimeEventType.POLL_CLOSED]: EventPriority.HIGH,
  
  [RealtimeEventType.QUESTION_SUBMITTED]: EventPriority.HIGH,
  [RealtimeEventType.QUESTION_UPVOTED]: EventPriority.MEDIUM,
  [RealtimeEventType.QUESTION_HIGHLIGHTED]: EventPriority.HIGH,
  [RealtimeEventType.QUESTION_ANSWERED]: EventPriority.MEDIUM,
  
  [RealtimeEventType.PARTICIPANT_JOINED]: EventPriority.MEDIUM,
  [RealtimeEventType.PARTICIPANT_LEFT]: EventPriority.MEDIUM,
  [RealtimeEventType.PARTICIPANT_COUNT_UPDATED]: EventPriority.LOW,
};

// 創建事件
export const createRealtimeEvent = <T>(
  type: RealtimeEventType,
  data: T,
  eventId: string
): RealtimeEvent<T> => ({
  type,
  priority: EVENT_PRIORITY_MAP[type],
  timestamp: Date.now(),
  eventId,
  data,
  version: 1,
});
