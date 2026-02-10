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

export interface IGroup {
  id: string | number;
  label: string;
  parentTableId: string | number;
  childRelationshipIds: (string | number)[];
}

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

export interface GroupInfoProps {
  data: {
    id: string | number;
    label: string;
    parentTableId: string | number;
    childRelationshipIds: (string | number)[];
  };
}
