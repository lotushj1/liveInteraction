export interface QuizTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  event_type: 'quiz' | 'qna';
  qna_enabled: boolean;
  questions: Array<{
    question_text: string;
    options: Array<{ text: string; isCorrect: boolean }>;
    time_limit: number;
    points: number;
  }>;
}

export const templates: QuizTemplate[] = [
  {
    id: 'team-icebreaker',
    title: '新團隊破冰',
    description: '適合新團隊成員互相認識，輕鬆有趣的破冰問題',
    category: '團隊建設',
    icon: '🤝',
    event_type: 'quiz',
    qna_enabled: false,
    questions: [
      {
        question_text: '如果可以擁有一種超能力，你會選擇什麼？',
        options: [
          { text: '飛行', isCorrect: false },
          { text: '隱形', isCorrect: false },
          { text: '讀心術', isCorrect: false },
          { text: '時光旅行', isCorrect: false },
        ],
        time_limit: 15,
        points: 100,
      },
      {
        question_text: '你更喜歡哪種工作方式？',
        options: [
          { text: '獨立完成任務', isCorrect: false },
          { text: '團隊協作', isCorrect: false },
          { text: '視情況而定', isCorrect: false },
          { text: '混合兩者', isCorrect: false },
        ],
        time_limit: 15,
        points: 100,
      },
      {
        question_text: '早晨你最喜歡喝什麼？',
        options: [
          { text: '咖啡', isCorrect: false },
          { text: '茶', isCorrect: false },
          { text: '果汁', isCorrect: false },
          { text: '白開水', isCorrect: false },
        ],
        time_limit: 10,
        points: 100,
      },
      {
        question_text: '假期你更喜歡去哪裡？',
        options: [
          { text: '海邊', isCorrect: false },
          { text: '山區', isCorrect: false },
          { text: '城市', isCorrect: false },
          { text: '在家休息', isCorrect: false },
        ],
        time_limit: 15,
        points: 100,
      },
      {
        question_text: '你最喜歡的季節是？',
        options: [
          { text: '春天', isCorrect: false },
          { text: '夏天', isCorrect: false },
          { text: '秋天', isCorrect: false },
          { text: '冬天', isCorrect: false },
        ],
        time_limit: 10,
        points: 100,
      },
    ],
  },
  {
    id: 'year-end-party',
    title: '尾牙活動',
    description: '適合公司尾牙的趣味問答，增加互動和歡樂氣氛',
    category: '企業活動',
    icon: '🎉',
    event_type: 'quiz',
    qna_enabled: false,
    questions: [
      {
        question_text: '今年公司最熱門的流行語是什麼？',
        options: [
          { text: '衝了啦', isCorrect: true },
          { text: '加油', isCorrect: false },
          { text: '沒問題', isCorrect: false },
          { text: '交給我', isCorrect: false },
        ],
        time_limit: 20,
        points: 100,
      },
      {
        question_text: '公司成立於哪一年？',
        options: [
          { text: '2010', isCorrect: false },
          { text: '2015', isCorrect: true },
          { text: '2020', isCorrect: false },
          { text: '2005', isCorrect: false },
        ],
        time_limit: 20,
        points: 150,
      },
      {
        question_text: '猜猜看：辦公室咖啡機一天被使用幾次？',
        options: [
          { text: '20-30 次', isCorrect: false },
          { text: '30-40 次', isCorrect: false },
          { text: '40-50 次', isCorrect: true },
          { text: '50 次以上', isCorrect: false },
        ],
        time_limit: 25,
        points: 200,
      },
      {
        question_text: '公司的吉祥物是什麼動物？',
        options: [
          { text: '貓咪', isCorrect: false },
          { text: '獅子', isCorrect: true },
          { text: '老鷹', isCorrect: false },
          { text: '狗狗', isCorrect: false },
        ],
        time_limit: 15,
        points: 100,
      },
      {
        question_text: '今年最受歡迎的員工福利是？',
        options: [
          { text: '彈性工時', isCorrect: true },
          { text: '零食補給', isCorrect: false },
          { text: '健身房', isCorrect: false },
          { text: '員工旅遊', isCorrect: false },
        ],
        time_limit: 20,
        points: 150,
      },
    ],
  },
  {
    id: 'classroom-quiz',
    title: '課堂問答',
    description: '適合老師在課堂上使用，檢測學生學習成果',
    category: '教育',
    icon: '📚',
    event_type: 'quiz',
    qna_enabled: true,
    questions: [
      {
        question_text: '台灣最高的山是？',
        options: [
          { text: '玉山', isCorrect: true },
          { text: '雪山', isCorrect: false },
          { text: '阿里山', isCorrect: false },
          { text: '合歡山', isCorrect: false },
        ],
        time_limit: 20,
        points: 100,
      },
      {
        question_text: '光合作用需要哪些條件？',
        options: [
          { text: '陽光、水、二氧化碳', isCorrect: true },
          { text: '陽光、水、氧氣', isCorrect: false },
          { text: '水、養分、氧氣', isCorrect: false },
          { text: '陽光、養分、氧氣', isCorrect: false },
        ],
        time_limit: 25,
        points: 150,
      },
      {
        question_text: '下列哪個不是台灣的縣市？',
        options: [
          { text: '台北市', isCorrect: false },
          { text: '台中市', isCorrect: false },
          { text: '台南市', isCorrect: false },
          { text: '台東市', isCorrect: true },
        ],
        time_limit: 20,
        points: 100,
      },
      {
        question_text: '1公尺等於多少公分？',
        options: [
          { text: '10', isCorrect: false },
          { text: '100', isCorrect: true },
          { text: '1000', isCorrect: false },
          { text: '10000', isCorrect: false },
        ],
        time_limit: 15,
        points: 100,
      },
      {
        question_text: '水的化學式是？',
        options: [
          { text: 'H2O', isCorrect: true },
          { text: 'CO2', isCorrect: false },
          { text: 'O2', isCorrect: false },
          { text: 'H2', isCorrect: false },
        ],
        time_limit: 15,
        points: 100,
      },
    ],
  },
  {
    id: 'baking-basics',
    title: '烘焙基礎知識',
    description: '測試烘焙愛好者的基礎知識，適合烘焙課程或社團',
    category: '生活技能',
    icon: '🧁',
    event_type: 'quiz',
    qna_enabled: false,
    questions: [
      {
        question_text: '製作蛋糕時，泡打粉的主要作用是？',
        options: [
          { text: '增加甜度', isCorrect: false },
          { text: '使麵糊膨脹', isCorrect: true },
          { text: '增加香味', isCorrect: false },
          { text: '延長保存期限', isCorrect: false },
        ],
        time_limit: 25,
        points: 150,
      },
      {
        question_text: '烘烤餅乾最適合的溫度通常是？',
        options: [
          { text: '120-140°C', isCorrect: false },
          { text: '160-180°C', isCorrect: true },
          { text: '200-220°C', isCorrect: false },
          { text: '240-260°C', isCorrect: false },
        ],
        time_limit: 25,
        points: 150,
      },
      {
        question_text: '打發蛋白時加入塔塔粉的目的是？',
        options: [
          { text: '增加甜味', isCorrect: false },
          { text: '穩定蛋白', isCorrect: true },
          { text: '增加顏色', isCorrect: false },
          { text: '加快打發', isCorrect: false },
        ],
        time_limit: 30,
        points: 200,
      },
      {
        question_text: '製作麵包時，酵母的最佳發酵溫度約為？',
        options: [
          { text: '15-20°C', isCorrect: false },
          { text: '25-30°C', isCorrect: true },
          { text: '35-40°C', isCorrect: false },
          { text: '45-50°C', isCorrect: false },
        ],
        time_limit: 25,
        points: 150,
      },
      {
        question_text: '下列哪種糖最適合用來製作焦糖？',
        options: [
          { text: '細砂糖', isCorrect: true },
          { text: '糖粉', isCorrect: false },
          { text: '黑糖', isCorrect: false },
          { text: '代糖', isCorrect: false },
        ],
        time_limit: 20,
        points: 100,
      },
    ],
  },
  {
    id: 'movie-trivia',
    title: '影視作品知識',
    description: '測試你對經典電影和電視劇的了解程度',
    category: '娛樂',
    icon: '🎬',
    event_type: 'quiz',
    qna_enabled: false,
    questions: [
      {
        question_text: '《鐵達尼號》中傑克和蘿絲在哪裡相遇？',
        options: [
          { text: '船頭', isCorrect: true },
          { text: '餐廳', isCorrect: false },
          { text: '舞會', isCorrect: false },
          { text: '船艙', isCorrect: false },
        ],
        time_limit: 20,
        points: 100,
      },
      {
        question_text: '哈利波特的貓頭鷹叫什麼名字？',
        options: [
          { text: '嘿美', isCorrect: true },
          { text: '哈利', isCorrect: false },
          { text: '榮恩', isCorrect: false },
          { text: '妙麗', isCorrect: false },
        ],
        time_limit: 20,
        points: 100,
      },
      {
        question_text: '《玩具總動員》中胡迪是什麼玩具？',
        options: [
          { text: '太空人', isCorrect: false },
          { text: '牛仔', isCorrect: true },
          { text: '恐龍', isCorrect: false },
          { text: '警長', isCorrect: false },
        ],
        time_limit: 15,
        points: 100,
      },
      {
        question_text: '漫威宇宙中，誰是初代復仇者的領袖？',
        options: [
          { text: '鋼鐵人', isCorrect: false },
          { text: '美國隊長', isCorrect: true },
          { text: '雷神索爾', isCorrect: false },
          { text: '黑寡婦', isCorrect: false },
        ],
        time_limit: 20,
        points: 150,
      },
      {
        question_text: '《冰雪奇緣》中艾莎的妹妹叫什麼？',
        options: [
          { text: '安娜', isCorrect: true },
          { text: '貝兒', isCorrect: false },
          { text: '愛麗兒', isCorrect: false },
          { text: '樂佩', isCorrect: false },
        ],
        time_limit: 15,
        points: 100,
      },
    ],
  },
  {
    id: 'taiwan-culture',
    title: '台灣文化常識',
    description: '認識台灣的文化、美食和傳統習俗',
    category: '文化',
    icon: '🇹🇼',
    event_type: 'quiz',
    qna_enabled: false,
    questions: [
      {
        question_text: '台灣最著名的夜市美食是？',
        options: [
          { text: '珍珠奶茶', isCorrect: false },
          { text: '滷肉飯', isCorrect: false },
          { text: '蚵仔煎', isCorrect: false },
          { text: '以上皆是', isCorrect: true },
        ],
        time_limit: 20,
        points: 100,
      },
      {
        question_text: '農曆新年必吃的年菜是？',
        options: [
          { text: '火鍋', isCorrect: false },
          { text: '年糕', isCorrect: false },
          { text: '水餃', isCorrect: false },
          { text: '以上皆是', isCorrect: true },
        ],
        time_limit: 20,
        points: 100,
      },
      {
        question_text: '台灣的國花是？',
        options: [
          { text: '櫻花', isCorrect: false },
          { text: '梅花', isCorrect: true },
          { text: '蓮花', isCorrect: false },
          { text: '玫瑰', isCorrect: false },
        ],
        time_limit: 20,
        points: 150,
      },
      {
        question_text: '端午節要做什麼活動？',
        options: [
          { text: '賞月', isCorrect: false },
          { text: '划龍舟', isCorrect: true },
          { text: '放天燈', isCorrect: false },
          { text: '賞花燈', isCorrect: false },
        ],
        time_limit: 15,
        points: 100,
      },
      {
        question_text: '台灣哪個城市有「文化之都」的美譽？',
        options: [
          { text: '台北', isCorrect: false },
          { text: '台中', isCorrect: false },
          { text: '台南', isCorrect: true },
          { text: '高雄', isCorrect: false },
        ],
        time_limit: 20,
        points: 150,
      },
    ],
  },
];

export function getTemplateById(id: string): QuizTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): QuizTemplate[] {
  return templates.filter((t) => t.category === category);
}

export const templateCategories = Array.from(
  new Set(templates.map((t) => t.category))
);
