/**
 * Logger utility - 輸出所有日誌以便診斷問題
 */

export const logger = {
  log: (...args: any[]) => {
    console.log(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  info: (...args: any[]) => {
    console.info(...args);
  },
};
