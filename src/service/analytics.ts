import Logger from './Logger/logger';
import { featureFlag_Debug_Log_Analytics } from '../config/featureFlags';

class AnalyticsService {
  private sessionStartTime: number;
  private events: Array<{
    type: string;
    timestamp: number;
    data?: any;
  }>;

  constructor() {
    this.sessionStartTime = Date.now();
    this.events = [];
  }

  trackEvent(type: string, data?: any) {
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    this.events.push(event);
    
    if (featureFlag_Debug_Log_Analytics) {
      Logger.info(`Analytics event tracked: ${type} - ${JSON.stringify(data)}`);
    }
  }

  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  getEventCount(type?: string): number {
    if (type) {
      return this.events.filter(event => event.type === type).length;
    }
    return this.events.length;
  }

  clearEvents() {
    this.events = [];
    if (featureFlag_Debug_Log_Analytics) {
      Logger.info('Analytics events cleared');
    }
  }
}

export const analytics = new AnalyticsService();