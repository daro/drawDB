import { TYPE_COLORS } from "../constants";
import { IDataTypes } from "../../types";
import {
  checkInt,
  checkString,
  checkNoValidation,
  checkBoolean,
  checkRaw,
} from "./helpers";

export const oraclesqlTypesBase: IDataTypes = {
  INTEGER: {
    type: "INTEGER",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    canIncrement: true,
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
    checkDefault: (field) => {
      return /^-?\d+(\.\d+)?$/.test(field.default);
    },
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
  },
  LONG: {
    type: "LONG",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    canIncrement: true,
  },
  VARCHAR2: {
    type: "VARCHAR2",
    color: TYPE_COLORS.STRING,
    checkDefault: checkString,
    hasCheck: true,
    isSized: true,
    hasPrecision: false,
    defaultSize: 255,
    hasQuotes: true,
  },
  NVARCHAR2: {
    type: "NVARCHAR2",
    color: TYPE_COLORS.STRING,
    checkDefault: checkString,
    hasCheck: true,
    isSized: true,
    hasPrecision: false,
    defaultSize: 255,
    hasQuotes: true,
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
  NCHAR: {
    type: "NCHAR",
    color: TYPE_COLORS.STRING,
    checkDefault: checkString,
    hasCheck: true,
    isSized: true,
    hasPrecision: false,
    defaultSize: 1,
    hasQuotes: true,
  },
  CLOB: {
    type: "CLOB",
    color: TYPE_COLORS.STRING,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: false,
    hasPrecision: false,
    noDefault: true,
  },
  NCLOB: {
    type: "NCLOB",
    color: TYPE_COLORS.STRING,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: false,
    hasPrecision: false,
    noDefault: true,
  },
  BLOB: {
    type: "BLOB",
    color: TYPE_COLORS.BINARY,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: false,
    hasPrecision: false,
    noDefault: true,
  },
  BFILE: {
    type: "BFILE",
    color: TYPE_COLORS.BINARY,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: false,
    hasPrecision: false,
    noDefault: true,
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
  VECTOR: {
    type: "VECTOR",
    color: TYPE_COLORS.VECTOR,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: false,
    hasPrecision: false,
    noDefault: true,
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
  TIMESTAMP: {
    type: "TIMESTAMP",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      if (field.default.toUpperCase() === "CURRENT_TIMESTAMP") {
        return true;
      }
      return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(
        field.default,
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: true,
    hasQuotes: true,
  },
  INTERVAL: {
    type: "INTERVAL",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      return /^INTERVAL\s'\d+'(\s+DAY|HOUR|MINUTE|SECOND)?$/.test(
        field.default,
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  BOOLEAN: {
    type: "BOOLEAN",
    color: TYPE_COLORS.BOOLEAN,
    checkDefault: checkBoolean,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  RAW: {
    type: "RAW",
    color: TYPE_COLORS.BINARY,
    checkDefault: checkRaw,
    hasCheck: false,
    isSized: true,
    hasPrecision: false,
    defaultSize: 255,
    hasQuotes: false,
  },
};

export const oraclesqlTypes = new Proxy<IDataTypes>(oraclesqlTypesBase, {
  get: (target, prop: string) => (prop in target ? target[prop] : false),
});
