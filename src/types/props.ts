import React, { Dispatch, SetStateAction } from "react";
import {
  IArea,
  ITable,
  IRelationship,
  INote,
  IText,
  IField,
  IEnum,
  IType,
  IDiagram,
  PartialDiagram,
  IImportData,
  IExportData,
  ILinkingLine,
  IHoveredTable,
  ITypeField,
  IIndex,
} from "./index";

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

export interface ModalProps {
  modal: number;
  setModal: Dispatch<SetStateAction<number>>
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
