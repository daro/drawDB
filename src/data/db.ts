import Dexie, { Table } from "dexie";
import { templateSeeds } from "./seeds";
import type {
  ITable,
  IRelationship,
  INote,
  IText,
  IArea,
  ITodo,
  IEnum,
  IType,
} from "@types";

export interface IGroup {
  id: string | number;
  label: string;
  parentTableId: string | number;
  childRelationshipIds: (string | number)[];
}

export interface DiagramData {
  id?: number;
  database: string;
  name: string;
  gistId?: string;
  lastModified: Date;
  tables: ITable[];
  references: IRelationship[];
  xorGroups?: IGroup[];
  orGroups?: IGroup[];
  notes: INote[];
  texts: IText[];
  areas: IArea[];
  todos: ITodo[];
  pan: { x: number; y: number };
  zoom: number;
  loadedFromGistId?: string;
  enums?: IEnum[];
  types?: IType[];
}

export interface TemplateData {
  id?: number;
  custom?: boolean;
  database?: string;
  title: string;
  tables: ITable[];
  relationships: IRelationship[];
  notes: INote[];
  texts?: IText[];
  subjectAreas: IArea[];
  todos?: ITodo[];
  pan?: { x: number; y: number };
  zoom?: number;
  xorGroups?: IGroup[];
  orGroups?: IGroup[];
  enums?: IEnum[];
  types?: IType[];
}

export class DrawDBDatabase extends Dexie {
  diagrams!: Table<DiagramData, number>;
  templates!: Table<TemplateData, number>;

  constructor() {
    super("drawDB");
    this.version(6).stores({
      diagrams: "++id, lastModified, loadedFromGistId",
      templates: "++id, custom",
    });

    this.on("populate", (transaction) => {
      const templatesTable = (transaction as unknown as DrawDBDatabase).templates;
      templatesTable.bulkAdd(templateSeeds).catch((e: Error) => console.log(e));
    });
  }
}

export const db = new DrawDBDatabase();
