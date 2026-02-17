import { TYPE_COLORS } from "../constants";
import { IDataTypes } from "@types";
import {
  checkInt,
  checkFloat,
  checkString,
} from "./helpers";

export const sqliteTypesBase: IDataTypes = {
  INTEGER: {
    type: "INTEGER",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    canIncrement: true,
  },
  REAL: {
    type: "REAL",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
  },
  TEXT: {
    type: "TEXT",
    color: TYPE_COLORS.STRING,
    checkDefault: checkString,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  BLOB: {
    type: "BLOB",
    color: TYPE_COLORS.BINARY,
    checkDefault: (field) => {
      return /^[0-9a-fA-F]*$/.test(field.default);
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  NUMERIC: {
    type: "NUMERIC",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
  },
  BOOLEAN: {
    type: "BOOLEAN",
    color: TYPE_COLORS.BOOLEAN,
    checkDefault: (field) => {
      return (
        field.default === "0" ||
        field.default === "1" ||
        field.default.toUpperCase() === "TRUE" ||
        field.default.toUpperCase() === "FALSE"
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  DATE: {
    type: "DATE",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      return /^\d{4}-\d{2}-\d{2}$/.test(field.default);
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  DATETIME: {
    type: "DATETIME",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      if (field.default.toUpperCase() === "CURRENT_TIMESTAMP") {
        return true;
      }
      if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(field.default)) {
        return false;
      }
      const c = field.default.split(" ");
      const d = c[0].split("-");
      return Number.parseInt(d[0]) >= 1000 && Number.parseInt(d[0]) <= 9999;
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
};

export const sqliteTypes = new Proxy<IDataTypes>(sqliteTypesBase, {
  get: (target, prop: string) => (prop in target ? target[prop] : false),
});
