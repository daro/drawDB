export interface DebugEntry {
  id: string;
  line: number;
  prefix: string;
  value: any;
  timestamp: number;
}

let debugLogs: DebugEntry[] = [];

export const addToDebugConsole = (line: number, prefix: string, value: any) => {
  const newEntry: DebugEntry = {
    id: `${prefix}_${line}`,
    line,
    prefix,
    value,
    timestamp: Date.now(),
  };

  const index = debugLogs.findIndex((log) => log.id === newEntry.id);
  if (index !== -1) {
    debugLogs[index] = newEntry;
  } else {
    debugLogs.push(newEntry);
  }

  // Sort logs by line number to keep them static in the UI
  debugLogs.sort((a, b) => a.line - b.line);

  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("debug-console-update", { detail: [...debugLogs] }),
      );
    }, 0);
  }
};

export const getDebugLogs = () => debugLogs;
