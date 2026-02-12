import { useCallback } from "react";
import { db, DiagramData } from "../data/db";
import { DB, State, tableWidth } from "../data/constants";
import { databases } from "../data/databases";
import { getTableHeight } from "../utils/utils";
import { nanoid } from "nanoid";

export const useWorkspacePersistence = ({
  id,
  setId,
  title,
  setTitle,
  database,
  setDatabase,
  tables,
  setTables,
  relationships,
  setRelationships,
  xorGroups,
  setXorGroups,
  orGroups,
  setOrGroups,
  notes,
  setNotes,
  texts,
  setTexts,
  areas,
  setAreas,
  tasks,
  setTasks,
  transform,
  setTransform,
  enums,
  setEnums,
  types,
  setTypes,
  gistId,
  setGistId,
  loadedFromGistId,
  setLoadedFromGistId,
  setSaveState,
  setLastSaved,
  setUndoStack,
  setRedoStack,
  searchParams,
  setSearchParams,
  setSelectedDb,
  setShowSelectDbModal,
}: any) => {

  const save = useCallback(async () => {
    const name = window.name.split(" ");
    const op = name[0];
    const saveAsDiagram = window.name === "" || op === "d" || op === "lt";

    if (saveAsDiagram) {
      if (searchParams.has("shareId")) {
        searchParams.delete("shareId");
        setSearchParams(searchParams, { replace: true });
      }
      if ((id === 0 && window.name === "") || op === "lt") {
        await (db as any).diagrams
          .add({
            database: database,
            name: title,
            gistId: gistId ?? "",
            lastModified: new Date(),
            tables: tables,
            references: relationships,
            xorGroups: xorGroups,
            orGroups: orGroups,
            notes: notes,
            texts: texts,
            areas: areas,
            todos: tasks,
            pan: transform.pan,
            zoom: transform.zoom,
            loadedFromGistId: loadedFromGistId,
            ...(databases[database].hasEnums && { enums: enums }),
            ...(databases[database].hasTypes && { types: types }),
          })
          .then((id: number) => {
            setId(id);
            window.name = `d ${id}`;
            setSaveState(State.SAVED);
            setLastSaved(new Date().toLocaleString());
          });
      } else {
        await (db as any).diagrams
          .update(typeof id === 'number' ? id : parseInt(String(id)), {
            database: database,
            name: title,
            lastModified: new Date(),
            tables: tables,
            references: relationships,
            xorGroups: xorGroups,
            orGroups: orGroups,
            notes: notes,
            texts: texts,
            areas: areas,
            todos: tasks,
            gistId: gistId ?? "",
            pan: transform.pan,
            zoom: transform.zoom,
            loadedFromGistId: loadedFromGistId,
            ...(databases[database].hasEnums && { enums: enums }),
            ...(databases[database].hasTypes && { types: types }),
          })
          .then(() => {
            setSaveState(State.SAVED);
            setLastSaved(new Date().toLocaleString());
          });
      }
    } else {
      await (db as any).templates
        .update(typeof id === 'number' ? id : parseInt(String(id)), {
          database: database,
          title: title,
          tables: tables,
          relationships: relationships,
          notes: notes,
          texts: texts,
          subjectAreas: areas,
          todos: tasks,
          pan: transform.pan,
          zoom: transform.zoom,
          ...(databases[database].hasEnums && { enums: enums }),
          ...(databases[database].hasTypes && { types: types }),
        })
        .then(() => {
          setSaveState(State.SAVED);
          setLastSaved(new Date().toLocaleString());
        })
        .catch(() => {
          setSaveState(State.ERROR);
        });
    }
  }, [
    searchParams,
    setSearchParams,
    tables,
    relationships,
    xorGroups,
    orGroups,
    notes,
    areas,
    types,
    title,
    id,
    tasks,
    transform,
    setSaveState,
    database,
    enums,
    gistId,
    loadedFromGistId,
    setLastSaved,
    setId,
    texts
  ]);

  const loadLatestDiagram = useCallback(async () => {
    await (db as any).diagrams
      .orderBy("lastModified")
      .last()
      .then((d: any) => {
        if (d) {
          if (d.database) {
            setDatabase(d.database);
          } else {
            setDatabase(DB.GENERIC);
          }
          setId(d.id);
          setGistId(d.gistId);
          setLoadedFromGistId(d.loadedFromGistId);
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
          setNotes(d.notes ?? []);
          setTexts(d.texts ?? []);
          setAreas(d.areas ?? []);
          setTasks(d.todos ?? []);
          setTransform({ pan: d.pan, zoom: d.zoom });
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
          window.name = `d ${d.id}`;
        } else {
          window.name = "";
          // Note: setSelectedDb and setShowSelectDbModal logic might need careful integration
          if (setSelectedDb) {
            setShowSelectDbModal(true);
          }
        }
      })
      .catch((error: Error) => {
        console.log(error);
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
    setNotes,
    setTexts,
    setAreas,
    setTasks,
    setTransform,
    setTypes,
    setEnums,
    database,
    setShowSelectDbModal,
    setSelectedDb
  ]);

  const loadDiagram = useCallback(async (id: number) => {
    await (db as any).diagrams
      .get(id)
      .then((diagram: DiagramData | undefined) => {
        if (diagram) {
          if (diagram.database) {
            setDatabase(diagram.database);
          } else {
            setDatabase(DB.GENERIC);
          }
          setId(diagram.id);
          setGistId(diagram.gistId);
          setLoadedFromGistId(diagram.loadedFromGistId);
          setTitle(diagram.name);
          setTables(
            diagram.tables.map((t: any) => ({
              ...t,
              width: t.width ?? tableWidth,
              height: t.height ?? getTableHeight(t),
              x: t.x ?? 0,
              y: t.y ?? 0,
            })),
          );
          setRelationships(diagram.references);
          setXorGroups(diagram.xorGroups ?? []);
          setOrGroups(diagram.orGroups ?? []);
          setAreas(diagram.areas ?? []);
          setNotes(diagram.notes ?? []);
          setTexts(diagram.texts ?? []);
          setTasks(diagram.todos ?? []);
          setTransform({
            pan: diagram.pan,
            zoom: diagram.zoom,
          });
          setUndoStack([]);
          setRedoStack([]);
          if (databases[database].hasTypes) {
            if (diagram.types) {
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
            } else {
              setTypes([]);
            }
          }
          if (databases[database].hasEnums) {
            setEnums(
              (diagram.enums || []).map((e: any) =>
                !e.id ? { ...e, id: nanoid() } : e,
              ),
            );
          }
          window.name = `d ${diagram.id}`;
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
    database
  ]);

  return {
    save,
    loadLatestDiagram,
    loadDiagram,
  };
};
