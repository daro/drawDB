import { TYPE_COLORS } from "../constants";
import { IDataTypes } from "@types";
import { checkNoValidation } from "./helpers";
import { mysqlTypes } from "./mysql";

export const mariadbTypesBase: IDataTypes = {
  UUID: {
    type: "UUID",
    color: TYPE_COLORS.NETWORK_ID,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: true,
    hasPrecision: false,
    noDefault: false,
  },
  INET4: {
    type: "INET4",
    color: TYPE_COLORS.NETWORK_ID,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: true,
    hasPrecision: false,
    noDefault: false,
  },
  INET6: {
    type: "INET6",
    color: TYPE_COLORS.NETWORK_ID,
    checkDefault: checkNoValidation,
    isSized: false,
    hasCheck: true,
    hasPrecision: false,
    noDefault: false,
  },
};

export const mariadbTypes = new Proxy<IDataTypes>(
  { ...mysqlTypes, ...mariadbTypesBase } as IDataTypes,
  {
    get: (target, prop: string) => (prop in target ? target[prop] : false),
  },
);
