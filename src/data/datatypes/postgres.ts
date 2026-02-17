import { TYPE_COLORS } from "../constants";
import { IDataTypes } from "@types";
import {
  checkInt,
  checkFloat,
  checkString,
  checkTime,
  checkDate,
} from "./helpers";

export const postgresTypesBase: IDataTypes = {
  SMALLINT: {
    type: "SMALLINT",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    canIncrement: true,
    compatibleWith: ["SMALLSERIAL", "SERIAL", "BIGSERIAL", "INTEGER", "BIGINT"],
  },
  INTEGER: {
    type: "INTEGER",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    canIncrement: true,
    compatibleWith: [
      "SMALLSERIAL",
      "SERIAL",
      "BIGSERIAL",
      "SMALLINT",
      "BIGINT",
    ],
  },
  BIGINT: {
    type: "BIGINT",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    canIncrement: true,
    compatibleWith: [
      "SMALLSERIAL",
      "SERIAL",
      "BIGSERIAL",
      "INTEGER",
      "SMALLINT",
    ],
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
  REAL: {
    type: "REAL",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
  },
  "DOUBLE PRECISION": {
    type: "DOUBLE PRECISION",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
  },
  SMALLSERIAL: {
    type: "SMALLSERIAL",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    compatibleWith: ["INTEGER", "SERIAL", "BIGSERIAL", "SMALLINT", "BIGINT"],
  },
  SERIAL: {
    type: "SERIAL",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    compatibleWith: [
      "INTEGER",
      "SMALLSERIAL",
      "BIGSERIAL",
      "SMALLINT",
      "BIGINT",
    ],
  },
  BIGSERIAL: {
    type: "BIGSERIAL",
    color: TYPE_COLORS.INT,
    checkDefault: checkInt,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    compatibleWith: ["INTEGER", "SERIAL", "SMALLSERIAL", "SMALLINT", "BIGINT"],
  },
  MONEY: {
    type: "MONEY",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
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
  TEXT: {
    type: "TEXT",
    color: TYPE_COLORS.STRING,
    checkDefault: checkString,
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  BYTEA: {
    type: "BYTEA",
    color: TYPE_COLORS.BINARY,
    checkDefault: (field) => {
      return /^[0-9a-fA-F]*$/.test(field.default);
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    defaultSize: null,
    hasQuotes: true,
  },
  DATE: {
    type: "DATE",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      const specialValues = [
        "epoch",
        "infinity",
        "-infinity",
        "now",
        "today",
        "tomorrow",
        "yesterday",
      ];
      return (
        /^\d{4}-\d{2}-\d{2}$/.test(field.default) ||
        specialValues.includes(field.default.toLowerCase())
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  TIME: {
    type: "TIME",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      const specialValues = ["now", "allballs"];
      return (
        /^(?:[01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d$/.test(field.default) ||
        specialValues.includes(field.default.toLowerCase())
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  TIMETZ: {
    type: "TIMETZ",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      const specialValues = ["now", "allballs"];
      return (
        /^(?:[01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d([+-]\d{2}:\d{2})?$/.test(
          field.default,
        ) || specialValues.includes(field.default.toLowerCase())
      );
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
      const content = field.default.split(" ");
      const date = content[0].split("-");
      const specialValues = [
        "epoch",
        "infinity",
        "-infinity",
        "now",
        "today",
        "tomorrow",
        "yesterday",
        "current_timestamp",
      ];
      return (
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(field.default) ||
        (Number.parseInt(date[0]) >= 1970 &&
          Number.parseInt(date[0]) <= 2038) ||
        specialValues.includes(field.default.toLowerCase())
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  TIMESTAMPTZ: {
    type: "TIMESTAMPTZ",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      const specialValues = [
        "epoch",
        "infinity",
        "-infinity",
        "now",
        "today",
        "tomorrow",
        "yesterday",
        "current_timestamp",
      ];
      return (
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2})?$/.test(
          field.default,
        ) || specialValues.includes(field.default.toLowerCase())
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  INTERVAL: {
    type: "INTERVAL",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      return (
        /^(-?\d+\s(year|month|day|hour|minute|second)s?\s?)+$/.test(
          field.default,
        ) ||
        /^(?:[01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d$/.test(field.default) ||
        /^P(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/.test(field.default)
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
    checkDefault: (field) => {
      const specialValues = ["true", "false", "yes", "no", "on", "off", "1", "0"];
      return specialValues.includes(field.default.toLowerCase());
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
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
  POINT: {
    type: "POINT",
    color: TYPE_COLORS.GEOMETRIC,
    checkDefault: (field) => {
      return /^\(\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\)$/.test(field.default);
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  LINE: {
    type: "LINE",
    color: TYPE_COLORS.GEOMETRIC,
    checkDefault: (field) => {
      return /^\{\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\}$/.test(
        field.default,
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  LSEG: {
    type: "LSEG",
    color: TYPE_COLORS.GEOMETRIC,
    checkDefault: (field) => {
      return /^\[\s*\(\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\)\s*,\s*\(\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\)\s*\]$/.test(
        field.default,
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  BOX: {
    type: "BOX",
    color: TYPE_COLORS.GEOMETRIC,
    checkDefault: (field) => {
      return /^\(\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\)\s*,\s*\(\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\)$/.test(
        field.default,
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  PATH: {
    type: "PATH",
    color: TYPE_COLORS.GEOMETRIC,
    checkDefault: (field) => {
      return /^[\(\[]\s*\(\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\)\s*(,\s*\(\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\)\s*)*[\)\]]$/.test(
        field.default,
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  POLYGON: {
    type: "POLYGON",
    color: TYPE_COLORS.GEOMETRIC,
    checkDefault: (field) => {
      return /^\(\s*\(\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\)\s*(,\s*\(\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\)\s*)*\)$/.test(
        field.default,
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  CIRCLE: {
    type: "CIRCLE",
    color: TYPE_COLORS.GEOMETRIC,
    checkDefault: (field) => {
      return /^<\s*\(\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\)\s*,\s*\d+\.?\d*\s*>$/.test(
        field.default,
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  CIDR: {
    type: "CIDR",
    color: TYPE_COLORS.NETWORK_ID,
    checkDefault: (field) => {
      return /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(field.default);
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  INET: {
    type: "INET",
    color: TYPE_COLORS.NETWORK_ID,
    checkDefault: (field) => {
      return /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(field.default);
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  MACADDR: {
    type: "MACADDR",
    color: TYPE_COLORS.NETWORK_ID,
    checkDefault: (field) => {
      return /^([0-9a-fA-F]{2}[:\-]){5}[0-9a-fA-F]{2}$/.test(field.default);
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  MACADDR8: {
    type: "MACADDR8",
    color: TYPE_COLORS.NETWORK_ID,
    checkDefault: (field) => {
      return /^([0-9a-fA-F]{2}[:\-]){7}[0-9a-fA-F]{2}$/.test(field.default);
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  BIT: {
    type: "BIT",
    color: TYPE_COLORS.BINARY,
    checkDefault: (field) => {
      return /^[01]*$/.test(field.default);
    },
    hasCheck: false,
    isSized: true,
    hasPrecision: false,
  },
  "BIT VARYING": {
    type: "BIT VARYING",
    color: TYPE_COLORS.BINARY,
    checkDefault: (field) => {
      return /^[01]*$/.test(field.default);
    },
    hasCheck: false,
    isSized: true,
    hasPrecision: false,
  },
  TSQUERY: {
    type: "TSQUERY",
    color: TYPE_COLORS.TEXT_SEARCH,
    checkDefault: (field) => true,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  TSVECTOR: {
    type: "TSVECTOR",
    color: TYPE_COLORS.TEXT_SEARCH,
    checkDefault: (field) => true,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  UUID: {
    type: "UUID",
    color: TYPE_COLORS.NETWORK_ID,
    checkDefault: (field) => {
      return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        field.default,
      );
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  XML: {
    type: "XML",
    color: TYPE_COLORS.DOCUMENT,
    checkDefault: (field) => true,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  JSON: {
    type: "JSON",
    color: TYPE_COLORS.DOCUMENT,
    checkDefault: (field) => true,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  JSONB: {
    type: "JSONB",
    color: TYPE_COLORS.DOCUMENT,
    checkDefault: (field) => true,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
  },
  INT4RANGE: {
    type: "INT4RANGE",
    color: TYPE_COLORS.RANGE,
    checkDefault: (field) => true,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  INT8RANGE: {
    type: "INT8RANGE",
    color: TYPE_COLORS.RANGE,
    checkDefault: (field) => true,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  NUMRANGE: {
    type: "NUMRANGE",
    color: TYPE_COLORS.RANGE,
    checkDefault: (field) => true,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  TSRANGE: {
    type: "TSRANGE",
    color: TYPE_COLORS.RANGE,
    checkDefault: (field) => true,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  TSTZRANGE: {
    type: "TSTZRANGE",
    color: TYPE_COLORS.RANGE,
    checkDefault: (field) => true,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
  DATERANGE: {
    type: "DATERANGE",
    color: TYPE_COLORS.RANGE,
    checkDefault: (field) => true,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
  },
};

export const postgresTypes = new Proxy<IDataTypes>(postgresTypesBase, {
  get: (target, prop: string) => (prop in target ? target[prop] : false),
});
