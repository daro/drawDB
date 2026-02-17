import { nanoid } from "nanoid";
import { Cardinality, DB, DBType } from "@data/constants";
import { dbToTypes } from "@data/datatypes";
import { buildSQLFromAST } from "./shared";
import { IImportData, ITable, IRelationship, IField } from "@types";

const affinity: Record<string, Record<string, string>> = {
  [DB.SQLITE]: new Proxy(
    {
      INT: "INTEGER",
      TINYINT: "INTEGER",
      SMALLINT: "INTEGER",
      MEDIUMINT: "INTEGER",
      BIGINT: "INTEGER",
      "UNSIGNED BIG INT": "INTEGER",
      INT2: "INTEGER",
      INT8: "INTEGER",
      CHARACTER: "TEXT",
      NCHARACTER: "TEXT",
      NVARCHAR: "VARCHAR",
      DOUBLE: "REAL",
      FLOAT: "REAL",
    },
    { get: (target, prop: string) => (prop in target ? target[prop] : "BLOB") },
  ),
  [DB.GENERIC]: new Proxy(
    {
      INTEGER: "INT",
      TINYINT: "SMALLINT",
      MEDIUMINT: "INTEGER",
      INT2: "INTEGER",
      INT8: "INTEGER",
      CHARACTER: "TEXT",
      NCHARACTER: "TEXT",
      NVARCHAR: "VARCHAR",
    },
    { get: (target, prop: string) => (prop in target ? target[prop] : "BLOB") },
  ),
};

export function fromSQLite(ast: any, diagramDb: DBType = DB.GENERIC): IImportData {
  const tables: ITable[] = [];
  const relationships: IRelationship[] = [];

  const addRelationshipFromReferenceDef = (
    startTable: ITable,
    startFieldName: string,
    referenceDefinition: any,
  ) => {
    const endTableName = referenceDefinition.table[0].table;
    const endFieldName = referenceDefinition.definition[0].column;

    const endTable = tables.find((t) => t.name === endTableName);
    if (!endTable) return;

    const endField = endTable.fields.find((f) => f.name === endFieldName);
    if (!endField) return;

    const startField = startTable.fields.find((f) => f.name === startFieldName);
    if (!startField) return;

    let updateConstraint = "No action";
    let deleteConstraint = "No action";
    referenceDefinition.on_action.forEach((c: any) => {
      if (c.type === "on update") {
        updateConstraint = c.value.value;
        updateConstraint =
          updateConstraint[0].toUpperCase() + updateConstraint.substring(1);
      } else if (c.type === "on delete") {
        deleteConstraint = c.value.value;
        deleteConstraint =
          deleteConstraint[0].toUpperCase() + deleteConstraint.substring(1);
      }
    });

    const relationship: IRelationship = {
      id: nanoid(),
      name: "fk_" + startTable.name + "_" + startFieldName + "_" + endTableName,
      startTableId: startTable.id,
      endTableId: endTable.id,
      endFieldId: endField.id,
      startFieldId: startField.id,
      updateConstraint,
      deleteConstraint,
      cardinality: startField.unique ? Cardinality.ONE_TO_ONE : Cardinality.MANY_TO_ONE,
    };

    relationships.push(relationship);
  };

  const parseSingleStatement = (e: any) => {
    if (e.type === "create") {
      if (e.keyword === "table") {
        const table: ITable = {
          id: nanoid(),
          name: e.table[0].table,
          comment: "",
          color: "#175e7a",
          fields: [],
          indices: [],
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          locked: false,
        };
        e.create_definitions.forEach((d: any) => {
          if (d.resource === "column") {
            const field: IField = {
              id: nanoid(),
              name: d.column.column,
              type: "",
              default: "",
              check: "",
              primary: false,
              unique: false,
              notNull: false,
              increment: false,
              comment: "",
            };

            let type = d.definition.dataType;
            if (!dbToTypes[diagramDb][type]) {
              type = affinity[diagramDb][type];
            }
            field.type = type;

            if (d.definition.expr && d.definition.expr.type === "expr_list") {
              field.values = d.definition.expr.value.map((v: any) => v.value);
            }
            field.comment = d.comment ? d.comment.value.value : "";
            field.unique = !!d.unique;
            field.increment = !!d.auto_increment;
            field.notNull = !!d.nullable;
            field.primary = !!d.primary_key;

            if (d.default_val) {
              let defaultValue = "";
              if (d.default_val.value.type === "function") {
                defaultValue = d.default_val.value.name.name[0].value;
                if (d.default_val.value.args) {
                  defaultValue +=
                    "(" +
                    d.default_val.value.args.value
                      .map((v: any) => {
                        if (
                          v.type === "single_quote_string" ||
                          v.type === "double_quote_string"
                        )
                          return "'" + v.value + "'";
                        return v.value;
                      })
                      .join(", ") +
                    ")";
                }
              } else if (d.default_val.value.type === "null") {
                defaultValue = "NULL";
              } else {
                defaultValue = d.default_val.value.value.toString();
              }
              field.default = defaultValue;
            }
            if (d.definition["length"]) {
              if (d.definition.scale) {
                field.size = d.definition["length"] + "," + d.definition.scale;
              } else {
                field.size = d.definition["length"];
              }
            }
            if (d.check) {
              field.check = buildSQLFromAST(d.check.definition[0], DB.SQLITE);
            }
            table.fields.push(field);

            if (d.reference_definition) {
              addRelationshipFromReferenceDef(
                table,
                field.name,
                d.reference_definition,
              );
            }
          } else if (d.resource === "constraint") {
            if (d.constraint_type === "primary key") {
              d.definition.forEach((c: any) => {
                table.fields.forEach((f) => {
                  if (f.name === c.column && !f.primary) {
                    f.primary = true;
                  }
                });
              });
            } else if (d.constraint_type.toLowerCase() === "foreign key") {
              addRelationshipFromReferenceDef(
                table,
                d.definition[0].column,
                d.reference_definition,
              );
            }
          }
        });
        tables.push(table);
      } else if (e.keyword === "index") {
        const index = {
          name: e.index,
          unique: e.index_type === "unique",
          fields: e.index_columns.map((f: any) => f.column),
        };

        const table = tables.find((t) => t.name === e.table.table);

        if (table) {
          table.indices.push(index as any);
          table.indices.forEach((i, j) => {
            i.id = j;
          });
        }
      }
    }
  };

  if (Array.isArray(ast)) {
    ast.forEach((e) => parseSingleStatement(e));
  } else {
    parseSingleStatement(ast);
  }

  return { 
    tables, 
    relationships,
    xorGroups: [],
    orGroups: [],
    enums: [],
    types: []
  };
}
