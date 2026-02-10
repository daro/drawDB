import React from "react";
import { useTranslation } from "react-i18next";

interface DebugOverlaysProps {
  showDebugCoordinates: boolean;
  showDebugConsole: boolean;
  transform: {
    pan: { x: number; y: number };
    zoom: number;
  };
  viewBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  pointer: {
    spaces: {
      screen: { x: number; y: number };
      diagram: { x: number; y: number };
    };
  };
  debugLogs: any[];
  filterLine: string;
  setFilterLine: (val: string) => void;
  setSettings: (val: any | ((prev: any) => any)) => void;
}

const DebugOverlays: React.FC<DebugOverlaysProps> = ({
  showDebugCoordinates,
  showDebugConsole,
  transform,
  viewBox,
  pointer,
  debugLogs,
  filterLine,
  setFilterLine,
  setSettings,
}) => {
  const { t } = useTranslation();

  const filteredLogs = filterLine
    ? debugLogs.filter((log) => String(log.line).includes(filterLine))
    : debugLogs;

  const displayLogs = [];
  if (filterLine || filteredLogs.length === 0) {
    displayLogs.push(...filteredLogs);
  } else {
    let currentLine = filteredLogs.length > 0 ? filteredLogs[0].line : 0;
    filteredLogs.forEach((log) => {
      while (log.line > currentLine) {
        displayLogs.push({ isPlaceholder: true, line: currentLine, id: `placeholder-${currentLine}` });
        currentLine++;
      }
      displayLogs.push(log);
      currentLine = log.line + 1;
    });
  }

  return (
    <>
      {showDebugCoordinates && (
        <div className="fixed flex flex-col flex-wrap gap-6 bg-[rgba(var(--semi-grey-1),var(--tw-bg-opacity))]/40 border border-color bottom-4 right-4 p-4 rounded-xl backdrop-blur-xs pointer-events-none select-none">
          <table className="table-auto grow">
            <thead>
              <tr>
                <th className="text-left" colSpan={3}>
                  {t("transform")}
                </th>
              </tr>
              <tr className="italic [&_th]:font-normal [&_th]:text-right">
                <th>pan x</th>
                <th>pan y</th>
                <th>scale</th>
              </tr>
            </thead>
            <tbody className="[&_td]:text-right [&_td]:min-w-[8ch]">
              <tr>
                <td>{transform.pan?.x.toFixed(2)}</td>
                <td>{transform.pan?.y.toFixed(2)}</td>
                <td>{transform.zoom.toFixed(4)}</td>
              </tr>
            </tbody>
          </table>
          <table className="table-auto grow [&_th]:text-left [&_th:not(:first-of-type)]:text-right [&_td:not(:first-of-type)]:text-right [&_td]:min-w-[8ch]">
            <thead>
              <tr>
                <th colSpan={4}>{t("viewbox")}</th>
              </tr>
              <tr className="italic [&_th]:font-normal">
                <th>left</th>
                <th>top</th>
                <th>width</th>
                <th>height</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{viewBox?.left.toFixed(2)}</td>
                <td>{viewBox?.top.toFixed(2)}</td>
                <td>{viewBox?.width.toFixed(2)}</td>
                <td>{viewBox?.height.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <table className="table-auto grow [&_th]:text-left [&_th:not(:first-of-type)]:text-right [&_td:not(:first-of-type)]:text-right [&_td]:min-w-[8ch]">
            <thead>
              <tr>
                <th colSpan={3}>{t("cursor_coordinates")}</th>
              </tr>
              <tr className="italic [&_th]:font-normal">
                <th>{t("coordinate_space")}</th>
                <th>x</th>
                <th>y</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("coordinate_space_screen")}</td>
                <td>{pointer.spaces?.screen?.x.toFixed(2)}</td>
                <td>{pointer.spaces?.screen?.y.toFixed(2)}</td>
              </tr>
              <tr>
                <td>{t("coordinate_space_diagram")}</td>
                <td>{pointer.spaces?.diagram?.x.toFixed(2)}</td>
                <td>{pointer.spaces?.diagram?.y.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {showDebugConsole && (
        <div className="fixed flex flex-col gap-2 bg-black/80 border border-zinc-700 top-4 bottom-4 left-4 p-4 rounded-xl backdrop-blur-md text-xs font-mono text-green-400 min-w-[500px] max-w-[800px] overflow-y-auto shadow-2xl z-50 pointer-events-auto">
          <div className="border-b border-zinc-700 pb-2 mb-1 text-zinc-400 uppercase font-bold flex justify-between sticky top-0 bg-black/40 backdrop-blur-sm z-10">
            <span className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <i className="bi bi-terminal text-blue-400"></i>
                Debug Console
              </span>
              <div className="flex items-center bg-zinc-800/80 rounded px-2 py-0.5 border border-zinc-700">
                <i className="bi bi-filter text-zinc-500 mr-1.5 text-[10px]"></i>
                <input
                  type="text"
                  placeholder="Filter line..."
                  className="bg-transparent border-none outline-none text-zinc-300 w-20 text-[10px] placeholder:text-zinc-600"
                  value={filterLine}
                  onChange={(e) => setFilterLine(e.target.value)}
                />
                {filterLine && (
                  <button 
                    onClick={() => setFilterLine("")}
                    className="ml-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] lowercase normal-case font-normal text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full border border-zinc-700">
                {filterLine ? `${filteredLogs.length} / ${debugLogs.length}` : debugLogs.length} entries
              </span>
              <button
                onClick={() => setSettings((prev) => ({ ...prev, showDebugConsole: false }))}
                className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded"
                title="Close console"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          {debugLogs.length === 0 && (
            <div className="text-zinc-500 italic py-4 text-center">No logs yet...</div>
          )}
          <div className="flex flex-col gap-1.5">
            {displayLogs.map((log) => (
              log.isPlaceholder ? (
                <div key={log.id} className="flex gap-2 p-1 h-6 items-center border-b border-zinc-800/30">
                  <span className="text-zinc-800/50 shrink-0 select-none text-[10px]">[{log.line}]</span>
                  <div className="h-px grow bg-zinc-900/50"></div>
                </div>
              ) : (
                <div key={log.id} className="flex gap-2 hover:bg-white/5 p-1 rounded transition-colors group">
                  <span className="text-zinc-500 shrink-0 select-none group-hover:text-zinc-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-zinc-500 shrink-0 select-none group-hover:text-zinc-400">[{log.line}]</span>
                  <span className="text-blue-300 font-bold shrink-0">
                    {log.prefix}:
                  </span>
                  <span className="break-all whitespace-pre-wrap">
                    {typeof log.value === "object"
                      ? JSON.stringify(log.value, null, 2)
                      : String(log.value)}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(DebugOverlays);
