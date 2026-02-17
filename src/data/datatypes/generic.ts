import { TYPE_COLORS } from "../constants";
import { IDataTypes } from "@types";
import {
  checkInt,
  checkFloat,
  checkString,
  checkTime,
  checkNoValidation,
  binaryRegex,
} from "./helpers";

export const defaultTypesBase: IDataTypes = {
  INT: {
    type: "INT",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    canIncrement: true,
  },
  SMALLINT: {
    type: "SMALLINT",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    canIncrement: true,
  },
  BIGINT: {
    type: "BIGINT",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    isSized: false,
    hasCheck: true,
    hasPrecision: false,
    canIncrement: true,
  },
  DECIMAL: {
    type: "DECIMAL",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
  },
  NUMERIC: {
    type: "NUMERIC",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
  },
  NUMBER: {
    type: "NUMBER",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: (field) => {
      return /^-?\d+(\.\d+)?$/.test(field.default);
    },
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
    canIncrement: false,
  },
  FLOAT: {
    type: "FLOAT",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
  },
  DOUBLE: {
    type: "DOUBLE",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
  },
  REAL: {
    type: "REAL",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
  },
  CHAR: {
    type: "CHAR",
    color: TYPE_COLORS.STRING,
    checkDefault: checkString,
    hasCheck: true,
    isSized: true,
    hasPrecision: false,
    defaultSize: 1,
    hasQuotes: true,
  },
  VARCHAR: {
    type: "VARCHAR",
    color: TYPE_COLORS.STRING,
    checkDefault: checkString,
    hasCheck: true,
    isSized: true,
    hasPrecision: false,
    defaultSize: 255,
    hasQuotes: true,
  },
  VARCHAR2: {
    type: "VARCHAR2",
    color: TYPE_COLORS.STRING,
    checkDefault: checkString,
    hasCheck: true,
    isSized: true,
    hasPrecision: false,
    defaultSize: 225,
    hasQuotes: true,
  },
  TEXT: {
    type: "TEXT",
    color: TYPE_COLORS.STRING,
    checkDefault: checkNoValidation,
    hasCheck: false,
    isSized: true,
    hasPrecision: false,
    defaultSize: 65535,
    hasQuotes: true,
  },
  TIME: {
    type: "TIME",
    color: TYPE_COLORS.DATE,
    checkDefault: checkTime,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  TIMESTAMP: {
    type: "TIMESTAMP",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      if (field.default.toUpperCase() === "CURRENT_TIMESTAMP") {
        return true;
      }
      if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(field.default)) {
        return false;
      }
      const content = field.default.split(" ");
      const date = content[0].split("-");
      return (
        Number.parseInt(date[0]) >= 1970 && Number.parseInt(date[0]) <= 2038
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
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
  BOOLEAN: {
    type: "BOOLEAN",
    color: TYPE_COLORS.BOOLEAN,
    checkDefault: (field) => {
      return (
        field.default.toLowerCase() === "false" ||
        field.default.toLowerCase() === "true" ||
        field.default === "0" ||
        field.default === "1"
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  BINARY: {
    type: "BINARY",
    color: TYPE_COLORS.BINARY,
    checkDefault: (field) => {
      return (
        field.default.length <= (field.size as number) && binaryRegex.test(field.default)
      );
    },
    hasCheck: false,
    isSized: true,
    hasPrecision: false,
    defaultSize: 1,
    hasQuotes: true,
  },
  VARBINARY: {
    type: "VARBINARY",
    color: TYPE_COLORS.BINARY,
    checkDefault: (field) => {
      return (
        field.default.length <= (field.size as number) && binaryRegex.test(field.default)
      );
    },
    hasCheck: false,
    isSized: true,
    hasPrecision: false,
    defaultSize: 255,
    hasQuotes: true,
  },
  JSON: {
    type: "JSON",
    color: TYPE_COLORS.DOCUMENT,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: false,
    hasPrecision: false,
    noDefault: true,
  },
  UUID: {
    type: "UUID",
    color: TYPE_COLORS.NETWORK_ID,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: false,
    hasPrecision: false,
    noDefault: false,
  },
  ENUM: {
    type: "ENUM",
    color: TYPE_COLORS.ENUM_SET,
    checkDefault: (field) => {
      return (field.values || []).includes(field.default);
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  SET: {
    type: "SET",
    color: TYPE_COLORS.ENUM_SET,
    checkDefault: (field) => {
      const defaultValues = field.default.split(",");
      for (let i = 0; i < defaultValues.length; i++) {
        if (!(field.values || []).includes(defaultValues[i].trim())) return false;
      }
      return true;
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    noDefault: true,
  },
};

export const defaultTypes = new Proxy<IDataTypes>(defaultTypesBase, {
  get: (target, prop: string) => (prop in target ? target[prop] : false),
});
