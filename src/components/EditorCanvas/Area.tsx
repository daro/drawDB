import React, { useState } from "react";
import { Button, Input } from "@douyinfe/semi-ui";
import ColorPicker from "../EditorSidePanel/ColorPicker";
import {
  IconEdit,
  IconDeleteStroked,
  IconLock,
  IconUnlock,
} from "@douyinfe/semi-icons";
import { Action, ObjectType, Tab } from "@data/constants";
import {
  useLayout,
  useUndoRedo,
  useAreas,
  useObjectColorEdit,
  useSelect,
} from "@hooks";

import { useTranslation } from "react-i18next";
import ColorList from "../ColorList";
import { IArea, AreaProps } from "@types";
import { CanvasObject } from "./common/CanvasObject";

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
}: AreaProps): JSX.Element {
  const { layout } = useLayout();
  const { updateArea } = useAreas();
  const { emitSelect } = useSelect();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { t } = useTranslation();

  const lockUnlockArea = (e: React.MouseEvent) => {
    const locking = !data.locked;
    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.AREA,
        aid: data.id,
        undo: { locked: data.locked },
        redo: { locked: locking },
        message: t("edit_area", {
          areaName: data.name,
          extra: `[${locking ? "lock" : "unlock"}]`,
        }),
      },
    ]);
    setRedoStack([]);
    updateArea(data.id, { locked: locking });
  };

  return (
    <CanvasObject
      data={data}
      objectType={ObjectType.AREA}
      tab={Tab.AREAS}
      scrollIdPrefix="scroll_area_"
      updateCallback={updateArea}
      popoverContent={<EditPopoverContent data={data} />}
      minWidth={100}
      minHeight={100}
    >
      {({ isSelected, isHovered, isOpen, edit }) => (
        <foreignObject
          key={data.id}
          x={data.x}
          y={data.y}
          width={data.width > 0 ? data.width : 0}
          height={data.height > 0 ? data.height : 0}
          onPointerDown={(e) => {
            if (e.defaultPrevented) return;
            emitSelect(data.id, ObjectType.AREA, e);
          }}
        >
          <div
            className={`w-full h-full p-2 rounded cursor-move border outline-none border-slate-400 opacity-100`}
            style={{ backgroundColor: `${data.color}66` }}
          >
            <div className="flex justify-between gap-1 w-full">
              <div className="text-color select-none overflow-hidden text-ellipsis">
                {data.name}
              </div>
              {(isHovered || (isOpen && !layout.sidebar)) && (
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
                  <Button
                    icon={<IconEdit />}
                    size="small"
                    theme="solid"
                    style={{
                      backgroundColor: "#2F68ADB3",
                    }}
                    onClick={edit}
                  />
                </div>
              )}
            </div>
          </div>
        </foreignObject>
      )}
    </CanvasObject>
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
  const { handleColorPick, updateColor } = useObjectColorEdit(
    data,
    ObjectType.AREA,
    updateArea
  );

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
          onChange={(color) => updateColor(color || "#1db7ae")}
          onColorPick={(color) => handleColorPick(color || "#1db7ae")}
        />
      </div>
      <ColorList
        currentColor={data.color}
        onColorClick={(color) => {
          handleColorPick(color);
          updateColor(color);
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
