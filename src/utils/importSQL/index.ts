import { DB, TABLE_CONFIG } from "../../data/constants";
import { arrangeTables } from "../arrangeTables";
import { fromMariaDB } from "./mariadb";
import { fromMSSQL } from "./mssql";
import { fromMySQL } from "./mysql";
import { fromOracleSQL } from "./oraclesql";
import { fromPostgres } from "./postgres";
import { fromSQLite } from "./sqlite";
import { getTableHeight } from "../utils";

export function importSQL(ast, toDb = DB.MYSQL, diagramDb = DB.GENERIC) {
  let diagram;
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
      diagram = { tables: [], relationships: [], xorGroups: [], orGroups: [] };
      break;
  }

  diagram.xorGroups = diagram.xorGroups ?? [];
  diagram.orGroups = diagram.orGroups ?? [];

  diagram.tables.forEach((table) => {
    table.width = table.width ?? TABLE_CONFIG.WIDTH;
    table.height = table.height ?? getTableHeight(table);
    table.x = table.x ?? 0;
    table.y = table.y ?? 0;
  });

  arrangeTables(diagram);

  return diagram;
}
