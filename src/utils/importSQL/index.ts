import { DB, TABLE_CONFIG, DBType } from "@data/constants";
import { arrangeTables } from "../arrangeTables";
import { fromMariaDB } from "./mariadb";
import { fromMSSQL } from "./mssql";
import { fromMySQL } from "./mysql";
import { fromOracleSQL } from "./oraclesql";
import { fromPostgres } from "./postgres";
import { fromSQLite } from "./sqlite";
import { getTableHeight } from "../utils";
import { IImportData } from "@types";

export function importSQL(
  ast: any,
  toDb: DBType = DB.MYSQL,
  diagramDb: DBType = DB.GENERIC,
): IImportData {
  let diagram: IImportData;
  switch (toDb) {
    case DB.SQLITE:
      diagram = fromSQLite(ast, diagramDb);
      break;
    case DB.MYSQL:
      diagram = fromMySQL(ast, diagramDb);
      break;
    case DB.POSTGRES:
      diagram = fromPostgres(ast, diagramDb);
      break;
    case DB.MARIADB:
      diagram = fromMariaDB(ast, diagramDb);
      break;
    case DB.MSSQL:
      diagram = fromMSSQL(ast, diagramDb);
      break;
    case DB.ORACLESQL:
      diagram = fromOracleSQL(ast, diagramDb);
      break;
    default:
      diagram = {
        tables: [],
        relationships: [],
        xorGroups: [],
        orGroups: [],
        enums: [],
        types: [],
      };
      break;
  }

  diagram.tables = diagram.tables ?? [];
  diagram.relationships = diagram.relationships ?? [];
  diagram.xorGroups = diagram.xorGroups ?? [];
  diagram.orGroups = diagram.orGroups ?? [];
  diagram.enums = diagram.enums ?? [];
  diagram.types = diagram.types ?? [];

  diagram.tables.forEach((table) => {
    table.width = table.width ?? TABLE_CONFIG.WIDTH;
    table.height = table.height ?? getTableHeight(table);
    table.x = table.x ?? 0;
    table.y = table.y ?? 0;
  });

  arrangeTables(diagram as any);

  return diagram;
}
