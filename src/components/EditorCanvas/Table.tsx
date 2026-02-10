import React, { useMemo, useState } from "react";
import {
  Tab,
  Action,
  State,
  ObjectType,
  TABLE_CONFIG,
} from "../../data/constants";
import {
  IconEdit,
  IconMore,
  IconMinus,
  IconDeleteStroked,
  IconKeyStroked,
  IconLock,
  IconUnlock,
} from "@douyinfe/semi-icons";
import { Popover, Tag, Button, SideSheet } from "@douyinfe/semi-ui";
import {
  useLayout,
  useSettings,
  useDiagram,
  useSelect,
  useUndoRedo,
  useSaveState,
  useTransform,
  useTableStyle,
} from "../../hooks";
import TableInfo from "../EditorSidePanel/TablesTab/TableInfo";
import { useTranslation } from "react-i18next";
import { dbToTypes } from "../../data/datatypes";
import { isRtl } from "../../i18n/utils/rtl";
import i18n from "../../i18n/i18n";
import { getTableHeight, getTableWidth } from "../../utils/utils";
import { ITable, IField, TableProps } from "../../types";

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
    database, 
    updateTable, 
    deleteField, 
    deleteTable, 
    relationships, 
    setLinkingLine, 
    tables, 
    setHoveredTable, 
    linking, 
    linkingLine 
  } = useDiagram();
  const { layout } = useLayout();
  const { settings } = useSettings();
  const { transform } = useTransform();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { setSaveState } = useSaveState();
  const { t } = useTranslation();
  const {
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
  } = useSelect();

  const { isSelected, borderColor, headerColor } = useTableStyle(
    tableData,
    selectedElement,
    bulkSelectedElements,
    settings
  );

  /**
   * Handles the manual resizing of the table.
   * 
   * @param {React.PointerEvent} e - The pointer down event on the resize handle.
   */
  const handleResize = (e: React.PointerEvent) => {
    if (layout.readOnly || tableData.locked) return;
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = tableData.width;
    const startHeight = tableData.height || 0;

    let currentWidth = startWidth;
    let currentHeight = startHeight;

    const baseHeight =
      (tableData.fields?.length || 0) * TABLE_CONFIG.FIELD_HEIGHT +
      TABLE_CONFIG.HEADER.HEIGHT +
      TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT;

    const onPointerMove = (moveEvent: PointerEvent) => {
      // Use client coordinates for consistent delta calculation
      const deltaX = (moveEvent.clientX - startX) / transform.zoom;
      const deltaY = (moveEvent.clientY - startY) / transform.zoom;

      const subtypes = tables.filter((t) => t.supertypeId === tableData.id);
      const minHeightFromSubtypes =
        subtypes.length > 0
          ? Math.max(
              ...subtypes.map((st) => (st.y - tableData.y) + (st.height || 0) + 10),
            )
          : 0;

      const minWidthFromSubtypes =
        subtypes.length > 0
          ? Math.max(
              ...subtypes.map((st) => (st.x - tableData.x) + (st.width || 0) + 10),
            )
          : 0;

      const minHeight = Math.max(
        baseHeight,
        minHeightFromSubtypes,
        TABLE_CONFIG.HEADER.HEIGHT + TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT + TABLE_CONFIG.FIELD_HEIGHT,
      );

      const minWidth = Math.max(150, minWidthFromSubtypes);

      currentWidth = Math.max(minWidth, startWidth + deltaX);
      currentHeight = Math.max(minHeight, startHeight + deltaY);

      updateTable(
        tableData.id,
        {
          width: currentWidth,
          height: currentHeight,
        },
        false,
      );

      if (tableData.supertypeId) {
        const supertype = tables.find((t) => t.id === tableData.supertypeId);
        if (supertype) {
          const currentSubtypes = tables
            .filter((t) => t.supertypeId === supertype.id)
            .map((t) =>
              t.id === tableData.id
                ? { ...t, width: currentWidth, height: currentHeight }
                : t,
            );
          const newHeight = getTableHeight(supertype, currentSubtypes);
          const newWidth = getTableWidth(supertype, currentSubtypes);
          updateTable(supertype.id, { height: newHeight, width: newWidth }, false);
        }
      }

      setBulkSelectedElements((prev) =>
        prev.map((el) =>
          el.id === tableData.id && el.type === ObjectType.TABLE
            ? { ...el, initialCoords: { x: tableData.x, y: tableData.y } }
            : el,
        ),
      );
    };

    const onPointerUp = () => {
      document.body.classList.remove("cursor-nwse-resize");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.TABLE,
          component: "self",
          tid: tableData.id,
          undo: { width: startWidth, height: startHeight },
          redo: { width: currentWidth, height: currentHeight },
          message: t("edit_table", {
            tableName: tableData.name,
            extra: "[resize]",
          }),
        },
      ]);
      setRedoStack([]);
    };

    document.body.classList.add("cursor-nwse-resize");
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  /**
   * Toggles the locked state of the table.
   * 
   * @param {React.MouseEvent} e - The click event.
   */
  const lockUnlockTable = (e: React.MouseEvent) => {
    const locking = !tableData.locked;
    updateTable(tableData.id, { locked: locking });

    const lockTable = () => {
      setSelectedElement({
        ...selectedElement,
        element: ObjectType.NONE,
        id: -1,
        open: false,
      });
      setBulkSelectedElements((prev) =>
        prev.filter(
          (el) => el.id !== tableData.id || el.type !== ObjectType.TABLE,
        ),
      );
    };

    const unlockTable = () => {
      const elementInBulk = {
        id: tableData.id,
        type: ObjectType.TABLE,
        initialCoords: { x: tableData.x, y: tableData.y },
        currentCoords: { x: tableData.x, y: tableData.y },
      };
      if (e.ctrlKey || e.metaKey) {
        setBulkSelectedElements((prev) => [...prev, elementInBulk]);
      } else {
        setBulkSelectedElements([elementInBulk]);
      }
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.TABLE,
        id: tableData.id,
        open: false,
      }));
    };

    if (locking) {
      lockTable();
    } else {
      unlockTable();
    }
  };

  const height = tableData.height || (
    (tableData.fields?.length || 0) * TABLE_CONFIG.FIELD_HEIGHT +
    TABLE_CONFIG.HEADER.HEIGHT +
    TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT
  );

  /**
   * Opens the table editor in the side panel or a side sheet.
   */
  const openEditor = () => {
    if (!layout.sidebar) {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.TABLE,
        id: tableData.id,
        open: true,
      }));
    } else {
      setSelectedElement((prev) => ({
        ...prev,
        currentTab: Tab.TABLES,
        element: ObjectType.TABLE,
        id: tableData.id,
        open: true,
      }));
      if (selectedElement.currentTab !== Tab.TABLES) return;
      document
        .getElementById(`scroll_table_${tableData.id}`)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (tableData.hidden) return null;

  const isLinkingMode = linking && tableData.id !== linkingLine.startTableId;

  return (
    <>
      <foreignObject
        key={tableData.id}
        x={tableData.x}
        y={tableData.y}
        width={tableData.width}
        height={height}
        className={`group drop-shadow-lg rounded-md ${isLinkingMode ? "cursor-pointer" : "cursor-move"}`}
        onPointerDown={(e) => {
          if (linking) {
            return;
          }
          onPointerDown(e);
        }}
      >
        <div
          onDoubleClick={isLinkingMode ? undefined : openEditor}
          className={`border-2 ${isLinkingMode ? "hover:border-solid hover:border-blue-500" : "hover:border-dashed hover:border-blue-500"}
               select-none rounded-lg w-full h-full relative ${
                 settings.mode === "light"
                   ? "bg-zinc-100 text-zinc-800"
                   : "bg-zinc-800 text-zinc-200"
               } ${isSelected ? "border-solid border-blue-500" : borderColor}`}
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
            <div className="hidden group-hover:block">
              <div className="flex justify-end items-center mx-2 space-x-1.5">
                <Button
                  icon={tableData.locked ? <IconLock /> : <IconUnlock />}
                  size="small"
                  theme="solid"
                  style={{
                    backgroundColor: "#2f68adb3",
                  }}
                  disabled={layout.readOnly}
                  onClick={lockUnlockTable}
                />
                <Button
                  icon={<IconEdit />}
                  size="small"
                  theme="solid"
                  style={{
                    backgroundColor: "#2f68adb3",
                  }}
                  onClick={openEditor}
                />
                <Popover
                  key={`table_more_${tableData.id}`}
                  content={
                    <div className="popover-theme">
                      <div className="mb-2">
                        <strong>{t("comment")}:</strong>{" "}
                        {tableData.comment === "" ? (
                          t("not_set")
                        ) : (
                          <div>{tableData.comment}</div>
                        )}
                      </div>
                      <div>
                        <strong
                          className={`${
                            tableData.indices.length === 0 ? "" : "block"
                          }`}
                        >
                          {t("indices")}:
                        </strong>{" "}
                        {tableData.indices.length === 0 ? (
                          t("not_set")
                        ) : (
                          <div>
                            {tableData.indices.map((index) => (
                              <div
                                key={index.id || index.name || `index_${index.fields.join("_")}`}
                                className={`flex items-center my-1 px-2 py-1 rounded ${
                                  settings.mode === "light"
                                    ? "bg-gray-100"
                                    : "bg-zinc-800"
                                }`}
                              >
                                <i className="fa-solid fa-thumbtack me-2 mt-1 text-slate-500"></i>
                                <div>
                                  {index.fields.map((f, fk) => (
                                    <Tag color="blue" key={`${f}_${fk}`} className="me-1">
                                      {f}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        icon={<IconDeleteStroked />}
                        type="danger"
                        block
                        style={{ marginTop: "8px" }}
                        onClick={() => deleteTable(tableData.id)}
                        disabled={layout.readOnly}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  }
                  position="rightTop"
                  showArrow
                  trigger="click"
                  style={{ width: "200px", wordBreak: "break-word" }}
                >
                  <Button
                    icon={<IconMore />}
                    type="tertiary"
                    size="small"
                    style={{
                      backgroundColor: "#808080b3",
                      color: "white",
                    }}
                  />
                </Popover>
              </div>
            </div>
          </div>
          {tableData.fields.map((e, i) => {
            return settings.showFieldSummary ? (
              <Popover
                key={e.id || i}
                content={
                  <div className="popover-theme">
                    <div
                      className="flex justify-between items-center pb-2"
                      style={{ direction: "ltr" }}
                    >
                      <p className="me-4 font-bold">{e.name}</p>
                      <p
                        className={
                          "ms-4 font-mono " + dbToTypes[database][e.type].color
                        }
                      >
                        {e.type +
                          ((dbToTypes[database][e.type].isSized ||
                            dbToTypes[database][e.type].hasPrecision) &&
                          e.size &&
                          e.size !== ""
                            ? "(" + e.size + ")"
                            : "")}
                      </p>
                    </div>
                    <hr />
                    {e.primary && (
                      <Tag color="blue" className="me-2 my-2">
                        {t("primary")}
                      </Tag>
                    )}
                    {e.unique && (
                      <Tag color="amber" className="me-2 my-2">
                        {t("unique")}
                      </Tag>
                    )}
                    {e.notNull && (
                      <Tag color="purple" className="me-2 my-2">
                        {t("not_null")}
                      </Tag>
                    )}
                    {e.increment && (
                      <Tag color="green" className="me-2 my-2">
                        {t("autoincrement")}
                      </Tag>
                    )}
                    <p>
                      <strong>{t("default_value")}: </strong>
                      {e.default === "" ? t("not_set") : e.default}
                    </p>
                    <p>
                      <strong>{t("comment")}: </strong>
                      {e.comment === "" ? t("not_set") : e.comment}
                    </p>
                  </div>
                }
                position="right"
                showArrow
                trigger="hover"
                mouseEnterDelay={200}
                mouseLeaveDelay={200}
                style={
                  isRtl(i18n.language)
                    ? { direction: "rtl" }
                    : { direction: "ltr" }
                }
              >
                {renderField(e, i)}
              </Popover>
            ) : (
              renderField(e, i)
            );
          })}
          {!layout.readOnly && !tableData.locked && (
            <div
              className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-30 flex justify-end items-end p-1 group/resize"
              onPointerDown={handleResize}
            >
              <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 group-hover/resize:border-blue-500 transition-colors" />
            </div>
          )}
        </div>
      </foreignObject>
      <SideSheet
        title={t("edit")}
        size="small"
        visible={
          selectedElement.element === ObjectType.TABLE &&
          selectedElement.id === tableData.id &&
          selectedElement.open &&
          !layout.sidebar
        }
        onCancel={() =>
          setSelectedElement((prev) => ({
            ...prev,
            open: !prev.open,
          }))
        }
        style={{ paddingBottom: "16px" }}
      >
        <div className="sidesheet-theme">
          <TableInfo data={tableData} />
        </div>
      </SideSheet>
    </>
  );

  /**
   * Renders a single field of the table.
   * 
   * @param {IField} fieldData - The field data.
   * @param {number} index - The index of the field in the fields array.
   * @returns {JSX.Element} The rendered field.
   */
  function renderField(fieldData: IField, index: number) {
    const isForeignKey = relationships.some(
      (rel) =>
        rel.endTableId === tableData.id && rel.endFieldId === fieldData.id,
    );

    return (
      <div
        key={fieldData.id || index}
        className={`${
          index === tableData.fields.length - 1
            ? ""
            : "border-b border-gray-400"
        } group px-2 py-1 flex justify-between items-center gap-1 w-full overflow-hidden`}
        style={{ height: `${TABLE_CONFIG.FIELD_HEIGHT}px` }}
        onPointerEnter={(e) => {
          if (!e.isPrimary) return;

          if (linking) {
            setHoveredTable({
              tableId: tableData.id,
              fieldId: fieldData.id,
            });
            return;
          }

          if (!settings.showFieldSummary) return;

          setHoveredField(index);
          setHoveredTable({
            tableId: tableData.id,
            fieldId: fieldData.id,
          });
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
        onPointerCancel={(e) => {
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
        onPointerUp={(e) => {
          if (!e.isPrimary) return;

          if (linking) return;

          setHoveredField(null);
          setHoveredTable({
            tableId: null,
            fieldId: null,
          });
        }}
        onPointerDown={(e) => {
          // Required for onPointerLeave to trigger when a touch pointer leaves
          // https://stackoverflow.com/a/70976017/1137077
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        }}
        onClick={(e) => {
          if (!settings.showFieldSummary) {
            e.stopPropagation();
          }
        }}
      >
        <div
          className={`${
            hoveredField === index ? "text-zinc-400" : ""
          } flex items-center gap-2 overflow-hidden`}
        >
          {settings.showPKIcons || settings.showFKIcons ? (
            <div
              className="shrink-0 flex items-center gap-1"
              onPointerDown={(e) => {
                if (!e.isPrimary) return;
                e.stopPropagation();

                handleGripField();
                setLinkingLine((prev) => ({
                  ...prev,
                  startFieldId: fieldData.id,
                  startTableId: tableData.id,
                  startX: tableData.x + 15,
                  startY:
                    tableData.y +
                    index * TABLE_CONFIG.FIELD_HEIGHT +
                    TABLE_CONFIG.HEADER.HEIGHT +
                    TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT +
                    TABLE_CONFIG.FIELD_HEIGHT / 2,
                  endX: tableData.x + 15,
                  endY:
                    tableData.y +
                    index * TABLE_CONFIG.FIELD_HEIGHT +
                    TABLE_CONFIG.HEADER.HEIGHT +
                    TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT +
                    TABLE_CONFIG.FIELD_HEIGHT / 2,
                }));
              }}
            >
              {settings.showPKIcons &&
                (fieldData.primary ? (
                  <div className="shrink-0 flex items-center justify-center cursor-pointer">
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
                !fieldData.primary &&
                !isForeignKey && (
                  <div className="shrink-0 w-[10px] h-[10px]" />
                )}
            </div>
          ) : (
            <button
              className="shrink-0 w-[10px] h-[10px] bg-[#2f68adcc] rounded-full"
              onPointerDown={(e) => {
                if (!e.isPrimary) return;
                e.stopPropagation();

                handleGripField();
                setLinkingLine((prev) => ({
                  ...prev,
                  startFieldId: fieldData.id,
                  startTableId: tableData.id,
                  startX: tableData.x + 15,
                  startY:
                    tableData.y +
                    index * TABLE_CONFIG.FIELD_HEIGHT +
                    TABLE_CONFIG.HEADER.HEIGHT +
                    TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT +
                    TABLE_CONFIG.FIELD_HEIGHT / 2,
                  endX: tableData.x + 15,
                  endY:
                    tableData.y +
                    index * TABLE_CONFIG.FIELD_HEIGHT +
                    TABLE_CONFIG.HEADER.HEIGHT +
                    TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT +
                    TABLE_CONFIG.FIELD_HEIGHT / 2,
                }));
              }}
            />
          )}
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {fieldData.name}
          </span>
        </div>
        <div className="text-zinc-400">
          {hoveredField === index ? (
            <Button
              theme="solid"
              size="small"
              style={{
                backgroundColor: "#d42020b3",
              }}
              icon={<IconMinus />}
              disabled={layout.readOnly}
              onClick={() => {
                if (layout.readOnly) return;
                deleteField(fieldData, tableData.id);
              }}
            />
          ) : settings.showDataTypes ? (
            <div className="flex gap-1 items-center">
              {fieldData.primary && !settings.showPKIcons && <IconKeyStroked />}
              {isForeignKey && !settings.showFKIcons && (
                <div className="text-orange-400 flex items-center">
                  <IconKeyStroked />
                </div>
              )}
              {!fieldData.notNull && <span className="font-mono">?</span>}
              <span
                className={
                  "font-mono " + dbToTypes[database][fieldData.type].color
                }
              >
                {fieldData.type +
                  ((dbToTypes[database][fieldData.type].isSized ||
                    dbToTypes[database][fieldData.type].hasPrecision) &&
                  fieldData.size &&
                  fieldData.size !== ""
                    ? `(${fieldData.size})`
                    : "")}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default React.memo(Table);
