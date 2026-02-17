import React from "react";
import {
  TABLE_CONFIG,
  ObjectType,
} from "@data/constants";
import {
  IconKeyStroked,
  IconMinus,
  IconArrowLeft,
} from "@douyinfe/semi-icons";
import { Button } from "@douyinfe/semi-ui";
import {
  useSettings,
  useDiagram,
  useLayout,
} from "@hooks";
import { dbToTypes } from "@data/datatypes";
import { ITable, IField } from "@types";
import { FieldPopover } from "./FieldPopover";

interface TableFieldsProps {
  tableData: ITable;
  hoveredField: number | null;
  setHoveredField: (id: number | null) => void;
  handleGripField: (e: React.PointerEvent, field: IField) => void;
}

export const TableFields: React.FC<TableFieldsProps> = ({
  tableData,
  hoveredField,
  setHoveredField,
  handleGripField,
}) => {
  const { settings } = useSettings();
  const { database, relationships, linking, setHoveredTable, setLinkingLine, deleteField } = useDiagram();
  const { layout } = useLayout();

  return (
    <>
      {tableData.fields.map((field, i) => {
        const isHovered = hoveredField === field.id;
        const isForeignKey = relationships.some(
          (rel) =>
            rel.endTableId === tableData.id && rel.endFieldId === field.id,
        );

        const fieldColor =
          dbToTypes[database][field.type.toUpperCase()]?.color || "transparent";

        return (
          <FieldPopover key={field.id || i} field={field}>
            <div
              className={`${
                i === tableData.fields.length - 1
                  ? ""
                  : "border-b border-gray-400"
              } flex justify-between items-center px-2 cursor-pointer ${
                isHovered ? (settings.mode === "light" ? "bg-gray-200" : "bg-zinc-700") : ""
              }`}
              style={{ height: `${TABLE_CONFIG.FIELD_HEIGHT}px` }}
              onPointerEnter={(e) => {
                if (!e.isPrimary) return;
                if (linking) {
                  setHoveredTable({
                    tableId: tableData.id,
                    fieldId: field.id,
                  });
                  return;
                }
                setHoveredField(field.id as number);
                if (settings.showFieldSummary) {
                  setHoveredTable({
                    tableId: tableData.id,
                    fieldId: field.id,
                  });
                }
              }}
              onPointerLeave={(e) => {
                if (!e.isPrimary) return;
                if (linking) {
                  setHoveredTable({
                    tableId: null,
                    fieldId: null,
                  });
                  return;
                }
                setHoveredField(null);
                setHoveredTable({
                  tableId: null,
                  fieldId: null,
                });
              }}
            >
              <div className="flex items-center gap-2 overflow-hidden w-full">
                {settings.showPKIcons || settings.showFKIcons ? (
                  <div
                    className="shrink-0 flex items-center gap-1"
                    onPointerDown={(e) => {
                      if (!e.isPrimary) return;
                      e.stopPropagation();
                      handleGripField(e, field);
                      setLinkingLine((prev) => ({
                        ...prev,
                        startFieldId: field.id,
                        startTableId: tableData.id,
                        startX: tableData.x + 15,
                        startY:
                          tableData.y +
                          i * TABLE_CONFIG.FIELD_HEIGHT +
                          TABLE_CONFIG.HEADER.HEIGHT +
                          TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT +
                          TABLE_CONFIG.FIELD_HEIGHT / 2,
                        endX: tableData.x + 15,
                        endY:
                          tableData.y +
                          i * TABLE_CONFIG.FIELD_HEIGHT +
                          TABLE_CONFIG.HEADER.HEIGHT +
                          TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT +
                          TABLE_CONFIG.FIELD_HEIGHT / 2,
                      }));
                    }}
                  >
                    {settings.showPKIcons &&
                      (field.primary ? (
                        <div className="shrink-0 flex items-center justify-center cursor-pointer text-yellow-500">
                          <IconKeyStroked size="small" />
                        </div>
                      ) : (
                        !settings.showFKIcons && (
                          <div className="shrink-0 w-[10px] h-[10px]" />
                        )
                      ))}
                    {settings.showFKIcons &&
                      (isForeignKey ? (
                        <div className="shrink-0 flex items-center justify-center cursor-pointer text-orange-400">
                          <IconKeyStroked size="small" />
                        </div>
                      ) : (
                        !settings.showPKIcons && (
                          <div className="shrink-0 w-[10px] h-[10px]" />
                        )
                      ))}
                    {settings.showPKIcons &&
                      settings.showFKIcons &&
                      !field.primary &&
                      !isForeignKey && (
                        <div className="shrink-0 w-[10px] h-[10px]" />
                      )}
                  </div>
                ) : (
                  <button
                    className={`shrink-0 flex items-center justify-center ${isHovered ? "hover-arrow" : "w-[10px] h-[10px] bg-[#2f68adcc] rounded-full"}`}
                    onPointerDown={(e) => {
                      if (!e.isPrimary) return;
                      e.stopPropagation();
                      handleGripField(e, field);
                      setLinkingLine((prev) => ({
                        ...prev,
                        startFieldId: field.id,
                        startTableId: tableData.id,
                        startX: tableData.x + 15,
                        startY:
                          tableData.y +
                          i * TABLE_CONFIG.FIELD_HEIGHT +
                          TABLE_CONFIG.HEADER.HEIGHT +
                          TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT +
                          TABLE_CONFIG.FIELD_HEIGHT / 2,
                        endX: tableData.x + 15,
                        endY:
                          tableData.y +
                          i * TABLE_CONFIG.FIELD_HEIGHT +
                          TABLE_CONFIG.HEADER.HEIGHT +
                          TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT +
                          TABLE_CONFIG.FIELD_HEIGHT / 2,
                      }));
                    }}
                  >
                    {isHovered && <IconArrowLeft size="small" />}
                  </button>
                )}
                <div className="truncate text-sm font-medium">
                  {field.name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isHovered ? (
                  <Button
                    theme="solid"
                    size="small"
                    style={{
                      backgroundColor: "#d42020b3",
                    }}
                    icon={<IconMinus />}
                    disabled={layout.readOnly}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (layout.readOnly) return;
                      deleteField(field, tableData.id);
                    }}
                  />
                ) : settings.showDataTypes ? (
                  <div className="flex gap-1 items-center">
                    {field.primary && !settings.showPKIcons && (
                      <div className="text-yellow-500 flex items-center">
                        <IconKeyStroked size="small" />
                      </div>
                    )}
                    {isForeignKey && !settings.showFKIcons && (
                      <div className="text-orange-400 flex items-center">
                        <IconKeyStroked size="small" />
                      </div>
                    )}
                    {!field.notNull && <span className="font-mono text-[10px]">?</span>}
                    <span
                      className={
                        "font-mono text-[10px] uppercase font-bold " + 
                        (dbToTypes[database][field.type.toUpperCase()]?.color || "")
                      }
                    >
                      {field.type +
                        ((dbToTypes[database][field.type.toUpperCase()]?.isSized ||
                          dbToTypes[database][field.type.toUpperCase()]?.hasPrecision) &&
                        field.size &&
                        field.size !== ""
                          ? `(${field.size})`
                          : "")}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </FieldPopover>
        );
      })}
    </>
  );
};
