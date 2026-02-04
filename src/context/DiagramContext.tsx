import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { Action, DB, ObjectType, defaultBlue, tableFieldHeight, tableHeaderHeight, tableColorStripHeight } from "../data/constants";
import { useTransform, useUndoRedo, useSelect, useSettings } from "../hooks";
import { Toast } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { nanoid } from "nanoid";
import { getTableHeight } from "../utils/utils";
import { ITable, IRelationship, IField, IArea } from "../types";

export interface ILinkingLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTableId: string | number;
  startFieldId: string | number;
}

export interface IHoveredTable {
  tableId: string | number | null;
  fieldId: string | number | null;
}

export interface IGroup {
  id: string | number;
  label: string;
  parentTableId: string | number;
  childRelationshipIds: (string | number)[];
}

interface DiagramContextType {
  tables: ITable[];
  setTables: Dispatch<SetStateAction<ITable[]>>;
  addTable: (data?: { table: ITable; index: number }, addToHistory?: boolean) => void;
  updateTable: (id: string | number, updatedValues: Partial<ITable>, addToHistory?: boolean) => void;
  updateField: (tid: string | number, fid: string | number, updatedValues: Partial<IField>) => void;
  deleteField: (field: IField, tid: string | number, addToHistory?: boolean) => void;
  deleteTable: (id: string | number, addToHistory?: boolean) => void;
  relationships: IRelationship[];
  setRelationships: Dispatch<SetStateAction<IRelationship[]>>;
  addRelationship: (data: IRelationship | { relationship: IRelationship; index: number }, addToHistory?: boolean) => void;
  deleteRelationship: (id: string | number, addToHistory?: boolean) => void;
  updateRelationship: (id: string | number, updatedValues: Partial<IRelationship>) => void;
  xorGroups: IGroup[];
  setXorGroups: Dispatch<SetStateAction<IGroup[]>>;
  addXorGroup: (data: Partial<IGroup>, addToHistory?: boolean) => void;
  deleteXorGroup: (id: string | number, addToHistory?: boolean) => void;
  updateXorGroup: (id: string | number, updatedValues: Partial<IGroup>) => void;
  orGroups: IGroup[];
  setOrGroups: Dispatch<SetStateAction<IGroup[]>>;
  addOrGroup: (data: Partial<IGroup>, addToHistory?: boolean) => void;
  deleteOrGroup: (id: string | number, addToHistory?: boolean) => void;
  updateOrGroup: (id: string | number, updatedValues: Partial<IGroup>) => void;
  convertXorToOr: (id: string | number) => void;
  convertOrToXor: (id: string | number) => void;
  database: string;
  setDatabase: Dispatch<SetStateAction<string>>;
  tablesCount: number;
  relationshipsCount: number;
  linking: boolean;
  setLinking: Dispatch<SetStateAction<boolean>>;
  linkingLine: ILinkingLine;
  setLinkingLine: Dispatch<SetStateAction<ILinkingLine>>;
  hoveredTable: IHoveredTable;
  setHoveredTable: Dispatch<SetStateAction<IHoveredTable>>;
}

export const DiagramContext = createContext<DiagramContextType>({} as DiagramContextType);

export default function DiagramContextProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [database, setDatabase] = useState<string>(DB.GENERIC);
  const [tables, setTables] = useState<ITable[]>([]);
  const [relationships, setRelationships] = useState<IRelationship[]>([]);
  const [xorGroups, setXorGroups] = useState<IGroup[]>([]);
  const [orGroups, setOrGroups] = useState<IGroup[]>([]);
  const { transform } = useTransform();
  const { settings } = useSettings();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { selectedElement, setSelectedElement } = useSelect();
  const [linking, setLinking] = useState(false);
  const [linkingLine, setLinkingLine] = useState<ILinkingLine>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    startTableId: "",
    startFieldId: "",
  });
  const [hoveredTable, setHoveredTable] = useState<IHoveredTable>({
    tableId: null,
    fieldId: null,
  });

  const addTable = (data?: { table: ITable; index: number }, addToHistory: boolean = true) => {
    const id = nanoid();
    const tableWithDefaultFields = {
      fields: [
        {
          name: "id",
          type: database === DB.GENERIC ? "INT" : "INTEGER",
          default: "",
          check: "",
          primary: true,
          unique: true,
          notNull: true,
          increment: true,
          comment: "",
          id: nanoid(),
        },
      ],
    };
    const newTable: ITable = {
      id,
      name: `table_${id}`,
      x: transform.pan.x,
      y: transform.pan.y,
      width: settings.tableWidth,
      height: getTableHeight(tableWithDefaultFields),
      locked: false,
      fields: tableWithDefaultFields.fields,
      comment: "",
      indices: [],
      color: defaultBlue,
      supertypeId: null,
    };
    if (data) {
      setTables((prev) => {
        const temp = prev.slice();
        temp.splice(data.index || tables.length, 0, data.table);
        return temp;
      });
    } else {
      setTables((prev) => [...prev, newTable]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          data: data || { table: newTable, index: tables.length - 1 },
          action: Action.ADD,
          element: ObjectType.TABLE,
          message: t("add_table"),
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteTable = (id: string | number, addToHistory: boolean = true) => {
    if (addToHistory) {
      const rels = relationships.reduce((acc: IRelationship[], r) => {
        if (r.startTableId === id || r.endTableId === id) {
          acc.push(r);
        }
        return acc;
      }, []);
      const deletedTable = tables.find((t) => t.id === id);
      const deletedTableIndex = tables.findIndex((t) => t.id === id);
      if (deletedTable) {
        setUndoStack((prev) => [
          ...prev,
          {
            action: Action.DELETE,
            element: ObjectType.TABLE,
            data: {
              table: deletedTable,
              relationship: rels,
              index: deletedTableIndex,
            },
            message: t("delete_table", { tableName: deletedTable.name }),
          },
        ]);
        setRedoStack([]);
        Toast.success(t("table_deleted"));
      }
    }
    setRelationships((prevR) =>
      prevR.filter((e) => !(e.startTableId === id || e.endTableId === id)),
    );
    setXorGroups((prevX) => prevX.filter((e) => e.parentTableId !== id));
    setOrGroups((prevO) => prevO.filter((e) => e.parentTableId !== id));
    setTables((prev) =>
      prev
        .filter((e) => e.id !== id)
        .map((t) =>
          t.supertypeId === id ? { ...t, supertypeId: null } : t,
        ),
    );
    if (id === selectedElement.id) {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.NONE,
        id: "",
        open: false,
      }));
    }
  };

  const updateTable = (id: string | number, updatedValues: Partial<ITable>, addToHistory: boolean = true) => {
    const oldTable = tables.find((t) => t.id === id);
    if (!oldTable) return;

    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.TABLE,
          component: "self",
          tid: id,
          undo: Object.keys(updatedValues).reduce((acc: Record<string, unknown>, key) => {
            acc[key] = (oldTable as Record<string, unknown>)[key];
            return acc;
          }, {} as Record<string, unknown>),
          redo: updatedValues,
          message: t("edit_table", {
            tableName: oldTable.name,
            extra: "[update]",
          }),
        },
      ]);
      setRedoStack([]);
    }

    if (
      updatedValues.x !== undefined ||
      updatedValues.y !== undefined ||
      updatedValues.width !== undefined
    ) {
      const newX = updatedValues.x ?? oldTable.x;
      const newY = updatedValues.y ?? oldTable.y;
      const newWidth = updatedValues.width ?? oldTable.width;

      const affectedXorGroups = xorGroups.filter((g) => g.parentTableId === id);
      const affectedOrGroups = orGroups.filter((g) => g.parentTableId === id);

      [...affectedXorGroups, ...affectedOrGroups].forEach((group) => {
        const oldPoints = getGroupPoints(group, tables, relationships);
        const newTable = { ...oldTable, x: newX, y: newY, width: newWidth };
        const newPoints = getGroupPoints(group, [newTable], relationships);

        if (oldPoints && newPoints) {
          group.childRelationshipIds.forEach((rid, index) => {
            const oldP = oldPoints[index];
            const newP = newPoints[index];
            if (oldP && newP) {
              const rel = relationships.find((r) => r.id === rid);
              if (rel && rel.waypoints) {
                const wpIndex = rel.waypoints.findIndex(
                  (wp) =>
                    Math.abs(wp.x - oldP.x) < 0.01 &&
                    Math.abs(wp.y - oldP.y) < 0.01,
                );
                if (wpIndex !== -1) {
                  const newWaypoints = [...rel.waypoints];
                  newWaypoints[wpIndex] = {
                    x: newP.x,
                    y: newP.y,
                    mode: rel.waypoints[wpIndex].mode,
                  };
                  updateRelationship(rid, { waypoints: newWaypoints });
                }
              }
            }
          });
        }
      });
    }

    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedValues } : t)),
    );
  };

  const updateField = (tid: string | number, fid: string | number, updatedValues: Partial<IField>) => {
    setTables((prev) =>
      prev.map((table) => {
        if (tid === table.id) {
          const updatedFields = table.fields.map((field) =>
            fid === field.id ? { ...field, ...updatedValues } : field,
          );
          const newTable = { ...table, fields: updatedFields };
          return {
            ...newTable,
            height: getTableHeight(newTable),
          };
        }
        return table;
      }),
    );
  };

  const deleteField = (field: IField, tid: string | number, addToHistory: boolean = true) => {
    const table = tables.find((t) => t.id === tid);
    if (!table) return;
    const { fields, name } = table;
    if (addToHistory) {
      const rels = relationships.reduce((acc: IRelationship[], r) => {
        if (
          (r.startTableId === tid && r.startFieldId === field.id) ||
          (r.endTableId === tid && r.endFieldId === field.id)
        ) {
          acc.push(r);
        }
        return acc;
      }, []);
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.TABLE,
          component: "field_delete",
          tid: tid,
          data: {
            field: field,
            index: fields.findIndex((f) => f.id === field.id),
            relationship: rels,
          },
          message: t("edit_table", {
            tableName: name,
            extra: "[delete field]",
          }),
        },
      ]);
      setRedoStack([]);
    }
    setRelationships((prev) =>
      prev.filter(
        (e) =>
          !(
            (e.startTableId === tid && e.startFieldId === field.id) ||
            (e.endTableId === tid && e.endFieldId === field.id)
          ),
      ),
    );
    updateTable(tid, {
      fields: fields.filter((e) => e.id !== field.id),
      height: getTableHeight({
        ...table,
        fields: fields.filter((e) => e.id !== field.id),
      }),
    });
  };

  const addRelationship = (data: IRelationship | { relationship: IRelationship; index: number }, addToHistory: boolean = true) => {
    if (addToHistory) {
      const rel = 'relationship' in data ? data.relationship : data;
      setRelationships((prev) => {
        setUndoStack((prevUndo) => [
          ...prevUndo,
          {
            action: Action.ADD,
            element: ObjectType.RELATIONSHIP,
            data: {
              relationship: rel,
              index: prevUndo.length,
            },
            message: t("add_relationship"),
          },
        ]);
        setRedoStack([]);
        return [...prev, rel];
      });
    } else {
      setRelationships((prev) => {
        const temp = prev.slice();
        const item = 'relationship' in data ? data.relationship : data;
        const index = 'index' in data ? data.index : prev.length;
        temp.splice(index, 0, item);
        return temp;
      });
    }
  };

  const deleteRelationship = (id: string | number, addToHistory: boolean = true) => {
    if (addToHistory) {
      const relationshipIndex = relationships.findIndex((r) => r.id === id);
      if (relationshipIndex !== -1) {
        setUndoStack((prev) => [
          ...prev,
          {
            action: Action.DELETE,
            element: ObjectType.RELATIONSHIP,
            data: {
              relationship: relationships[relationshipIndex],
              index: relationshipIndex,
            },
            message: t("delete_relationship", {
              refName: relationships[relationshipIndex].name,
            }),
          },
        ]);
        setRedoStack([]);
      }
    }
    setRelationships((prev) => prev.filter((e) => e.id !== id));
    setXorGroups((prev) =>
      prev.map((group) => ({
        ...group,
        childRelationshipIds: group.childRelationshipIds.filter(
          (rid) => rid !== id,
        ),
      })).filter((group) => group.childRelationshipIds.length > 0),
    );
    setOrGroups((prev) =>
      prev.map((group) => ({
        ...group,
        childRelationshipIds: group.childRelationshipIds.filter(
          (rid) => rid !== id,
        ),
      })).filter((group) => group.childRelationshipIds.length > 0),
    );
  };

  const updateRelationship = (id: string | number, updatedValues: Partial<IRelationship>) => {
    setRelationships((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedValues } : t)),
    );
  };

  const addXorGroup = (data: Partial<IGroup>, addToHistory: boolean = true) => {
    const id = nanoid();
    const newGroup: IGroup = {
      id,
      label: "XOR",
      parentTableId: data.parentTableId!,
      childRelationshipIds: data.childRelationshipIds!,
      ...data,
    };

    const groupPoints = getGroupPoints(newGroup, tables, relationships);
    if (groupPoints) {
      newGroup.childRelationshipIds.forEach((rid, index) => {
        const point = groupPoints[index];
        if (point) {
          const rel = relationships.find((r) => r.id === rid);
          if (rel) {
            const currentWaypoints = rel.waypoints || [];
            updateRelationship(rid, {
              waypoints: [
                ...currentWaypoints,
                { x: point.x, y: point.y, mode: "waypoint" as const },
              ],
            });
          }
        }
      });
    }

    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.ADD,
          element: ObjectType.XOR_GROUP,
          data: { group: newGroup, index: xorGroups.length },
          message: t("add_xor_group"),
        },
      ]);
      setRedoStack([]);
    }
    setXorGroups((prev) => [...prev, newGroup]);
  };

  const deleteXorGroup = (id: string | number, addToHistory: boolean = true) => {
    const group = xorGroups.find((g) => g.id === id);
    if (!group) return;

    const groupPoints = getGroupPoints(group, tables, relationships);
    if (groupPoints) {
      group.childRelationshipIds.forEach((rid, index) => {
        const point = groupPoints[index];
        if (point) {
          const rel = relationships.find((r) => r.id === rid);
          if (rel && rel.waypoints) {
            const newWaypoints = rel.waypoints.filter(
              (wp) =>
                Math.abs(wp.x - point.x) > 0.01 ||
                Math.abs(wp.y - point.y) > 0.01,
            );
            if (newWaypoints.length !== rel.waypoints.length) {
              updateRelationship(rid, { waypoints: newWaypoints });
            }
          }
        }
      });
    }

    if (addToHistory) {
      const groupIndex = xorGroups.findIndex((g) => g.id === id);
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.DELETE,
          element: ObjectType.XOR_GROUP,
          data: { group: xorGroups[groupIndex], index: groupIndex },
          message: t("delete_xor_group"),
        },
      ]);
      setRedoStack([]);
    }
    setXorGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const updateXorGroup = (id: string | number, updatedValues: Partial<IGroup>) => {
    setXorGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updatedValues } : g)),
    );
  };

  const addOrGroup = (data: Partial<IGroup>, addToHistory: boolean = true) => {
    const id = nanoid();
    const newGroup: IGroup = {
      id,
      label: "OR",
      parentTableId: data.parentTableId!,
      childRelationshipIds: data.childRelationshipIds!,
      ...data,
    };

    const groupPoints = getGroupPoints(newGroup, tables, relationships);
    if (groupPoints) {
      newGroup.childRelationshipIds.forEach((rid, index) => {
        const point = groupPoints[index];
        if (point) {
          const rel = relationships.find((r) => r.id === rid);
          if (rel) {
            const currentWaypoints = rel.waypoints || [];
            updateRelationship(rid, {
              waypoints: [
                ...currentWaypoints,
                { x: point.x, y: point.y, mode: "waypoint" as const },
              ],
            });
          }
        }
      });
    }

    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.ADD,
          element: ObjectType.OR_GROUP,
          data: { group: newGroup, index: orGroups.length },
          message: t("add_or_group"),
        },
      ]);
      setRedoStack([]);
    }
    setOrGroups((prev) => [...prev, newGroup]);
  };

  const deleteOrGroup = (id: string | number, addToHistory: boolean = true) => {
    const group = orGroups.find((g) => g.id === id);
    if (!group) return;

    const groupPoints = getGroupPoints(group, tables, relationships);
    if (groupPoints) {
      group.childRelationshipIds.forEach((rid, index) => {
        const point = groupPoints[index];
        if (point) {
          const rel = relationships.find((r) => r.id === rid);
          if (rel && rel.waypoints) {
            const newWaypoints = rel.waypoints.filter(
              (wp) =>
                Math.abs(wp.x - point.x) > 0.01 ||
                Math.abs(wp.y - point.y) > 0.01,
            );
            if (newWaypoints.length !== rel.waypoints.length) {
              updateRelationship(rid, { waypoints: newWaypoints });
            }
          }
        }
      });
    }

    if (addToHistory) {
      const groupIndex = orGroups.findIndex((g) => g.id === id);
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.DELETE,
          element: ObjectType.OR_GROUP,
          data: { group: orGroups[groupIndex], index: groupIndex },
          message: t("delete_or_group"),
        },
      ]);
      setRedoStack([]);
    }
    setOrGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const updateOrGroup = (id: string | number, updatedValues: Partial<IGroup>) => {
    setOrGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updatedValues } : g)),
    );
  };

  const convertXorToOr = (id: string | number) => {
    const xorGroup = xorGroups.find((g) => g.id === id);
    if (!xorGroup) return;

    const newOrGroup: IGroup = {
      ...xorGroup,
      label: xorGroup.label === "XOR" ? "OR" : xorGroup.label,
    };

    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.DELETE,
        element: ObjectType.XOR_GROUP,
        data: { group: xorGroup, index: xorGroups.findIndex((g) => g.id === id) },
        message: t("convert_to_or"),
      },
      {
        action: Action.ADD,
        element: ObjectType.OR_GROUP,
        data: { group: newOrGroup, index: orGroups.length },
        message: t("convert_to_or"),
      },
    ]);
    setRedoStack([]);

    setXorGroups((prev) => prev.filter((g) => g.id !== id));
    setOrGroups((prev) => [...prev, newOrGroup]);
    setSelectedElement((prev) => ({ ...prev, element: ObjectType.OR_GROUP }));
  };

  const convertOrToXor = (id: string | number) => {
    const orGroup = orGroups.find((g) => g.id === id);
    if (!orGroup) return;

    const newXorGroup: IGroup = {
      ...orGroup,
      label: orGroup.label === "OR" ? "XOR" : orGroup.label,
    };

    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.DELETE,
        element: ObjectType.OR_GROUP,
        component: "convert",
        id: id,
        undo: { type: "OR" },
        redo: { type: "XOR" },
        message: t("convert_to_xor"),
      },
    ]);
    setRedoStack([]);

    setOrGroups((prev) => prev.filter((g) => g.id !== id));
    setXorGroups((prev) => [...prev, { ...orGroup, label: "XOR" }]);
  };

  const getGroupPoints = (data: IGroup, tables: ITable[], relationships: IRelationship[]) => {
    const parentTable = tables.find((t) => t.id === data.parentTableId);
    if (!parentTable) return null;

    const groupRelationships = relationships.filter((rel) =>
      data.childRelationshipIds.includes(rel.id!)
    );
    if (groupRelationships.length === 0) return null;

    const armWidth = 30;
    const horizontalOffset = 41;
    const totalXOffset = armWidth + horizontalOffset;

    const raw = groupRelationships
      .map((rel) => {
        const touchesAsStart = rel.startTableId === data.parentTableId;
        const touchesAsEnd = rel.endTableId === data.parentTableId;
        if (!touchesAsStart && !touchesAsEnd) return null;

        const isStart = touchesAsStart;
        const fieldId = isStart ? rel.startFieldId : rel.endFieldId;

        let fieldIndex = parentTable.fields.findIndex((f) => f.id === fieldId);
        if (fieldIndex < 0) fieldIndex = 0;

        const x = isStart
          ? parentTable.x - totalXOffset
          : parentTable.x + parentTable.width + totalXOffset;

        const y =
          parentTable.y +
          tableHeaderHeight +
          tableColorStripHeight +
          fieldIndex * tableFieldHeight +
          tableFieldHeight / 2;

        return { x, y, id: rel.id };
      });

    const spacing = 100;
    const result: Record<string | number, { x: number; y: number }> = {};

    const fieldMap: Record<string, Array<{ x: number; y: number; id: string | number }>> = {};
    raw.forEach((p) => {
      if (!p) return;
      const key = `${p.x}_${p.y}`;
      if (!fieldMap[key]) fieldMap[key] = [];
      fieldMap[key].push(p);
    });

    Object.values(fieldMap).forEach((rels) => {
      rels
        .sort((a, b) => {
          const aRel = groupRelationships.find((r) => r.id === a.id);
          const bRel = groupRelationships.find((r) => r.id === b.id);
          const aSubtypeTableId =
            aRel!.startTableId === data.parentTableId
              ? aRel!.endTableId
              : aRel!.startTableId;
          const bSubtypeTableId =
            bRel!.startTableId === data.parentTableId
              ? bRel!.endTableId
              : bRel!.startTableId;
          const aTable = tables.find((t) => t.id === aSubtypeTableId);
          const bTable = tables.find((t) => t.id === bSubtypeTableId);
          return (aTable?.y ?? 0) - (bTable?.y ?? 0);
        })
        .forEach((rel, index) => {
          result[rel.id] = { x: rel.x, y: rel.y + index * spacing };
        });
    });

    return data.childRelationshipIds.map((rid) => result[rid]);
  };

  return (
    <DiagramContext.Provider
      value={{
        tables,
        setTables,
        addTable,
        updateTable,
        updateField,
        deleteField,
        deleteTable,
        relationships,
        setRelationships,
        addRelationship,
        deleteRelationship,
        updateRelationship,
        xorGroups,
        setXorGroups,
        addXorGroup,
        deleteXorGroup,
        updateXorGroup,
        orGroups,
        setOrGroups,
        addOrGroup,
        deleteOrGroup,
        updateOrGroup,
        convertXorToOr,
        convertOrToXor,
        database,
        setDatabase,
        tablesCount: tables.length,
        relationshipsCount: relationships.length,
        linking,
        setLinking,
        linkingLine,
        setLinkingLine,
        hoveredTable,
        setHoveredTable,
      }}
    >
      {children}
    </DiagramContext.Provider>
  );
}

export { DiagramContextProvider };
