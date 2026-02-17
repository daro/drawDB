import { useState, useRef } from "react";
import { Button, Input } from "@douyinfe/semi-ui";
import ColorPicker from "../ColorPicker";
import { IconDeleteStroked } from "@douyinfe/semi-icons";
import { useAreas, useLayout, useUndoRedo, useSettings } from "@hooks";
import { Action, ObjectType } from "@data/constants";
import { useTranslation } from "react-i18next";
import ColorList from "../../ColorList";

import { AreaInfoProps, IArea } from "@types";

export default function AreaInfo({ data, i }: AreaInfoProps) {
  const { t } = useTranslation();
  const { layout } = useLayout();
  const { settings } = useSettings();
  const { deleteArea, updateArea } = useAreas();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const [editField, setEditField] = useState<Partial<IArea>>({});
  const initialColorRef = useRef(data.color);

  const handleColorPick = (color) => {
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
          aid: i,
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
    <div id={`scroll_area_${data.id}`} className="my-3">
      <div className="flex gap-2 items-center mb-2">
        <Input
          value={data.name}
          placeholder={t("name")}
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
                aid: i,
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
          value={data.color || "#1db7ae"}
          readOnly={layout.readOnly}
          onChange={(color) =>
            updateArea(data.id, { color: color || "#1db7ae" })
          }
          onColorPick={(color) => handleColorPick(color || "#1db7ae")}
        />
        <Button
          type="danger"
          disabled={layout.readOnly}
          icon={<IconDeleteStroked />}
          onClick={() => deleteArea(i, true)}
        />
      </div>
      <ColorList
        currentColor={data.color}
        onColorClick={(color) => {
          handleColorPick(color);
          updateArea(data.id, { color: color });
        }}
      />
    </div>
  );
}
