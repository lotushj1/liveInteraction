# LiveInteraction 負載測試工具

這是一個針對 LiveInteraction 實時互動系統的並發負載測試工具，用於評估系統在不同並發用戶數下的性能表現。

## 🎯 測試目標

- 評估系統可支持的最大並發用戶數
- 測試 Supabase Realtime 的性能表現
- 監控連接穩定性和消息傳遞效率
- 識別性能瓶頸和優化空間

## 📋 功能特性

- ✅ 模擬真實用戶行為（連接、在線狀態、互動）
- ✅ 支持自定義並發數和測試時長
- ✅ 逐步加載用戶（模擬真實場景）
- ✅ 實時性能監控和錯誤追蹤
- ✅ 詳細的測試報告生成
- ✅ 多種預設測試場景

## 🚀 快速開始

### 1. 安裝依賴

```bash
cd load-testing
npm install
```

### 2. 配置環境變量

複製 `.env.example` 為 `.env` 並填入你的配置：

```bash
cp .env.example .env
```

編輯 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
TEST_EVENT_ID=your_test_event_id_here
```

### 3. 運行測試

#### 使用預設場景

```bash
# 輕量測試 (10 用戶, 60 秒)
npm run test:light

# 中等測試 (25 用戶, 120 秒)
npm run test:medium

# 重度測試 (50 用戶, 120 秒)
npm run test:heavy

# 壓力測試 (100 用戶, 180 秒)
npm run test:stress
```

#### 自定義測試

```bash
# 基本用法
node test-runner.js --users 30 --duration 90

# 完整參數
node test-runner.js \
  --users 50 \
  --duration 120 \
  --rampup 15 \
  --interval 5 \
  --event your_event_id \
  --verbose
```

## 📊 測試參數說明

| 參數 | 說明 | 默認值 |
|------|------|--------|
| `--users` | 並發用戶數 | 10 |
| `--duration` | 測試總時長（秒） | 60 |
| `--rampup` | 用戶爬坡時間（秒） | 10 |
| `--interval` | 用戶活動間隔（秒） | 5 |
| `--event` | 測試事件 ID | 從 .env 讀取 |
| `--verbose` | 詳細輸出模式 | false |
| `--log-messages` | 記錄所有消息 | false |

## 📈 測試報告

測試完成後會生成：

1. **控制台輸出** - 即時測試進度和摘要
2. **JSON 報告** - 詳細數據保存在 `reports/` 目錄

### 報告指標說明

**連接指標:**
- 成功連接率
- 平均/最快/最慢連接時間
- 連接失敗數

**性能指標:**
- 消息吞吐量（每秒）
- 每用戶平均消息數
- Presence 更新次數
- 錯誤率

**並發性能:**
- 系統穩定性評估
- 推薦安全並發數
- 最大並發容量預估

## 📚 測試場景建議

### 1. 基礎測試 (10-20 用戶)
```bash
npm run test:light
```
- 目的: 驗證基本功能正常
- 適用: 開發環境初步測試

### 2. 小型活動 (25-50 用戶)
```bash
npm run test:medium
# 或
npm run test:heavy
```
- 目的: 模擬小型線上活動
- 適用: 小班教學、小型會議

### 3. 中型活動 (50-100 用戶)
```bash
node test-runner.js --users 100 --duration 180 --rampup 20
```
- 目的: 模擬中型線上活動
- 適用: 大班課程、中型研討會

### 4. 大型活動 (100-200 用戶)
```bash
node test-runner.js --users 200 --duration 300 --rampup 30
```
- 目的: 壓力測試，找出系統極限
- 適用: 大型講座、全校活動

### 5. 極限壓力測試 (200+ 用戶)
```bash
node test-runner.js --users 500 --duration 300 --rampup 60
```
- 目的: 測試系統崩潰點
- 適用: 容量規劃參考

## 🔍 如何解讀測試結果

### ✅ 優秀表現
- 成功連接率 ≥ 99%
- 錯誤率 < 1%
- 平均連接時間 < 500ms
- **結論**: 可以穩定支持當前並發數

### ⚠️ 良好表現
- 成功連接率 ≥ 95%
- 錯誤率 < 5%
- 平均連接時間 < 1000ms
- **結論**: 基本可以支持，建議監控

### ❌ 需要優化
- 成功連接率 < 95%
- 錯誤率 ≥ 5%
- 平均連接時間 > 1000ms
- **結論**: 超出容量，需要優化或降低並發

## 🛠️ 優化建議

### Supabase 端優化
1. 升級 Supabase 計劃（增加並發連接數）
2. 調整 Realtime 配置參數
3. 優化數據庫查詢和索引

### 應用端優化
1. 減少不必要的實時訂閱
2. 優化消息發送頻率
3. 實現消息批處理
4. 添加客戶端緩存

### 架構優化
1. 使用 CDN 加速靜態資源
2. 實現負載均衡
3. 考慮分區/分片策略
4. 添加限流機制

## 📝 注意事項

1. **測試環境**: 建議在獨立的測試環境進行，避免影響生產環境
2. **Supabase 限制**: 注意 Supabase 計劃的並發連接限制
3. **網絡條件**: 測試結果受網絡環境影響
4. **測試時機**: 避開業務高峰期進行測試

## 🎓 測試最佳實踐

1. **階段性測試**: 從小到大逐步增加並發數
2. **多次測試**: 每個級別至少測試 3 次取平均值
3. **記錄基準**: 保存每次測試報告作為對比基準
4. **持續監控**: 定期進行回歸測試
5. **真實模擬**: 盡量模擬真實用戶行為模式

## 🔗 相關資源

- [Supabase Realtime 文檔](https://supabase.com/docs/guides/realtime)
- [Supabase 並發限制](https://supabase.com/docs/guides/platform/performance)
- [性能優化指南](https://supabase.com/docs/guides/platform/performance-tuning)

## 🐛 問題排查

### 連接失敗
- 檢查 Supabase URL 和 API Key 是否正確
- 確認 Event ID 存在
- 檢查網絡連接

### 測試卡住
- 減少並發用戶數
- 增加活動間隔時間
- 檢查 Supabase 計劃限制

### 錯誤率過高
- 查看 reports/ 目錄中的詳細錯誤日誌
- 檢查 Supabase 儀表板的錯誤信息
- 降低並發數重新測試

## 📞 支持

如有問題或建議，請查看項目文檔或聯繫開發團隊。
