/**
 * Batch Test Script - 批量測試腳本
 * 自動運行多個測試場景並生成對比報告
 */

import { LoadTestRunner } from './test-runner.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 批量測試場景
const BATCH_SCENARIOS = [
  {
    name: '10 用戶測試',
    numberOfUsers: 10,
    duration: 60,
    rampUpTime: 10,
  },
  {
    name: '25 用戶測試',
    numberOfUsers: 25,
    duration: 90,
    rampUpTime: 15,
  },
  {
    name: '50 用戶測試',
    numberOfUsers: 50,
    duration: 120,
    rampUpTime: 20,
  },
  {
    name: '100 用戶測試',
    numberOfUsers: 100,
    duration: 180,
    rampUpTime: 30,
  },
];

class BatchTestRunner {
  constructor() {
    this.results = [];
  }

  async runBatch() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║     LiveInteraction 批量負載測試           ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log(`將運行 ${BATCH_SCENARIOS.length} 個測試場景:\n`);
    BATCH_SCENARIOS.forEach((scenario, index) => {
      console.log(`  ${index + 1}. ${scenario.name} (${scenario.numberOfUsers} 用戶, ${scenario.duration}秒)`);
    });

    console.log('\n⏱️  預估總時間:', this.estimateTotalTime(), '分鐘\n');

    await this.sleep(3000);

    for (let i = 0; i < BATCH_SCENARIOS.length; i++) {
      const scenario = BATCH_SCENARIOS[i];
      console.log(`\n${'='.repeat(50)}`);
      console.log(`運行場景 ${i + 1}/${BATCH_SCENARIOS.length}: ${scenario.name}`);
      console.log('='.repeat(50));

      try {
        const runner = new LoadTestRunner(scenario);
        await runner.run();

        // 收集結果
        this.results.push({
          scenario: scenario.name,
          config: scenario,
          success: true,
          metrics: this.extractMetrics(runner),
        });

        // 場景間休息
        if (i < BATCH_SCENARIOS.length - 1) {
          console.log('\n⏸️  場景間休息 30 秒...\n');
          await this.sleep(30000);
        }
      } catch (error) {
        console.error(`場景 ${scenario.name} 失敗:`, error.message);
        this.results.push({
          scenario: scenario.name,
          config: scenario,
          success: false,
          error: error.message,
        });
      }
    }

    // 生成對比報告
    this.generateComparisonReport();
  }

  extractMetrics(runner) {
    const stats = runner.metrics;
    const connectionTimes = stats.userMetrics.map(m => m.connectionTime);
    const totalMessagesSent = stats.userMetrics.reduce((sum, m) => sum + m.messagesSent, 0);
    const totalMessagesReceived = stats.userMetrics.reduce((sum, m) => sum + m.messagesReceived, 0);

    return {
      successRate: (stats.successfulConnections / stats.totalUsers) * 100,
      avgConnectionTime: connectionTimes.reduce((a, b) => a + b, 0) / connectionTimes.length,
      totalMessages: totalMessagesSent + totalMessagesReceived,
      errorCount: stats.userMetrics.reduce((sum, m) => sum + m.errorCount, 0),
    };
  }

  generateComparisonReport() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          批量測試對比報告                  ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // 表格頭
    console.log('場景           | 用戶數 | 成功率  | 平均連接時間 | 總消息數 | 錯誤數');
    console.log('-'.repeat(80));

    // 表格內容
    this.results.forEach(result => {
      if (result.success) {
        const m = result.metrics;
        console.log(
          `${result.scenario.padEnd(13)} | ` +
          `${result.config.numberOfUsers.toString().padStart(6)} | ` +
          `${m.successRate.toFixed(1).padStart(6)}% | ` +
          `${m.avgConnectionTime.toFixed(0).padStart(12)}ms | ` +
          `${m.totalMessages.toString().padStart(8)} | ` +
          `${m.errorCount.toString().padStart(6)}`
        );
      } else {
        console.log(`${result.scenario.padEnd(13)} | 失敗: ${result.error}`);
      }
    });

    console.log('\n');

    // 找出最佳表現
    const successfulResults = this.results.filter(r => r.success);
    if (successfulResults.length > 0) {
      const maxUsers = Math.max(...successfulResults.map(r => r.config.numberOfUsers));
      const bestPerforming = successfulResults.find(r =>
        r.config.numberOfUsers === maxUsers && r.metrics.successRate >= 95
      );

      console.log('📊 測試總結:\n');
      if (bestPerforming) {
        console.log(`  ✅ 系統可穩定支持: ${bestPerforming.config.numberOfUsers} 個並發用戶`);
        console.log(`  📈 成功率: ${bestPerforming.metrics.successRate.toFixed(2)}%`);
        console.log(`  ⚡ 平均連接時間: ${bestPerforming.metrics.avgConnectionTime.toFixed(0)}ms`);
      } else {
        console.log(`  ⚠️  最大測試用戶數 ${maxUsers} 下表現不穩定`);
        console.log(`  💡 建議降低並發數或優化系統配置`);
      }
    }

    // 保存報告
    this.saveBatchReport();
  }

  saveBatchReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      scenarios: BATCH_SCENARIOS,
      results: this.results,
    };

    const fileName = `batch-test-report-${Date.now()}.json`;
    const reportsDir = path.join(__dirname, 'reports');

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));

    console.log(`\n📄 批量測試報告已保存: ${fileName}\n`);
  }

  estimateTotalTime() {
    const totalSeconds = BATCH_SCENARIOS.reduce((sum, s) => sum + s.duration, 0);
    const restTime = (BATCH_SCENARIOS.length - 1) * 30; // 場景間休息時間
    return Math.ceil((totalSeconds + restTime) / 60);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 主函數
async function main() {
  const batchRunner = new BatchTestRunner();
  await batchRunner.runBatch();
}

main().catch(error => {
  console.error('批量測試失敗:', error);
  process.exit(1);
});
