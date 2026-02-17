import { useCallback } from "react";
import { Validator } from "jsonschema";
import { nanoid } from "nanoid";
import {
  ObjectType,
  Action,
} from "@data/constants";
import { areaSchema, noteSchema, tableSchema } from "@data/schemas.js";

/**
 * Hook for handling clipboard and element manipulation actions.
 */
export const useClipboardActions = ({
  tables,
  addTable,
  deleteTable,
  notes,
  addNote,
  deleteNote,
  areas,
  addArea,
  deleteArea,
  relationships,
  deleteRelationship,
  updateRelationship,
  xorGroups,
  deleteXorGroup,
  orGroups,
  deleteOrGroup,
  selectedElement,
  setSelectedElement,
  bulkSelectedElements,
  setBulkSelectedElements,
  setUndoStack,
  setRedoStack,
  layout,
  t,
}: any) => {
  const copy = useCallback(() => {
    let obj: any = null;
    switch (selectedElement.element) {
      case ObjectType.TABLE:
        obj = tables.find((t: any) => t.id === selectedElement.id);
        break;
      case ObjectType.NOTE:
        obj = notes.find((n: any) => n.id === selectedElement.id);
        break;
      case ObjectType.AREA:
        obj = areas.find((a: any) => a.id === selectedElement.id);
        break;
      default:
        break;
    }
    if (obj) {
      navigator.clipboard.writeText(JSON.stringify(obj));
    }
  }, [selectedElement, tables, notes, areas]);

  const del = useCallback(() => {
    if (layout.readOnly) return;

    if (bulkSelectedElements.length > 0) {
      bulkSelectedElements.forEach((el: any) => {
        switch (el.type) {
          case ObjectType.TABLE:
            deleteTable(el.id);
            break;
          case ObjectType.NOTE:
            deleteNote(el.id);
            break;
          case ObjectType.AREA:
            deleteArea(el.id);
            break;
          case ObjectType.RELATIONSHIP:
            deleteRelationship(el.id);
            break;
          case ObjectType.XOR_GROUP:
            deleteXorGroup(el.id);
            break;
          case ObjectType.OR_GROUP:
            deleteOrGroup(el.id);
            break;
          case ObjectType.WAYPOINT: {
            const rel = relationships.find((r: any) => r.id === el.id);
            if (rel && rel.waypoints) {
              const newWaypoints = rel.waypoints.filter(
                (_: any, i: number) => i !== (el as any).waypointIndex,
              );
              setUndoStack((prev: any) => [
                ...prev,
                {
                  action: Action.EDIT,
                  element: ObjectType.RELATIONSHIP,
                  rid: el.id,
                  undo: { waypoints: rel.waypoints || [] },
                  redo: { waypoints: newWaypoints },
                  message: t("edit_relationship", {
                    refName: rel.name,
                    extra: `[${t("delete_waypoint") || "Delete waypoint"}]`,
                  }),
                },
              ]);
              setRedoStack([]);
              updateRelationship(el.id, { waypoints: newWaypoints });
            }
            break;
          }
          default:
            break;
        }
      });
      setBulkSelectedElements([]);
      setSelectedElement((prev: any) => ({
        ...prev,
        element: ObjectType.NONE,
        id: "",
        open: false,
      }));
      return;
    }

    switch (selectedElement.element) {
      case ObjectType.TABLE:
        deleteTable(selectedElement.id);
        break;
      case ObjectType.NOTE:
        deleteNote(selectedElement.id);
        break;
      case ObjectType.AREA:
        deleteArea(selectedElement.id);
        break;
      case ObjectType.RELATIONSHIP:
        deleteRelationship(selectedElement.id);
        break;
      case ObjectType.XOR_GROUP:
        deleteXorGroup(selectedElement.id);
        break;
      case ObjectType.OR_GROUP:
        deleteOrGroup(selectedElement.id);
        break;
      case ObjectType.WAYPOINT: {
        const rel = relationships.find((r: any) => r.id === selectedElement.id);
        if (rel && rel.waypoints) {
          const newWaypoints = rel.waypoints.filter(
            (_: any, i: number) => i !== (selectedElement as any).waypointIndex,
          );
          setUndoStack((prev: any) => [
            ...prev,
            {
              action: Action.EDIT,
              element: ObjectType.RELATIONSHIP,
              rid: selectedElement.id,
              undo: { waypoints: rel.waypoints || [] },
              redo: { waypoints: newWaypoints },
              message: t("edit_relationship", {
                noteTitle: rel.name,
                extra: `[${t("delete_waypoint") || "Delete waypoint"}]`,
              }),
            },
          ]);
          setRedoStack([]);
          updateRelationship(selectedElement.id, { waypoints: newWaypoints });
        }
        break;
      }
      default:
        break;
    }
  }, [
    layout.readOnly,
    bulkSelectedElements,
    selectedElement,
    deleteTable,
    deleteNote,
    deleteArea,
    deleteRelationship,
    deleteXorGroup,
    deleteOrGroup,
    relationships,
    setUndoStack,
    setRedoStack,
    updateRelationship,
    setBulkSelectedElements,
    setSelectedElement,
    t,
  ]);

  const duplicate = useCallback(() => {
    if (layout.readOnly) return;

    switch (selectedElement.element) {
      case ObjectType.TABLE: {
        const table = tables.find((t: any) => t.id === selectedElement.id);
        if (table) {
          addTable({
            table: {
              ...table,
              x: table.x + 20,
              y: table.y + 20,
              id: nanoid(),
            },
            index: tables.length,
          });
        }
        break;
      }
      case ObjectType.NOTE: {
        const note = notes.find((n: any) => n.id === selectedElement.id);
        if (note) {
          addNote({
            note: {
              ...note,
              x: note.x + 20,
              y: note.y + 20,
              id: nanoid(),
            },
            index: notes.length,
          });
        }
        break;
      }
      case ObjectType.AREA: {
        const area = areas.find((a: any) => a.id === selectedElement.id);
        if (area) {
          addArea({
            area: {
              ...area,
              x: area.x + 20,
              y: area.y + 20,
              id: nanoid(),
            },
            index: areas.length,
          });
        }
        break;
      }
      default:
        break;
    }
  }, [layout.readOnly, selectedElement, tables, addTable, notes, addNote, areas, addArea]);

  const paste = useCallback(() => {
    if (layout.readOnly) return;

    navigator.clipboard.readText().then((text) => {
      let obj = null;
      try {
        obj = JSON.parse(text);
      } catch (error) {
        return;
      }
      const v = new Validator();
      if (v.validate(obj, tableSchema).valid) {
        addTable({
          table: {
            ...obj,
            x: obj.x + 20,
            y: obj.y + 20,
            id: nanoid(),
          },
          index: tables.length,
        });
      } else if (v.validate(obj, areaSchema).valid) {
        addArea({
          area: {
            ...obj,
            x: obj.x + 20,
            y: obj.y + 20,
            id: nanoid(),
          },
          index: areas.length,
        });
      } else if (v.validate(obj, noteSchema).valid) {
        addNote({
          note: {
            ...obj,
            x: obj.x + 20,
            y: obj.y + 20,
            id: nanoid(),
          },
          index: notes.length,
        });
      }
    });
  }, [layout.readOnly, addTable, tables.length, addArea, areas.length, addNote, notes.length]);

  const cut = useCallback(() => {
    if (layout.readOnly) return;
    copy();
    del();
  }, [layout.readOnly, copy, del]);

  const edit = useCallback(() => {
    if (layout.readOnly) return;
    setSelectedElement((prev: any) => ({ ...prev, open: true }));
  }, [layout.readOnly, setSelectedElement]);

  return {
    copy,
    paste,
    cut,
    duplicate,
    del,
    edit,
  };
};
