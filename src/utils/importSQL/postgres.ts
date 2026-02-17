import { nanoid } from "nanoid";
import { Cardinality, Constraint, DB, DBType } from "@data/constants";
import { dbToTypes } from "@data/datatypes";
import { buildSQLFromAST } from "./shared";
import { IImportData, ITable, IRelationship, IField, IType, IEnum } from "@types";

const affinity: Record<string, Record<string, string>> = {
  [DB.POSTGRES]: new Proxy(
    { INT: "INTEGER" },
    { get: (target, prop: string) => (prop in target ? target[prop] : "BLOB") },
  ),
  [DB.GENERIC]: new Proxy(
    {
      INTEGER: "INT",
      MEDIUMINT: "INTEGER",
      BIT: "BOOLEAN",
      "CHARACTER VARYING": "VARCHAR",
    },
    { get: (target, prop: string) => (prop in target ? target[prop] : "BLOB") },
  ),
};

export function fromPostgres(ast: any, diagramDb: DBType = DB.GENERIC): IImportData {
  const tables: ITable[] = [];
  const relationships: IRelationship[] = [];
  const types: IType[] = [];
  const enums: IEnum[] = [];

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
              name: d.column.column.expr.value,
              type: "",
              default: "",
              check: "",
              primary: false,
              unique: false,
              notNull: false,
              increment: false,
              comment: "",
            };

            let type = types.find((t) =>
              new RegExp(`^(${t.name}|"${t.name}")$`).test(
                d.definition.dataType,
              ),
            )?.name;
            type ??= enums.find((t) =>
              new RegExp(`^(${t.name}|"${t.name}")$`).test(
                d.definition.dataType,
              ),
            )?.name;

            type ??=
              dbToTypes[diagramDb][d.definition.dataType.toUpperCase()]?.type;
            type ??= affinity[diagramDb][d.definition.dataType.toUpperCase()];

            field.type = type || d.definition.dataType;

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
              } else if (d.default_val.value.type === "cast") {
                defaultValue = d.default_val.value.expr.value;
              } else if (d.default_val.value.type === "array") {
                defaultValue = `ARRAY[${d.default_val.value.expr_list.value
                  .map((v: any) => v.value ?? v.expr.value)
                  .join(", ")}]`;
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
              field.check = buildSQLFromAST(d.check.definition[0], DB.POSTGRES);
            }

            table.fields.push(field);

            if (d.reference_definition) {
              const startTableName = table.name;
              const startFieldName = field.name;
              const endTableName = d.reference_definition.table[0].table;
              const endFieldName =
                d.reference_definition.definition[0].column.expr.value;

              const endTable = tables.find((t) => t.name === endTableName);
              if (!endTable) return;

              const endField = endTable.fields.find(
                (f) => f.name === endFieldName,
              );
              if (!endField) return;

              let updateConstraint = Constraint.NONE;
              let deleteConstraint = Constraint.NONE;
              d.reference_definition.on_action.forEach((c: any) => {
                if (c.type === "on update") {
                  updateConstraint = c.value.value;
                  updateConstraint =
                    updateConstraint[0].toUpperCase() +
                    updateConstraint.substring(1);
                } else if (c.type === "on delete") {
                  deleteConstraint = c.value.value;
                  deleteConstraint =
                    deleteConstraint[0].toUpperCase() +
                    deleteConstraint.substring(1);
                }
              });

              const relationship: IRelationship = {
                id: nanoid(),
                name: `fk_${startTableName}_${startFieldName}_${endTableName}`,
                startTableId: table.id,
                startFieldId: field.id,
                endTableId: endTable.id,
                endFieldId: endField.id,
                updateConstraint,
                deleteConstraint,
                cardinality: field.unique ? Cardinality.ONE_TO_ONE : Cardinality.MANY_TO_ONE,
              };

              relationships.push(relationship);
            }
          } else if (d.resource === "constraint") {
            if (d.constraint_type === "primary key") {
              d.definition.forEach((c: any) => {
                table.fields.forEach((f) => {
                  if (f.name === c.column.expr.value && !f.primary) {
                    f.primary = true;
                  }
                });
              });
            } else if (d.constraint_type.toLowerCase() === "foreign key") {
              const startTableName = e.table[0].table;
              const startFieldName = d.definition[0].column.expr.value;
              const endTableName = d.reference_definition.table[0].table;
              const endFieldName =
                d.reference_definition.definition[0].column.expr.value;

              const endTable = tables.find((t) => t.name === endTableName);
              if (!endTable) return;

              const endField = endTable.fields.find(
                (f) => f.name === endFieldName,
              );
              if (!endField) return;

              const startField = table.fields.find(
                (f) => f.name === startFieldName,
              );
              if (!startField) return;

              let updateConstraint = Constraint.NONE;
              let deleteConstraint = Constraint.NONE;
              d.reference_definition.on_action.forEach((c: any) => {
                if (c.type === "on update") {
                  updateConstraint = c.value.value;
                  updateConstraint =
                    updateConstraint[0].toUpperCase() +
                    updateConstraint.substring(1);
                } else if (c.type === "on delete") {
                  deleteConstraint = c.value.value;
                  deleteConstraint =
                    deleteConstraint[0].toUpperCase() +
                    deleteConstraint.substring(1);
                }
              });

              const relationship: IRelationship = {
                id: nanoid(),
                name: `fk_${startTableName}_${startFieldName}_${endTableName}`,
                startTableId: table.id,
                endTableId: endTable.id,
                endFieldId: endField.id,
                startFieldId: startField.id,
                updateConstraint,
                deleteConstraint,
                cardinality: startField.unique ? Cardinality.ONE_TO_ONE : Cardinality.MANY_TO_ONE,
              };
              relationships.push(relationship);
            }
          }
        });
        tables.push(table);
      } else if (e.keyword === "index") {
        const index = {
          name: e.index,
          unique: e.index_type === "unique",
          fields: e.index_columns.map((f: any) => f.column.expr.value),
        };

        const table = tables.find((t) => t.name === e.table.table);

        if (table) {
          table.indices.push(index as any);
          table.indices.forEach((i, j) => {
            i.id = j;
          });
        }
      } else if (e.keyword === "type") {
        if (e.resource === "enum") {
          const newEnum: IEnum = {
            id: nanoid(),
            name: e.name.name,
            values: e.create_definitions.value.map((x: any) => x.value),
          };
          enums.push(newEnum);
        } else if (Array.isArray(e.create_definitions)) {
          const type: IType = {
            id: nanoid(),
            name: e.name.name,
            fields: [],
            comment: "",
          };
          e.create_definitions.forEach((d: any) => {
            const field: any = {};
            if (d.resource === "column") {
              field.id = nanoid();
              field.name = d.column.column.expr.value;

              let type = d.definition.dataType;
              if (!dbToTypes[diagramDb][type]) {
                type = affinity[diagramDb][type];
              }
              field.type = type;
            }
            if (d.definition["length"]) {
              if (d.definition.scale) {
                field.size = d.definition["length"] + "," + d.definition.scale;
              } else {
                field.size = d.definition["length"];
              }
            }

            type.fields.push(field);
          });
          types.push(type);
        }
      }
    } else if (e.type === "alter") {
      if (Array.isArray(e.expr)) {
        e.expr.forEach((expr: any) => {
          if (
            expr.action === "add" &&
            expr.create_definitions.constraint_type.toLowerCase() ===
              "foreign key"
          ) {
            const startTableName = e.table[0].table;
            const startFieldName =
              expr.create_definitions.definition[0].column.expr.value;
            const endTableName =
              expr.create_definitions.reference_definition.table[0].table;
            const endFieldName =
              expr.create_definitions.reference_definition.definition[0].column
                .expr.value;
            let updateConstraint = Constraint.NONE;
            let deleteConstraint = Constraint.NONE;
            expr.create_definitions.reference_definition.on_action.forEach(
              (c: any) => {
                if (c.type === "on update") {
                  updateConstraint = c.value.value;
                  updateConstraint =
                    updateConstraint[0].toUpperCase() +
                    updateConstraint.substring(1);
                } else if (c.type === "on delete") {
                  deleteConstraint = c.value.value;
                  deleteConstraint =
                    deleteConstraint[0].toUpperCase() +
                    deleteConstraint.substring(1);
                }
              },
            );

            const startTable = tables.find((t) => t.name === startTableName);
            if (!startTable) return;

            const endTable = tables.find((t) => t.name === endTableName);
            if (!endTable) return;

            const endField = endTable.fields.find(
              (f) => f.name === endFieldName,
            );
            if (!endField) return;

            const startField = startTable.fields.find(
              (f) => f.name === startFieldName,
            );
            if (!startField) return;

            const relationship: IRelationship = {
              id: nanoid(),
              name: `fk_${startTableName}_${startFieldName}_${endTableName}`,
              startTableId: startTable.id,
              startFieldId: startField.id,
              endTableId: endTable.id,
              endFieldId: endField.id,
              updateConstraint,
              deleteConstraint,
              cardinality: startField.unique ? Cardinality.ONE_TO_ONE : Cardinality.MANY_TO_ONE,
            };

            relationships.push(relationship);
          }
        });
      }
    } else if (e.type === "comment") {
      if (e.target.type === "table") {
        const table = tables.find((t) => t.name === e.target?.name?.table);
        if (table) {
          table.comment = e.expr.expr.value;
        }
      } else if (e.target.type === "column") {
        const table = tables.find((t) => t.name === e.target?.name?.table);
        if (table) {
          const field = table.fields.find(
            (f) => f.name === e.target?.name?.column?.expr?.value,
          );
          if (field) {
            field.comment = e.expr.expr.value;
          }
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
    types, 
    enums,
    xorGroups: [],
    orGroups: [],
    texts: [],
    notes: []
  };
}
