import { useState, useRef } from "react";
import { Button, Collapse, TextArea, Input } from "@douyinfe/semi-ui";
import ColorPicker from "../ColorPicker";
import { IconDeleteStroked } from "@douyinfe/semi-icons";
import { Action, ObjectType } from "@data/constants";
import { useLayout, useNotes, useUndoRedo } from "@hooks";
import { useTranslation } from "react-i18next";
import ColorList from "../../ColorList";

import { INote, NoteInfoProps } from "@types";

export default function NoteInfo({ data, nid }: NoteInfoProps) {
  const { layout } = useLayout();
  const { updateNote, deleteNote } = useNotes();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const [editField, setEditField] = useState<Partial<INote>>({});
  const { t } = useTranslation();
  const initialColorRef = useRef(data.color);

  const handleColorPick = (color: string) => {
    setUndoStack((prev) => {
      let undoColor = initialColorRef.current;
      const lastColorChange = [...prev]
        .reverse()
        .find(
          (e) =>
            e.element === ObjectType.NOTE &&
            e.nid === data.id &&
            e.action === Action.EDIT &&
            e.redo?.color,
        );
      if (lastColorChange) {
        undoColor = lastColorChange.redo!.color!;
      }

      if (color === undoColor) return prev;

      const newStack = [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.NOTE,
          nid: data.id,
          undo: { color: undoColor },
          redo: { color: color },
          message: t("edit_note", {
            noteTitle: data.title,
            extra: "[color]",
          }),
        },
      ];
      return newStack;
    });
    setRedoStack([]);
  };


  return (
    <Collapse.Panel
      header={
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          {data.title}
        </div>
      }
      itemKey={`${data.id}`}
    >
      <div id={`scroll_note_${data.id}`}></div>
      <div className="flex items-center mb-2">
        <div className="font-semibold me-2 break-keep">{t("title")}:</div>
        <Input
          value={data.title}
          readOnly={layout.readOnly}
          placeholder={t("title")}
          onChange={(value) => updateNote(data.id, { title: value })}
          onFocus={(e) => setEditField({ title: (e.target as HTMLInputElement).value })}
          onBlur={(e) => {
            if ((e.target as HTMLInputElement).value === editField.title) return;
            setUndoStack((prev) => [
              ...prev,
              {
                action: Action.EDIT,
                element: ObjectType.NOTE,
                nid: data.id,
                undo: editField,
                redo: { title: (e.target as HTMLInputElement).value },
                message: t("edit_note", {
                  noteTitle: (e.target as HTMLInputElement).value,
                  extra: "[title]",
                }),
              },
            ]);
            setRedoStack([]);
          }}
        />
      </div>
      <div className="flex justify-between align-top">
        <TextArea
          placeholder={t("content")}
          value={data.content}
          autosize
          readOnly={layout.readOnly}
          onChange={(value) => {
            const textarea = document.getElementById(`note_${data.id}`);
            if (textarea) {
              textarea.style.height = "0";
              textarea.style.height = textarea.scrollHeight + "px";
              const newHeight = textarea.scrollHeight + 16 + 20 + 4;
              updateNote(data.id, { height: newHeight, content: value });
            }
          }}
          onFocus={(e) =>
            setEditField({ content: (e.target as HTMLTextAreaElement).value, height: data.height })
          }
          onBlur={(e) => {
            if ((e.target as HTMLTextAreaElement).value === editField.content) return;
            const textarea = document.getElementById(`note_${data.id}`);
            if (textarea) {
              textarea.style.height = "0";
              textarea.style.height = textarea.scrollHeight + "px";
              const newHeight = textarea.scrollHeight + 16 + 20 + 4;
              setUndoStack((prev) => [
                ...prev,
                {
                  action: Action.EDIT,
                  element: ObjectType.NOTE,
                  nid: nid,
                  undo: editField,
                  redo: { content: (e.target as HTMLTextAreaElement).value, height: newHeight },
                  message: t("edit_note", {
                    noteTitle: (e.target as HTMLTextAreaElement).value,
                    extra: "[content]",
                  }),
                },
              ]);
              setRedoStack([]);
            }
          }}
          rows={3}
        />
        <div className="ms-2 flex flex-col gap-2">
          <ColorPicker
            usePopover={true}
            readOnly={layout.readOnly}
            value={data.color || "#fcf7ac"}
            onChange={(color) => updateNote(data.id, { color: color || "#fcf7ac" })}
            onColorPick={(color) => handleColorPick(color || "#fcf7ac")}
          />
          <Button
            type="danger"
            disabled={layout.readOnly}
            icon={<IconDeleteStroked />}
            onClick={() => deleteNote(nid, true)}
            {...({} as any)}
          />
        </div>
      </div>
      <div className="mt-3">
        <ColorList
          currentColor={data.color}
          onColorClick={(color) => {
            handleColorPick(color);
            updateNote(data.id, { color: color });
          }}
        />
      </div>
    </Collapse.Panel>
  );
}
