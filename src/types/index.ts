export interface IPoint {
  x: number;
  y: number;
}

export interface IField {
  id: string | number;
  name: string;
  type: string;
  default: string;
  check: string;
  primary: boolean;
  unique: boolean;
  notNull: boolean;
  increment: boolean;
  comment: string;
  size?: string | number;
  values?: string[];
  unsigned?: boolean;
  isArray?: boolean;
}

export interface ITable {
  id: string | number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
  fields: IField[];
  comment: string;
  indices: IIndex[];
  color: string;
  supertypeId?: string | number | null;
  hidden?: boolean;
  inherits?: string[];
}

export interface IIndex {
  id: string | number;
  name: string;
  unique: boolean;
  fields: string[];
}

export interface IRelationship {
  id: string | number;
  name: string;
  startTableId: string | number;
  startFieldId: string | number;
  endTableId: string | number;
  endFieldId: string | number;
  cardinality: string;
  updateConstraint: string;
  deleteConstraint: string;
  identifying?: boolean;
  oneLabel?: string;
  reverseName?: string;
  manyLabel?: string;
  waypoints?: IWaypoint[];
  startXOffset?: number;
  endXOffset?: number;
  startYCorrection?: number;
  endYCorrection?: number;
  nameRotation?: number;
  labelOffsetX?: number;
  labelOffsetY?: number;
  labelRatio?: number;
}

export interface IWaypoint {
  x: number;
  y: number;
  mode: "waypoint" | "floating" | "divider";
  pathRatio?: number;
}

export interface IArea {
  id: string | number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  locked?: boolean;
}

export interface INote {
  id: string | number;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  locked?: boolean;
}

export interface IText {
  id: string | number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: string | number;
  color: string;
  locked?: boolean;
}

export interface IEnum {
  id: string | number;
  name: string;
  values: string[];
}

export interface ITypeField {
  id: string | number;
  name: string;
  type: string;
  size?: string | number;
  values?: string[];
}

export interface IDataType {
  type: string;
  color: string;
  checkDefault: (field: IField) => boolean;
  hasCheck?: boolean;
  isSized?: boolean;
  hasPrecision?: boolean;
  canIncrement?: boolean;
  hasQuotes?: boolean;
  noDefault?: boolean;
  defaultSize?: number;
}

export interface IDataTypes {
  [key: string]: IDataType;
}

export interface IType {
  id: string | number;
  name: string;
  fields: ITypeField[];
  comment: string;
}

export interface ITodo {
  id: string | number;
  text: string;
  done: boolean;
  priority: number;
}

export interface AreaProps {
  data: IArea;
  onPointerDown: (e: React.PointerEvent) => void;
  setResize: (resizeData: { id: string | number; dir: string }) => void;
  setInitDimensions: (dimensions: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}

export interface TableProps {
  tableData: ITable;
  onPointerDown: (e: React.PointerEvent) => void;
  handleGripField: () => void;
}

export interface RelationshipProps {
  data: IRelationship;
  onPointerDown: (e: React.PointerEvent) => void;
}

export interface NoteProps {
  data: INote;
  onPointerDown: (e: React.PointerEvent) => void;
}

export interface TextProps {
  data: IText;
  onPointerDown: (e: React.PointerEvent) => void;
}

export interface ILinkingLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTableId: string | number;
  startFieldId: string | number;
}

export interface IHoveredTable {
  tableId: string | number | null;
  fieldId: string | number | null;
}

export interface IGroup {
  id: string | number;
  label: string;
  parentTableId: string | number;
  childRelationshipIds: (string | number)[];
}

import { Dispatch, SetStateAction } from "react";
import { ITable, IRelationship, IField, IGroup, ILinkingLine, IHoveredTable } from "./index";

export interface IDiagram {
  tables: ITable[];
  relationships: IRelationship[];
  notes: INote[];
  texts: IText[];
  areas: IArea[];
  subjectAreas?: IArea[];
  xorGroups?: IGroup[];
  orGroups?: IGroup[];
  enums?: IEnum[];
  types?: IType[];
}

export interface PartialDiagram {
  tables?: ITable[];
  relationships?: IRelationship[];
  notes?: INote[];
  texts?: IText[];
  areas?: IArea[];
  subjectAreas?: IArea[];
}

export interface ThumbnailProps {
  diagram: IDiagram | PartialDiagram;
  i: string | number;
  zoom: number;
  theme: string;
}

export interface SimpleCanvasProps {
  diagram: IDiagram;
  zoom: number;
}

export interface IDragging {
  id: string | number;
  type: number;
  grabOffset: { x: number; y: number };
}

export interface IPanning {
  isPanning: boolean;
  panStart: { x: number; y: number };
  cursorStart: { x: number; y: number };
}

export interface IAreaResize {
  id: string | number;
  dir: string;
}

export interface IAreaInitDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IIdContext {
  gistId: string;
  setGistId: (id: string) => void;
  version: string;
  setVersion: (v: string) => void;
}

export interface ControlPanelProps {
  diagramId: string | number;
  setDiagramId: React.Dispatch<React.SetStateAction<string | number>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  lastSaved: string;
}

export interface SidePanelProps {
  width: number;
  resize: boolean;
  setResize: (resize: boolean) => void;
}

export interface TableInfoProps {
  data: ITable;
}

export interface TableFieldProps {
  data: IField;
  tid: string | number;
  index: number;
  inherited?: boolean;
}

export interface EnumDetailsProps {
  data: IEnum;
}

export interface IExportData {
  data?: string | Blob;
  filename?: string;
  extension?: string;
}

export interface IImportData {
  database?: string;
  tables?: ITable[];
  relationships?: IRelationship[];
  notes?: INote[];
  areas?: IArea[];
  enums?: IEnum[];
  types?: IType[];
}

export interface ModalProps {
  modal: number;
  setModal: (modal: number) => void;
  title: string;
  setTitle: (title: string) => void;
  setDiagramId: (id: string | number) => void;
  exportData: IExportData;
  setExportData: React.Dispatch<React.SetStateAction<IExportData>>;
  importDb: string;
  importFrom: number;
  settingsTab?: string;
  settingsOption?: string;
}

export interface ImportDiagramProps {
  setImportData: (data: IImportData) => void;
  error: { type: number; message: string };
  setError: (error: { type: number; message: string }) => void;
  importFrom: number;
}

export interface ImportSourceProps {
  importData: { src: string; overwrite: boolean };
  setImportData: React.Dispatch<React.SetStateAction<{ src: string; overwrite: boolean }>>;
  error: { type: number; message: string };
  setError: (error: { type: number; message: string }) => void;
}

export interface NewProps {
  selectedTemplateId: number;
  setSelectedTemplateId: (id: number) => void;
}

export interface OpenProps {
  selectedDiagramId: string | number;
  setSelectedDiagramId: (id: string | number) => void;
}

export interface RenameProps {
  title: string;
  setTitle: (title: string) => void;
}

export interface ShareProps {
  title: string;
  setModal: (modal: number) => void;
}

export interface FieldDetailsProps {
  data: IField;
  tid: string | number;
}

export interface IndexDetailsProps {
  data: IIndex;
  fields: { label: string; value: string | number }[];
  iid: string | number;
  tid: string | number;
}

export interface TypeInfoProps {
  index: number;
  data: IType;
}

export interface TypeFieldProps {
  data: ITypeField;
  tid: string | number;
  fid: number;
}

export interface NoteInfoProps {
  data: INote;
  nid: string | number;
}

export interface AreaInfoProps {
  data: IArea;
  i: number;
}

export interface TextInfoProps {
  data: IText;
}

export interface RelationshipInfoProps {
  data: IRelationship;
}


export interface DiagramContextType {
  tables: ITable[];
  setTables: Dispatch<SetStateAction<ITable[]>>;
  addTable: (data?: { table: ITable; index: number }, addToHistory?: boolean) => void;
  updateTable: (id: string | number, updatedValues: Partial<ITable>, addToHistory?: boolean) => void;
  updateField: (tid: string | number, fid: string | number, updatedValues: Partial<IField>) => void;
  deleteField: (field: IField, tid: string | number, addToHistory?: boolean) => void;
  deleteTable: (id: string | number, addToHistory?: boolean) => void;
  relationships: IRelationship[];
  setRelationships: Dispatch<SetStateAction<IRelationship[]>>;
  addRelationship: (data: IRelationship | { relationship: IRelationship; index: number }, addToHistory?: boolean) => void;
  deleteRelationship: (id: string | number, addToHistory?: boolean) => void;
  updateRelationship: (id: string | number, updatedValues: Partial<IRelationship>) => void;
  xorGroups: IGroup[];
  setXorGroups: Dispatch<SetStateAction<IGroup[]>>;
  addXorGroup: (data: Partial<IGroup>, addToHistory?: boolean) => void;
  deleteXorGroup: (id: string | number, addToHistory?: boolean) => void;
  updateXorGroup: (id: string | number, updatedValues: Partial<IGroup>) => void;
  orGroups: IGroup[];
  setOrGroups: Dispatch<SetStateAction<IGroup[]>>;
  addOrGroup: (data: Partial<IGroup>, addToHistory?: boolean) => void;
  deleteOrGroup: (id: string | number, addToHistory?: boolean) => void;
  updateOrGroup: (id: string | number, updatedValues: Partial<IGroup>) => void;
  convertXorToOr: (id: string | number) => void;
  convertOrToXor: (id: string | number) => void;
  database: string;
  setDatabase: Dispatch<SetStateAction<string>>;
  tablesCount: number;
  relationshipsCount: number;
  linking: boolean;
  setLinking: Dispatch<SetStateAction<boolean>>;
  linkingLine: ILinkingLine;
  setLinkingLine: Dispatch<SetStateAction<ILinkingLine>>;
  hoveredTable: IHoveredTable;
  setHoveredTable: Dispatch<SetStateAction<IHoveredTable>>;
  relationshipType: string;
  setRelationshipType: Dispatch<SetStateAction<string>>;
}

export interface GroupInfoProps {
  data: {
    id: string | number;
    label: string;
    parentTableId: string | number;
    childRelationshipIds: (string | number)[];
  };
}
