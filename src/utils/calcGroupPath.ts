// @ts-nocheck
import { tableFieldHeight, tableHeaderHeight, tableColorStripHeight } from "../data/constants";

export function calcGroupPoints(data, tables, relationships) {
  const parentTable = tables.find((t) => t.id === data.parentTableId);
  if (!parentTable) return null;

  const groupRelationships = relationships.filter((rel) =>
    data.childRelationshipIds.includes(rel.id),
  );
  if (groupRelationships.length === 0) return null;

  const raw = groupRelationships
    .map((rel) => {
      const touchesAsStart = rel.startTableId === data.parentTableId;
      const touchesAsEnd = rel.endTableId === data.parentTableId;
      if (!touchesAsStart && !touchesAsEnd) return null;

      const isStart = touchesAsStart;
      const fieldId = isStart ? rel.startFieldId : rel.endFieldId;

      let fieldIndex = parentTable.fields.findIndex((f) => f.id === fieldId);
      if (fieldIndex < 0) fieldIndex = 0;

      const x = isStart ? parentTable.x : parentTable.x + parentTable.width;
      const y =
        parentTable.y +
        tableHeaderHeight +
        tableColorStripHeight +
        fieldIndex * tableFieldHeight +
        tableFieldHeight / 2;

      return { x, y, isStart, id: rel.id };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (Math.abs(a.y - b.y) > 0.01) return a.y - b.y;
      
      const aRel = relationships.find((r) => r.id === a.id);
      const bRel = relationships.find((r) => r.id === b.id);
      const aSubtypeTableId =
        aRel.startTableId === data.parentTableId
          ? aRel.endTableId
          : aRel.startTableId;
      const bSubtypeTableId =
        bRel.startTableId === data.parentTableId
          ? bRel.endTableId
          : bRel.startTableId;
      const aTable = tables.find((t) => t.id === aSubtypeTableId);
      const bTable = tables.find((t) => t.id === bSubtypeTableId);
      return (aTable?.y ?? 0) - (bTable?.y ?? 0);
    });

  if (raw.length < 2) return null;

  // --- VIRTUAL ANCHORS: if points overlap, spread them vertically ---
  const spacing = 100;
  const fieldMap = {};
  raw.forEach((p) => {
    const key = `${p.x}_${p.y}`;
    if (!fieldMap[key]) fieldMap[key] = [];
    fieldMap[key].push(p);
  });

  const adjusted = [];
  Object.values(fieldMap).forEach((rels) => {
    // rels are already sorted by subtype Y within each field due to the previous sort
    rels.forEach((p, index) => {
      adjusted.push({
        ...p,
        y: p.y + index * spacing
      });
    });
  });

  return adjusted.sort((a, b) => a.y - b.y);
}

/**
 * Generuje ścieżkę SVG dla łuku/klamry grupy.
 * 
 * @param {boolean} isRight - false dla lewej strony, true dla prawej
 * @param {number} x - Współrzędna X krawędzi tabeli
 * @param {number} width - Szerokość klamry (długość ramion)
 * @param {number} height - Całkowita wysokość klamry
 * @param {number} radius - Promień zaokrąglenia (0 = prostokąt)
 * @param {number} offset - Odstęp od krawędzi tabeli
 * @returns {string} Atrybut "d" dla elementu <path>
 */
export function calcGroupPath(isRight, x, width, height, radius = 0, offset = 0) {
  const direction = isRight ? 1 : -1;
  const startX = x + offset * direction;
  const targetX = startX + width * direction;
  
  if (radius <= 0) {
    return `M ${startX} 0 L ${targetX} 0 L ${targetX} ${height} L ${startX} ${height}`;
  }

  const r = Math.min(radius, Math.abs(width), height / 2);
  const sweepOuter = isRight ? 1 : 0;
  
  return [
    `M ${startX} 0`,
    `L ${targetX - r * direction} 0`,
    `A ${r} ${r} 0 0 ${sweepOuter} ${targetX} ${r}`,
    `L ${targetX} ${height - r}`,
    `A ${r} ${r} 0 0 ${sweepOuter} ${targetX - r * direction} ${height}`,
    `L ${startX} ${height}`
  ].join(" ");
}
