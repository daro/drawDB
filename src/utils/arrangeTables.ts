import { TABLE_CONFIG } from "@data/constants";

export function arrangeTables(diagram) {
  let maxHeight = -1;
  const gapX = 54;
  const gapY = 40;
  diagram.tables.forEach((table, i) => {
    const currentTableWidth = table.width || 200;
    if (i < diagram.tables.length / 2) {
      table.x = i * currentTableWidth + (i + 1) * gapX;
      table.y = gapY;
      const height = table.height;
      maxHeight = Math.max(height, maxHeight);
    } else {
      const index = diagram.tables.length - i - 1;
      table.x = index * currentTableWidth + (index + 1) * gapX;
      table.y = maxHeight + 2 * gapY;
    }
  });
}
