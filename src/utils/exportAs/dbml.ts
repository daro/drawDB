import { Cardinality } from "@data/constants";
import { dbToTypes } from "@data/datatypes";
import i18n from "@i18n/i18n";
import { escapeQuotes } from "../exportSQL/shared";
import { isFunction, isKeyword } from "../utils";
import type { IField, IDiagram, IRelationship, ITable } from "@types";

const IDENT_SAFE_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function escapeIdentifier(s: string): string {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function quoteIdentifier(name: string | number): string {
  if (name == null) return String(name);
  const s = String(name);
  return IDENT_SAFE_RE.test(s) ? s : `"${escapeIdentifier(s)}"`;
}

function parseDefaultDbml(field: IField, database: string): string {
  if (isFunction(field.default)) {
    return `\`${field.default}\``;
  }

  if (isKeyword(field.default) || !dbToTypes[database][field.type]?.hasQuotes) {
    return field.default;
  }

  return `'${escapeQuotes(field.default)}'`;
}

function columnDefault(field: IField, database: string): string {
  if (!field.default) {
    return "";
  }

  if (typeof field.default === "string" && !field.default.trim()) {
    return "";
  }

  return `default: ${parseDefaultDbml(field, database)}`;
}

function columnSettings(field: IField, database: string): string {
  let constraints: string[] = [];

  if (field.primary) constraints.push("pk");
  if (field.increment) constraints.push("increment");
  if (field.notNull) constraints.push("not null");
  if (field.unique) constraints.push("unique");
  constraints.push(columnDefault(field, database));
  constraints.push(columnComment(field));

  const filteredConstraints = constraints.filter((x) => Boolean(x));

  if (!filteredConstraints.length) {
    return "";
  }

  return ` [ ${filteredConstraints.join(", ")} ]`;
}

function cardinality(rel: IRelationship): string {
  switch (rel.cardinality) {
    case i18n.t(Cardinality.ONE_TO_ONE):
    case Cardinality.ONE_TO_ONE:
      return "-";
    case i18n.t(Cardinality.ONE_TO_MANY):
    case Cardinality.ONE_TO_MANY:
      return "<";
    case i18n.t(Cardinality.MANY_TO_ONE):
    case Cardinality.MANY_TO_ONE:
      return ">";
    default:
      return "-";
  }
}

function fieldSize(field: IField, database: string): string {
  const typeMetadata = dbToTypes[database][field.type];

  if ((typeMetadata?.isSized || typeMetadata?.hasPrecision) && field.size)
    return `(${field.size})`;

  return "";
}

function processComment(comment: string): string {
  if (comment.includes("\n")) {
    return `'''${comment}'''`;
  }

  return `'${escapeQuotes(comment)}'`;
}

function columnComment(field: IField): string {
  if (!field.comment || field.comment.trim() === "") {
    return "";
  }

  return `note: ${processComment(field.comment)}`;
}

function processType(type: string): string {
  // TODO: remove after a while
  if (type.toUpperCase() === "TIMESTAMP WITH TIME ZONE") {
    return "timestamptz";
  }

  return type.toLowerCase();
}

interface DiagramWithDatabase extends Partial<IDiagram> {
  database: string;
  tables: ITable[];
  relationships: IRelationship[];
}

export function toDBML(diagram: DiagramWithDatabase): string {
  const generateRelString = (rel: IRelationship): string => {
    const startTable = diagram.tables.find((t) => t.id === rel.startTableId);
    const endTable = diagram.tables.find((t) => t.id === rel.endTableId);

    if (!startTable || !endTable) return "";

    const startField = startTable.fields.find((f) => f.id === rel.startFieldId);
    const endField = endTable.fields.find((f) => f.id === rel.endFieldId);

    if (!startField || !endField) return "";

    return `Ref ${quoteIdentifier(rel.name)} {\n\t${quoteIdentifier(startTable.name)}.${quoteIdentifier(startField.name)} ${cardinality(rel)} ${quoteIdentifier(endTable.name)}.${quoteIdentifier(endField.name)} [ delete: ${rel.deleteConstraint.toLowerCase()}, update: ${rel.updateConstraint.toLowerCase()} ]\n}`;
  };

  let enumDefinitions = "";

  for (const table of diagram.tables) {
    for (const field of table.fields) {
      if (
        (field.type === "ENUM" || field.type === "SET") &&
        Array.isArray(field.values)
      ) {
        enumDefinitions += `enum ${quoteIdentifier(`${field.name}_${field.values.join("_")}_t`)} {\n\t${field.values.map((v) => quoteIdentifier(v)).join("\n\t")}\n}\n\n`;
      }
    }
  }

  return `${(diagram.enums || [])
    .map(
      (en) =>
        `enum ${quoteIdentifier(en.name)} {\n${en.values.map((v) => `\t${quoteIdentifier(v)}`).join("\n")}\n}\n\n`,
    )
    .join("\n\n")}${enumDefinitions}${diagram.tables
    .map(
      (table) =>
        `Table ${quoteIdentifier(table.name)} [headercolor: ${table.color}${
          table.width ? `, width: ${table.width}` : ""
        }${table.height ? `, height: ${table.height}` : ""}] {\n${table.fields
          .map(
            (field) =>
              `\t${quoteIdentifier(field.name)} ${
                field.type === "ENUM" || field.type === "SET"
                  ? quoteIdentifier(`${field.name}_${field.values.join("_")}_t`)
                  : processType(field.type)
              }${fieldSize(
                field,
                diagram.database,
              )}${columnSettings(field, diagram.database)}`,
          )
          .join("\n")}${
          table.indices.length > 0
            ? "\n\n\tindexes {\n" +
              table.indices
                .map(
                  (index) =>
                    `\t\t(${index.fields
                      .map((f) => quoteIdentifier(f))
                      .join(", ")}) [ name: '${
                      index.name
                    }'${index.unique ? ", unique" : ""} ]`,
                )
                .join("\n") +
              "\n\t}"
            : ""
        }${
          table.comment && table.comment.trim() !== ""
            ? `\n\n\tNote: ${processComment(table.comment)}`
            : ""
        }\n}`,
    )
    .join("\n\n")}\n\n${diagram.relationships
    .map((rel) => generateRelString(rel))
    .join("\n\n")}`;
}
