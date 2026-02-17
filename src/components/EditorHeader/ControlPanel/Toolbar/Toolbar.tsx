import React, { Dispatch, SetStateAction } from "react";
import {
  IconCaretdown,
  IconChevronUp,
  IconChevronDown,
  IconUndo,
  IconRedo,
  IconSaveStroked,
  IconDeleteStroked,
} from "@douyinfe/semi-icons";
import {
  Divider,
  Dropdown,
  InputNumber,
  Tooltip,
  Toast,
} from "@douyinfe/semi-ui";
import {
  ObjectType,
  SIDESHEET,
  Cardinality,
} from "@data/constants";
import {
  useLayout,
  useSettings,
  useTransform,
  useDiagram,
  useUndoRedo,
  useSelect,
  useCanvas,
} from "@hooks";
import {
  IconAddArea,
  IconAddNote,
  IconAddTable,
  IconAddXorGroup,
  IconAddOrGroup,
  IconAddText,
  IconSupertype,
  IconWaypoint,
  IconDivider,
} from "@icons";
import LayoutDropdown from "../../LayoutDropdown";
import { useTranslation } from "react-i18next";
import { isRtl } from "@i18n/utils/rtl";

interface ToolbarProps {
  setModal: Dispatch<SetStateAction<number>>; // (modal: number) => void;
  setSidesheet: Dispatch<SetStateAction<number>>; // (sidesheet: number) => void;
  undo: () => void;
  redo: () => void;
  save: () => void;
  addTable: () => void;
  addArea: () => void;
  addNote: () => void;
  addText: () => void;
  fitWindow: (zoom: number) => void;
  createXorGroup: () => void;
  createOrGroup: () => void;
  del: () => void;
  isSingleXorGroupSelected: boolean;
  isSingleOrGroupSelected: boolean;
  convertXorToOr: (id: string | number) => void;
  convertOrToXor: (id: string | number) => void;
  relationshipOptions: any[];
  canCreateXorGroup: boolean;
  canCreateOrGroup: boolean;
}

export default function Toolbar({
  setModal,
  setSidesheet,
  undo,
  redo,
  save,
  addTable,
  addArea,
  addNote,
  addText,
  fitWindow,
  createXorGroup,
  createOrGroup,
  del,
  isSingleXorGroupSelected,
  isSingleOrGroupSelected,
  convertXorToOr,
  convertOrToXor,
  relationshipOptions,
  canCreateXorGroup,
  canCreateOrGroup,
}: ToolbarProps) {
  const { t, i18n } = useTranslation();
  const { layout, setLayout } = useLayout();
  const { setSettings } = useSettings();
  const { transform, setTransform } = useTransform();

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? 'Cmd' : 'Ctrl';

  const {
    tables,
    linking,
    setLinking,
    linkingLine,
    setLinkingLine,
    relationshipType,
    setRelationshipType,
    waypointMode,
    setWaypointMode,
  } = useDiagram();
  const { pointer } = useCanvas();
  const { undoStack, redoStack } = useUndoRedo();
  const {
    selectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
  } = useSelect();

  const invertLayout = (component: string) =>
    setLayout((prev: any) => ({ ...prev, [component]: !prev[component] }));

  return (
    <div
      className="py-1.5 px-5 flex justify-between items-center rounded-xl my-1 sm:mx-1 xl:mx-6 select-none overflow-hidden toolbar-theme"
      style={isRtl(i18n.language) ? { direction: "rtl" } : {}}
    >
      <div className="flex justify-start items-center">
        <LayoutDropdown setModal={setModal} />
        <Divider layout="vertical" margin="8px" />
        <Tooltip content={t("zoom_out")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm text-lg"
            onClick={() =>
              setTransform((prev) => ({ ...prev, zoom: prev.zoom / 1.2 }))
            }
          >
            <i className="fa-solid fa-magnifying-glass-minus" />
          </button>
        </Tooltip>
        <Dropdown
          style={{ width: "240px" }}
          position={isRtl(i18n.language) ? "bottomRight" : "bottomLeft"}
          render={
            <Dropdown.Menu
              style={isRtl(i18n.language) ? { direction: "rtl" } : {}}
            >
              <Dropdown.Item
                onClick={() => fitWindow(100)}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div>{t("fit_window_reset")}</div>
                <div className="text-gray-400">Ctrl+Alt+W</div>
              </Dropdown.Item>
              <Dropdown.Divider />
              {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0].map((e, i) => (
                <Dropdown.Item
                  key={i}
                  onClick={() => {
                    setTransform((prev) => ({ ...prev, zoom: e }));
                  }}
                >
                  {Math.floor(e * 100)}%
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item>
                <InputNumber
                  // @ts-ignore
                  field="zoom"
                  label={t("zoom")}
                  placeholder={t("zoom")}
                  suffix={<div className="p-1">%</div>}
                  onChange={(v: any) =>
                    setTransform((prev: any) => ({
                      ...prev,
                      zoom: parseFloat(v.toString()) * 0.01,
                    }))
                  }
                />
              </Dropdown.Item>
            </Dropdown.Menu>
          }
          trigger="click"
        >
          <div className="py-1 px-2 hover-2 rounded-sm flex items-center justify-center">
            <div className="w-[40px]">
              {Math.floor(transform.zoom * 100)}%
            </div>
            <div>
              <IconCaretdown />
            </div>
          </div>
        </Dropdown>
        <Tooltip content={t("zoom_in")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm text-lg"
            onClick={() =>
              setTransform((prev) => ({ ...prev, zoom: prev.zoom * 1.2 }))
            }
          >
            <i className="fa-solid fa-magnifying-glass-plus" />
          </button>
        </Tooltip>
        <Divider layout="vertical" margin="8px" />
        <Tooltip content={t("fit_window_reset")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm text-lg"
            onClick={() => fitWindow(100)}
          >
            <i className="fa-solid fa-expand" />
          </button>
        </Tooltip>
        <Divider layout="vertical" margin="8px" />
        <Tooltip content={t("undo")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
            disabled={undoStack.length === 0 || layout.readOnly}
            onClick={undo}
          >
            <IconUndo size="large" />
          </button>
        </Tooltip>
        <Tooltip content={t("redo")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
            disabled={redoStack.length === 0 || layout.readOnly}
            onClick={redo}
          >
            <IconRedo size="large" />
          </button>
        </Tooltip>
        <Divider layout="vertical" margin="8px" />
        <Tooltip content={t("add_table")} position="bottom">
          <button
            className="flex items-center py-1 px-2 hover-2 rounded-sm disabled:opacity-50"
            onClick={() => addTable()}
            disabled={layout.readOnly}
          >
            <IconAddTable />
          </button>
        </Tooltip>
        <Tooltip content={t("add_area")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
            onClick={() => addArea()}
            disabled={layout.readOnly}
          >
            <IconAddArea />
          </button>
        </Tooltip>
        <Tooltip content={t("add_note")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
            onClick={() => addNote()}
            disabled={layout.readOnly}
          >
            <IconAddNote />
          </button>
        </Tooltip>
        <Tooltip content={t("add_text")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
            onClick={() => addText()}
            disabled={layout.readOnly}
          >
            <IconAddText />
          </button>
        </Tooltip>
        <Tooltip content={`${t("assign_supertype")} (${modKey} + Click)`} position="bottom">
          <button
            className={`py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 ${linking && linkingLine.startFieldId === "" ? "text-blue-500" : ""}`}
            onClick={() => {
              if (
                bulkSelectedElements.length === 1 &&
                bulkSelectedElements[0].type === ObjectType.TABLE
              ) {
                const selectedTable = tables.find(
                  (t) => t.id === bulkSelectedElements[0].id
                );
                setLinking(true);
                setLinkingLine({
                  startX: selectedTable
                    ? selectedTable.x + selectedTable.width / 2
                    : 0,
                  startY: selectedTable
                    ? selectedTable.y + (selectedTable.height || 0) / 2
                    : 0,
                  endX: pointer.spaces.diagram.x,
                  endY: pointer.spaces.diagram.y,
                  startTableId: bulkSelectedElements[0].id,
                  startFieldId: "",
                });
                setBulkSelectedElements([]);
              } else {
                Toast.info("Select a table first");
              }
            }}
            disabled={layout.readOnly}
          >
            <IconSupertype />
          </button>
        </Tooltip>
        <Divider layout="vertical" margin="8px" />
        <Tooltip content={t("waypoint")} position="bottom">
          <button
            className={`py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 ${waypointMode === "waypoint" ? "text-blue-500" : ""}`}
            onClick={() => setWaypointMode("waypoint")}
            disabled={layout.readOnly}
          >
            <IconWaypoint />
          </button>
        </Tooltip>
        <Tooltip content={t("divider")} position="bottom">
          <button
            className={`py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 ${waypointMode === "divider" ? "text-blue-500" : ""}`}
            onClick={() => setWaypointMode("divider")}
            disabled={layout.readOnly}
          >
            <IconDivider />
          </button>
        </Tooltip>
        <Divider layout="vertical" margin="8px" />
        {relationshipOptions.map((option) => (
          <Tooltip key={option.type} content={option.tooltip} position="bottom">
            <button
              className={`py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 ${relationshipType === option.type ? "text-blue-500" : ""}`}
              onClick={() => setRelationshipType(option.type)}
              disabled={layout.readOnly}
            >
              {option.icon}
            </button>
          </Tooltip>
        ))}
        {isSingleXorGroupSelected && (
          <Tooltip content={t("convert_to_or")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-green-500"
              onClick={() => convertXorToOr(bulkSelectedElements[0].id)}
              disabled={layout.readOnly}
            >
              <IconAddOrGroup />
            </button>
          </Tooltip>
        )}
        {isSingleOrGroupSelected && (
          <Tooltip content={t("convert_to_xor")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-blue-500"
              onClick={() => convertOrToXor(bulkSelectedElements[0].id)}
              disabled={layout.readOnly}
            >
              <IconAddXorGroup />
            </button>
          </Tooltip>
        )}
        {(selectedElement.element !== ObjectType.NONE ||
          bulkSelectedElements.length > 0) && (
          <Tooltip content={t("delete")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-red-500"
              onClick={del}
              disabled={layout.readOnly}
            >
              <IconDeleteStroked />
            </button>
          </Tooltip>
        )}
        {canCreateXorGroup && (
          <Tooltip content={t("add_xor_group")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-blue-500"
              onClick={createXorGroup}
              disabled={layout.readOnly}
            >
              <IconAddXorGroup />
            </button>
          </Tooltip>
        )}
        {canCreateOrGroup && (
          <Tooltip content={t("add_or_group")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-green-500"
              onClick={createOrGroup}
              disabled={layout.readOnly}
            >
              <IconAddOrGroup />
            </button>
          </Tooltip>
        )}
        <Divider layout="vertical" margin="8px" />
        <Tooltip content={t("save")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
            onClick={save}
            disabled={layout.readOnly}
          >
            <IconSaveStroked size="extra-large" />
          </button>
        </Tooltip>

        <Tooltip content={t("to_do")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm text-xl -mt-0.5"
            onClick={() => setSidesheet(SIDESHEET.TODO)}
          >
            <i className="fa-regular fa-calendar-check" />
          </button>
        </Tooltip>
        <Divider layout="vertical" margin="8px" />
        <Tooltip content={t("versions")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm text-xl -mt-0.5"
            onClick={() => setSidesheet(SIDESHEET.VERSIONS)}
          >
            <i className="fa-solid fa-code-branch" />
          </button>
        </Tooltip>
        <Divider layout="vertical" margin="8px" />
        <Tooltip content={t("theme")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm text-xl -mt-0.5"
            onClick={() => {
              setSettings((prev) => ({
                ...prev,
                mode: prev.mode === "light" ? "dark" : "light",
              }));
            }}
          >
            <i className="fa-solid fa-circle-half-stroke" />
          </button>
        </Tooltip>
      </div>
      <button
        onClick={() => invertLayout("header")}
        className="flex items-center"
      >
        {layout.header ? <IconChevronUp /> : <IconChevronDown />}
      </button>
    </div>
  );
}
