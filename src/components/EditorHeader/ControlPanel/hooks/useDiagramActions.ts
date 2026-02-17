import { useCallback } from "react";
import { Toast } from "@douyinfe/semi-ui";
import { db } from "@data/db";
import { DB, State } from "@data/constants";
import { databases } from "@data/databases.js";
import { nanoid } from "nanoid";

import { useLiveQuery } from "dexie-react-hooks";

export const useDiagramActions = ({
  diagramId,
  setDiagramId,
  title,
  setTitle,
  setTables,
  setRelationships,
  setAreas,
  setNotes,
  setTypes,
  setEnums,
  setDatabase,
  setGistId,
  setTransform,
  setUndoStack,
  setRedoStack,
  setTasks,
  setSaveState,
  tables,
  relationships,
  areas,
  notes,
  enums,
  types,
  database,
  t,
}: any) => {
  const save = useCallback(() => setSaveState(State.SAVING), [setSaveState]);

  const loadDiagram = useCallback(
    async (id: any) => {
      await (db as any).diagrams
        .get(id)
        .then((diagram: any) => {
          if (diagram) {
            if (diagram.database) {
              setDatabase(diagram.database);
            } else {
              setDatabase(DB.GENERIC);
            }
            setDiagramId(diagram.id as any);
            setTitle(diagram.name);
            setTables(diagram.tables);
            setRelationships(diagram.references);
            setAreas(diagram.areas);
            setGistId(diagram.gistId ?? "");
            setNotes(diagram.notes);
            setTasks(diagram.todos ?? []);
            setTransform({
              pan: diagram.pan,
              zoom: diagram.zoom,
            });
            setUndoStack([]);
            setRedoStack([]);
            if (databases[diagram.database].hasTypes) {
              setTypes(
                diagram.types.map((t: any) =>
                  t.id
                    ? t
                    : {
                        ...t,
                        id: nanoid(),
                        fields: t.fields.map((f: any) =>
                          f.id ? f : { ...f, id: nanoid() },
                        ),
                      },
                ),
              );
            }
            if (databases[diagram.database].hasEnums) {
              setEnums(
                diagram.enums.map((e: any) =>
                  !e.id ? { ...e, id: nanoid() } : e,
                ) ?? [],
              );
            }
            window.name = `d ${diagram.id}`;
          } else {
            window.name = "";
            Toast.error(t("didnt_find_diagram"));
          }
        })
        .catch((error: any) => {
          console.log(error);
          Toast.error(t("didnt_find_diagram"));
        });
    },
    [
      setDatabase,
      setDiagramId,
      setTitle,
      setTables,
      setRelationships,
      setAreas,
      setGistId,
      setNotes,
      setTasks,
      setTransform,
      setUndoStack,
      setRedoStack,
      setTypes,
      setEnums,
      t,
    ],
  );

  const saveDiagramAsTemplate = useCallback(() => {
    (db as any).templates
      .add({
        title: title,
        tables: tables,
        database: database,
        relationships: relationships,
        notes: notes,
        subjectAreas: areas,
        custom: 1,
        ...(databases[database].hasEnums && { enums: enums }),
        ...(databases[database].hasTypes && { types: types }),
      })
      .then(() => {
        Toast.success(t("template_saved"));
      });
  }, [title, tables, database, relationships, notes, areas, enums, types, t]);

  const delDiagram = useCallback(async () => {
    await (db as any).diagrams
      .delete(diagramId)
      .then(() => {
        setDiagramId("");
        setTitle("Untitled diagram");
        setTables([]);
        setRelationships([]);
        setAreas([]);
        setNotes([]);
        setTypes([]);
        setEnums([]);
        setUndoStack([]);
        setRedoStack([]);
        setGistId("");
      })
      .catch(() => Toast.error(t("oops_smth_went_wrong")));
  }, [
    diagramId,
    setDiagramId,
    setTitle,
    setTables,
    setRelationships,
    setAreas,
    setNotes,
    setTypes,
    setEnums,
    setUndoStack,
    setRedoStack,
    setGistId,
    t,
  ]);

  const recentlyOpenedDiagrams = useLiveQuery(() =>
    (db as any).diagrams.orderBy("lastModified").reverse().limit(10).toArray(),
  );

  return {
    save,
    loadDiagram,
    saveDiagramAsTemplate,
    delDiagram,
    recentlyOpenedDiagrams,
  };
};
