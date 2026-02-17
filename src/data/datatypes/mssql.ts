import { TYPE_COLORS } from "../constants";
import { IDataTypes } from "@types";
import {
  checkInt,
  checkFloat,
  checkString,
  checkTime,
  checkNoValidation,
  checkBit,
} from "./helpers";

export const mssqlTypesBase: IDataTypes = {
  TINYINT: {
    type: "TINYINT",
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
  INTEGER: {
    type: "INTEGER",
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
    hasCheck: true,
    isSized: false,
    hasPrecision: false,
    canIncrement: true,
  },
  BIT: {
    type: "BIT",
    color: TYPE_COLORS.BINARY,
    checkDefault: checkBit,
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
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
  MONEY: {
    type: "MONEY",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
  },
  SMALLMONEY: {
    type: "MONEY",
    color: TYPE_COLORS.DECIMAL,
    checkDefault: checkFloat,
    hasCheck: true,
    isSized: false,
    hasPrecision: true,
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
  DATETIME2: {
    type: "DATETIME2",
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
    hasPrecision: true,
    hasQuotes: true,
  },
  DATETIMEOFFSET: {
    type: "DATETIMEOFFSET",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      if (field.default.toUpperCase() === "CURRENT_TIMESTAMP") {
        return true;
      }
      if (
        !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,7})?([+-]\d{2}:\d{2})?$/.test(
          field.default,
        )
      ) {
        return false;
      }
      const c = field.default.split(" ");
      const d = c[0].split("-");
      return Number.parseInt(d[0]) >= 1000 && Number.parseInt(d[0]) <= 9999;
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: true,
    hasQuotes: true,
  },
  SMALLDATETIME: {
    type: "SMALLDATETIME",
    color: TYPE_COLORS.DATE,
    checkDefault: (field) => {
      if (field.default.toUpperCase() === "CURRENT_TIMESTAMP") {
        return true;
      }
      if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(field.default)) {
        return false;
      }
      const c = field.default.split(" ");
      const d = c[0].split("-");
      return Number.parseInt(d[0]) >= 1900 && Number.parseInt(d[0]) <= 2079;
    },
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
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
    checkDefault: checkNoValidation,
    hasCheck: false,
    isSized: true,
    hasPrecision: false,
    defaultSize: 65535,
    hasQuotes: true,
  },
  NCHAR: {
    type: "CHAR",
    color: TYPE_COLORS.STRING,
    checkDefault: checkString,
    hasCheck: true,
    isSized: true,
    hasPrecision: false,
    defaultSize: 1,
    hasQuotes: true,
  },
  NVARCHAR: {
    type: "VARCHAR",
    color: TYPE_COLORS.STRING,
    checkDefault: checkString,
    hasCheck: true,
    isSized: true,
    hasPrecision: false,
    defaultSize: 255,
    hasQuotes: true,
  },
  NTEXT: {
    type: "TEXT",
    color: TYPE_COLORS.STRING,
    checkDefault: checkNoValidation,
    hasCheck: false,
    isSized: true,
    hasPrecision: false,
    defaultSize: 65535,
    hasQuotes: true,
  },
  BINARY: {
    type: "BINARY",
    color: TYPE_COLORS.BINARY,
    checkDefault: (field) => {
      const binaryRegex = /^[01]+$/;
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
      const binaryRegex = /^[01]+$/;
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
  IMAGE: {
    type: "IMAGE",
    color: TYPE_COLORS.BINARY,
    checkDefault: checkNoValidation,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
    noDefault: true,
  },
  UNIQUEIDENTIFIER: {
    type: "UNIQUEIDENTIFIER",
    color: TYPE_COLORS.NETWORK_ID,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: false,
    hasPrecision: false,
    noDefault: true,
  },
  XML: {
    type: "XML",
    color: TYPE_COLORS.DOCUMENT,
    checkDefault: checkNoValidation,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: true,
    noDefault: true,
  },
  CURSOR: {
    type: "CURSOR",
    color: TYPE_COLORS.OTHER,
    checkDefault: checkNoValidation,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: false,
    noDefault: true,
  },
  SQL_VARIANT: {
    type: "SQL_VARIANT",
    color: TYPE_COLORS.OTHER,
    checkDefault: checkNoValidation,
    hasCheck: false,
    isSized: false,
    hasPrecision: false,
    hasQuotes: false,
    noDefault: true,
  },
  JSON: {
    type: "JSON",
    color: TYPE_COLORS.DOCUMENT,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: false,
    hasPrecision: false,
    hasQuotes: true,
    noDefault: true,
  },
};

export const mssqlTypes = new Proxy<IDataTypes>(mssqlTypesBase, {
  get: (target, prop: string) => (prop in target ? target[prop] : false),
});
