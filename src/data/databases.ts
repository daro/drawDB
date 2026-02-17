import mysqlImage from "../assets/mysql-icon.png";
import postgresImage from "../assets/postgres-icon.png";
import sqliteImage from "../assets/sqlite-icon.png";
import mariadbImage from "../assets/mariadb-icon.png";
import mssqlImage from "../assets/mssql-icon.png";
import oraclesqlImage from "../assets/oraclesql-icon.png";
import i18n from "@i18n/i18n";
import { DB, DBType } from "./constants";

export interface DatabaseInfo {
  name: string;
  label: DBType;
  image: string | null;
  hasTypes: boolean;
  hasUnsignedTypes?: boolean;
  hasEnums?: boolean;
  hasArrays?: boolean;
  beta?: boolean;
  description?: string;
}

const databaseConfig: Record<DBType, DatabaseInfo> = {
  [DB.MYSQL]: {
    name: "MySQL",
    label: DB.MYSQL,
    image: mysqlImage,
    hasTypes: false,
    hasUnsignedTypes: true,
  },
  [DB.POSTGRES]: {
    name: "PostgreSQL",
    label: DB.POSTGRES,
    image: postgresImage,
    hasTypes: true,
    hasEnums: true,
    hasArrays: true,
  },
  [DB.SQLITE]: {
    name: "SQLite",
    label: DB.SQLITE,
    image: sqliteImage,
    hasTypes: false,
  },
  [DB.MARIADB]: {
    name: "MariaDB",
    label: DB.MARIADB,
    image: mariadbImage,
    hasTypes: false,
    hasUnsignedTypes: true,
  },
  [DB.MSSQL]: {
    name: "MSSQL",
    label: DB.MSSQL,
    image: mssqlImage,
    hasTypes: false,
  },
  [DB.ORACLESQL]: {
    name: "Oracle SQL",
    label: DB.ORACLESQL,
    image: oraclesqlImage,
    hasTypes: false,
    hasEnums: false,
    hasArrays: false,
    beta: true,
  },
  [DB.GENERIC]: {
    name: i18n.t("generic"),
    label: DB.GENERIC,
    image: null,
    description: i18n.t("generic_description"),
    hasTypes: true,
  },
};

export const databases = new Proxy<Record<string, DatabaseInfo>>(
  databaseConfig as unknown as Record<string, DatabaseInfo>,
  {
    get: (target, prop: string) => (prop in target ? target[prop] : ({} as DatabaseInfo)),
  },
);
