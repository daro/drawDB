import { useCallback } from "react";
import { Toast } from "@douyinfe/semi-ui";
import { Action, Cardinality, ObjectType, TABLE_CONFIG, Constraint } from "../data/constants";
import { nanoid } from "nanoid";
import { areFieldsCompatible, getTableHeight, getTableWidth, toSnakeCase } from "../utils/utils";
import { isPointInsideRect } from "../utils/rect";
import { ITable, IField, IRelationship } from "../types";
import { ICanvasContext } from "../context/CanvasContext";

/**
 * Hook to handle the logic of linking tables to create relationships.
 *
 * @param tables - Array of table objects.
 * @param setTables - Function to update the tables state.
 * @param updateTable - Function to update a specific table.
 * @param addRelationship - Function to add a new relationship.
 * @param updateField - Function to update a specific field.
 * @param linking - Boolean indicating if linking mode is active.
 * @param setLinking - Function to update linking mode state.
 * @param linkingLine - State of the temporary linking line.
 * @param setLinkingLine - Function to update linking line state.
 * @param hoveredTable - State of the currently hovered table during linking.
 * @param setHoveredTable - Function to update hovered table state.
 * @param relationshipType - The type of relationship being created.
 * @param settings - Application settings.
 * @param setUndoStack - Function to update the undo stack.
 * @param setRedoStack - Function to update the redo stack.
 * @param pointer - Pointer state from CanvasContext.
 * @param t - Translation function.
 * @param database - The current database type.
 * @returns Object containing linking handlers.
 */
export function useLinkingLogic(
  tables: ITable[],
  setTables: (val: ITable[] | ((prev: ITable[]) => ITable[])) => void,
  updateTable: (id: string | number, values: Partial<ITable>, history?: boolean) => void,
  addRelationship: (rel: IRelationship, history?: boolean) => void,
  updateField: (tid: string | number, fid: string | number, values: Partial<IField>) => void,
  linking: boolean,
  setLinking: (val: boolean) => void,
  linkingLine: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    startFieldId: string | number;
    startTableId: string | number;
  },
  setLinkingLine: (val: any | ((prev: any) => any)) => void,
  hoveredTable: { tableId: string | number | null; fieldId: string | number | null },
  setHoveredTable: (val: any) => void,
  relationshipType: string,
  settings: any,
  setUndoStack: (val: any | ((prev: any) => any)) => void,
  setRedoStack: (val: any[]) => void,
  pointer: ICanvasContext["pointer"],
  t: (key: string) => string,
  database: string
) {
  const getCardinality = useCallback((startField: IField, endField: IField) => {
    if (relationshipType && relationshipType !== Cardinality.AUTO) {
      return relationshipType;
    }
    const startIsUnique = startField.unique || startField.primary;
    const endIsUnique = endField.unique || endField.primary;

    if (startIsUnique && endIsUnique) {
      return Cardinality.ONE_TO_ONE;
    }
    if (startIsUnique && !endIsUnique) {
      return Cardinality.ONE_TO_MANY;
    }
    if (!startIsUnique && endIsUnique) {
      return Cardinality.MANY_TO_ONE;
    }
    return Cardinality.ONE_TO_ONE;
  }, [relationshipType]);

  const handleLinking = useCallback(() => {
    if (hoveredTable.tableId === null) {
      if (linkingLine.startFieldId === "") {
        Toast.info("Click on a table to assign it as supertype");
      }
      return;
    }

    if (linkingLine.startFieldId === "") {
      const subtypeId = linkingLine.startTableId;
      const supertypeId = hoveredTable.tableId;
      if (subtypeId === supertypeId) return;

      const subtype = tables.find((t) => t.id === subtypeId);
      const supertype = tables.find((t) => t.id === supertypeId);
      if (!subtype || !supertype) return;

      if (supertype.supertypeId) {
        Toast.info("A subtype cannot be a supertype");
        return;
      }

      setUndoStack((prev: any) => [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.TABLE,
          tid: subtypeId,
          undo: {
            supertypeId: subtype.supertypeId,
            x: subtype.x,
            y: subtype.y,
          },
          redo: {
            supertypeId: supertypeId,
            x: supertype.x + 20,
            y:
              supertype.y +
              supertype.fields.length * TABLE_CONFIG.FIELD_HEIGHT +
              TABLE_CONFIG.HEADER.HEIGHT +
              TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT +
              10,
          },
          message: t("edit_table", {
            tableName: subtype.name,
            extra: "[supertype]",
          }),
        },
      ]);
      setRedoStack([]);

      const baseHeight =
        supertype.fields.length * TABLE_CONFIG.FIELD_HEIGHT +
        TABLE_CONFIG.HEADER.HEIGHT +
        TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT;
      const newX = supertype.x + 20;
      const newY = supertype.y + baseHeight + 10;

      const updatedSubtype = {
        ...subtype,
        supertypeId: supertypeId,
        x: newX,
        y: newY,
      };

      const updatedTables = tables.map((tab) =>
        tab.id === subtypeId ? updatedSubtype : tab,
      );

      const currentSubtypes = updatedTables.filter((tab) => tab.supertypeId === supertypeId);
      const newHeight = getTableHeight(supertype, currentSubtypes);
      const newWidth = getTableWidth(supertype, currentSubtypes);

      setTables((prev: any) =>
        prev.map((tab: any) => {
          if (tab.id === subtypeId) return updatedSubtype;
          if (tab.id === supertypeId) return { ...tab, height: newHeight, width: newWidth };
          return tab;
        }),
      );
      return;
    }

    if (hoveredTable.fieldId === null) return;

    const startTableData = tables.find((tab) => tab.id === linkingLine.startTableId);
    if (!startTableData) return;
    const startField = startTableData.fields.find((f: any) => f.id === linkingLine.startFieldId);
    
    const endTableData = tables.find((tab) => tab.id === hoveredTable.tableId);
    if (!endTableData) return;
    const endField = endTableData.fields.find((f: any) => f.id === hoveredTable.fieldId);

    if (endField.primary) {
      const newFid = nanoid();
      const newField = {
        id: newFid,
        name: `${toSnakeCase(startTableData.name)}_${toSnakeCase(startField.name)}`,
        type: startField.type,
        default: "",
        check: "",
        primary: false,
        unique: false,
        notNull: true,
        increment: false,
        comment: "",
      };
      const cardinality = getCardinality(startField, newField);
      if (cardinality === Cardinality.ONE_TO_ONE) {
        newField.unique = true;
      }
      const updatedEndTableFields = [...endTableData.fields, newField];
      updateTable(hoveredTable.tableId, {
        fields: updatedEndTableFields,
        height: getTableHeight({
          ...endTableData,
          fields: updatedEndTableFields,
        }),
      });

      const newRelationship: any = {
        id: nanoid(),
        name: `fk_${toSnakeCase(startTableData.name)}_${toSnakeCase(startField.name)}_${toSnakeCase(endTableData.name)}`,
        startTableId: linkingLine.startTableId,
        startFieldId: linkingLine.startFieldId,
        endTableId: hoveredTable.tableId,
        endFieldId: newFid,
        cardinality,
        updateConstraint: Constraint.NONE,
        deleteConstraint: Constraint.NONE,
        identifying: startField.primary && newField.primary,
        waypoints: settings.autoSplitRelationships && cardinality !== Cardinality.ONE_TO_ONE
          ? [{ x: 0, y: 0, mode: "divider", pathRatio: 0.5 }]
          : [],
      };
      addRelationship(newRelationship);
      return;
    }

    if (!areFieldsCompatible(database, startField.type, endField.type)) {
      Toast.info(t("cannot_connect"));
      return;
    }
    if (
      linkingLine.startTableId === hoveredTable.tableId &&
      linkingLine.startFieldId === hoveredTable.fieldId
    )
      return;

    const cardinality = getCardinality(startField, endField);

    if (settings.renameFK || cardinality === Cardinality.ONE_TO_ONE) {
      const expectedName = `${toSnakeCase(startTableData.name)}_${toSnakeCase(startField.name)}`;
      updateField(hoveredTable.tableId, hoveredTable.fieldId, {
        ...(settings.renameFK && endField.name !== expectedName && {
          name: expectedName,
        }),
        ...(cardinality === Cardinality.ONE_TO_ONE && { unique: true }),
      });
    }

    const newRelationship: any = {
      id: nanoid(),
      name: `fk_${toSnakeCase(startTableData.name)}_${toSnakeCase(startField.name)}_${toSnakeCase(endTableData.name)}`,
      startTableId: linkingLine.startTableId,
      startFieldId: linkingLine.startFieldId,
      endTableId: hoveredTable.tableId,
      endFieldId: hoveredTable.fieldId,
      cardinality,
      updateConstraint: Constraint.NONE,
      deleteConstraint: Constraint.NONE,
      identifying: startField.primary && endField.primary,
      waypoints: settings.autoSplitRelationships && cardinality !== Cardinality.ONE_TO_ONE ? [{ x: 0, y: 0, mode: "divider", pathRatio: 0.5 }] : [],
    };
    addRelationship(newRelationship);
  }, [hoveredTable, linkingLine, tables, settings, addRelationship, updateField, updateTable, getCardinality, setUndoStack, setRedoStack, t, database]);

  const handlePointerMoveLinking = useCallback(() => {
    if (linking) {
      if (linkingLine.startFieldId !== "") {
        setLinkingLine((prev: any) => ({
          ...prev,
          endX: pointer.spaces.diagram.x!,
          endY: pointer.spaces.diagram.y!,
        }));
      } else {
        const table = tables.find((tab) =>
          isPointInsideRect(
            { x: pointer.spaces.diagram.x!, y: pointer.spaces.diagram.y! },
            {
              x: tab.x - 10,
              y: tab.y - 10,
              width: tab.width + 20,
              height: (tab.height || 0) + 20,
            },
          ),
        );
        if (table) {
          setHoveredTable({ tableId: table.id, fieldId: null });
        } else {
          setHoveredTable({ tableId: null, fieldId: null });
        }
        setLinkingLine((prev: any) => ({
          ...prev,
          endX: pointer.spaces.diagram.x!,
          endY: pointer.spaces.diagram.y!,
        }));
      }
      pointer.setStyle("crosshair");
      return true;
    }
    return false;
  }, [linking, linkingLine.startFieldId, pointer, tables, setLinkingLine, setHoveredTable]);

  return { handleLinking, handlePointerMoveLinking };
}
