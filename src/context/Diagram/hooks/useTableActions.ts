import { useCallback } from "react";
import { nanoid } from "nanoid";
import { Toast } from "@douyinfe/semi-ui";
import { Action, DB, ObjectType, TABLE_CONFIG, GRID_CONFIG } from "@data/constants";
import { getTableHeight, toSnakeCase } from "@utils/utils";
import { ITable, IField, IRelationship, IGroup } from "@types";

interface UseTableActionsProps {
  database: string;
  tables: ITable[];
  setTables: React.Dispatch<React.SetStateAction<ITable[]>>;
  relationships: IRelationship[];
  setRelationships: React.Dispatch<React.SetStateAction<IRelationship[]>>;
  setXorGroups: React.Dispatch<React.SetStateAction<IGroup[]>>;
  setOrGroups: React.Dispatch<React.SetStateAction<IGroup[]>>;
  transform: any;
  settings: any;
  setUndoStack: React.Dispatch<React.SetStateAction<any[]>>;
  setRedoStack: React.Dispatch<React.SetStateAction<any[]>>;
  selectedElement: any;
  setSelectedElement: React.Dispatch<React.SetStateAction<any>>;
  t: (key: string, options?: any) => string;
  getGroupPoints: (data: any, tables: ITable[], relationships: IRelationship[]) => any;
  updateRelationship: (id: string | number, updatedValues: Partial<IRelationship>) => void;
  xorGroups: IGroup[];
  orGroups: IGroup[];
}

export const useTableActions = ({
  database,
  tables,
  setTables,
  relationships,
  setRelationships,
  setXorGroups,
  setOrGroups,
  transform,
  settings,
  setUndoStack,
  setRedoStack,
  selectedElement,
  setSelectedElement,
  t,
  getGroupPoints,
  updateRelationship,
  xorGroups,
  orGroups,
}: UseTableActionsProps) => {

  const addTable = useCallback((data?: { table: ITable; index: number }, addToHistory: boolean = true) => {
    const id = nanoid();
    const x = settings.snapToGrid 
      ? Math.round(transform.pan.x / GRID_CONFIG.SIZE) * GRID_CONFIG.SIZE 
      : transform.pan.x;
    const y = settings.snapToGrid 
      ? Math.round(transform.pan.y / GRID_CONFIG.SIZE) * GRID_CONFIG.SIZE 
      : transform.pan.y;
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
      x,
      y,
      width: settings.tableWidth,
      height: getTableHeight(tableWithDefaultFields),
      locked: false,
      fields: tableWithDefaultFields.fields,
      comment: "",
      indices: [],
      color: TABLE_CONFIG.DEFAULT_BLUE,
      supertypeId: null,
    };
    if (data) {
      setTables((prev) => {
        const temp = prev.slice();
        temp.splice(data.index ?? prev.length, 0, data.table);
        return temp;
      });
    } else {
      setTables((prev) => [...prev, newTable]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          data: data || { table: newTable, index: tables.length },
          action: Action.ADD,
          element: ObjectType.TABLE,
          message: t("add_table"),
        },
      ]);
      setRedoStack([]);
    }
  }, [database, transform.pan.x, transform.pan.y, settings.tableWidth, tables.length, setTables, setUndoStack, setRedoStack, t]);

  const deleteTable = useCallback((id: string | number, addToHistory: boolean = true) => {
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
      setSelectedElement({
        element: ObjectType.NONE,
        id: "",
        open: false,
      });
    }
  }, [relationships, tables, setUndoStack, setRedoStack, t, setRelationships, setXorGroups, setOrGroups, setTables, selectedElement.id, setSelectedElement]);

  const updateField = useCallback((tid: string | number, fid: string | number, updatedValues: Partial<IField>) => {
    setTables((prev) => {
      const table = prev.find((t) => t.id === tid);
      if (!table) return prev;
      
      const oldField = table.fields.find((f) => f.id === fid);

      if (updatedValues.name && updatedValues.name !== oldField?.name) {
        setRelationships((prevRels) =>
          prevRels.map((rel) => {
            if (
              (rel.startTableId === tid && rel.startFieldId === fid) ||
              (rel.endTableId === tid && rel.endFieldId === fid)
            ) {
              const startTable = prev.find((t) => t.id === rel.startTableId);
              const endTable = prev.find((t) => t.id === rel.endTableId);
              
              let startFieldName = startTable?.fields.find(f => f.id === rel.startFieldId)?.name || "";
              let endFieldName = endTable?.fields.find(f => f.id === rel.endFieldId)?.name || "";

              if (rel.startTableId === tid && rel.startFieldId === fid) {
                startFieldName = updatedValues.name!;
              }
              if (rel.endTableId === tid && rel.endFieldId === fid) {
                endFieldName = updatedValues.name!;
              }

              const newRelName = `fk_${toSnakeCase(startTable?.name || "")}_${toSnakeCase(startFieldName)}_${toSnakeCase(endTable?.name || "")}`;

              if (settings.renameFK && rel.startTableId === tid && rel.startFieldId === fid) {
                const targetRel = prevRels.find(r => r.startTableId === tid && r.startFieldId === fid && r.endTableId === rel.endTableId);
                if (targetRel) {
                  const expectedName = `${toSnakeCase(startTable?.name || "")}_${toSnakeCase(updatedValues.name!)}`;
                  const targetEndTable = prev.find(t => t.id === rel.endTableId);
                  const currentField = targetEndTable?.fields.find(f => f.id === rel.endFieldId);
                  if (currentField && currentField.name !== expectedName) {
                    // This is a recursive-like call, we should probably handle it carefully.
                    // In DiagramContext it calls itself.
                    setTimeout(() => updateField(rel.endTableId, rel.endFieldId, { name: expectedName }), 0);
                  }
                }
              }

              return { ...rel, name: newRelName };
            }
            return rel;
          })
        );
      }

      return prev.map((table) => {
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
      });
    });
  }, [setTables, setRelationships, settings.renameFK]);

  const updateTable = useCallback((id: string | number, updatedValues: Partial<ITable>, addToHistory: boolean = true) => {
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

    if (updatedValues.name && updatedValues.name !== oldTable.name) {
      setRelationships((prevRels) =>
        prevRels.map((rel) => {
          if (rel.startTableId === id || rel.endTableId === id) {
            const startTable = rel.startTableId === id ? { ...oldTable, ...updatedValues } : tables.find(t => t.id === rel.startTableId);
            const endTable = rel.endTableId === id ? { ...oldTable, ...updatedValues } : tables.find(t => t.id === rel.endTableId);
            
            const startField = startTable?.fields.find(f => f.id === rel.startFieldId);
            const endField = endTable?.fields.find(f => f.id === rel.endFieldId);

            const newRelName = `fk_${toSnakeCase(startTable?.name || "")}_${toSnakeCase(startField?.name || "")}_${toSnakeCase(endTable?.name || "")}`;
            
            if (settings.renameFK && rel.endTableId === id && startTable && startField) {
              const expectedName = `${toSnakeCase(startTable.name)}_${toSnakeCase(startField.name)}`;
              const currentField = endTable?.fields.find(f => f.id === rel.endFieldId);
              if (currentField && currentField.name !== expectedName) {
                updateField(id, rel.endFieldId, {
                  name: expectedName
                });
              }
            }

            return { ...rel, name: newRelName };
          }
          return rel;
        })
      );
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
          group.childRelationshipIds.forEach((rid: string | number, index: number) => {
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
  }, [tables, setUndoStack, setRedoStack, t, setRelationships, settings.renameFK, updateField, xorGroups, orGroups, getGroupPoints, relationships, updateRelationship, setTables]);

  const deleteField = useCallback((field: IField, tid: string | number, addToHistory: boolean = true) => {
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
  }, [tables, relationships, setUndoStack, setRedoStack, t, setRelationships, updateTable]);

  return {
    addTable,
    deleteTable,
    updateTable,
    updateField,
    deleteField,
  };
};
