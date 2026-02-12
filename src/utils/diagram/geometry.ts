import { TABLE_CONFIG } from "../../data/constants";
import { ITable, IRelationship, IGroup } from "../../types";

export const getGroupPoints = (data: IGroup, tables: ITable[], relationships: IRelationship[]) => {
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
        TABLE_CONFIG.HEADER.HEIGHT +
        TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT +
        fieldIndex * TABLE_CONFIG.FIELD_HEIGHT +
        TABLE_CONFIG.FIELD_HEIGHT / 2;

      return { x, y, id: rel.id };
    });

  const spacing = 100;
  const result: Record<string | number, { x: number; y: number }> = {};

  const fieldMap: Record<string, Array<{ x: number; y: number; id: string | number | undefined }>> = {};
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
        if (rel.id !== undefined) {
          result[rel.id] = { x: rel.x, y: rel.y + index * spacing };
        }
      });
  });

  return data.childRelationshipIds.map((rid) => result[rid]);
};
