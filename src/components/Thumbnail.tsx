import SVGPathCommander, { PathArray } from "svg-path-commander";
import {
  TABLE_CONFIG,
  NOTE_CONFIG,
  GRID_CONFIG,
} from "@data/constants";
import { ThumbnailProps } from "@types";

export default function Thumbnail({ diagram, i, zoom, theme }: ThumbnailProps) {
  return (
    <svg
      className={`${
        theme === "dark" ? "bg-[#222229]" : "bg-white"
      } w-full h-full rounded-md text-color`}
    >
      <defs>
        <pattern
          id={"pattern-grid-" + i}
          x={-GRID_CONFIG.CIRCLE_RADIUS}
          y={-GRID_CONFIG.CIRCLE_RADIUS}
          width={GRID_CONFIG.SIZE * zoom}
          height={GRID_CONFIG.SIZE * zoom}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <circle
            cx={GRID_CONFIG.CIRCLE_RADIUS * zoom}
            cy={GRID_CONFIG.CIRCLE_RADIUS * zoom}
            r={GRID_CONFIG.CIRCLE_RADIUS * zoom}
            fill="rgb(99, 152, 191)"
            opacity="1"
          />
        </pattern>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={"url(#pattern-grid-" + i + ")"}
      ></rect>
      <g
        style={{
          transform: `scale(${zoom})`,
        }}
      >
        {(diagram.areas || diagram.subjectAreas)?.map((a) => {
          if (!a) return null;
          return (
            <foreignObject
              key={a.id}
              x={a.x}
              y={a.y}
              width={a.width > 0 ? a.width : 0}
              height={a.height > 0 ? a.height : 0}
            >
              <div className="border border-slate-400 w-full h-full rounded-xs relative">
                <div
                  className="opacity-40 w-fill h-full"
                  style={{ backgroundColor: a.color }}
                />
              </div>
              <div className="text-color absolute top-1 left-2 select-none">
                {a.name}
              </div>
            </foreignObject>
          );
        })}
        {diagram.tables?.map((table, i) => {
          if (!table) return null;
          const height =
            (table.fields?.length || 0) * TABLE_CONFIG.FIELD_HEIGHT +
            TABLE_CONFIG.HEADER.HEIGHT +
            TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT;
          return (
            <foreignObject
              x={table.x}
              y={table.y}
              width={200}
              height={height}
              key={i}
            >
              <div
                className={`border rounded-md ${
                  theme === "dark"
                    ? "bg-zinc-800"
                    : "border-zinc-300 bg-zinc-100"
                }`}
              >
                <div
                  className="w-full rounded-t-sm"
                  style={{ 
                    backgroundColor: table.color,
                    height: `${TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT}px`
                  }}
                />
                <div className="rounded-b-[3px]">
                  <div
                    className={`font-bold flex items-center px-2 border-b ${
                      theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"
                    } border-gray-300`}
                    style={{ height: `${TABLE_CONFIG.HEADER.HEIGHT}px` }}
                  >
                    {table.name}
                  </div>
                  {table.fields?.map((f, j) => (
                    <div
                      className={`flex justify-between items-center py-1 px-2 ${
                        j < table.fields.length - 1 ? "border-b" : ""
                      }`}
                      key={j}
                    >
                      <div className="flex items-center justify-start">
                        <div
                          className={`w-[6px] h-[6px] bg-[#2f68adcc] rounded-full me-2`}
                        ></div>
                        <div>{f.name}</div>
                      </div>
                      <div className="text-zinc-500">{f.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </foreignObject>
          );
        })}
        {diagram.notes?.map((n) => {
          if (!n) return null;
          const x = n.x;
          const y = n.y;
          const h = n.height;
          const w = n.width ?? NOTE_CONFIG.WIDTH;
          
          const mainSegments: PathArray = [
            ["M", x + NOTE_CONFIG.FOLD, y],
            ["L", x + w - NOTE_CONFIG.RADIUS, y],
            ["A", NOTE_CONFIG.RADIUS, NOTE_CONFIG.RADIUS, 0, 0, 1, x + w, y + NOTE_CONFIG.RADIUS],
            ["L", x + w, y + h - NOTE_CONFIG.RADIUS],
            ["A", NOTE_CONFIG.RADIUS, NOTE_CONFIG.RADIUS, 0, 0, 1, x + w - NOTE_CONFIG.RADIUS, y + h],
            ["L", x + NOTE_CONFIG.RADIUS, y + h],
            ["A", NOTE_CONFIG.RADIUS, NOTE_CONFIG.RADIUS, 0, 0, 1, x, y + h - NOTE_CONFIG.RADIUS],
            ["L", x, y + NOTE_CONFIG.FOLD],
          ];

          const foldSegments: PathArray = [
            ["M", x, y + NOTE_CONFIG.FOLD],
            ["L", x + NOTE_CONFIG.FOLD - NOTE_CONFIG.RADIUS, y + NOTE_CONFIG.FOLD],
            ["A", NOTE_CONFIG.RADIUS, NOTE_CONFIG.RADIUS, 0, 0, 0, x + NOTE_CONFIG.FOLD, y + NOTE_CONFIG.FOLD - NOTE_CONFIG.RADIUS],
            ["L", x + NOTE_CONFIG.FOLD, y],
            ["L", x, y + NOTE_CONFIG.FOLD],
            ["Z"],
          ];

          return (
            <g key={n.id}>
              <path
                d={SVGPathCommander.pathToString(mainSegments)}
                fill={n.color}
                stroke="rgb(168 162 158)"
                strokeLinejoin="round"
                strokeWidth="0.5"
              />
              <path
                d={SVGPathCommander.pathToString(foldSegments)}
                fill={n.color}
                stroke={"rgb(168 162 158)"}
                strokeLinejoin="round"
                strokeWidth="0.5"
              />
              <foreignObject x={x} y={y} width={w} height={h}>
                <div className="text-gray-900 w-full h-full px-4 py-2">
                  <label htmlFor={`note_${n.id}`} className="ms-4">
                    {n.title}
                  </label>
                  <div className="mt-[2px]">{n.content}</div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
