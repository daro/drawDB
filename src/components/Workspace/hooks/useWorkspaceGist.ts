import { useCallback } from "react";
import { get, SHARE_FILENAME } from "@/api/gists";
import { DB, tableWidth } from "@data/constants";
import { databases } from "@data/databases";
import { getTableHeight } from "@utils/utils";
import { nanoid } from "nanoid";

export const useWorkspaceGist = ({
  setDatabase,
  setId,
  setGistId,
  setLoadedFromGistId,
  setTitle,
  setTables,
  setRelationships,
  setXorGroups,
  setOrGroups,
  setAreas,
  setNotes,
  setTexts,
  setTasks,
  setTransform,
  setUndoStack,
  setRedoStack,
  setTypes,
  setEnums,
  database,
  t,
}: any) => {

  const loadGist = useCallback(async (gistId: string) => {
    get(gistId).then((gist: any) => {
      if (gist.files[SHARE_FILENAME]) {
        const d = JSON.parse(gist.files[SHARE_FILENAME].content);
        if (d) {
          if (d.database) {
            setDatabase(d.database);
          } else {
            setDatabase(DB.GENERIC);
          }
          setId(0);
          setGistId(gistId);
          setLoadedFromGistId(gistId);
          setTitle(d.name);
          setTables(
            d.tables.map((t: any) => ({
              ...t,
              width: t.width ?? tableWidth,
              height: t.height ?? getTableHeight(t),
              x: t.x ?? 0,
              y: t.y ?? 0,
            })),
          );
          setRelationships(d.references);
          setXorGroups(d.xorGroups ?? []);
          setOrGroups(d.orGroups ?? []);
          setAreas(d.areas ?? []);
          setNotes(d.notes ?? []);
          setTexts(d.texts ?? []);
          setTasks(d.todos ?? []);
          setTransform({ pan: d.pan, zoom: d.zoom });
          setUndoStack([]);
          setRedoStack([]);
          if (databases[database].hasTypes) {
            if (d.types) {
              setTypes(
                d.types.map((t: any) =>
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
            } else {
              setTypes([]);
            }
          }
          if (databases[database].hasEnums) {
            setEnums(
              (d.enums || []).map((e: any) => (!e.id ? { ...e, id: nanoid() } : e)),
            );
          }
          window.name = "";
        }
      }
    });
  }, [
    setDatabase,
    setId,
    setGistId,
    setLoadedFromGistId,
    setTitle,
    setTables,
    setRelationships,
    setXorGroups,
    setOrGroups,
    setAreas,
    setNotes,
    setTexts,
    setTasks,
    setTransform,
    setUndoStack,
    setRedoStack,
    setTypes,
    setEnums,
    database,
  ]);

  return { loadGist };
};
