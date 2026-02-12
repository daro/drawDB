import { useCallback } from "react";
import { Action, ObjectType } from "../../data/constants";

export const useHistoryActions = (
  undoStack: any[],
  redoStack: any[],
  setUndoStack: (val: any | ((prev: any[]) => any[])) => void,
  setRedoStack: (val: any | ((prev: any[]) => any[])) => void,
  updateTable: any,
  updateArea: any,
  updateNote: any,
  updateText: any,
  deleteTable: any,
  deleteArea: any,
  deleteNote: any,
  deleteRelationship: any,
  deleteType: any,
  deleteEnum: any,
  deleteXorGroup: any,
  deleteOrGroup: any,
  deleteText: any,
  tables: any[],
  areas: any[],
  notes: any[],
  relationships: any[],
  texts: any[],
  addRelationship: any,
  addTable: any,
  addNote: any,
  addArea: any,
  addType: any,
  addEnum: any,
  addText: any,
  setRelationships: any,
  updateField: any,
  updateEnum: any,
  updateType: any,
  deleteRelationshipWaypoint: any,
  updateRelationship: any,
) => {
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
        deleteType(a.data.type.id, false);
      } else if (a.element === ObjectType.ENUM) {
        deleteEnum(a.data.enum.id, false);
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
        const table = tables.find((t) => t.id === a.id);
        if (table) {
          const { x, y } = table;
          setRedoStack((prev: any[]) => [...prev, { ...a, x, y }]);
          updateTable(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.AREA && a.id !== undefined) {
        const area = areas.find((ar) => ar.id === a.id);
        if (area) {
          setRedoStack((prev: any[]) => [
            ...prev,
            { ...a, x: area.x, y: area.y },
          ]);
          updateArea(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.NOTE && a.id !== undefined) {
        const note = notes.find((n) => n.id === a.id);
        if (note) {
          setRedoStack((prev: any[]) => [
            ...prev,
            { ...a, x: note.x, y: note.y },
          ]);
          updateNote(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.TEXT && a.id !== undefined) {
        const text = texts.find((t) => t.id === a.id);
        if (text) {
          setRedoStack((prev: any[]) => [
            ...prev,
            { ...a, x: text.x, y: text.y },
          ]);
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
      } else if (a.element === ObjectType.TYPE) {
        addType(a.data, false);
      } else if (a.element === ObjectType.ENUM) {
        addEnum(a.data, false);
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
            let temp = [...prev];
            a.data.relationship.forEach((r: any) => {
              if (!temp.find((t) => t.id === r.id)) temp.push(r);
            });
            return temp;
          });
          updateTable(a.tid, a.undo);
        } else if (a.component === "index_delete") {
          updateTable(a.tid, a.undo);
        } else {
          updateTable(a.tid, a.undo);
        }
      } else if (a.element === ObjectType.ENUM) {
        updateEnum(a.id, a.undo);
      } else if (a.element === ObjectType.TYPE) {
        updateType(a.id, a.undo);
      } else if (a.element === ObjectType.RELATIONSHIP) {
        if (a.component === "waypoint_delete") {
          addRelationship(a.data, false);
        } else {
          updateRelationship(a.id, a.undo);
        }
      }
      setRedoStack((prev: any[]) => [...prev, a]);
    }
  }, [undoStack, setUndoStack, updateTable, updateArea, updateNote, updateText, deleteTable, areas, deleteArea, notes, deleteNote, deleteRelationship, deleteType, deleteEnum, deleteXorGroup, deleteOrGroup, texts, deleteText, setRedoStack, tables, addRelationship, addTable, addNote, addArea, addType, addEnum, addText, updateField, setRelationships, updateEnum, updateType, updateRelationship]);

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
      } else if (a.element === ObjectType.TYPE) {
        addType(a.data, false);
      } else if (a.element === ObjectType.ENUM) {
        addEnum(a.data, false);
      } else if (a.element === ObjectType.XOR_GROUP) {
        addXorGroup(a.data, false);
      } else if (a.element === ObjectType.OR_GROUP) {
        addOrGroup(a.data, false);
      } else if (a.element === ObjectType.TEXT) {
        addText(a.data, false);
      }
      setUndoStack((prev: any[]) => [...prev, a]);
    } else if (a.action === Action.MOVE) {
      if (a.element === ObjectType.TABLE && a.id !== undefined) {
        const table = tables.find((t) => t.id === a.id);
        if (table) {
          const { x, y } = table;
          setUndoStack((prev: any[]) => [...prev, { ...a, x, y }]);
          updateTable(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.AREA && a.id !== undefined) {
        const area = areas.find((ar) => ar.id === a.id);
        if (area) {
          setUndoStack((prev: any[]) => [
            ...prev,
            { ...a, x: area.x, y: area.y },
          ]);
          updateArea(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.NOTE && a.id !== undefined) {
        const note = notes.find((n) => n.id === a.id);
        if (note) {
          setUndoStack((prev: any[]) => [
            ...prev,
            { ...a, x: note.x, y: note.y },
          ]);
          updateNote(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.TEXT && a.id !== undefined) {
        const text = texts.find((t) => t.id === a.id);
        if (text) {
          setUndoStack((prev: any[]) => [
            ...prev,
            { ...a, x: text.x, y: text.y },
          ]);
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
      } else if (a.element === ObjectType.TYPE) {
        deleteType(a.data.id, false);
      } else if (a.element === ObjectType.ENUM) {
        deleteEnum(a.data.id, false);
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
          deleteField(a.tid, a.fid, false);
        } else if (a.component === "index_delete") {
          updateTable(a.tid, a.redo);
        } else {
          updateTable(a.tid, a.redo);
        }
      } else if (a.element === ObjectType.ENUM) {
        updateEnum(a.id, a.redo);
      } else if (a.element === ObjectType.TYPE) {
        updateType(a.id, a.redo);
      } else if (a.element === ObjectType.RELATIONSHIP) {
        if (a.component === "waypoint_delete") {
          deleteRelationshipWaypoint(a.id, a.index, false);
        } else {
          updateRelationship(a.id, a.redo);
        }
      }
      setUndoStack((prev: any[]) => [...prev, a]);
    }
  }, [redoStack, setRedoStack, updateTable, updateArea, updateNote, updateText, setUndoStack, addTable, addArea, addNote, addRelationship, addType, addEnum, addXorGroup, addOrGroup, addText, tables, areas, notes, texts, deleteTable, deleteRelationship, deleteNote, deleteArea, deleteType, deleteEnum, deleteText, updateField, deleteField, updateEnum, updateType, deleteRelationshipWaypoint, updateRelationship]);

  return {
    undo,
    redo,
  };
};
