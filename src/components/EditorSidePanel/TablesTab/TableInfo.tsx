import { useState, useRef } from "react";
import {
  Collapse,
  Input,
  InputNumber,
  TextArea,
  Button,
  Card,
  Select,
} from "@douyinfe/semi-ui";
import ColorPicker from "../ColorPicker";
import { IconDeleteStroked } from "@douyinfe/semi-icons";
import {
  useDiagram,
  useLayout,
  useSaveState,
  useUndoRedo,
  useSettings,
} from "@hooks";
import {
  Action,
  ObjectType,
  State,
  DB,
  tableHeaderHeight,
  tableColorStripHeight,
  tableFieldHeight,
} from "@data/constants";
import TableField from "./TableField";
import IndexDetails from "./IndexDetails";
import { useTranslation } from "react-i18next";
import { SortableList } from "../../SortableList/SortableList";
import { nanoid } from "nanoid";
import { getTableHeight } from "@utils/utils";
import ColorList from "../../ColorList";
import { TableInfoProps, ITable } from "@types";

export default function TableInfo({ data }: TableInfoProps) {
  const { tables, database } = useDiagram();
  const { t } = useTranslation();
  const [indexActiveKey, setIndexActiveKey] = useState("");
  const { layout } = useLayout();
  const { deleteTable, updateTable, setTables } = useDiagram();
  const { settings } = useSettings();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { setSaveState } = useSaveState();
  const [editField, setEditField] = useState<Partial<ITable>>({});
  const initialColorRef = useRef(data.color);
  const tableHeight = data.height;

  const handleSupertypeChange = (value: string | number | null) => {
    const supertype = tables.find((t) => t.id === value);
    const oldSupertypeId = data.supertypeId;

    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.TABLE,
        tid: data.id,
        undo: {
          supertypeId: oldSupertypeId,
          x: data.x,
          y: data.y,
        },
        redo: {
          supertypeId: value,
          x: supertype ? supertype.x + 20 : data.x,
          y: supertype
            ? supertype.y +
              supertype.fields.length * tableFieldHeight +
              tableHeaderHeight +
              tableColorStripHeight +
              10
            : data.y,
        },
        message: t("edit_table", { tableName: data.name, extra: "[supertype]" }),
      },
    ]);
    setRedoStack([]);

    if (value && supertype) {
      const baseHeight =
        supertype.fields.length * tableFieldHeight +
        tableHeaderHeight +
        tableColorStripHeight;
      const newX = supertype.x + 20;
      const newY = supertype.y + baseHeight + 10;

      updateTable(data.id, {
        supertypeId: value,
        x: newX,
        y: newY,
      });

      const newHeight = getTableHeight(
        supertype,
        tables
          .filter((t) => t.supertypeId === supertype.id || t.id === data.id)
          .map((t) =>
            t.id === data.id ? { ...t, x: newX, y: newY, supertypeId: value } : t,
          ),
      );
      updateTable(value, { height: newHeight });
    } else {
      updateTable(data.id, { supertypeId: null });
      if (oldSupertypeId) {
        const oldSupertype = tables.find((t) => t.id === oldSupertypeId);
        if (oldSupertype) {
          const remainingSubtypes = tables.filter(
            (t) => t.supertypeId === oldSupertypeId && t.id !== data.id,
          );
          const newHeight = getTableHeight(oldSupertype, remainingSubtypes);
          updateTable(oldSupertypeId, { height: newHeight });
        }
      }
    }
  };

  const handleColorPick = (color: string) => {
    setUndoStack((prev) => {
      let undoColor = initialColorRef.current;
      const lastColorChange = prev.findLast(
        (e) =>
          e.element === ObjectType.TABLE &&
          e.tid === data.id &&
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
          element: ObjectType.TABLE,
          component: "self",
          tid: data.id,
          undo: { color: undoColor },
          redo: { color: color },
          message: t("edit_table", {
            tableName: data.name,
            extra: "[color]",
          }),
        },
      ];
      return newStack;
    });
    setRedoStack([]);
  };

  const inheritedFieldNames =
    Array.isArray(data.inherits) && data.inherits.length > 0
      ? data.inherits
          .map((parentName) => {
            const parent = tables.find((t) => t.name === parentName);
            return parent ? parent.fields.map((f) => f.name) : [];
          })
          .flat()
      : [];

  return (
    <div>
      <div className="flex items-center mb-2.5 gap-1">
        <div className="flex items-center flex-1">
          <div className="text-md font-semibold break-keep">{t("name")}:</div>
          <Input
            value={data.name}
            validateStatus={data.name.trim() === "" ? "error" : "default"}
            placeholder={t("name")}
            className="ms-2"
            readOnly={layout.readOnly}
            onChange={(value) => updateTable(data.id, { name: value })}
            onFocus={(e) => setEditField({ name: e.target.value })}
            onBlur={(e) => {
              if (e.target.value === editField.name) return;
              setUndoStack((prev) => [
                ...prev,
                {
                  action: Action.EDIT,
                  element: ObjectType.TABLE,
                  component: "self",
                  tid: data.id,
                  undo: editField,
                  redo: { name: e.target.value },
                  message: t("edit_table", {
                    tableName: e.target.value,
                    extra: "[name]",
                  }),
                },
              ]);
              setRedoStack([]);
            }}
          />
        </div>
        <ColorPicker
          usePopover={true}
          readOnly={layout.readOnly}
          value={data.color || "#175e7a"}
          onChange={(color) => {
            if (layout.readOnly) return;
            updateTable(data.id, { color: color || "#175e7a" });
          }}
          onColorPick={(color) => handleColorPick(color || "#175e7a")}
        />
      </div>
      <ColorList
        currentColor={data.color}
        onColorClick={(color) => {
          handleColorPick(color);
          updateTable(data.id, { color: color });
        }}
      />
      <div className="flex items-center mb-2.5">
        <div className="text-md font-semibold break-keep">Supertype:</div>
        <Select
          className="w-full ms-2"
          placeholder="Select supertype"
          value={data.supertypeId}
          showClear
          onChange={handleSupertypeChange}
        >
          {tables
            .filter((t) => t.id !== data.id && !t.supertypeId)
            .map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {t.name}
              </Select.Option>
            ))}
        </Select>
      </div>

      <div className="flex gap-2 mb-2.5">
        <div className="flex items-center w-full">
          <div className="text-sm font-semibold break-keep">{t("width")}:</div>
          <InputNumber
            value={data.width}
            className="ms-2"
            readOnly={layout.readOnly}
            min={150}
            onChange={(value) =>
              updateTable(data.id, { width: typeof value === 'number' ? value : parseInt(String(value)) || settings.tableWidth }, false)
            }
            onFocus={(e) =>
              setEditField({
                width: parseInt(e.target.value) || (data.width as number),
              })
            }
            onBlur={(e) => {
              const val = parseInt(e.target.value) || settings.tableWidth;
              if (val === editField.width) return;
              setUndoStack((prev) => [
                ...prev,
                {
                  action: Action.EDIT,
                  element: ObjectType.TABLE,
                  component: "self",
                  tid: data.id,
                  undo: { width: editField.width },
                  redo: { width: val },
                  message: t("edit_table", {
                    tableName: data.name,
                    extra: "[width]",
                  }),
                },
              ]);
              setRedoStack([]);
            }}
          />
        </div>
        <div className="flex items-center w-full">
          <div className="text-sm font-semibold break-keep">{t("height")}:</div>
          <InputNumber
            value={tableHeight}
            className="ms-2"
            readOnly={layout.readOnly}
            min={tableHeaderHeight + tableColorStripHeight + tableFieldHeight}
            onChange={(value) =>
              updateTable(data.id, { height: typeof value === 'number' ? value : parseInt(String(value)) || tableHeight }, false)
            }
            onFocus={(e) =>
              setEditField({ height: parseInt(e.target.value) || tableHeight })
            }
            onBlur={(e) => {
              const val = parseInt(e.target.value) || tableHeight;
              if (val === editField.height) return;
              setUndoStack((prev) => [
                ...prev,
                {
                  action: Action.EDIT,
                  element: ObjectType.TABLE,
                  component: "self",
                  tid: data.id,
                  undo: { height: editField.height },
                  redo: { height: val },
                  message: t("edit_table", {
                    tableName: data.name,
                    extra: "[height]",
                  }),
                },
              ]);
              setRedoStack([]);
            }}
          />
        </div>
      </div>

      <SortableList
        items={data.fields}
        keyPrefix={`table-${data.id}`}
        onChange={(newFields) =>
          setTables((prev) =>
            prev.map((t) =>
              t.id === data.id ? { ...t, fields: newFields } : t,
            ),
          )
        }
        afterChange={() => setSaveState(State.SAVING)}
        renderItem={(item, i) => (
          <TableField
            data={item}
            tid={data.id}
            index={i}
            inherited={inheritedFieldNames.includes(item.name)}
          />
        )}
      />

      {database === DB.POSTGRES && (
        <div className="mb-2">
          <div className="text-md font-semibold break-keep">
            {t("inherits")}:
          </div>
          <Select
            multiple
            value={data.inherits || []}
            optionList={tables
              .filter((t) => t.id !== data.id)
              .map((t) => ({ label: t.name, value: t.name }))}
            onChange={(value) => {
              if (layout.readOnly) return;
              const inheritedValues = Array.isArray(value) ? (value as string[]) : [];

              setUndoStack((prev) => [
                ...prev,
                {
                  action: Action.EDIT,
                  element: ObjectType.TABLE,
                  component: "self",
                  tid: data.id,
                  undo: { inherits: data.inherits },
                  redo: { inherits: inheritedValues },
                  message: t("edit_table", {
                    tableName: data.name,
                    extra: "[inherits]",
                  }),
                },
              ]);
              setRedoStack([]);
              updateTable(data.id, { inherits: inheritedValues });
            }}
            placeholder={t("inherits")}
            className="w-full"
          />
        </div>
      )}

      {data.indices.length > 0 && (
        <Card
          bodyStyle={{ padding: "4px" }}
          style={{ marginTop: "12px", marginBottom: "12px" }}
          headerLine={false}
        >
          <Collapse
            activeKey={indexActiveKey}
            keepDOM={false}
            lazyRender
            onChange={(itemKey) => setIndexActiveKey(Array.isArray(itemKey) ? itemKey[0] || "" : String(itemKey))}
            accordion
          >
            <Collapse.Panel header={t("indices")} itemKey="1">
              {data.indices.map((idx, k) => (
                <IndexDetails
                  key={"index_" + k}
                  data={idx}
                  iid={k}
                  tid={data.id}
                  fields={data.fields.map((e) => ({
                    value: e.name,
                    label: e.name,
                  }))}
                />
              ))}
            </Collapse.Panel>
          </Collapse>
        </Card>
      )}

      <Card
        bodyStyle={{ padding: "4px" }}
        style={{ marginTop: "12px", marginBottom: "12px" }}
        headerLine={false}
      >
        <Collapse keepDOM={false} lazyRender>
          <Collapse.Panel header={t("comment")} itemKey="1">
            <TextArea
              value={data.comment}
              readOnly={layout.readOnly}
              autosize
              placeholder={t("comment")}
              rows={1}
              onChange={(value) =>
                updateTable(data.id, { comment: value }, false)
              }
              onFocus={(e) => setEditField({ comment: e.target.value })}
              onBlur={(e) => {
                if (e.target.value === editField.comment) return;
                setUndoStack((prev) => [
                  ...prev,
                  {
                    action: Action.EDIT,
                    element: ObjectType.TABLE,
                    component: "self",
                    tid: data.id,
                    undo: editField,
                    redo: { comment: e.target.value },
                    message: t("edit_table", {
                      tableName: e.target.value,
                      extra: "[comment]",
                    }),
                  },
                ]);
                setRedoStack([]);
              }}
            />
          </Collapse.Panel>
        </Collapse>
      </Card>

      <div className="flex justify-end items-center gap-1 mb-2">
        <div className="flex gap-1">
          <Button
            block
            disabled={layout.readOnly}
            onClick={() => {
              setIndexActiveKey("1");
              setUndoStack((prev) => [
                ...prev,
                {
                  action: Action.EDIT,
                  element: ObjectType.TABLE,
                  component: "index_add",
                  tid: data.id,
                  message: t("edit_table", {
                    tableName: data.name,
                    extra: "[add index]",
                  }),
                },
              ]);
              setRedoStack([]);
              updateTable(data.id, {
                indices: [
                  ...data.indices,
                  {
                    id: data.indices.length,
                    name: `${data.name}_index_${data.indices.length}`,
                    unique: false,
                    fields: [],
                  },
                ],
              });
            }}
          >
            {t("add_index")}
          </Button>
          <Button
            block
            disabled={layout.readOnly}
            onClick={() => {
              const id = nanoid();
              setUndoStack((prev) => [
                ...prev,
                {
                  action: Action.EDIT,
                  element: ObjectType.TABLE,
                  component: "field_add",
                  tid: data.id,
                  fid: id,
                  message: t("edit_table", {
                    tableName: data.name,
                    extra: "[add field]",
                  }),
                },
              ]);
              setRedoStack([]);
              updateTable(data.id, {
                fields: [
                  ...data.fields,
                  {
                    id,
                    name: "",
                    type: "",
                    default: "",
                    check: "",
                    primary: false,
                    unique: false,
                    notNull: false,
                    increment: false,
                    comment: "",
                  },
                ],
              });
            }}
          >
            {t("add_field")}
          </Button>
          <Button
            type="danger"
            disabled={layout.readOnly}
            icon={<IconDeleteStroked />}
            onClick={() => deleteTable(data.id)}
          />
        </div>
      </div>
    </div>
  );
}
