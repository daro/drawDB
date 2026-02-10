import React, { useMemo, useState, useRef, useEffect} from "react";
import { Button, Popover, Input } from "@douyinfe/semi-ui";
import ColorPicker from "../EditorSidePanel/ColorPicker";
import {
  IconEdit,
  IconDeleteStroked,
  IconLock,
  IconUnlock,
} from "@douyinfe/semi-icons";
import { Tab, Action, ObjectType, State } from "../../data/constants";
import {
  useLayout,
  useSettings,
  useUndoRedo,
  useSelect,
  useAreas,
  useSaveState,
  useCanvas,
} from "../../hooks";
import { useTranslation } from "react-i18next";
import ColorList from "../ColorList";
import { IArea, AreaProps } from "../../types";
import { GRID_CONFIG, AREA_CONFIG } from "../../data/constants";

/**
 * A component that renders a subject area on the canvas.
 * Subject areas are used to group tables and other elements visually.
 * 
 * @param {AreaProps} props - The component props.
 * @returns {JSX.Element} The rendered area.
 */
function Area({
  data,
  onPointerDown,
  setResize,
  setInitDimensions,
}: AreaProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const { layout } = useLayout();
  const { settings } = useSettings();
  const { setSaveState } = useSaveState();
  const { areas, updateArea } = useAreas();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { t } = useTranslation();
  const { pointer } = useCanvas();
  const {
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
  } = useSelect();

  const [resizing, setResizing] = useState<{ id: string; dir: string } | null>(null);
  const initialDimensionsRef = useRef<IAreaInitDimensions | null>(null);

  const handleResize = (e: React.PointerEvent, dir: string) => {
    if (layout.readOnly || data.locked) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setResizing({ id: data.id, dir: dir });
    initialDimensionsRef.current = {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
    };
    setResize({ id: data.id, dir: dir });
    setInitDimensions({
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!resizing || resizing.id !== data.id) return;
    
    const dir = resizing.dir;
    const newDims = { x: data.x, y: data.y, width: data.width, height: data.height };
    let { x, y } = { x: pointer.spaces.diagram.x!, y: pointer.spaces.diagram.y! };

    if (settings.snapToGrid) {
      x = Math.round(x / GRID_CONFIG.SIZE) * GRID_CONFIG.SIZE;
      y = Math.round(y / GRID_CONFIG.SIZE) * GRID_CONFIG.SIZE;
    }

    switch (dir) {
      case "br":
        newDims.width = x - data.x;
        newDims.height = y - data.y;
        break;
      case "tl":
        newDims.x = x;
        newDims.y = y;
        newDims.width = data.width - (x - data.x);
        newDims.height = data.height - (y - data.y);
        break;
      case "tr":
        newDims.y = y;
        newDims.width = x - data.x;
        newDims.height = data.height - (y - data.y);
        break;
      case "bl":
        newDims.x = x;
        newDims.width = data.width - (x - data.x);
        newDims.height = y - data.y;
        break;
    }

    if (newDims.width <= AREA_CONFIG.MIN_SIZE) {
      newDims.width = AREA_CONFIG.MIN_SIZE;
      if (dir === "tl" || dir === "bl") {
        newDims.x = data.x + data.width - AREA_CONFIG.MIN_SIZE;
      }
    }

    if (newDims.height <= AREA_CONFIG.MIN_SIZE) {
      newDims.height = AREA_CONFIG.MIN_SIZE;
      if (dir === "tl" || dir === "tr") {
        newDims.y = data.y + data.height - AREA_CONFIG.MIN_SIZE;
      }
    }

    if (newDims.x !== data.x || newDims.y !== data.y || newDims.width !== data.width || newDims.height !== data.height) {
      updateArea(data.id, newDims);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!resizing) return;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    
    const init = initialDimensionsRef.current;
    if (init && (data.x !== init.x || data.y !== init.y || 
        data.width !== init.width || data.height !== init.height)) {
      setUndoStack((prev: any) => [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.AREA,
          aid: data.id,
          undo: {
            ...data,
            x: init.x,
            y: init.y,
            width: init.width,
            height: init.height,
          },
          redo: { ...data },
          message: t("edit_area", {
            areaName: data.name,
            extra: "[resize]",
          }),
        },
      ]);
      setRedoStack([]);
      setSaveState(State.SAVING);
    }

    setResizing(null);
    setResize({ id: "", dir: "none" });
  };

  const lockUnlockArea = (e: React.MouseEvent) => {
    const locking = !data.locked;
    updateArea(data.id, { locked: locking });

    const lockArea = () => {
      setSelectedElement({
        ...selectedElement,
        element: ObjectType.NONE,
        id: "",
        open: false,
      });
      setBulkSelectedElements((prev) =>
        prev.filter((el) => el.id !== data.id || el.type !== ObjectType.AREA),
      );
    };

    const unlockArea = () => {
      const elementInBulk = {
        id: data.id,
        type: ObjectType.AREA,
        initialCoords: { x: data.x, y: data.y },
        currentCoords: { x: data.x, y: data.y },
      };
      if (e.ctrlKey || e.metaKey) {
        setBulkSelectedElements((prev) => [...prev, elementInBulk]);
      } else {
        setBulkSelectedElements([elementInBulk]);
      }
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.AREA,
        id: data.id,
        open: false,
      }));
    };

    if (locking) {
      lockArea();
    } else {
      unlockArea();
    }
  };

  const edit = () => {
    if (layout.sidebar) {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.AREA,
        id: data.id,
        currentTab: Tab.AREAS,
        open: true,
      }));
      if (selectedElement.currentTab !== Tab.AREAS) return;
      document
        .getElementById(`scroll_area_${data.id}`)
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.AREA,
        id: data.id,
        open: true,
      }));
    }
  };

  const onClickOutSide = () => {
    if (selectedElement.editFromToolbar) {
      setSelectedElement((prev) => ({
        ...prev,
        editFromToolbar: false,
      }));
      return;
    }
    setSelectedElement((prev) => ({
      ...prev,
      open: false,
    }));
    setSaveState(State.SAVING);
  };

  const areaIsOpen = () =>
    selectedElement.element === ObjectType.AREA &&
    selectedElement.id === data.id &&
    selectedElement.open;

  const isSelected = useMemo(() => {
    return (
      (selectedElement.id === data.id &&
        selectedElement.element === ObjectType.AREA) ||
      bulkSelectedElements.some(
        (e) => e.type === ObjectType.AREA && e.id === data.id,
      )
    );
  }, [selectedElement, data, bulkSelectedElements]);

  return (
    <g
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <foreignObject
        key={data.id}
        x={data.x}
        y={data.y}
        width={data.width > 0 ? data.width : 0}
        height={data.height > 0 ? data.height : 0}
        onPointerDown={onPointerDown}
      >
        <div
          className={`w-full h-full p-2 rounded cursor-move border-2 ${
            isHovered
              ? "border-dashed border-blue-500"
              : isSelected
                ? "border-blue-500 opacity-100"
                : "border-slate-400 opacity-100"
          }`}
          style={{ backgroundColor: `${data.color}66` }}
          onDoubleClick={edit}
        >
          <div className="flex justify-between gap-1 w-full">
            <div className="text-color select-none overflow-hidden text-ellipsis">
              {data.name}
            </div>
            {(isHovered || (areaIsOpen() && !layout.sidebar)) && (
              <div className="flex items-center gap-1.5">
                <Button
                  icon={data.locked ? <IconLock /> : <IconUnlock />}
                  size="small"
                  theme="solid"
                  style={{
                    backgroundColor: "#2F68ADB3",
                  }}
                  onClick={lockUnlockArea}
                  disabled={layout.readOnly}
                />
                <Popover
                  visible={areaIsOpen() && !layout.sidebar}
                  onClickOutSide={onClickOutSide}
                  stopPropagation
                  content={<EditPopoverContent data={data} />}
                  trigger="custom"
                  position="rightTop"
                  showArrow
                >
                  <Button
                    icon={<IconEdit />}
                    size="small"
                    theme="solid"
                    style={{
                      backgroundColor: "#2F68ADB3",
                    }}
                    onClick={edit}
                  />
                </Popover>
              </div>
            )}
          </div>
        </div>
      </foreignObject>
      {isHovered && (
        <>
          <circle
            cx={data.x}
            cy={data.y}
            r={6}
            fill={settings.mode === "light" ? "white" : "rgb(28, 31, 35)"}
            stroke="#5891db"
            strokeWidth={2}
            cursor="nwse-resize"
            onPointerDown={(e) => handleResize(e, "tl")}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
          <circle
            cx={data.x + data.width}
            cy={data.y}
            r={6}
            fill={settings.mode === "light" ? "white" : "rgb(28, 31, 35)"}
            stroke="#5891db"
            strokeWidth={2}
            cursor="nesw-resize"
            onPointerDown={(e) => handleResize(e, "tr")}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
          <circle
            cx={data.x}
            cy={data.y + data.height}
            r={6}
            fill={settings.mode === "light" ? "white" : "rgb(28, 31, 35)"}
            stroke="#5891db"
            strokeWidth={2}
            cursor="nesw-resize"
            onPointerDown={(e) => handleResize(e, "bl")}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
          <circle
            cx={data.x + data.width}
            cy={data.y + data.height}
            r={6}
            fill={settings.mode === "light" ? "white" : "rgb(28, 31, 35)"}
            stroke="#5891db"
            strokeWidth={2}
            cursor="nwse-resize"
            onPointerDown={(e) => handleResize(e, "br")}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        </>
      )}
    </g>
  );
}

export default React.memo(Area);

/**
 * The content of the edit popover for an area.
 * 
 * @param {{ data: IArea }} props - The component props.
 * @returns {JSX.Element} The rendered popover content.
 */
function EditPopoverContent({ data }: { data: IArea }): JSX.Element {
  const [editField, setEditField] = useState<{ name?: string }>({});
  const { updateArea, deleteArea } = useAreas();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { t } = useTranslation();
  const { layout } = useLayout();
  const initialColorRef = useRef(data.color);

  const handleColorPick = (color: string) => {
    setUndoStack((prev) => {
      let undoColor = initialColorRef.current;
      const lastColorChange = prev.findLast(
        (e) =>
          e.element === ObjectType.AREA &&
          e.aid === data.id &&
          e.action === Action.EDIT &&
          e.redo?.color,
      );
      if (lastColorChange) {
        undoColor = lastColorChange.redo.color;
      }

      if (color === undoColor) return prev;

      const newStack = [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.AREA,
          aid: data.id,
          undo: { color: undoColor },
          redo: { color: color },
          message: t("edit_area", {
            areaName: data.name,
            extra: "[color]",
          }),
        },
      ];
      return newStack;
    });
    setRedoStack([]);
  };

  return (
    <div className="popover-theme">
      <div className="font-semibold mb-2 ms-1">{t("edit")}</div>
      <div className="w-70 flex items-center mb-2">
        <Input
          value={data.name}
          placeholder={t("name")}
          className="me-2"
          readOnly={layout.readOnly}
          onChange={(value) => updateArea(data.id, { name: value })}
          onFocus={(e) => setEditField({ name: e.target.value })}
          onBlur={(e) => {
            if (e.target.value === editField.name) return;
            setUndoStack((prev) => [
              ...prev,
              {
                action: Action.EDIT,
                element: ObjectType.AREA,
                aid: data.id,
                undo: editField,
                redo: { name: e.target.value },
                message: t("edit_area", {
                  areaName: e.target.value,
                  extra: "[name]",
                }),
              },
            ]);
            setRedoStack([]);
          }}
        />
        <ColorPicker
          usePopover={true}
          readOnly={layout.readOnly}
          value={data.color || "#1db7ae"}
          onChange={(color) =>
            updateArea(data.id, { color: color || "#1db7ae" })
          }
          onColorPick={(color) => handleColorPick(color || "#1db7ae")}
        />
      </div>
      <ColorList
        currentColor={data.color}
        onColorClick={(color) => {
          handleColorPick(color);
          updateArea(data.id, { color: color });
        }}
      />
      <div className="flex">
        <Button
          icon={<IconDeleteStroked />}
          type="danger"
          block
          onClick={() => deleteArea(data.id, true)}
          disabled={layout.readOnly}
        >
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}
