import { useMemo } from "react";
import { IRelationship, ITable, IGroup } from "../types";
import { Cardinality } from "../data/constants";

/**
 * Hook to calculate vertical offsets for relationships sharing the same field or table side.
 * This prevents lines from overlapping exactly at the contact point.
 *
 * @param data - The current relationship data.
 * @param relationships - Array of all relationships.
 * @param tables - Array of all tables.
 * @param xorGroups - Array of XOR groups.
 * @param orGroups - Array of OR groups.
 * @param settings - Application settings (e.g., spreadRelations toggle).
 * @param t - Translation function.
 * @returns Object containing startYOffset and endYOffset.
 */
export function useRelationshipOffsets(
  data: IRelationship,
  relationships: IRelationship[],
  tables: ITable[],
  xorGroups: IGroup[],
  orGroups: IGroup[],
  settings: any,
  t: (key: string) => string
) {
  return useMemo(() => {
    const group =
      xorGroups.find((g) => g.childRelationshipIds.includes(data.id)) ||
      orGroups.find((g) => g.childRelationshipIds.includes(data.id));

    if (group) {
      const sameFieldRels = group.childRelationshipIds
        .map((rid) => relationships.find((rel) => rel.id === rid))
        .filter((r) => {
          if (!r) return false;
          const rIsParentStart = r.startTableId === group.parentTableId;
          const dataIsParentStart = data.startTableId === group.parentTableId;

          if (rIsParentStart !== dataIsParentStart) return false;

          if (rIsParentStart) {
            return r.startFieldId === data.startFieldId;
          } else {
            return r.endFieldId === data.endFieldId;
          }
        })
        .sort((a, b) => {
          if (!a || !b) return 0;
          const aSubtypeTableId =
            a.startTableId === group.parentTableId
              ? a.endTableId
              : a.startTableId;
          const bSubtypeTableId =
            b.startTableId === group.parentTableId
              ? b.endTableId
              : b.startTableId;
          const aTable = tables.find((t) => t.id === aSubtypeTableId);
          const bTable = tables.find((t) => t.id === bSubtypeTableId);
          return (aTable?.y ?? 0) - (bTable?.y ?? 0);
        })
        .map((r) => r?.id);

      if (sameFieldRels.length <= 1) return { startYOffset: 0, endYOffset: 0 };

      const index = sameFieldRels.indexOf(data.id);
      if (index === -1) return { startYOffset: 0, endYOffset: 0 };

      const spacing = 100;
      const offset = index * spacing;

      if (data.startTableId === group.parentTableId) {
        return { startYOffset: offset, endYOffset: 0 };
      } else {
        return { startYOffset: 0, endYOffset: offset };
      }
    }

    if (settings.spreadRelations) {
      const isERD = settings.relationshipStyle === "erd";

      const getOffsetForSide = (isStart: boolean) => {
        const tableId = isStart ? data.startTableId : data.endTableId;
        const fieldId = isStart ? data.startFieldId : data.endFieldId;
        const cardinality = data.cardinality;

        // Check if this side has many (crow's foot)
        let hasMany = false;
        if (isERD) {
          if (isStart) {
            hasMany =
              cardinality === Cardinality.MANY_TO_ONE ||
              cardinality === t(Cardinality.MANY_TO_ONE);
          } else {
            hasMany =
              cardinality === Cardinality.ONE_TO_MANY ||
              cardinality === t(Cardinality.ONE_TO_MANY);
          }
        }

        if (hasMany) return 0;

        const sameFieldRels = relationships
          .filter((r) => {
            const rStart = r.startTableId === tableId && r.startFieldId === fieldId;
            const rEnd = r.endTableId === tableId && r.endFieldId === fieldId;
            if (!rStart && !rEnd) return false;

            // Check if OTHER side of r has many
            let rHasManyOnThisSide = false;
            if (isERD) {
              if (rStart) {
                rHasManyOnThisSide =
                  r.cardinality === Cardinality.MANY_TO_ONE ||
                  r.cardinality === t(Cardinality.MANY_TO_ONE);
              } else {
                rHasManyOnThisSide =
                  r.cardinality === Cardinality.ONE_TO_MANY ||
                  r.cardinality === t(Cardinality.ONE_TO_MANY);
              }
            }
            return !rHasManyOnThisSide;
          })
          .sort((a, b) => {
            const aOtherId = a.startTableId === tableId ? a.endTableId : a.startTableId;
            const bOtherId = b.startTableId === tableId ? b.endTableId : b.startTableId;
            const aTable = tables.find((t) => t.id === aOtherId);
            const bTable = tables.find((t) => t.id === bOtherId);
            return (aTable?.y ?? 0) - (bTable?.y ?? 0);
          });

        if (sameFieldRels.length <= 1) return 0;

        const index = sameFieldRels.findIndex((r) => r.id === data.id);
        if (index === -1) return 0;

        const fieldHeight = 36;
        const padding = 4;
        const availableHeight = fieldHeight - 2 * padding;
        const step = availableHeight / (sameFieldRels.length + 1);
        return (index + 1) * step - fieldHeight / 2 + padding;
      };

      return {
        startYOffset: getOffsetForSide(true),
        endYOffset: getOffsetForSide(false),
      };
    }

    return { startYOffset: 0, endYOffset: 0 };
  }, [xorGroups, orGroups, data, relationships, settings.spreadRelations, settings.relationshipStyle, tables, t]);
}
