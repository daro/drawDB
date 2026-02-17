import React, { useMemo, useEffect } from "react";
import { ObjectType, NOTE_CONFIG, Tab } from "@data/constants";
import { Input, Button } from "@douyinfe/semi-ui";
import ColorPicker from "../../EditorSidePanel/ColorPicker";
import {
  IconEdit,
  IconDeleteStroked,
  IconLock,
  IconUnlock,
} from "@douyinfe/semi-icons";
import {
  useLayout,
  useSettings,
  useNotes,
  useSelect,
} from "@hooks";
import { useTranslation } from "react-i18next";
import ColorList from "../../ColorList";
import { INote, NoteProps } from "@types";
import { useNoteEdit } from "./hooks/useNoteEdit";
import { CanvasObject } from "../common/CanvasObject";
import { PathCommander } from "@utils/path/PathCommander";
import { getNoteGeometry } from "@utils/path/noteGeometry";

/**
 * A component that renders a note on the canvas.
 * Notes can be resized, edited, and contain arbitrary text.
 * 
 * @param {NoteProps} props - The component props.
 * @returns {JSX.Element} The rendered note.
 */
function Note({ data, onPointerDown }: NoteProps) {
  const { layout } = useLayout();
  const { updateNote } = useNotes();
  const { emitSelect } = useSelect();

  const {
    editField,
    setEditField,
    handleColorPick,
    handleChange,
    handleBlur,
    handleTitleBlur,
  } = useNoteEdit(data);

  const lockUnlockNote = (e: React.MouseEvent) => {
    updateNote(data.id, { locked: !data.locked });
  };

  useEffect(() => {
    const textarea = document.getElementById(`note_${data.id}`);
    if (!textarea) return;

    textarea.style.height = "0";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = scrollHeight + "px";
    const newHeight = scrollHeight + 42;

    if (newHeight === data.height) return;

    updateNote(data.id, { height: newHeight });
  }, [data.id, data.height, updateNote]);

  const width = data.width ?? NOTE_CONFIG.WIDTH;

  const { mainSegments, foldSegments } = useMemo(
    () => getNoteGeometry(data.x, data.y, width, data.height),
    [data.x, data.y, width, data.height]
  );

  return (
    <CanvasObject
      data={data}
      objectType={ObjectType.NOTE}
      tab={Tab.NOTES}
      scrollIdPrefix="scroll_note_"
      updateCallback={updateNote}
      popoverContent={
        <EditPopoverContent
          data={data}
          editField={editField}
          setEditField={setEditField}
          handleColorPick={handleColorPick}
          handleTitleBlur={handleTitleBlur}
          updateNote={updateNote}
        />
      }
      minWidth={120}
      resizeDirections={["l", "r"]}
    >
      {({ isSelected, isHovered, isOpen, edit }) => (
        <>
          <path
            d={PathCommander.pathToString(mainSegments)}
            fill={data.color}
            stroke="rgb(168 162 158)"
            strokeLinejoin="round"
            strokeWidth="1"
          />
          <path
            d={PathCommander.pathToString(foldSegments)}
            fill={data.color}
            stroke="rgb(168 162 158)"
            strokeLinejoin="round"
            strokeWidth="1"
          />

          <foreignObject
            x={data.x}
            y={data.y}
            width={width}
            height={data.height}
            onPointerDown={(e) => {
              if (e.defaultPrevented) return;
              emitSelect(data.id, ObjectType.NOTE, e);
            }}
          >
            <div className="text-gray-900 select-none w-full h-full cursor-move px-3 py-2 outline-none">
              <div className="flex justify-between gap-1 w-full">
                <label
                  htmlFor={`note_${data.id}`}
                  className="ms-5 overflow-hidden text-ellipsis"
                >
                  {data.title}
                </label>
                {(isHovered || (isOpen && !layout.sidebar)) && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      icon={data.locked ? <IconLock /> : <IconUnlock />}
                      size="small"
                      theme="solid"
                      style={{ backgroundColor: "#2F68ADB3" }}
                      onClick={lockUnlockNote}
                      disabled={layout.readOnly}
                    />
                    <Button
                      icon={<IconEdit />}
                      size="small"
                      theme="solid"
                      style={{ backgroundColor: "#2F68ADB3" }}
                      onClick={edit}
                    />
                  </div>
                )}
              </div>
              <textarea
                id={`note_${data.id}`}
                readOnly={layout.readOnly}
                value={data.content}
                onChange={handleChange}
                onFocus={(e) =>
                  setEditField({
                    content: e.target.value,
                    height: data.height,
                  })
                }
                onBlur={handleBlur}
                className="w-full resize-none outline-none overflow-y-hidden border-none select-none"
                style={{ backgroundColor: data.color }}
              />
            </div>
          </foreignObject>
        </>
      )}
    </CanvasObject>
  );
}

export default React.memo(Note);

function EditPopoverContent({
  data,
  editField,
  setEditField,
  handleColorPick,
  handleTitleBlur,
  updateNote,
}: {
  data: INote;
  editField: { title?: string; content?: string; height?: number };
  setEditField: (field: { title?: string; content?: string; height?: number }) => void;
  handleColorPick: (color: string) => void;
  handleTitleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  updateNote: (id: string | number, updates: Partial<INote>) => void;
}) {
  const { t } = useTranslation();
  const { layout } = useLayout();
  const { deleteNote } = useNotes();

  return (
    <div className="popover-theme">
      <div className="font-semibold mb-2 ms-1">{t("edit")}</div>
      <div className="w-[280px] flex items-center mb-2">
        <Input
          value={data.title}
          placeholder={t("title")}
          className="me-2"
          readOnly={layout.readOnly}
          onChange={(value) => updateNote(data.id, { title: value })}
          onFocus={(e) => setEditField({ title: e.target.value })}
          onBlur={handleTitleBlur}
        />
        <ColorPicker
          usePopover={true}
          readOnly={layout.readOnly}
          value={data.color || "#fcf7ac"}
          onChange={(color) =>
            updateNote(data.id, { color: color || "#fcf7ac" })
          }
          onColorPick={(color) => handleColorPick(color || "#fcf7ac")}
        />
      </div>
      <ColorList
        currentColor={data.color}
        onColorClick={(color) => {
          handleColorPick(color);
          updateNote(data.id, { color: color });
        }}
      />
      <div className="flex">
        <Button
          block
          type="danger"
          disabled={layout.readOnly}
          icon={<IconDeleteStroked />}
          onClick={() => deleteNote(data.id, true)}
        >
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}
