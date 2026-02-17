import { useCallback } from "react";
import { nanoid } from "nanoid";
import { Action, ObjectType } from "@data/constants";
import { IRelationship, IGroup, ITable } from "@types";

interface UseRelationshipActionsProps {
  relationships: IRelationship[];
  setRelationships: React.Dispatch<React.SetStateAction<IRelationship[]>>;
  xorGroups: IGroup[];
  setXorGroups: React.Dispatch<React.SetStateAction<IGroup[]>>;
  orGroups: IGroup[];
  setOrGroups: React.Dispatch<React.SetStateAction<IGroup[]>>;
  tables: ITable[];
  setUndoStack: React.Dispatch<React.SetStateAction<any[]>>;
  setRedoStack: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedElement: React.Dispatch<React.SetStateAction<any>>;
  t: (key: string, options?: any) => string;
  getGroupPoints: (data: IGroup, tables: ITable[], relationships: IRelationship[]) => any;
}

export const useRelationshipActions = ({
  relationships,
  setRelationships,
  xorGroups,
  setXorGroups,
  orGroups,
  setOrGroups,
  tables,
  setUndoStack,
  setRedoStack,
  setSelectedElement,
  t,
  getGroupPoints,
}: UseRelationshipActionsProps) => {

  const updateRelationship = useCallback((id: string | number, updatedValues: Partial<IRelationship>) => {
    setRelationships((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedValues } : t)),
    );
  }, [setRelationships]);

  const addRelationship = useCallback((data: IRelationship | { relationship: IRelationship; index: number }, addToHistory: boolean = true) => {
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
  }, [setRelationships, setUndoStack, setRedoStack, t]);

  const deleteRelationship = useCallback((id: string | number, addToHistory: boolean = true) => {
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
  }, [relationships, setUndoStack, setRedoStack, t, setRelationships, setXorGroups, setOrGroups]);

  const addXorGroup = useCallback((data: Partial<IGroup>, addToHistory: boolean = true) => {
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
  }, [tables, relationships, getGroupPoints, updateRelationship, setUndoStack, t, xorGroups.length, setXorGroups]);

  const deleteXorGroup = useCallback((id: string | number, addToHistory: boolean = true) => {
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
  }, [xorGroups, getGroupPoints, tables, relationships, updateRelationship, setUndoStack, t, setXorGroups]);

  const updateXorGroup = useCallback((id: string | number, updatedValues: Partial<IGroup>) => {
    setXorGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updatedValues } : g)),
    );
  }, [setXorGroups]);

  const addOrGroup = useCallback((data: Partial<IGroup>, addToHistory: boolean = true) => {
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
  }, [tables, relationships, getGroupPoints, updateRelationship, setUndoStack, t, orGroups.length, setOrGroups]);

  const deleteOrGroup = useCallback((id: string | number, addToHistory: boolean = true) => {
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
  }, [orGroups, getGroupPoints, tables, relationships, updateRelationship, setUndoStack, t, setOrGroups]);

  const updateOrGroup = useCallback((id: string | number, updatedValues: Partial<IGroup>) => {
    setOrGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updatedValues } : g)),
    );
  }, [setOrGroups]);

  const convertXorToOr = useCallback((id: string | number) => {
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
    setSelectedElement((prev: any) => ({ ...prev, element: ObjectType.OR_GROUP }));
  }, [xorGroups, setUndoStack, t, orGroups.length, setXorGroups, setOrGroups, setSelectedElement]);

  const convertOrToXor = useCallback((id: string | number) => {
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
  }, [orGroups, setUndoStack, t, setOrGroups, setXorGroups]);

  return {
    updateRelationship,
    addRelationship,
    deleteRelationship,
    addXorGroup,
    deleteXorGroup,
    updateXorGroup,
    addOrGroup,
    deleteOrGroup,
    updateOrGroup,
    convertXorToOr,
    convertOrToXor,
  };
};
