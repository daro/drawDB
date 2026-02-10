export const TABLE_CONFIG = {
  DEFAULT_BLUE: "#175e7a",
  DEFAULT_COLORS: [
    "#175e7a",
    "#1db7ae",
    "#138a2e",
    "#f1a60d",
    "#ef6214",
    "#d42020",
    "#a220d4",
    "#2040d4",
    "#607d8b",
    "#3f51b5",
  ],
  HEADER: {
    HEIGHT: 40,
    COLOR_STRIP_HEIGHT: 7,
  },
  WIDTH: 220,
  FIELD_HEIGHT: 36,
} as const;

export const NOTE_CONFIG = {
  DEFAULT_THEME: "#fcf7ac",
  WIDTH: 180,
  RADIUS: 3,
  FOLD: 24,
} as const;

export const GRID_CONFIG = {
  SIZE: 24,
  CIRCLE_RADIUS: 0.85,
} as const;

export const THEME_CONFIG = {
  DARK_BG: "#16161A",
} as const;

export const TYPE_COLORS = {
  STRING: "text-orange-500",
  INT: "text-yellow-500",
  DECIMAL: "text-lime-500",
  BOOLEAN: "text-violet-500",
  BINARY: "text-emerald-500",
  ENUM_SET: "text-sky-500",
  DOCUMENT: "text-indigo-500",
  NETWORK_ID: "text-rose-500",
  GEOMETRIC: "text-fuchsia-500",
  VECTOR: "text-slate-500",
  OTHER: "text-zinc-500",
  DATE: "text-cyan-500",
} as const;

export const EXPORT_CONFIG = {
  PNG_PIXEL_RATIO: 4,
} as const;

export const AREA_CONFIG = {
  MIN_SIZE: 120,
} as const;

// Backward compatibility exports
export const defaultBlue = TABLE_CONFIG.DEFAULT_BLUE;
export const defaultTableColors = [...TABLE_CONFIG.DEFAULT_COLORS];
export const defaultNoteTheme = NOTE_CONFIG.DEFAULT_THEME;
export const noteWidth = NOTE_CONFIG.WIDTH;
export const noteRadius = NOTE_CONFIG.RADIUS;
export const noteFold = NOTE_CONFIG.FOLD;
export const darkBgTheme = THEME_CONFIG.DARK_BG;
export const stringColor = TYPE_COLORS.STRING;
export const intColor = TYPE_COLORS.INT;
export const decimalColor = TYPE_COLORS.DECIMAL;
export const booleanColor = TYPE_COLORS.BOOLEAN;
export const binaryColor = TYPE_COLORS.BINARY;
export const enumSetColor = TYPE_COLORS.ENUM_SET;
export const documentColor = TYPE_COLORS.DOCUMENT;
export const networkIdColor = TYPE_COLORS.NETWORK_ID;
export const geometricColor = TYPE_COLORS.GEOMETRIC;
export const vectorColor = TYPE_COLORS.VECTOR;
export const otherColor = TYPE_COLORS.OTHER;
export const dateColor = TYPE_COLORS.DATE;
export const tableHeaderHeight = TABLE_CONFIG.HEADER.HEIGHT;
export const tableWidth = TABLE_CONFIG.WIDTH;
export const gridSize = GRID_CONFIG.SIZE;
export const gridCircleRadius = GRID_CONFIG.CIRCLE_RADIUS;
export const tableFieldHeight = TABLE_CONFIG.FIELD_HEIGHT;
export const tableColorStripHeight = TABLE_CONFIG.HEADER.COLOR_STRIP_HEIGHT;
export const pngExportPixelRatio = EXPORT_CONFIG.PNG_PIXEL_RATIO;
export const minAreaSize = AREA_CONFIG.MIN_SIZE;

export const Cardinality = {
  ONE_TO_ONE: "one_to_one",
  ONE_TO_MANY: "one_to_many",
  MANY_TO_ONE: "many_to_one",
  MANY_TO_MANY: "many_to_many",
  AUTO: "auto",
} as const;

export type CardinalityType = (typeof Cardinality)[keyof typeof Cardinality];

export const Constraint = {
  NONE: "No action",
  RESTRICT: "Restrict",
  CASCADE: "Cascade",
  SET_NULL: "Set null",
  SET_DEFAULT: "Set default",
} as const;

export type ConstraintType = (typeof Constraint)[keyof typeof Constraint];

export const Tab = {
  TABLES: "1",
  RELATIONSHIPS: "2",
  AREAS: "3",
  NOTES: "4",
  TYPES: "5",
  ENUMS: "6",
  TEXT: "7",
} as const;

export type TabType = (typeof Tab)[keyof typeof Tab];

export const ObjectType = {
  NONE: 0,
  TABLE: 1,
  AREA: 2,
  NOTE: 3,
  RELATIONSHIP: 4,
  TYPE: 5,
  ENUM: 6,
  XOR_GROUP: 7,
  OR_GROUP: 8,
  WAYPOINT: 9,
  TEXT: 10,
  DIVIDER: 11,
} as const;

export type ObjectTypeValue = (typeof ObjectType)[keyof typeof ObjectType];

export const Action = {
  ADD: 0,
  MOVE: 1,
  DELETE: 2,
  EDIT: 3,
} as const;

export type ActionType = (typeof Action)[keyof typeof Action];

export const State = {
  NONE: 0,
  SAVING: 1,
  SAVED: 2,
  LOADING: 3,
  ERROR: 4,
  FAILED_TO_LOAD: 5,
} as const;

export type StateType = (typeof State)[keyof typeof State];

export const MODAL = {
  NONE: 0,
  IMG: 1,
  CODE: 2,
  IMPORT: 3,
  RENAME: 4,
  OPEN: 5,
  SAVEAS: 6,
  NEW: 7,
  IMPORT_SRC: 8,
  TABLE_WIDTH: 9,
  LANGUAGE: 10,
  SHARE: 11,
  SIDE_MARGIN: 12,
  TABLE_COLORS: 13,
  SETTINGS: 14,
} as const;

export type ModalType = (typeof MODAL)[keyof typeof MODAL];

export const STATUS = {
  NONE: 0,
  WARNING: 1,
  ERROR: 2,
  OK: 3,
} as const;

export type StatusType = (typeof STATUS)[keyof typeof STATUS];

export const SIDESHEET = {
  NONE: 0,
  TODO: 1,
  TIMELINE: 2,
  VERSIONS: 3,
} as const;

export type SideSheetType = (typeof SIDESHEET)[keyof typeof SIDESHEET];

export const DB = {
  MYSQL: "mysql",
  POSTGRES: "postgresql",
  MSSQL: "transactsql",
  SQLITE: "sqlite",
  MARIADB: "mariadb",
  ORACLESQL: "oraclesql",
  GENERIC: "generic",
} as const;

export type DBType = (typeof DB)[keyof typeof DB];

export const IMPORT_FROM = {
  JSON: 0,
  DBML: 1,
} as const;

export type ImportFromType = (typeof IMPORT_FROM)[keyof typeof IMPORT_FROM];
