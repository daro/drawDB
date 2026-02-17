import React, { useState } from "react";
import {
  Tab,
  ObjectType,
  TABLE_CONFIG,
} from "@data/constants";
import {
  useSettings,
  useDiagram,
  useSelect,
} from "@hooks";
import { useTableStyle } from "./Table/hooks/useTableStyle";
import { TableProps } from "@types";
import { CanvasObject } from "./common/CanvasObject";
import { useTableResize } from "./Table/hooks/useTableResize";
import { useTableActions } from "./Table/hooks/useTableActions";
import { TablePopover } from "./Table/TablePopover";
import { TableHeader } from "./Table/TableHeader";
import { TableFields } from "./Table/TableFields";

/**
 * A component that renders a single table on the editor canvas.
 * Handles resizing, selection, locking, and field interactions.
 * 
 * @param {TableProps} props - The component props.
 * @returns {JSX.Element | null} The rendered table or null if hidden.
 */
function Table({
  tableData,
  onPointerDown,
  handleGripField,
}: TableProps) {
  const [hoveredField, setHoveredField] = useState<number | null>(null);
  const { 
    linking, 
    linkingLine,
  } = useDiagram();
  const { settings } = useSettings();
  const { bulkSelectedElements, emitSelect } = useSelect();

  const { headerColor } = useTableStyle(
    tableData,
    { element: -1, id: -1, open: false }, 
    bulkSelectedElements,
    settings
  );

  const borderColor = settings.mode === "light" ? "border-zinc-300" : "border-zinc-600";

  const { handleResize } = useTableResize(tableData);
  const { lockUnlockTable } = useTableActions(tableData);

  const height = tableData.height || (
    (tableData.fields?.length || 0) * TABLE_CONFIG.FIELD_HEIGHT +
    TABLE_CONFIG.HEADER.HEIGHT +
    TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT
  );

  if (tableData.hidden) return null;

  const isLinkingMode = linking && tableData.id !== linkingLine.startTableId;

  return (
    <CanvasObject
      data={{...tableData, height}}
      objectType={ObjectType.TABLE}
      tab={Tab.TABLES}
      scrollIdPrefix="scroll_table_"
      updateCallback={handleResize}
      popoverContent={<TablePopover tableData={tableData} />}
      minWidth={150}
      minHeight={TABLE_CONFIG.HEADER.HEIGHT + TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT + TABLE_CONFIG.FIELD_HEIGHT}
    >
      {({ isSelected: isSelectedFromStatus, edit }) => (
        <foreignObject
          key={tableData.id}
          x={tableData.x}
          y={tableData.y}
          width={tableData.width}
          height={height}
          className={`group drop-shadow-lg rounded-md ${isLinkingMode ? "cursor-pointer" : "cursor-move"}`}
          onPointerDown={(e) => {
            if (linking) return;
            emitSelect(tableData.id, ObjectType.TABLE, e);
          }}
        >
          <div
            onDoubleClick={isLinkingMode ? undefined : edit}
            className={`border outline-none select-none rounded-lg w-full h-full relative ${
                   settings.mode === "light"
                     ? "bg-zinc-100 text-zinc-800"
                     : "bg-zinc-800 text-zinc-200"
                 } ${borderColor}`}
            style={{ direction: "ltr" }}
          >
            <div
              className="w-full rounded-t-md"
              style={{ 
                backgroundColor: headerColor,
                height: `${TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT}px`
              }}
            />
            <div
              className={`overflow-hidden font-bold flex justify-between items-center border-b border-gray-400 ${
                settings.mode === "light" ? "bg-zinc-200" : "bg-zinc-900"
              }`}
              style={{ height: `${TABLE_CONFIG.HEADER.HEIGHT}px` }}
            >
              <div className="px-3 overflow-hidden text-ellipsis whitespace-nowrap">
                {settings.tableNamesUppercase
                  ? tableData.name.toUpperCase()
                  : tableData.name}
              </div>
              <TableHeader 
                tableData={tableData} 
                lockUnlockTable={lockUnlockTable} 
                openEditor={edit} 
              />
            </div>
            <TableFields 
              tableData={tableData}
              hoveredField={hoveredField}
              setHoveredField={setHoveredField}
              handleGripField={handleGripField}
            />
          </div>
        </foreignObject>
      )}
    </CanvasObject>
  );
}

export default React.memo(Table);
