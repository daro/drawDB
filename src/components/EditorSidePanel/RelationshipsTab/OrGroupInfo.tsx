import { Input, Button } from "@douyinfe/semi-ui";
import { IconDeleteStroked } from "@douyinfe/semi-icons";
import { useDiagram, useUndoRedo, useLayout } from "@hooks";
import { useTranslation } from "react-i18next";
import { Action, ObjectType } from "@data/constants";
import { useState, useMemo } from "react";

import { GroupInfoProps } from "@types";

export default function OrGroupInfo({ data }: GroupInfoProps) {
  const { updateOrGroup, deleteOrGroup, tables, relationships } = useDiagram();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { t } = useTranslation();
  const { layout } = useLayout();
  const [editLabel, setEditLabel] = useState("");

  const groupDescription = useMemo(() => {
    const parentTable = tables.find((t) => t.id === data.parentTableId);
    if (!parentTable) return "";

    const childTableNames = data.childRelationshipIds
      .map((rid) => {
        const rel = relationships.find((r) => r.id === rid);
        if (!rel) return null;
        const childTableId =
          rel.startTableId === data.parentTableId
            ? rel.endTableId
            : rel.startTableId;
        return tables.find((t) => t.id === childTableId)?.name;
      })
      .filter(Boolean);

    return `${parentTable.name} → {${childTableNames.join(", ")}}`;
  }, [data, tables, relationships]);

  return (
    <div className="p-2">
      <div className="text-xs text-gray-400 mb-3 px-1 italic">
        {groupDescription}
      </div>
      <div className="flex items-center mb-4">
        <div className="text-md font-semibold break-keep me-2">{t("label")}: </div>
        <Input
          value={data.label}
          onChange={(val) => updateOrGroup(data.id, { label: val })}
          onFocus={(e) => setEditLabel(e.target.value)}
          onBlur={(e) => {
            if (e.target.value === editLabel) return;
            setUndoStack((prev) => [
              ...prev,
              {
                action: Action.EDIT,
                element: ObjectType.OR_GROUP,
                id: data.id,
                undo: { label: editLabel },
                redo: { label: e.target.value },
                message: t("edit_or_group"),
              },
            ]);
            setRedoStack([]);
          }}
          readOnly={layout.readOnly}
        />
      </div>
      <Button
        block
        type="danger"
        icon={<IconDeleteStroked />}
        onClick={() => deleteOrGroup(data.id)}
        disabled={layout.readOnly}
      >
        {t("delete")}
      </Button>
    </div>
  );
}
