import { useCallback, useMemo } from "react";
import { Toast } from "@douyinfe/semi-ui";
import {
  ObjectType,
  Action,
  Cardinality,
} from "../../data/constants";

import {
  IconOneToOne,
  IconOneToMany,
  IconManyToMany,
  IconRelationshipAuto,
} from "../../icons";

export const useControlPanelActions = ({
  tables,
  setTables,
  addTable,
  updateTable,
  deleteTable,
  updateField,
  relationships,
  setRelationships,
  addRelationship,
  deleteRelationship,
  updateRelationship,
  undoStack,
  redoStack,
  setUndoStack,
  setRedoStack,
  areas,
  deleteArea,
  addArea,
  updateArea,
  notes,
  deleteNote,
  addNote,
  updateNote,
  texts,
  deleteText,
  addText,
  updateText,
  xorGroups,
  addXorGroup,
  deleteXorGroup,
  orGroups,
  addOrGroup,
  deleteOrGroup,
  selectedElement,
  setSelectedElement,
  bulkSelectedElements,
  setBulkSelectedElements,
  layout,
  t,
}: any) => {

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const a = undoStack[undoStack.length - 1];
    setUndoStack((prev: any[]) => prev.filter((_, i) => i !== prev.length - 1));

    if (a.bulk && a.elements) {
      for (const element of a.elements) {
        if (element.type === ObjectType.TABLE) {
          updateTable(element.id, element.undo);
        } else if (element.type === ObjectType.AREA) {
          updateArea(element.id, element.undo);
        } else if (element.type === ObjectType.NOTE) {
          updateNote(element.id, element.undo);
        } else if (element.type === ObjectType.TEXT) {
          updateText(element.id, element.undo);
        }
      }
      setRedoStack((prev: any[]) => [...prev, a]);
      return;
    }

    if (a.action === Action.ADD) {
      if (a.element === ObjectType.TABLE) {
        deleteTable(a.data.table.id, false);
      } else if (a.element === ObjectType.AREA) {
        deleteArea(areas[areas.length - 1].id, false);
      } else if (a.element === ObjectType.NOTE) {
        deleteNote(notes[notes.length - 1].id, false);
      } else if (a.element === ObjectType.RELATIONSHIP) {
        deleteRelationship(a.data.relationship.id, false);
      } else if (a.element === ObjectType.TYPE) {
        // Assume deleteType is available globally or passed via props
        // This might need more refinement if types/enums are managed differently
      } else if (a.element === ObjectType.ENUM) {
        // Same for deleteEnum
      } else if (a.element === ObjectType.XOR_GROUP) {
        deleteXorGroup(a.data.group.id, false);
      } else if (a.element === ObjectType.OR_GROUP) {
        deleteOrGroup(a.data.group.id, false);
      } else if (a.element === ObjectType.TEXT) {
        deleteText(texts[texts.length - 1].id, false);
      }
      setRedoStack((prev: any[]) => [...prev, a]);
    } else if (a.action === Action.MOVE) {
      if (a.element === ObjectType.TABLE && a.id !== undefined) {
        const table = tables.find((t: any) => t.id === a.id);
        if (table) {
          const { x, y } = table;
          setRedoStack((prev: any[]) => [...prev, { ...a, x, y }]);
          updateTable(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.AREA && a.id !== undefined) {
        const area = areas.find((ar: any) => ar.id === a.id);
        if (area) {
          setRedoStack((prev: any[]) => [...prev, { ...a, x: area.x, y: area.y }]);
          updateArea(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.NOTE && a.id !== undefined) {
        const note = notes.find((n: any) => n.id === a.id);
        if (note) {
          setRedoStack((prev: any[]) => [...prev, { ...a, x: note.x, y: note.y }]);
          updateNote(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.TEXT && a.id !== undefined) {
        const text = texts.find((t: any) => t.id === a.id);
        if (text) {
          setRedoStack((prev: any[]) => [...prev, { ...a, x: text.x, y: text.y }]);
          updateText(a.id, { x: a.x, y: a.y });
        }
      }
    } else if (a.action === Action.DELETE) {
      if (a.element === ObjectType.TABLE) {
        a.data.relationship.forEach((x: any) => addRelationship(x, false));
        addTable(a.data, false);
      } else if (a.element === ObjectType.RELATIONSHIP) {
        addRelationship(a.data, false);
      } else if (a.element === ObjectType.NOTE) {
        addNote(a.data, false);
      } else if (a.element === ObjectType.AREA) {
        addArea(a.data, false);
      } else if (a.element === ObjectType.TEXT) {
        addText(a.data, false);
      }
      setRedoStack((prev: any[]) => [...prev, a]);
    } else if (a.action === Action.EDIT) {
       if (a.element === ObjectType.AREA) {
        updateArea(a.aid, a.undo);
      } else if (a.element === ObjectType.NOTE) {
        updateNote(a.nid, a.undo);
      } else if (a.element === ObjectType.TEXT) {
        updateText(a.tid, a.undo);
      } else if (a.element === ObjectType.TABLE) {
        if (a.component === "field") {
          updateField(a.tid, a.fid, a.undo);
        } else if (a.component === "field_delete") {
           setRelationships((prev: any[]) => {
            const newRels = [...prev];
            a.data.relationships.forEach((rel: any) => {
              if (!newRels.find((r) => r.id === rel.id)) {
                newRels.push(rel);
              }
            });
            return newRels;
          });
          updateTable(a.tid, a.undo);
        } else {
          updateTable(a.tid, a.undo);
        }
      } else if (a.element === ObjectType.RELATIONSHIP) {
        updateRelationship(a.rid, a.undo);
      }
      setRedoStack((prev: any[]) => [...prev, a]);
    }
  }, [undoStack, setUndoStack, setRedoStack, updateTable, updateArea, updateNote, updateText, deleteTable, deleteArea, deleteNote, deleteRelationship, deleteXorGroup, deleteOrGroup, deleteText, tables, areas, notes, texts, addRelationship, addTable, addNote, addArea, addText, updateField, setRelationships, updateRelationship]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const a = redoStack[redoStack.length - 1];
    setRedoStack((prev: any[]) => prev.filter((_, i) => i !== prev.length - 1));

    if (a.bulk && a.elements) {
      for (const element of a.elements) {
        if (element.type === ObjectType.TABLE) {
          updateTable(element.id, element.redo);
        } else if (element.type === ObjectType.AREA) {
          updateArea(element.id, element.redo);
        } else if (element.type === ObjectType.NOTE) {
          updateNote(element.id, element.redo);
        } else if (element.type === ObjectType.TEXT) {
          updateText(element.id, element.redo);
        }
      }
      setUndoStack((prev: any[]) => [...prev, a]);
      return;
    }

    if (a.action === Action.ADD) {
      if (a.element === ObjectType.TABLE) {
        addTable(a.data, false);
      } else if (a.element === ObjectType.AREA) {
        addArea(a.data, false);
      } else if (a.element === ObjectType.NOTE) {
        addNote(a.data, false);
      } else if (a.element === ObjectType.RELATIONSHIP) {
        addRelationship(a.data, false);
      } else if (a.element === ObjectType.TEXT) {
        addText(a.data, false);
      }
      setUndoStack((prev: any[]) => [...prev, a]);
    } else if (a.action === Action.MOVE) {
      if (a.element === ObjectType.TABLE && a.id !== undefined) {
        const table = tables.find((t: any) => t.id === a.id);
        if (table) {
          const { x, y } = table;
          setUndoStack((prev: any[]) => [...prev, { ...a, x, y }]);
          updateTable(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.AREA && a.id !== undefined) {
        const area = areas.find((ar: any) => ar.id === a.id);
        if (area) {
          setUndoStack((prev: any[]) => [...prev, { ...a, x: area.x, y: area.y }]);
          updateArea(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.NOTE && a.id !== undefined) {
        const note = notes.find((n: any) => n.id === a.id);
        if (note) {
          setUndoStack((prev: any[]) => [...prev, { ...a, x: note.x, y: note.y }]);
          updateNote(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.TEXT && a.id !== undefined) {
        const text = texts.find((t: any) => t.id === a.id);
        if (text) {
          setUndoStack((prev: any[]) => [...prev, { ...a, x: text.x, y: text.y }]);
          updateText(a.id, { x: a.x, y: a.y });
        }
      }
    } else if (a.action === Action.DELETE) {
      if (a.element === ObjectType.TABLE) {
        deleteTable(a.data.table.id, false);
      } else if (a.element === ObjectType.RELATIONSHIP) {
        deleteRelationship(a.data.id, false);
      } else if (a.element === ObjectType.NOTE) {
        deleteNote(a.data.id, false);
      } else if (a.element === ObjectType.AREA) {
        deleteArea(a.data.id, false);
      } else if (a.element === ObjectType.TEXT) {
        deleteText(a.data.id, false);
      }
      setUndoStack((prev: any[]) => [...prev, a]);
    } else if (a.action === Action.EDIT) {
      if (a.element === ObjectType.AREA) {
        updateArea(a.aid, a.redo);
      } else if (a.element === ObjectType.NOTE) {
        updateNote(a.nid, a.redo);
      } else if (a.element === ObjectType.TEXT) {
        updateText(a.tid, a.redo);
      } else if (a.element === ObjectType.TABLE) {
        if (a.component === "field") {
          updateField(a.tid, a.fid, a.redo);
        } else if (a.component === "field_delete") {
          updateTable(a.tid, a.redo);
        } else {
          updateTable(a.tid, a.redo);
        }
      } else if (a.element === ObjectType.RELATIONSHIP) {
        updateRelationship(a.rid, a.redo);
      }
      setUndoStack((prev: any[]) => [...prev, a]);
    }
  }, [redoStack, setRedoStack, setUndoStack, updateTable, updateArea, updateNote, updateText, addTable, addArea, addNote, addRelationship, addText, tables, areas, notes, texts, deleteTable, deleteRelationship, deleteNote, deleteArea, deleteText, updateField, updateRelationship]);

  const rotateRelationshipName = useCallback(() => {
    if (layout.readOnly) return;

    const selectedRels = bulkSelectedElements.filter(
      (e: any) => e.type === ObjectType.RELATIONSHIP,
    );

    if (selectedRels.length === 0) return;

    const undoActions: any[] = [];
    const redoActions: any[] = [];

    selectedRels.forEach((relSelection: any) => {
      const rel = relationships.find((r: any) => r.id === relSelection.id);
      if (rel) {
        const currentRotation = rel.nameRotation ?? 0;
        const nextRotation = (currentRotation + 90) % 360;

        undoActions.push({ id: rel.id, nameRotation: currentRotation });
        redoActions.push({ id: rel.id, nameRotation: nextRotation });

        updateRelationship(rel.id, { nameRotation: nextRotation });
      }
    });

    if (undoActions.length > 0) {
      setUndoStack((prev: any[]) => [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.RELATIONSHIP,
          multiple: true,
          undo: undoActions,
          redo: redoActions,
          message: t("edit_relationship", {
            refName: selectedRels.length === 1 
              ? relationships.find((r: any) => r.id === selectedRels[0].id)?.name 
              : `${selectedRels.length} ${t("relationships")}`,
            extra: `[${t("rotate")}]`,
          }),
        },
      ]);
      setRedoStack([]);
    }
  }, [layout.readOnly, bulkSelectedElements, relationships, updateRelationship, setUndoStack, setRedoStack, t]);

  const createXorGroup = useCallback(() => {
    const selectedRels = bulkSelectedElements.filter(
      (e: any) => e.type === ObjectType.RELATIONSHIP,
    );
    const ids = selectedRels.map((r: any) => r.id);
    const relObjects = relationships.filter((r: any) => ids.includes(r.id));

    if (relObjects.length < 2) return;

    const startTableId = relObjects[0].startTableId;
    const isParentStart = relObjects.every(
      (r: any) => r.startTableId === startTableId,
    );

    addXorGroup({
      parentTableId: isParentStart ? startTableId : relObjects[0].endTableId,
      childRelationshipIds: ids,
    });
  }, [bulkSelectedElements, relationships, addXorGroup]);

  const createOrGroup = useCallback(() => {
    const selectedRels = bulkSelectedElements.filter(
      (e: any) => e.type === ObjectType.RELATIONSHIP,
    );
    const ids = selectedRels.map((r: any) => r.id);
    const relObjects = relationships.filter((r: any) => ids.includes(r.id));

    if (relObjects.length < 2) return;

    const startTableId = relObjects[0].startTableId;
    const isParentStart = relObjects.every(
      (r: any) => r.startTableId === startTableId,
    );

    addOrGroup({
      parentTableId: isParentStart ? startTableId : relObjects[0].endTableId,
      childRelationshipIds: ids,
    });
  }, [bulkSelectedElements, relationships, addOrGroup]);

  const canCreateXorGroup = useMemo(() => {
    if (!bulkSelectedElements || bulkSelectedElements.length < 2) return false;
    const selectedRels = bulkSelectedElements.filter(
      (e: any) => e.type === ObjectType.RELATIONSHIP,
    );
    if (selectedRels.length < 2) return false;

    const ids = selectedRels.map((r: any) => r.id);
    if (
      xorGroups &&
      xorGroups.some((g: any) =>
        g.childRelationshipIds && ids.some((id: any) => g.childRelationshipIds.includes(id)),
      )
    )
      return false;

    const relObjects = relationships.filter((r: any) => ids.includes(r.id));
    if (relObjects.length < 2) return false;

    const startTableId = relObjects[0]?.startTableId;
    const isParentStart = relObjects.every(
      (r: any) => r.startTableId === startTableId,
    );

    if (isParentStart) return true;

    const endTableId = relObjects[0]?.endTableId;
    const isParentEnd = relObjects.every((r: any) => r.endTableId === endTableId);

    return isParentEnd;
  }, [bulkSelectedElements, xorGroups, relationships]);

  const canCreateOrGroup = useMemo(() => {
    if (!bulkSelectedElements || bulkSelectedElements.length < 2) return false;
    const selectedRels = bulkSelectedElements.filter(
      (e: any) => e.type === ObjectType.RELATIONSHIP,
    );
    if (selectedRels.length < 2) return false;

    const ids = selectedRels.map((r: any) => r.id);
    if (
      orGroups &&
      orGroups.some((g: any) =>
        g.childRelationshipIds && ids.some((id: any) => g.childRelationshipIds.includes(id)),
      )
    )
      return false;

    const relObjects = relationships.filter((r: any) => ids.includes(r.id));
    if (relObjects.length < 2) return false;

    const startTableId = relObjects[0]?.startTableId;
    const isParentStart = relObjects.every(
      (r: any) => r.startTableId === startTableId,
    );

    if (isParentStart) return true;

    const endTableId = relObjects[0]?.endTableId;
    const isParentEnd = relObjects.every((r: any) => r.endTableId === endTableId);

    return isParentEnd;
  }, [bulkSelectedElements, orGroups, relationships]);

  const isSingleXorGroupSelected = useMemo(() => {
    return (
      bulkSelectedElements.length === 1 &&
      bulkSelectedElements[0].type === ObjectType.XOR_GROUP
    );
  }, [bulkSelectedElements]);

  const isSingleOrGroupSelected = useMemo(() => {
    return (
      bulkSelectedElements.length === 1 &&
      bulkSelectedElements[0].type === ObjectType.OR_GROUP
    );
  }, [bulkSelectedElements]);

  const hasSelectedRelationships = useMemo(() => {
    return bulkSelectedElements.some((e: any) => e.type === ObjectType.RELATIONSHIP);
  }, [bulkSelectedElements]);

  const relationshipOptions = useMemo(() => [
    {
      type: Cardinality.AUTO,
      icon: <IconRelationshipAuto />,
      tooltip: t("auto"),
    },
    {
      type: Cardinality.ONE_TO_ONE,
      icon: <IconOneToOne />,
      tooltip: t("one_to_one"),
    },
    {
      type: Cardinality.ONE_TO_MANY,
      icon: <IconOneToMany />,
      tooltip: t("one_to_many"),
    },
    {
      type: Cardinality.MANY_TO_MANY,
      icon: <IconManyToMany />,
      tooltip: t("many_to_many"),
    },
  ], [t]);

  return {
    undo,
    redo,
    rotateRelationshipName,
    createXorGroup,
    createOrGroup,
    canCreateXorGroup,
    canCreateOrGroup,
    isSingleXorGroupSelected,
    isSingleOrGroupSelected,
    hasSelectedRelationships,
    relationshipOptions,
  };
};
