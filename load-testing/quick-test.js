/**
 * Quick Test Script - 快速測試腳本
 * 提供一個互動式的測試場景選擇器
 */

import { LoadTestRunner } from './test-runner.js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// 預設測試場景
const TEST_SCENARIOS = {
  '1': {
    name: '微型測試 (5 用戶)',
    numberOfUsers: 5,
    duration: 30,
    rampUpTime: 5,
    activityInterval: 5,
  },
  '2': {
    name: '輕量測試 (10 用戶)',
    numberOfUsers: 10,
    duration: 60,
    rampUpTime: 10,
    activityInterval: 5,
  },
  '3': {
    name: '中等測試 (25 用戶)',
    numberOfUsers: 25,
    duration: 120,
    rampUpTime: 15,
    activityInterval: 5,
  },
  '4': {
    name: '重度測試 (50 用戶)',
    numberOfUsers: 50,
    duration: 120,
    rampUpTime: 20,
    activityInterval: 5,
  },
  '5': {
    name: '壓力測試 (100 用戶)',
    numberOfUsers: 100,
    duration: 180,
    rampUpTime: 30,
    activityInterval: 5,
  },
  '6': {
    name: '極限測試 (200 用戶)',
    numberOfUsers: 200,
    duration: 300,
    rampUpTime: 60,
    activityInterval: 5,
  },
};

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   LiveInteraction 負載測試 - 快速啟動     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  console.log('請選擇測試場景:\n');
  Object.entries(TEST_SCENARIOS).forEach(([key, scenario]) => {
    console.log(`  ${key}. ${scenario.name}`);
    console.log(`     └─ ${scenario.numberOfUsers} 並發用戶, ${scenario.duration} 秒\n`);
  });
  console.log('  7. 自定義測試');
  console.log('  0. 退出\n');

  const choice = await question('請輸入選項 (0-7): ');

  if (choice === '0') {
    console.log('\n再見！\n');
    rl.close();
    process.exit(0);
  }

  let config;

  if (choice === '7') {
    // 自定義測試
    console.log('\n=== 自定義測試配置 ===\n');
    const users = await question('並發用戶數 (預設: 10): ');
    const duration = await question('測試時長/秒 (預設: 60): ');
    const rampup = await question('爬坡時間/秒 (預設: 10): ');

    config = {
      numberOfUsers: parseInt(users) || 10,
      duration: parseInt(duration) || 60,
      rampUpTime: parseInt(rampup) || 10,
      activityInterval: 5,
    };
  } else if (TEST_SCENARIOS[choice]) {
    config = TEST_SCENARIOS[choice];
  } else {
    console.log('\n❌ 無效的選項，請重試。\n');
    rl.close();
    process.exit(1);
  }

  rl.close();

  console.log(`\n已選擇: ${config.name || '自定義測試'}`);
  console.log('\n即將開始測試，請確保：');
  console.log('  ✓ 已設置 .env 文件');
  console.log('  ✓ Supabase 配置正確');
  console.log('  ✓ 測試事件 ID 有效\n');

  await new Promise(resolve => {
    const countdown = setInterval(() => {
      process.stdout.write('.');
    }, 1000);

    setTimeout(() => {
      clearInterval(countdown);
      console.log('\n');
      resolve();
    }, 3000);
  });

  // 運行測試
  const runner = new LoadTestRunner(config);
  await runner.run();
}

main().catch(error => {
  console.error('\n測試失敗:', error.message);
  rl.close();
  process.exit(1);
});
