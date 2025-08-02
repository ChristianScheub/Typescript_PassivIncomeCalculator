import { Capacitor } from "@capacitor/core";
import {
  featureFlag_Debug_AllLogs,
  featureFlag_Debug_Log_Cache,
  featureFlag_Debug_Log_Error,
  featureFlag_Debug_Log_Info,
  featureFlag_Debug_Log_Service,
  featureFlag_Debug_Log_Warning,
  featureFlag_Debug_Log_infoRedux,
  featureFlag_Debug_StoreLogs,
  featureFlag_Debug_Log_API
} from "../../../../config/featureFlags";
import { handleFileDownload } from "../../utilities/helper/downloadFile";

class Logger {
  private static readonly isMobile: boolean = typeof window !== 'undefined' && (Capacitor.getPlatform() === "ios" || Capacitor.getPlatform() === "android");
  private static readonly logKey: string = "app_logs";
  private static readonly isWorker: boolean = typeof window === 'undefined';

  private static getCallerFunctionName(): string {
    const stack = new Error().stack;

    if (stack) {
      const stackLines = stack.split("\n");

      for (let i = 2; i < stackLines.length; i++) {
        const line = stackLines[i].trim();
        if (!line.includes("Logger.")) {
          const match = /at (\S+)/.exec(line);
          if (match?.[1]) {
            return match[1];
          }
        }
      }
    }
    return "Unknown Function";
  }

  static deleteLogs(){
    if (!this.isWorker) {
      Logger.saveLogsToLocalStorage([])
    }
    Logger.infoService("Logs deleted!");
  }

  private static formatMessage(message: string, emojiPrefix: string): string {
    return this.isMobile ? message : `${emojiPrefix} ${message}`;
  }

  private static getLogsFromLocalStorage(): string[] {
    if (this.isWorker) return [];
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
    const storedLogs = localStorage.getItem(this.logKey);
    return storedLogs ? JSON.parse(storedLogs) : [];
  }

  private static saveLogsToLocalStorage(logs: string[]): void {
    if (this.isWorker) return;
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    localStorage.setItem(this.logKey, JSON.stringify(logs));
  }
  
  static log(message: string): void {
    const functionName = this.getCallerFunctionName();
    const logMessage = `[${functionName}] ${message}`;
    console.log(logMessage);

    if (featureFlag_Debug_StoreLogs || featureFlag_Debug_AllLogs) {
      const logs = this.getLogsFromLocalStorage();
      if (logs.length >= 1000) {
        logs.splice(0, logs.length - 999);
      }
      logs.push(new Date() + logMessage);
      this.saveLogsToLocalStorage(logs);
    }
  }

  static infoRedux(message: string): void {
    if (featureFlag_Debug_Log_infoRedux || featureFlag_Debug_AllLogs) {
      this.log(this.formatMessage(`Redux Log: ${message}`, "👁️‍🗨️"));
    }
  }
  

  static info(message: string): void {
    if (featureFlag_Debug_Log_Info || featureFlag_Debug_AllLogs) {
      this.log(this.formatMessage(`INFO: ${message}`, "ℹ️"));
    }
  }

  static infoService(message: string): void {
    if (featureFlag_Debug_Log_Service || featureFlag_Debug_AllLogs) {
      this.log(this.formatMessage(`Service Call Info: ${message}`, "⚙️"));
    }
  }

  static infoAPI(message: string, requestData?: unknown, responseData?: unknown): void {
    if (featureFlag_Debug_Log_API || featureFlag_Debug_AllLogs) {
      let logMessage = `API: ${message}`;
      if (requestData) {
        logMessage += `\nRequest: ${JSON.stringify(requestData, null, 2)}`;
      }
      if (responseData) {
        logMessage += `\nResponse: ${JSON.stringify(responseData, null, 2)}`;
      }
      this.log(this.formatMessage(logMessage, "🌐"));
    }
  }

  static warn(message: string): void {
    if (featureFlag_Debug_Log_Warning || featureFlag_Debug_AllLogs) {
      this.log(this.formatMessage(`WARN: ${message}`, "⚠️"));
    }
  }

  static warnService(message: string): void {
    if (featureFlag_Debug_Log_Warning ||featureFlag_Debug_Log_Service || featureFlag_Debug_AllLogs) {
      this.log(this.formatMessage(`Service Warning: ${message}`, "⚙️⚠️"));
    }
  }

  static error(message: string): void {
    if (featureFlag_Debug_Log_Error || featureFlag_Debug_AllLogs) {
      this.log(this.formatMessage(`ERROR: ${message}`, "‼️🆘"));
    }
  }

  static errorService(message: string): void {
    if (featureFlag_Debug_Log_Service || featureFlag_Debug_AllLogs) {
      this.log(this.formatMessage(`Service Error: ${message}`, "⚙️‼️"));
    }
  }

  //New method to log errors with stack trace
  static errorStack(message: string, error: Error): void {
    if (featureFlag_Debug_Log_Error || featureFlag_Debug_AllLogs) {
      const errorMessage = `${this.formatMessage(`ERROR: ${message}`, "‼️🆘")}\nError Details: ${error.message}\nStack Trace: ${error.stack}`;
      this.log(errorMessage);
    }
  }

  static cache(message: string): void {
    if (featureFlag_Debug_Log_Cache || featureFlag_Debug_AllLogs) {
      this.log(this.formatMessage(`CACHE: ${message}`, '🗄️'));
    }
  }

  static getLogsCount(): number {
    const logs = this.getLogsFromLocalStorage();
    return logs.length;
  }

  static getLogs(): string[] {
    return this.getLogsFromLocalStorage();
  }

  static exportLogs(): void {
    if (featureFlag_Debug_StoreLogs) {
      const logs = this.getLogsFromLocalStorage();
      handleFileDownload(logs.join("\n\n"));
    }
  }
}

export default Logger;