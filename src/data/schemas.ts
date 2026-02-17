export const tableSchema = {
  type: "object",
  properties: {
    id: { type: ["integer", "string"] },
    name: { type: "string" },
    x: { type: "number" },
    y: { type: "number" },
    fields: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: ["integer", "string"] },
          name: { type: "string" },
          type: { type: "string" },
          default: { type: ["string", "number", "boolean"] },
          check: { type: "string" },
          primary: { type: "boolean" },
          unique: { type: "boolean" },
          notNull: { type: "boolean" },
          increment: { type: "boolean" },
          comment: { type: "string" },
          size: { type: ["string", "number"] },
          values: { type: "array", items: { type: "string" } },
        },
        required: [
          "id",
          "name",
          "type",
          "default",
          "check",
          "primary",
          "unique",
          "notNull",
          "increment",
          "comment",
        ],
      },
    },
    comment: { type: "string" },
    locked: { type: "boolean" },
    hidden: { type: "boolean" },
    indices: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          unique: { type: "boolean" },
          fields: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["name", "unique", "fields"],
      },
    },
    color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
    inherits: {
      type: "array",
      items: { type: ["string"] },
    },
  },
  required: ["id", "name", "x", "y", "fields", "comment", "indices", "color"],
};

export const areaSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    x: { type: "number" },
    y: { type: "number" },
    width: { type: "number" },
    height: { type: "number" },
    locked: { type: "boolean" },
    color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
  },
  required: ["id", "name", "x", "y", "width", "height", "color"],
};

export const noteSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    x: { type: "number" },
    y: { type: "number" },
    title: { type: "string" },
    content: { type: "string" },
    color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
    height: { type: "number" },
    locked: { type: "boolean" },
  },
  required: ["id", "x", "y", "title", "content", "color", "height"],
};

export const textSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    x: { type: "number" },
    y: { type: "number" },
    text: { type: "string" },
    color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
    fontSize: { type: "number" },
    fontWeight: { type: ["string", "number"] },
    locked: { type: "boolean" },
  },
  required: ["id", "x", "y", "text", "color", "fontSize"],
};

export const typeSchema = {
  type: "object",
  properties: {
    id: { type: ["string"] },
    name: { type: "string" },
    fields: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: ["string"] },
          name: { type: "string" },
          type: { type: "string" },
          values: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["name", "type"],
      },
    },
    comment: { type: "string" },
  },
  required: ["name", "fields", "comment"],
};

export const enumSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    values: {
      type: "array",
      items: { type: "string" },
    },
  },
};

export const jsonSchema = {
  type: "object",
  properties: {
    tables: {
      type: "array",
      items: { ...tableSchema },
    },
    relationships: {
      type: "array",
      items: {
        type: "object",
        properties: {
          startTableId: { type: ["integer", "string"] },
          startFieldId: { type: ["integer", "string"] },
          endTableId: { type: ["integer", "string"] },
          endFieldId: { type: ["integer", "string"] },
          name: { type: "string" },
          cardinality: { type: "string" },
          updateConstraint: { type: "string" },
          deleteConstraint: { type: "string" },
          id: { type: ["integer", "string"] },
          waypoints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                mode: { type: "string", enum: ["waypoint", "floating", "divider"] },
                pathRatio: { type: "number" },
              },
              required: ["x", "y"],
            },
          },
          startXOffset: { type: "number" },
          endXOffset: { type: "number" },
          startYCorrection: { type: "number" },
          endYCorrection: { type: "number" },
        },
        required: [
          "startTableId",
          "startFieldId",
          "endTableId",
          "endFieldId",
          "name",
          "cardinality",
          "updateConstraint",
          "deleteConstraint",
          "id",
        ],
      },
    },
    notes: {
      type: "array",
      items: { ...noteSchema },
    },
    texts: {
      type: "array",
      items: { ...textSchema },
    },
    subjectAreas: {
      type: "array",
      items: { ...areaSchema },
    },
    types: {
      type: "array",
      items: { ...typeSchema },
    },
    enums: {
      type: "array",
      items: { ...enumSchema },
    },
    xorGroups: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          parentTableId: { type: ["integer", "string"] },
          childRelationshipIds: {
            type: "array",
            items: { type: ["integer", "string"] },
          },
        },
        required: ["id", "label", "parentTableId", "childRelationshipIds"],
      },
    },
    orGroups: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          parentTableId: { type: ["integer", "string"] },
          childRelationshipIds: {
            type: "array",
            items: { type: ["integer", "string"] },
          },
        },
        required: ["id", "label", "parentTableId", "childRelationshipIds"],
      },
    },
    title: { type: "string" },
    database: { type: "string" },
  },
  required: ["tables", "relationships", "notes", "subjectAreas"],
};

export const ddbSchema = {
  type: "object",
  properties: {
    author: { type: "string" },
    project: { type: "string" },
    title: { type: "string" },
    date: { type: "string" },
    ...jsonSchema.properties,
  },
};
