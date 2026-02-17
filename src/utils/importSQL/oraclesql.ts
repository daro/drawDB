import { nanoid } from "nanoid";
import { Cardinality, Constraint, DB, DBType } from "@data/constants";
import { dbToTypes } from "@data/datatypes";
import { IImportData, ITable, IRelationship, IField, IEnum } from "@types";

const affinity: Record<string, Record<string, string>> = {
  [DB.ORACLESQL]: new Proxy(
    {
      INT: "INTEGER",
      NUMERIC: "NUMBER",
      DECIMAL: "NUMBER",
      CHARACTER: "CHAR",
    },
    { get: (target, prop: string) => (prop in target ? target[prop] : "BLOB") },
  ),
  [DB.GENERIC]: new Proxy(
    {
      INTEGER: "INT",
      MEDIUMINT: "INTEGER",
    },
    { get: (target, prop: string) => (prop in target ? target[prop] : "BLOB") },
  ),
};

export function fromOracleSQL(ast: any[], diagramDb: DBType = DB.GENERIC): IImportData {
  const tables: ITable[] = [];
  const relationships: IRelationship[] = [];
  const enums: IEnum[] = [];

  const parseSingleStatement = (e: any) => {
    if (e.operation === "create") {
      if (e.object === "table") {
        const table: ITable = {
          id: nanoid(),
          name: e.name.name,
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
        e.table.relational_properties.forEach((d: any) => {
          if (d.resource === "column") {
            const field: IField = {
              id: nanoid(),
              name: d.name,
              type: "",
              default: "",
              check: "",
              primary: false,
              unique: false,
              notNull: false,
              increment: false,
              comment: "",
            };

            let type = d.type.type.toUpperCase();
            if (!dbToTypes[diagramDb][type]) {
              type = affinity[diagramDb][type];
            }
            field.type = type;

            if (d.type.scale && d.type.precision) {
              field.size = d.type.precision + "," + d.type.scale;
            } else if (d.type.size || d.type.precision) {
              field.size = d.type.size || d.type.precision;
            }

            for (const c of d.constraints) {
              if (c.constraint.primary_key === "primary key")
                field.primary = true;
              if (c.constraint.not_null === "not null") field.notNull = true;
              if (c.constraint.unique === "unique") field.unique = true;
            }

            if (d.identity) {
              field.increment = true;
            }

            // TODO: reconstruct default when implemented in parser
            if (d.default) {
              field.default = JSON.stringify(d.default.expr);
            }

            table.fields.push(field);
          } else if (d.resource === "constraint") {
            const startFieldName = d.constraint.columns[0];
            const endFieldName = d.constraint.reference.columns[0];
            const endTableName = d.constraint.reference.object.name;

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

            const relationship: IRelationship = {
              id: nanoid(),
              startTableId: table.id,
              startFieldId: startField.id,
              endTableId: endTable.id,
              endFieldId: endField.id,
              updateConstraint: Constraint.NONE,
              name: d.name && Boolean(d.name.trim())
                ? d.name
                : `fk_${table.name}_${startFieldName}_${endTableName}`,
              deleteConstraint:
                d.constraint.reference.on_delete &&
                Boolean(d.constraint.reference.on_delete.trim())
                  ? d.constraint.reference.on_delete[0].toUpperCase() +
                    d.constraint.reference.on_delete.substring(1)
                  : Constraint.NONE,
              cardinality: startField.unique ? Cardinality.ONE_TO_ONE : Cardinality.MANY_TO_ONE,
            };

            relationships.push(relationship);
          }
        });
        tables.push(table);
      }
    }
  };

  ast.forEach((e) => parseSingleStatement(e));

  return { 
    tables, 
    relationships, 
    enums,
    xorGroups: [],
    orGroups: [],
    types: []
  };
}
