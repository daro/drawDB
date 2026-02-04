import { Input, Button, Row, Col, InputNumber, Select, TextArea } from "@douyinfe/semi-ui";
import { IconDeleteStroked } from "@douyinfe/semi-icons";
import { useTexts, useUndoRedo, useLayout } from "../../../hooks";
import { useTranslation } from "react-i18next";
import { Action, ObjectType } from "../../../data/constants";
import { useState } from "react";
import ColorPicker from "../ColorPicker";

import { TextInfoProps, IText } from "../../../types";

export default function TextInfo({ data }: TextInfoProps) {
  const { updateText, deleteText } = useTexts();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { t } = useTranslation();
  const { layout } = useLayout();
  const [editField, setEditField] = useState<Partial<IText>>({});

  const handleUpdate = (values) => {
    updateText(data.id, values);
  };

  const handleBlur = (field, value) => {
    if (value === editField[field]) return;
    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.TEXT,
        id: data.id,
        undo: { [field]: editField[field] },
        redo: { [field]: value },
        message: t("edit_text"),
      },
    ]);
    setRedoStack([]);
  };

  return (
    <div className="p-2">
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-md font-semibold mb-2">{t("text")}:</div>
          <TextArea
            value={data.text}
            onChange={(val) => handleUpdate({ text: val })}
            onFocus={(e) => setEditField({ ...editField, text: e.target.value })}
            onBlur={(e) => handleBlur("text", e.target.value)}
            readOnly={layout.readOnly}
            autosize
          />
        </div>
        <Row gutter={8}>
          <Col span={12}>
            <div className="text-md font-semibold mb-2">{t("font_size")}:</div>
            <InputNumber
              value={data.fontSize}
              onChange={(val) => handleUpdate({ fontSize: val })}
              onFocus={(e) => setEditField({ ...editField, fontSize: parseFloat(e.target.value) })}
              onBlur={(e) => handleBlur("fontSize", parseFloat(e.target.value))}
              readOnly={layout.readOnly}
              min={8}
              max={100}
            />
          </Col>
          <Col span={12}>
            <div className="text-md font-semibold mb-2">{t("font_weight")}:</div>
            <Select
              value={data.fontWeight}
              onChange={(val) => {
                const oldWeight = data.fontWeight;
                handleUpdate({ fontWeight: val });
                setUndoStack((prev) => [
                  ...prev,
                  {
                    action: Action.EDIT,
                    element: ObjectType.TEXT,
                    id: data.id,
                    undo: { fontWeight: oldWeight },
                    redo: { fontWeight: val },
                    message: t("edit_text"),
                  },
                ]);
                setRedoStack([]);
              }}
              disabled={layout.readOnly}
              style={{ width: "100%" }}
            >
              <Select.Option value="normal">Normal</Select.Option>
              <Select.Option value="bold">Bold</Select.Option>
              <Select.Option value={500}>500</Select.Option>
              <Select.Option value={600}>600</Select.Option>
            </Select>
          </Col>
        </Row>
        <div>
          <div className="text-md font-semibold mb-2">{t("color")}:</div>
          <ColorPicker
            value={data.color || "#000000"}
            onChange={(color) => handleUpdate({ color: color || "#000000" })}
            onColorPick={(color) => {
              const oldColor = data.color;
              handleUpdate({ color: color || "#000000" });
              setUndoStack((prev) => [
                ...prev,
                {
                  action: Action.EDIT,
                  element: ObjectType.TEXT,
                  id: data.id,
                  undo: { color: oldColor },
                  redo: { color: color || "#000000" },
                  message: t("edit_text"),
                },
              ]);
              setRedoStack([]);
            }}
          />
        </div>
        <Button
          block
          type="danger"
          icon={<IconDeleteStroked />}
          onClick={() => deleteText(data.id)}
          disabled={layout.readOnly}
        >
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}
