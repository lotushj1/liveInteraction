/**
 * Load Test Runner - 負載測試運行器
 * 管理多個用戶模擬器，收集性能指標並生成報告
 */

import { UserSimulator } from './user-simulator.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加載環境變量
dotenv.config({ path: path.join(__dirname, '.env') });

class LoadTestRunner {
  constructor(config) {
    this.config = {
      numberOfUsers: config.numberOfUsers || 10,
      duration: config.duration || 60, // 測試持續時間（秒）
      rampUpTime: config.rampUpTime || 10, // 用戶逐步加入的時間（秒）
      activityInterval: config.activityInterval || 5, // 用戶活動間隔（秒）
      supabaseUrl: config.supabaseUrl || process.env.VITE_SUPABASE_URL,
      supabaseKey: config.supabaseKey || process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      eventId: config.eventId || process.env.TEST_EVENT_ID,
      verbose: config.verbose || false,
      logMessages: config.logMessages || false,
    };

    this.users = [];
    this.metrics = {
      startTime: 0,
      endTime: 0,
      totalUsers: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalMessages: 0,
      totalErrors: 0,
      userMetrics: [],
    };
  }

  /**
   * 驗證配置
   */
  validateConfig() {
    if (!this.config.supabaseUrl || !this.config.supabaseKey) {
      throw new Error('請在 .env 文件中設置 VITE_SUPABASE_URL 和 VITE_SUPABASE_PUBLISHABLE_KEY');
    }
    if (!this.config.eventId) {
      throw new Error('請在 .env 文件中設置 TEST_EVENT_ID 或通過參數傳入');
    }
  }

  /**
   * 運行負載測試
   */
  async run() {
    console.log('\n========================================');
    console.log('🚀 LiveInteraction 負載測試開始');
    console.log('========================================\n');
    console.log(`配置:`);
    console.log(`  - 並發用戶數: ${this.config.numberOfUsers}`);
    console.log(`  - 測試時長: ${this.config.duration} 秒`);
    console.log(`  - 爬坡時間: ${this.config.rampUpTime} 秒`);
    console.log(`  - 活動間隔: ${this.config.activityInterval} 秒`);
    console.log(`  - Event ID: ${this.config.eventId}`);
    console.log('');

    try {
      this.validateConfig();
      this.metrics.startTime = Date.now();
      this.metrics.totalUsers = this.config.numberOfUsers;

      // 階段 1: 逐步啟動用戶（模擬真實場景）
      await this.rampUpUsers();

      // 階段 2: 用戶活動模擬
      await this.simulateUserActivity();

      // 階段 3: 關閉所有用戶
      await this.shutdownUsers();

      this.metrics.endTime = Date.now();

      // 生成報告
      this.generateReport();

    } catch (error) {
      console.error('\n❌ 測試執行失敗:', error.message);
      throw error;
    }
  }

  /**
   * 逐步啟動用戶
   */
  async rampUpUsers() {
    console.log(`\n📈 階段 1: 逐步啟動 ${this.config.numberOfUsers} 個用戶...`);

    const delayBetweenUsers = (this.config.rampUpTime * 1000) / this.config.numberOfUsers;

    for (let i = 0; i < this.config.numberOfUsers; i++) {
      const user = new UserSimulator(`user_${i + 1}`, this.config);
      this.users.push(user);

      const connected = await user.connect();

      if (connected) {
        this.metrics.successfulConnections++;
      } else {
        this.metrics.failedConnections++;
      }

      // 延遲啟動下一個用戶
      if (i < this.config.numberOfUsers - 1) {
        await this.sleep(delayBetweenUsers);
      }

      // 進度顯示
      if ((i + 1) % 10 === 0 || i === this.config.numberOfUsers - 1) {
        console.log(`  已啟動: ${i + 1}/${this.config.numberOfUsers} 用戶 (成功: ${this.metrics.successfulConnections}, 失敗: ${this.metrics.failedConnections})`);
      }
    }

    console.log(`✅ 所有用戶已啟動完成`);
  }

  /**
   * 模擬用戶活動
   */
  async simulateUserActivity() {
    const activityDuration = this.config.duration - this.config.rampUpTime;
    const iterations = Math.floor(activityDuration / this.config.activityInterval);

    console.log(`\n🎮 階段 2: 模擬用戶活動 (${activityDuration} 秒, ${iterations} 次迭代)...`);

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();

      // 所有用戶並發執行活動
      const activityPromises = this.users
        .filter(user => user.isConnected)
        .map(user => user.simulateActivity());

      await Promise.all(activityPromises);

      const elapsed = Date.now() - startTime;
      const remaining = (this.config.activityInterval * 1000) - elapsed;

      console.log(`  迭代 ${i + 1}/${iterations} 完成 (耗時: ${elapsed}ms, 活躍用戶: ${this.users.filter(u => u.isConnected).length})`);

      // 等待到下一個活動週期
      if (remaining > 0 && i < iterations - 1) {
        await this.sleep(remaining);
      }
    }

    console.log(`✅ 用戶活動模擬完成`);
  }

  /**
   * 關閉所有用戶
   */
  async shutdownUsers() {
    console.log(`\n🔌 階段 3: 關閉所有用戶連接...`);

    const disconnectPromises = this.users.map(user => user.disconnect());
    await Promise.all(disconnectPromises);

    console.log(`✅ 所有用戶已斷開連接`);
  }

  /**
   * 生成測試報告
   */
  generateReport() {
    console.log('\n========================================');
    console.log('📊 測試報告');
    console.log('========================================\n');

    // 收集所有用戶的指標
    this.metrics.userMetrics = this.users.map(user => user.getMetrics());

    // 計算統計數據
    const stats = this.calculateStatistics();

    // 顯示摘要
    console.log('測試摘要:');
    console.log(`  總測試時間: ${((this.metrics.endTime - this.metrics.startTime) / 1000).toFixed(2)} 秒`);
    console.log(`  總用戶數: ${this.metrics.totalUsers}`);
    console.log(`  成功連接: ${this.metrics.successfulConnections} (${((this.metrics.successfulConnections / this.metrics.totalUsers) * 100).toFixed(2)}%)`);
    console.log(`  失敗連接: ${this.metrics.failedConnections} (${((this.metrics.failedConnections / this.metrics.totalUsers) * 100).toFixed(2)}%)`);
    console.log('');

    console.log('性能指標:');
    console.log(`  平均連接時間: ${stats.avgConnectionTime.toFixed(2)} ms`);
    console.log(`  最快連接時間: ${stats.minConnectionTime} ms`);
    console.log(`  最慢連接時間: ${stats.maxConnectionTime} ms`);
    console.log(`  總發送消息數: ${stats.totalMessagesSent}`);
    console.log(`  總接收消息數: ${stats.totalMessagesReceived}`);
    console.log(`  總 Presence 更新: ${stats.totalPresenceUpdates}`);
    console.log(`  總錯誤數: ${stats.totalErrors}`);
    console.log('');

    console.log('並發性能:');
    console.log(`  每秒消息吞吐量: ${stats.messagesPerSecond.toFixed(2)}`);
    console.log(`  每用戶平均消息數: ${stats.avgMessagesPerUser.toFixed(2)}`);
    console.log('');

    // 保存詳細報告到文件
    this.saveReportToFile(stats);

    // 結論
    this.printConclusion(stats);
  }

  /**
   * 計算統計數據
   */
  calculateStatistics() {
    const connectionTimes = this.metrics.userMetrics.map(m => m.connectionTime);
    const totalMessagesSent = this.metrics.userMetrics.reduce((sum, m) => sum + m.messagesSent, 0);
    const totalMessagesReceived = this.metrics.userMetrics.reduce((sum, m) => sum + m.messagesReceived, 0);
    const totalPresenceUpdates = this.metrics.userMetrics.reduce((sum, m) => sum + m.presenceUpdates, 0);
    const totalErrors = this.metrics.userMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    const totalDuration = (this.metrics.endTime - this.metrics.startTime) / 1000;

    return {
      avgConnectionTime: connectionTimes.reduce((a, b) => a + b, 0) / connectionTimes.length,
      minConnectionTime: Math.min(...connectionTimes),
      maxConnectionTime: Math.max(...connectionTimes),
      totalMessagesSent,
      totalMessagesReceived,
      totalPresenceUpdates,
      totalErrors,
      messagesPerSecond: (totalMessagesSent + totalMessagesReceived) / totalDuration,
      avgMessagesPerUser: (totalMessagesSent + totalMessagesReceived) / this.metrics.totalUsers,
    };
  }

  /**
   * 保存報告到 JSON 文件
   */
  saveReportToFile(stats) {
    const reportData = {
      timestamp: new Date().toISOString(),
      config: this.config,
      metrics: this.metrics,
      statistics: stats,
    };

    const fileName = `load-test-report-${Date.now()}.json`;
    const filePath = path.join(__dirname, 'reports', fileName);

    // 確保 reports 目錄存在
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
    console.log(`📄 詳細報告已保存: ${fileName}`);
  }

  /**
   * 打印結論和建議
   */
  printConclusion(stats) {
    console.log('\n結論與建議:');

    const successRate = (this.metrics.successfulConnections / this.metrics.totalUsers) * 100;
    const errorRate = (stats.totalErrors / (stats.totalMessagesSent + stats.totalMessagesReceived)) * 100;

    if (successRate >= 99 && errorRate < 1) {
      console.log('  ✅ 優秀! 系統可以穩定支持 ' + this.config.numberOfUsers + ' 個並發用戶');
      console.log('  💡 建議: 可以嘗試更高的並發數進行壓力測試');
    } else if (successRate >= 95 && errorRate < 5) {
      console.log('  ⚠️  良好! 系統基本可以支持 ' + this.config.numberOfUsers + ' 個並發用戶');
      console.log('  💡 建議: 注意監控錯誤率，考慮優化連接穩定性');
    } else {
      console.log('  ❌ 警告! 系統在 ' + this.config.numberOfUsers + ' 個並發用戶下表現不佳');
      console.log('  💡 建議: 檢查錯誤日誌，優化系統配置或降低並發數');
    }

    console.log('');
    console.log('推薦並發容量評估:');
    if (successRate >= 99) {
      console.log(`  - 安全並發數: ${this.config.numberOfUsers} 用戶`);
      console.log(`  - 最大並發數: ${Math.floor(this.config.numberOfUsers * 1.5)} 用戶 (預估)`);
    } else {
      console.log(`  - 安全並發數: ${Math.floor(this.config.numberOfUsers * 0.8)} 用戶`);
      console.log(`  - 需要優化後再增加並發數`);
    }

    console.log('\n========================================\n');
  }

  /**
   * 延遲函數
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 解析命令行參數
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];

    if (key === 'users') config.numberOfUsers = parseInt(value);
    else if (key === 'duration') config.duration = parseInt(value);
    else if (key === 'rampup') config.rampUpTime = parseInt(value);
    else if (key === 'interval') config.activityInterval = parseInt(value);
    else if (key === 'event') config.eventId = value;
    else if (key === 'verbose') config.verbose = true;
    else if (key === 'log-messages') config.logMessages = true;
  }

  return config;
}

// 主函數
async function main() {
  const config = parseArgs();
  const runner = new LoadTestRunner(config);

  try {
    await runner.run();
    process.exit(0);
  } catch (error) {
    console.error('測試失敗:', error);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { LoadTestRunner };
