import { DB } from "./constants";
import { IDataTypes } from "../types";
import { defaultTypes } from "./datatypes/generic";
import { mysqlTypes } from "./datatypes/mysql";
import { postgresTypes } from "./datatypes/postgres";
import { sqliteTypes } from "./datatypes/sqlite";
import { mssqlTypes } from "./datatypes/mssql";
import { oraclesqlTypes } from "./datatypes/oracle";
import { mariadbTypes } from "./datatypes/mariadb";

export { defaultTypes } from "./datatypes/generic";
export { mysqlTypes } from "./datatypes/mysql";
export { postgresTypes } from "./datatypes/postgres";
export { sqliteTypes } from "./datatypes/sqlite";
export { mssqlTypes } from "./datatypes/mssql";
export { oraclesqlTypes } from "./datatypes/oracle";
export { mariadbTypes } from "./datatypes/mariadb";

const dbToTypesBase: Record<string, IDataTypes> = {
  [DB.GENERIC]: defaultTypes,
  [DB.MYSQL]: mysqlTypes,
  [DB.POSTGRES]: postgresTypes,
  [DB.SQLITE]: sqliteTypes,
  [DB.MSSQL]: mssqlTypes,
  [DB.MARIADB]: mariadbTypes,
  [DB.ORACLESQL]: oraclesqlTypes,
};

export const dbToTypes = new Proxy<Record<string, IDataTypes>>(dbToTypesBase, {
  get: (target, prop: string) => (prop in target ? target[prop] : false),
});
