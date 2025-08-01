import React from 'react';
import { Button } from '../shared/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../shared/Card';
import { ChevronUp, ChevronDown, RefreshCw, FileText, Trash2 } from 'lucide-react';

interface DebugSettingsProps {
  logs: string[];
  showLogs: boolean;
  autoRefresh: boolean;
  onToggleLogs: () => void;
  onRefreshLogs: () => void;
  onExportLogs: () => void;
  onClearLogs: () => void;
  onAutoRefreshChange: (enabled: boolean) => void;
  formatLogEntry: (logEntry: string) => { timestamp: string; message: string };
  getLogLevelColor: (level: string) => string;
  pullToRefreshFake?: () => void;
}

const DebugSettings: React.FC<DebugSettingsProps> = ({
  logs,
  showLogs,
  autoRefresh,
  onToggleLogs,
  onRefreshLogs,
  onExportLogs,
  onClearLogs,
  onAutoRefreshChange,
  formatLogEntry,
  getLogLevelColor,
  pullToRefreshFake
}) => {
  // Calculate total events from logs length
  const totalEvents = logs.length;

  return (
    <Card className="bg-white dark:bg-gray-800 border-2 border-yellow-200 dark:border-yellow-700">
      <CardHeader>
        <CardTitle className="text-yellow-700 dark:text-yellow-300">
          🚧 Debug Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Debug Logs</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View and manage application debug logs ({logs.length} entries)
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onToggleLogs}
              className="flex items-center space-x-2"
            >
              {showLogs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>{showLogs ? 'Hide' : 'Show'} Logs</span>
            </Button>
            <Button
              variant="outline"
              onClick={onRefreshLogs}
              className="flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="outline"
              onClick={onExportLogs}
              className="flex items-center space-x-2"
            >
              <FileText size={16} />
              <span>Export</span>
            </Button>
            <Button
              variant="outline"
              onClick={onClearLogs}
              className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* Log Controls */}
        {showLogs && (
          <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => onAutoRefreshChange(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-blue-400"
              />
              <span className="text-sm">Auto-refresh (2s)</span>
            </label>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing latest {Math.min(logs.length, 50)} entries
            </div>
          </div>
        )}
                    {pullToRefreshFake && (
              <Button
                variant="outline"
                onClick={pullToRefreshFake}
                className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                <RefreshCw size={16} />
                <span>Pull to Refresh</span>
              </Button>
            )}

        {/* Log Display */}
        {showLogs && (
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md max-h-96 overflow-y-auto">
            <div className="space-y-1">
              {logs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No logs available</p>
              ) : (
                logs.slice(-50).reverse().map((logEntry) => {
                  const { timestamp, message } = formatLogEntry(logEntry);
                  const colorClass = getLogLevelColor(message);

                  return (
                    <div key={`${timestamp}-${message.substring(0, 20)}`} className="text-xs font-mono border-b border-gray-200 dark:border-gray-700 pb-1 mb-1">
                      <div className="flex items-start space-x-2">
                        <span className="text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {timestamp.split(' ').slice(1, 3).join(' ')}
                        </span>
                        <span className={`${colorClass} break-all`}>
                          {message}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Session Analytics */}
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
          <h4 className="font-medium text-sm mb-2">Session Analytics</h4>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p>Total Events: {totalEvents}</p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugSettings;
