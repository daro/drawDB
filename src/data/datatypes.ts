import { DB } from "./constants";
import { IDataTypes } from "@types";
import { defaultTypes } from "@data/datatypes/generic";
import { mysqlTypes } from "@data/datatypes/mysql";
import { postgresTypes } from "@data/datatypes/postgres";
import { sqliteTypes } from "@data/datatypes/sqlite";
import { mssqlTypes } from "@data/datatypes/mssql";
import { oraclesqlTypes } from "@data/datatypes/oracle";
import { mariadbTypes } from "@data/datatypes/mariadb";

export { defaultTypes } from "@data/datatypes/generic";
export { mysqlTypes } from "@data/datatypes/mysql";
export { postgresTypes } from "@data/datatypes/postgres";
export { sqliteTypes } from "@data/datatypes/sqlite";
export { mssqlTypes } from "@data/datatypes/mssql";
export { oraclesqlTypes } from "@data/datatypes/oracle";
export { mariadbTypes } from "@data/datatypes/mariadb";

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
