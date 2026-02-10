import { dbToTypes } from "../data/datatypes";

import { TABLE_CONFIG } from "../data/constants";

export function dataURItoBlob(dataUrl) {
  const byteString = atob(dataUrl.split(",")[1]);
  const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([intArray], { type: mimeString });
}

export function arrayIsEqual(arr1, arr2) {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

export function strHasQuotes(str) {
  if (str.length < 2) return false;

  return (
    (str[0] === str[str.length - 1] && str[0] === "'") ||
    (str[0] === str[str.length - 1] && str[0] === '"') ||
    (str[0] === str[str.length - 1] && str[0] === "`")
  );
}

const keywords = [
  "NULL",
  "TRUE",
  "FALSE",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "LOCALTIME",
  "LOCALTIMESTAMP",
];

export function isKeyword(str) {
  if (typeof str !== "string") return false;

  return keywords.includes(str.toUpperCase());
}

export function isFunction(str) {
  return /\w+\([^)]*\)$/.test(str);
}

export function areFieldsCompatible(db, field1Type, field2Type) {
  const same = field1Type === field2Type;
  const isCompatible =
    dbToTypes[db][field1Type].compatibleWith &&
    dbToTypes[db][field1Type].compatibleWith.includes(field2Type);
  return same || isCompatible;
}

export function getTableHeight(table, subtypes = []) {
  if (!table) return 0;
  const baseHeight =
    (table.fields?.length || 0) * TABLE_CONFIG.FIELD_HEIGHT +
    TABLE_CONFIG.HEADER.HEIGHT +
    TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT;

  if (subtypes.length === 0) {
    return Math.max(table.height || 0, baseHeight);
  }

  const maxSubtypeY = Math.max(
    0,
    ...subtypes.map((s) => s.y - table.y + (s.height || 0)),
  );

  return Math.max(table.height || 0, baseHeight, maxSubtypeY + 10);
}

export function getTableWidth(table, subtypes = []) {
  if (!table) return 0;

  if (subtypes.length === 0) {
    return table.width;
  }

  const maxSubtypeX = Math.max(
    0,
    ...subtypes.map((s) => (s.x - table.x) + (s.width || 0)),
  );

  return Math.max(table.width, maxSubtypeX + 10);
}

export const toSnakeCase = (str: string) =>
  str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toLowerCase();
