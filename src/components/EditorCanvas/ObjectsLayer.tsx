import React, { useMemo } from "react";
import { ObjectType } from "../../data/constants";
import Table from "./Table";
import Note from "./Note";
import Text from "./Text";
import Area from "./Area";
import { ITable, IArea, INote, IText, IAreaResize, IAreaInitDimensions } from "../../types";

/**
 * Props for the ObjectsLayer component.
 */
interface ObjectsLayerProps {
  /** Array of table objects to render. */
  tables: ITable[];
  /** Array of subject area objects to render. */
  areas: IArea[];
  /** Array of note objects to render. */
  notes: INote[];
  /** Array of text objects to render. */
  texts: IText[];
  /** Callback to handle pointer down on an element. */
  setElementPointerDown: (element: any, type: number) => (e: React.PointerEvent) => void;
  /** Callback to handle field grip for linking. */
  handleGripField: () => void;
  /** Callback to handle area resize initiation. */
  setAreaResizeCallback: (val: IAreaResize) => void;
  /** Callback to store initial area dimensions before resize. */
  setAreaInitDimensionsCallback: (val: IAreaInitDimensions) => void;
}

/**
 * ObjectsLayer component renders the main diagram objects: areas, notes, tables, and texts.
 * It uses React.memo and useMemo to optimize rendering of large object sets.
 *
 * @param props - Component props.
 * @returns Rendered SVG elements.
 */
const ObjectsLayer: React.FC<ObjectsLayerProps> = ({
  tables,
  areas,
  notes,
  texts,
  setElementPointerDown,
  handleGripField,
  setAreaResizeCallback,
  setAreaInitDimensionsCallback,
}) => {
  const renderedAreas = useMemo(() => areas.map((a) => a && (
    <Area
      key={a.id}
      data={a}
      setResize={setAreaResizeCallback}
      setInitDimensions={setAreaInitDimensionsCallback}
      onPointerDown={setElementPointerDown(a, ObjectType.AREA)}
    />
  )), [areas, setAreaResizeCallback, setAreaInitDimensionsCallback, setElementPointerDown]);

  const renderedNotes = useMemo(() => notes.map((n) => n && (
    <Note
      key={n.id}
      data={n}
      onPointerDown={setElementPointerDown(n, ObjectType.NOTE)}
    />
  )), [notes, setElementPointerDown]);

  const renderedTables = useMemo(() => tables.map((table) => table && (
    <Table
      key={table.id}
      tableData={table}
      handleGripField={handleGripField}
      onPointerDown={setElementPointerDown(table, ObjectType.TABLE)}
    />
  )), [tables, handleGripField, setElementPointerDown]);

  const renderedTexts = useMemo(() => texts.map((t) => t && (
    <Text
      key={t.id}
      data={t}
      onPointerDown={setElementPointerDown(t, ObjectType.TEXT)}
    />
  )), [texts, setElementPointerDown]);

  return (
    <>
      {renderedAreas}
      {renderedNotes}
      {renderedTables}
      {renderedTexts}
    </>
  );
};

export default React.memo(ObjectsLayer);
