import { arrangeTables } from "../arrangeTables";
import { Cardinality, Constraint, TABLE_CONFIG } from "@data/constants";
import { nanoid } from "nanoid";
import { getTableHeight } from "../utils";
import type { ITable, IField, IRelationship, IIndex, IEnum } from "@types";

// Lazy-loaded parser - initialized only when needed
let parserInstance: any = null;

async function getParser() {
  if (!parserInstance) {
    const { Parser } = await import("@dbml/core");
    parserInstance = new Parser();
  }
  return parserInstance;
}

interface DBMLColumn {
  name: string;
  type: { type_name: string };
  dbdefault?: { value: string };
  pk?: boolean;
  unique?: boolean;
  not_null?: boolean;
  increment?: boolean;
  note?: string;
}

interface DBMLIndex {
  id: number;
  columns: Array<{ value: string }>;
  name?: string;
  unique?: boolean;
}

interface DBMLTable {
  name: string;
  note?: string;
  headerColor?: string;
  width?: string;
  height?: string;
  fields: DBMLColumn[];
  indexes: DBMLIndex[];
}

interface DBMLEndpoint {
  tableName: string;
  fieldNames: string[];
  relation: string;
}

interface DBMLRef {
  name?: string;
  endpoints: [DBMLEndpoint, DBMLEndpoint];
  onUpdate?: string;
  onDelete?: string;
}

interface DBMLEnum {
  name: string;
  values: Array<{ name: string }>;
}

interface DBMLSchema {
  tables: DBMLTable[];
  refs: DBMLRef[];
  enums: DBMLEnum[];
}

interface DBMLAST {
  schemas: DBMLSchema[];
}

export async function fromDBML(src: string, existingTables: ITable[] = [], existingEnums: IEnum[] = []) {
  const parser = await getParser();
  const ast = parser.parse(src, "dbmlv2") as DBMLAST;

  const tables: ITable[] = [];
  const enums: IEnum[] = [];
  const relationships: IRelationship[] = [];

  for (const schema of ast.schemas) {
    for (const table of schema.tables) {
      const existingTable = existingTables.find((t) => t.name === table.name);
      const parsedFields: IField[] = [];
      const parsedIndices: IIndex[] = [];

      for (const column of table.fields) {
        const existingField = existingTable?.fields.find(
          (f) => f.name === column.name,
        );

        const field: IField = {
          id: existingField ? existingField.id : nanoid(),
          name: column.name,
          type: column.type.type_name.toUpperCase(),
          default: column.dbdefault?.value ?? "",
          check: "",
          primary: !!column.pk,
          unique: !!column.pk || !!column.unique,
          notNull: !!column.not_null,
          increment: !!column.increment,
          comment: column.note ?? "",
        };

        parsedFields.push(field);
      }

      for (const idx of table.indexes) {
        const parsedIndex: IIndex = {
          id: idx.id - 1,
          fields: idx.columns.map((x) => x.value),
          name: idx.name ?? `${table.name}_index_${idx.id - 1}`,
          unique: !!idx.unique,
        };

        parsedIndices.push(parsedIndex);
      }

      const parsedTable: ITable = {
        id: existingTable ? existingTable.id : nanoid(),
        name: table.name,
        x: existingTable ? existingTable.x : 0,
        y: existingTable ? existingTable.y : 0,
        width: table.width ? parseInt(table.width) : (existingTable?.width ?? TABLE_CONFIG.WIDTH),
        height: 0, // Will be calculated below
        comment: table.note ?? "",
        color: table.headerColor ?? "#175e7a",
        locked: false,
        fields: parsedFields,
        indices: parsedIndices,
      };

      parsedTable.height = table.height ? parseInt(table.height) : (existingTable?.height ?? getTableHeight(parsedTable));

      tables.push(parsedTable);
    }

    for (const ref of schema.refs) {
      const startTableName = ref.endpoints[0].tableName;
      const endTableName = ref.endpoints[1].tableName;
      const startFieldName = ref.endpoints[0].fieldNames[0];
      const endFieldName = ref.endpoints[1].fieldNames[0];

      const startTable = tables.find((t) => t.name === startTableName);
      if (!startTable) continue;

      const endTable = tables.find((t) => t.name === endTableName);
      if (!endTable) continue;

      const endField = endTable.fields.find((f) => f.name === endFieldName);
      if (!endField) continue;

      const startField = startTable.fields.find(
        (f) => f.name === startFieldName,
      );
      if (!startField) continue;

      const startRelation = ref.endpoints[0].relation;
      const endRelation = ref.endpoints[1].relation;

      let cardinality = Cardinality.ONE_TO_ONE;
      if (startRelation === "*" && endRelation === "1") {
        cardinality = Cardinality.MANY_TO_ONE;
      } else if (startRelation === "1" && endRelation === "*") {
        cardinality = Cardinality.ONE_TO_MANY;
      }

      const constraintKey = (str: string) => str.toUpperCase().replace(" ", "_") as keyof typeof Constraint;

      const relationship: IRelationship = {
        id: nanoid(),
        name: ref.name ?? `fk_${startTableName}_${startFieldName}_${endTableName}`,
        startTableId: startTable.id,
        endTableId: endTable.id,
        endFieldId: endField.id,
        startFieldId: startField.id,
        cardinality,
        updateConstraint: (ref.onUpdate && Constraint[constraintKey(ref.onUpdate)])
          ? Constraint[constraintKey(ref.onUpdate)]
          : Constraint.NONE,
        deleteConstraint: (ref.onDelete && Constraint[constraintKey(ref.onDelete)])
          ? Constraint[constraintKey(ref.onDelete)]
          : Constraint.NONE,
      };

      relationships.push(relationship);
    }

    for (const schemaEnum of schema.enums) {
      const existingEnum = existingEnums.find((e) => e.name === schemaEnum.name);

      const parsedEnum: IEnum = {
        id: existingEnum ? existingEnum.id : nanoid(),
        name: schemaEnum.name,
        values: schemaEnum.values.map((x) => x.name),
      };

      enums.push(parsedEnum);
    }
  }

  const diagram = { tables, enums, relationships };

  if (existingTables.length === 0) {
    arrangeTables(diagram);
  }

  return diagram;
}
