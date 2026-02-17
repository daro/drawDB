import { useState, ReactNode } from "react";
import { Button, Input, TagInput } from "@douyinfe/semi-ui";
import { IconDeleteStroked } from "@douyinfe/semi-icons";
import { useDiagram, useEnums, useLayout, useUndoRedo } from "@hooks";
import { Action, ObjectType } from "@data/constants";
import { useTranslation } from "react-i18next";
import { IEnum, EnumDetailsProps } from "@types";

/**
 * A component representing the details of an enum in the side panel.
 * Allows editing the enum name and its values, and deleting the enum.
 * 
 * @param {EnumDetailsProps} props - The component props.
 * @returns {JSX.Element} The rendered enum details.
 */
export default function EnumDetails({ data }: EnumDetailsProps) {
  const { t } = useTranslation();
  const { layout } = useLayout();
  const { deleteEnum, updateEnum } = useEnums();
  const { tables, updateField } = useDiagram();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const [editField, setEditField] = useState<{ name?: string; values?: string[] }>({});

  return (
    <>
      <div className="flex justify-center items-center gap-2">
        <div className="font-semibold">{t("name")}: </div>
        <Input
          value={data.name}
          readOnly={layout.readOnly}
          placeholder={t("name")}
          validateStatus={data.name.trim() === "" ? "error" : "default"}
          onChange={(value) => {
            updateEnum(data.id, { name: value });
            tables.forEach((table) => {
              table.fields.forEach((field) => {
                if (field.type.toLowerCase() === data.name.toLowerCase()) {
                  updateField(table.id, field.id, {
                    type: value.toUpperCase(),
                  });
                }
              });
            });
          }}
          onFocus={(e) => setEditField({ name: e.target.value })}
          onBlur={(e) => {
            if (e.target.value === editField.name) return;

            const updatedFields: { tid: string | number; fid: string | number }[] = [];
            tables.forEach((table) => {
              table.fields.forEach((field) => {
                if (field.type.toLowerCase() === data.name.toLowerCase()) {
                  updatedFields.push({ tid: table.id, fid: field.id });
                }
              });
            });

            setUndoStack((prev) => [
              ...prev,
              {
                action: Action.EDIT,
                element: ObjectType.ENUM,
                id: data.id,
                undo: editField,
                redo: { name: e.target.value },
                updatedFields,
                message: t("edit_enum", {
                  enumName: e.target.value,
                  extra: "[name]",
                }),
              },
            ]);
            setRedoStack([]);
          }}
        />
      </div>
      <TagInput
        separator={[",", ", ", " ,"]}
        value={data.values}
        addOnBlur
        className="my-2"
        placeholder={t("values")}
        validateStatus={data.values.length === 0 ? "error" : "default"}
        onChange={(v) => {
          if (layout.readOnly) return;
          updateEnum(data.id, { values: v });
        }}
        onFocus={() => setEditField({ values: data.values })}
        onBlur={() => {
          if (JSON.stringify(editField.values) === JSON.stringify(data.values))
            return;
          setUndoStack((prev) => [
            ...prev,
            {
              action: Action.EDIT,
              element: ObjectType.ENUM,
              id: data.id,
              undo: editField,
              redo: { values: data.values },
              message: t("edit_enum", {
                enumName: data.name,
                extra: "[values]",
              }),
            },
          ]);
          setRedoStack([]);
        }}
      />
      <Button
        block
        type="danger"
        icon={<IconDeleteStroked />}
        disabled={layout.readOnly}
        onClick={() => deleteEnum(data.id, true)}
      >
        {t("delete")}
      </Button>
    </>
  );
}
