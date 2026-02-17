import React, { useMemo } from "react";
import { ObjectType, Tab } from "@data/constants";
import Table from "./Table";
import Note from "./Note";
import Text, { TextEditPopover, TextHeader } from "./Text";
import { ITable, IArea, INote, IText, IAreaResize, IAreaInitDimensions } from "@types";
import { CanvasObject } from "./common/CanvasObject";
import { useTexts, useLayout } from "@hooks";
import { getTextWidth } from "@utils/utils";
import Area from "@components/EditorCanvas/Area";

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
  const { updateText, deleteText } = useTexts();
  const { layout } = useLayout();

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

  const renderedTables = useMemo(() => {
    const sortedTables = [...tables].sort((a, b) => {
      if (!a || !b) return 0;
      const aHasSuper = a.supertypeId !== null && a.supertypeId !== undefined;
      const bHasSuper = b.supertypeId !== null && b.supertypeId !== undefined;
      if (!aHasSuper && bHasSuper) return -1;
      if (aHasSuper && !bHasSuper) return 1;
      return 0;
    });

    return sortedTables.map((table) => table && (
      <Table
        key={table.id}
        tableData={table}
        handleGripField={handleGripField}
        onPointerDown={setElementPointerDown(table, ObjectType.TABLE)}
      />
    ));
  }, [tables, handleGripField, setElementPointerDown]);

  const renderedTexts = useMemo(() => texts.map((t) => {
    if (!t) return null;
    
    const width = getTextWidth(t.text, `${t.fontWeight} ${t.fontSize}px sans-serif`);
    
    return (
      <CanvasObject
        key={t.id}
        data={{
          ...t, 
          width: width, 
          height: t.fontSize + 4,
          x: t.x,
          y: t.y - t.fontSize
        }}
        objectType={ObjectType.TEXT}
        tab={Tab.TEXT}
        scrollIdPrefix="scroll_text_"
        updateCallback={updateText}
        popoverContent={<TextEditPopover data={t} />}
        showResizeHandles={false}
        showRotationHandle={true}
      >
        {({ isSelected, isHovered, isOpen, edit }) => (
          <>
            <g onDoubleClick={edit} transform={`translate(${t.x}, ${t.y - t.fontSize})`}>
              <Text
                data={t}
                onPointerDown={setElementPointerDown(t, ObjectType.TEXT)}
              />
              {(isSelected || (isHovered && !layout.readOnly)) && (
                <TextHeader data={t} width={width} edit={edit} deleteText={deleteText} />
              )}
            </g>
          </>
        )}
      </CanvasObject>
    );
  }), [texts, setElementPointerDown, updateText, layout.readOnly, deleteText]);

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
