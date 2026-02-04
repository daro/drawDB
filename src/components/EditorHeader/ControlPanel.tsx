import { useContext, useState, useMemo } from "react";
import {
  IconCaretdown,
  IconChevronRight,
  IconChevronLeft,
  IconChevronUp,
  IconChevronDown,
  IconSaveStroked,
  IconUndo,
  IconRedo,
  IconEdit,
  IconShareStroked,
  IconDeleteStroked,
} from "@douyinfe/semi-icons";
import { Link, useNavigate } from "react-router-dom";
import icon from "../../assets/icon_dark_64.png";
import {
  Button,
  Divider,
  Dropdown,
  InputNumber,
  Tooltip,
  Spin,
  Tag,
  Toast,
  Popconfirm,
} from "@douyinfe/semi-ui";
import { toPng, toJpeg, toSvg } from "html-to-image";
import {
  jsonToMySQL,
  jsonToPostgreSQL,
  jsonToSQLite,
  jsonToMariaDB,
  jsonToSQLServer,
  jsonToOracleSQL,
} from "../../utils/exportSQL/generic";
import {
  ObjectType,
  Action,
  Tab,
  State,
  MODAL,
  SIDESHEET,
  DB,
  IMPORT_FROM,
  noteWidth,
  pngExportPixelRatio,
} from "../../data/constants";
import jsPDF from "jspdf";
import { useHotkeys } from "react-hotkeys-hook";
import { Validator } from "jsonschema";
import { areaSchema, noteSchema, tableSchema } from "../../data/schemas";
import { db } from "../../data/db";
import {
  useLayout,
  useSettings,
  useTransform,
  useDiagram,
  useUndoRedo,
  useSelect,
  useSaveState,
  useTypes,
  useNotes,
  useAreas,
  useEnums,
  useFullscreen,
  useTasks,
  useTexts,
  useCanvas,
} from "../../hooks";
import { enterFullscreen, exitFullscreen } from "../../utils/fullscreen";
import { dataURItoBlob } from "../../utils/utils";
import {
  IconAddArea,
  IconAddNote,
  IconAddTable,
  IconAddXorGroup,
  IconAddOrGroup,
  IconAddText,
  IconSupertype,
} from "../../icons";
import LayoutDropdown from "./LayoutDropdown";
import Sidesheet from "./SideSheet/Sidesheet";
import Modal from "./Modal/Modal";
import { useTranslation } from "react-i18next";
import { exportSQL } from "../../utils/exportSQL";
import { databases } from "../../data/databases";
import { jsonToMermaid } from "../../utils/exportAs/mermaid";
import { isRtl } from "../../i18n/utils/rtl";
import { jsonToDocumentation } from "../../utils/exportAs/documentation";
import { IdContext } from "../Workspace";
import { socials } from "../../data/socials";
import { toDBML } from "../../utils/exportAs/dbml";
import { exportSavedData } from "../../utils/exportSavedData";
import { nanoid } from "nanoid";
import { getTableHeight } from "../../utils/utils";
import { deleteFromCache, STORAGE_KEY } from "../../utils/cache";
import { useLiveQuery } from "dexie-react-hooks";
import { DateTime } from "luxon";
import { ControlPanelProps, IIndex, ITable } from "../../types";

export default function ControlPanel({
  diagramId,
  setDiagramId,
  title,
  setTitle,
  lastSaved,
}: ControlPanelProps) {
  const [modal, setModal] = useState(MODAL.NONE);
  const [settingsTab, setSettingsTab] = useState<string | undefined>(undefined);
  const [settingsOption, setSettingsOption] = useState<string | undefined>(
    undefined,
  );
  const [sidesheet, setSidesheet] = useState(SIDESHEET.NONE);
  const [showEditName, setShowEditName] = useState(false);
  const [importDb, setImportDb] = useState("");
  const [exportData, setExportData] = useState({
    data: null,
    filename: `${title}_${new Date().toISOString()}`,
    extension: "",
  });
  const [importFrom, setImportFrom] = useState(IMPORT_FROM.JSON);
  const { saveState, setSaveState } = useSaveState();
  const { layout, setLayout } = useLayout();
  const { settings, setSettings } = useSettings();
  const {
    relationships,
    tables,
    setTables,
    addTable,
    updateTable,
    deleteField,
    deleteTable,
    updateField,
    setRelationships,
    addRelationship,
    deleteRelationship,
    updateRelationship,
    database,
    setDatabase,
    xorGroups,
    addXorGroup,
    deleteXorGroup,
    orGroups,
    addOrGroup,
    deleteOrGroup,
    convertXorToOr,
    convertOrToXor,
    linking,
    setLinking,
    setLinkingLine,
    setHoveredTable,
  } = useDiagram();
  const { pointer } = useCanvas();
  const { enums, setEnums, deleteEnum, addEnum, updateEnum } = useEnums();
  const { types, addType, deleteType, updateType, setTypes } = useTypes();
  const { notes, setNotes, updateNote, addNote, deleteNote } = useNotes();
  const { texts, addText, deleteText, updateText, setTexts } = useTexts();
  const { areas, setAreas, updateArea, addArea, deleteArea } = useAreas();
  const { undoStack, redoStack, setUndoStack, setRedoStack } = useUndoRedo();
  const {
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
  } = useSelect();
  const { transform, setTransform } = useTransform();
  const { t, i18n } = useTranslation();
  const { version, gistId, setGistId } = useContext(IdContext);
  const navigate = useNavigate();

  const canCreateXorGroup = useMemo(() => {
    if (!bulkSelectedElements || bulkSelectedElements.length < 2) return false;
    const selectedRels = bulkSelectedElements.filter(
      (e) => e.type === ObjectType.RELATIONSHIP,
    );
    if (selectedRels.length < 2) return false;

    // Check if they are already in an XOR group
    const ids = selectedRels.map((r) => r.id);
    if (
      xorGroups &&
      xorGroups.some((g) =>
        g.childRelationshipIds && ids.some((id) => g.childRelationshipIds.includes(id)),
      )
    )
      return false;

    const relObjects = relationships.filter((r) => ids.includes(r.id));
    if (relObjects.length < 2) return false;

    const startTableId = relObjects[0]?.startTableId;
    const isParentStart = relObjects.every(
      (r) => r.startTableId === startTableId,
    );

    if (isParentStart) return true;

    const endTableId = relObjects[0]?.endTableId;
    const isParentEnd = relObjects.every((r) => r.endTableId === endTableId);

    return isParentEnd;
  }, [bulkSelectedElements, xorGroups, relationships]);

  const canCreateOrGroup = useMemo(() => {
    if (!bulkSelectedElements || bulkSelectedElements.length < 2) return false;
    const selectedRels = bulkSelectedElements.filter(
      (e) => e.type === ObjectType.RELATIONSHIP,
    );
    if (selectedRels.length < 2) return false;

    // Check if they are already in an OR group
    const ids = selectedRels.map((r) => r.id);
    if (
      orGroups &&
      orGroups.some((g) =>
        g.childRelationshipIds && ids.some((id) => g.childRelationshipIds.includes(id)),
      )
    )
      return false;

    const relObjects = relationships.filter((r) => ids.includes(r.id));
    if (relObjects.length < 2) return false;

    const startTableId = relObjects[0]?.startTableId;
    const isParentStart = relObjects.every(
      (r) => r.startTableId === startTableId,
    );

    if (isParentStart) return true;

    const endTableId = relObjects[0]?.endTableId;
    const isParentEnd = relObjects.every((r) => r.endTableId === endTableId);

    return isParentEnd;
  }, [bulkSelectedElements, orGroups, relationships]);

  const isSingleXorGroupSelected = useMemo(() => {
    return (
      bulkSelectedElements.length === 1 &&
      bulkSelectedElements[0].type === ObjectType.XOR_GROUP
    );
  }, [bulkSelectedElements]);

  const isSingleOrGroupSelected = useMemo(() => {
    return (
      bulkSelectedElements.length === 1 &&
      bulkSelectedElements[0].type === ObjectType.OR_GROUP
    );
  }, [bulkSelectedElements]);

  const createXorGroup = () => {
    const selectedRels = bulkSelectedElements.filter(
      (e) => e.type === ObjectType.RELATIONSHIP,
    );
    const ids = selectedRels.map((r) => r.id);
    const relObjects = relationships.filter((r) => ids.includes(r.id));

    if (relObjects.length < 2) return;

    const startTableId = relObjects[0].startTableId;
    const isParentStart = relObjects.every(
      (r) => r.startTableId === startTableId,
    );

    addXorGroup({
      parentTableId: isParentStart ? startTableId : relObjects[0].endTableId,
      childRelationshipIds: ids,
    });
  };

  const createOrGroup = () => {
    const selectedRels = bulkSelectedElements.filter(
      (e) => e.type === ObjectType.RELATIONSHIP,
    );
    const ids = selectedRels.map((r) => r.id);
    const relObjects = relationships.filter((r) => ids.includes(r.id));

    if (relObjects.length < 2) return;

    const startTableId = relObjects[0].startTableId;
    const isParentStart = relObjects.every(
      (r) => r.startTableId === startTableId,
    );

    addOrGroup({
      parentTableId: isParentStart ? startTableId : relObjects[0].endTableId,
      childRelationshipIds: ids,
    });
  };

  const invertLayout = (component) =>
    setLayout((prev) => ({ ...prev, [component]: !prev[component] }));

  const undo = () => {
    if (undoStack.length === 0) return;
    const a = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.filter((_, i) => i !== prev.length - 1));

    if (a.bulk && a.elements) {
      for (const element of a.elements) {
        if (element.type === ObjectType.TABLE) {
          updateTable(element.id, element.undo);
        } else if (element.type === ObjectType.AREA) {
          updateArea(element.id, element.undo);
        } else if (element.type === ObjectType.NOTE) {
          updateNote(element.id, element.undo);
        } else if (element.type === ObjectType.TEXT) {
          updateText(element.id, element.undo);
        }
      }
      setRedoStack((prev) => [...prev, a]);
      return;
    }

    if (a.action === Action.ADD) {
      if (a.element === ObjectType.TABLE) {
        deleteTable(a.data.table.id, false);
      } else if (a.element === ObjectType.AREA) {
        deleteArea(areas[areas.length - 1].id, false);
      } else if (a.element === ObjectType.NOTE) {
        deleteNote(notes[notes.length - 1].id, false);
      } else if (a.element === ObjectType.RELATIONSHIP) {
        deleteRelationship(a.data.relationship.id, false);
      } else if (a.element === ObjectType.TYPE) {
        deleteType(a.data.type.id, false);
      } else if (a.element === ObjectType.ENUM) {
        deleteEnum(a.data.enum.id, false);
      } else if (a.element === ObjectType.XOR_GROUP) {
        deleteXorGroup(a.data.group.id, false);
      } else if (a.element === ObjectType.OR_GROUP) {
        deleteOrGroup(a.data.group.id, false);
      } else if (a.element === ObjectType.TEXT) {
        deleteText(texts[texts.length - 1].id, false);
      }
      setRedoStack((prev) => [...prev, a]);
    } else if (a.action === Action.MOVE) {
      if (a.element === ObjectType.TABLE && a.id !== undefined) {
        const table = tables.find((t) => t.id === a.id);
        if (table) {
          const { x, y } = table;
          setRedoStack((prev) => [...prev, { ...a, x, y }]);
          updateTable(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.AREA && a.id !== undefined) {
        const area = areas.find((ar) => ar.id === a.id);
        if (area) {
          setRedoStack((prev) => [
            ...prev,
            { ...a, x: area.x, y: area.y },
          ]);
          updateArea(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.NOTE && a.id !== undefined) {
        const note = notes.find((n) => n.id === a.id);
        if (note) {
          setRedoStack((prev) => [
            ...prev,
            { ...a, x: note.x, y: note.y },
          ]);
          updateNote(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.TEXT && a.id !== undefined) {
        const text = texts.find((t) => t.id === a.id);
        if (text) {
          setRedoStack((prev) => [
            ...prev,
            { ...a, x: text.x, y: text.y },
          ]);
          updateText(a.id, { x: a.x, y: a.y });
        }
      }
    } else if (a.action === Action.DELETE) {
      if (a.element === ObjectType.TABLE) {
        a.data.relationship.forEach((x) => addRelationship(x, false));
        addTable(a.data, false);
      } else if (a.element === ObjectType.RELATIONSHIP) {
        addRelationship(a.data, false);
      } else if (a.element === ObjectType.NOTE) {
        addNote(a.data, false);
      } else if (a.element === ObjectType.AREA) {
        addArea(a.data, false);
      } else if (a.element === ObjectType.TYPE) {
        addType(a.data, false);
      } else if (a.element === ObjectType.ENUM) {
        addEnum(a.data, false);
      } else if (a.element === ObjectType.TEXT) {
        addText(a.data, false);
      }
      setRedoStack((prev) => [...prev, a]);
    } else if (a.action === Action.EDIT) {
      if (a.element === ObjectType.AREA) {
        updateArea(a.aid, a.undo);
      } else if (a.element === ObjectType.NOTE) {
        updateNote(a.nid, a.undo);
      } else if (a.element === ObjectType.TEXT) {
        updateText(a.tid, a.undo);
      } else if (a.element === ObjectType.TABLE) {
        const table = tables.find((t) => t.id === a.tid);
        if (a.component === "field") {
          updateField(a.tid, a.fid, a.undo);
        } else if (a.component === "field_delete") {
          setRelationships((prev) => {
            let temp = [...prev];
            a.data.relationship.forEach((r) => {
              temp.splice(r.id, 0, r);
            });
            return temp;
          });
          const updatedFields = table.fields.slice();
          updatedFields.splice(a.data.index, 0, a.data.field);
          updateTable(a.tid, { fields: updatedFields });
        } else if (a.component === "field_add") {
          updateTable(a.tid, {
            fields: table.fields.filter((e) => e.id !== a.fid),
          });
        } else if (a.component === "index_add") {
          updateTable(a.tid!, {
            indices: table.indices
              .filter((e) => e.id !== table.indices.length - 1)
              .map((t, i) => ({ ...t, id: i } as any)),
          });
        } else if (a.component === "index") {
          updateTable(a.tid!, {
            indices: table.indices.map((index) =>
              index.id === a.iid
                ? {
                    ...index,
                    ...a.undo,
                  }
                : index,
            ),
          });
        } else if (a.component === "index_delete") {
          const updatedIndices = table.indices.slice();
          updatedIndices.splice(a.data.id as number, 0, a.data);
          updateTable(a.tid!, {
            indices: updatedIndices.map((t, i) => ({ ...t, id: i } as any)),
          });
        } else if (a.component === "self") {
          updateTable(a.tid!, a.undo);
        }
      } else if (a.element === ObjectType.RELATIONSHIP) {
        updateRelationship(a.rid!, a.undo);
      } else if (a.element === ObjectType.TYPE) {
        if (a.component === "field_add") {
          const type = types.find((t, i) =>
            typeof a.tid === "number" ? i === a.tid : t.id === a.tid,
          );
          if (type) {
            updateType(a.tid!, {
              fields: type.fields.filter((f, i) =>
                f.id ? f.id !== a.data.field.id : i !== type.fields.length - 1,
              ),
            });
          }
        }
        if (a.component === "field") {
          const type = types.find((t, i) =>
            typeof a.tid === "number" ? i === a.tid : t.id === a.tid,
          );
          if (type) {
            updateType(a.tid!, {
              fields: type.fields.map((e, i) =>
                i === a.fid ? { ...e, ...a.undo } : e,
              ),
            });
          }
        } else if (a.component === "field_delete") {
          setTypes((prev) =>
            prev.map((t, i) => {
              if ((typeof a.tid === "number" ? i === a.tid : t.id === a.tid)) {
                const temp = t.fields.slice();
                temp.splice(a.fid as number, 0, a.data);
                return { ...t, fields: temp };
              }
              return t;
            }),
          );
        } else if (a.component === "self") {
          updateType(a.tid!, a.undo);
          if (a.updatedFields) {
            if (a.undo.name) {
              a.updatedFields.forEach((x) =>
                updateField(x.tid, x.fid, { type: a.undo.name.toUpperCase() }),
              );
            }
          }
        }
      } else if (a.element === ObjectType.ENUM) {
        updateEnum(a.id!, a.undo);
        if (a.updatedFields) {
          if (a.undo.name) {
            a.updatedFields.forEach((x) =>
              updateField(x.tid, x.fid, { type: a.undo.name.toUpperCase() }),
            );
          }
        }
      }
      setRedoStack((prev) => [...prev, a]);
    }
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const a = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.filter((e, i) => i !== prev.length - 1));

    if (a.bulk && a.elements) {
      for (const element of a.elements) {
        if (element.type === ObjectType.TABLE) {
          updateTable(element.id, element.redo);
        } else if (element.type === ObjectType.AREA) {
          updateArea(element.id, element.redo);
        } else if (element.type === ObjectType.NOTE) {
          updateNote(element.id, element.redo);
        } else if (element.type === ObjectType.TEXT) {
          updateText(element.id, element.redo);
        }
      }
      setUndoStack((prev) => [...prev, a]);
      return;
    }

    if (a.action === Action.ADD) {
      if (a.element === ObjectType.TABLE) {
        addTable(a.data, false);
      } else if (a.element === ObjectType.AREA) {
        addArea(null, false);
      } else if (a.element === ObjectType.NOTE) {
        addNote(null, false);
      } else if (a.element === ObjectType.RELATIONSHIP) {
        addRelationship(a.data, false);
      } else if (a.element === ObjectType.TYPE) {
        addType(a.data, false);
      } else if (a.element === ObjectType.ENUM) {
        addEnum(a.data, false);
      } else if (a.element === ObjectType.TEXT) {
        addText(null, false);
      }
      setUndoStack((prev) => [...prev, a]);
    } else if (a.action === Action.MOVE) {
      if (a.element === ObjectType.TABLE && a.id !== undefined) {
        const table = tables.find((t) => t.id === a.id);
        if (table) {
          const { x, y } = table;
          setUndoStack((prev) => [...prev, { ...a, x, y }]);
          updateTable(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.AREA && a.id !== undefined) {
        const area = areas.find((ar) => ar.id === a.id);
        if (area) {
          setUndoStack((prev) => [
            ...prev,
            { ...a, x: area.x, y: area.y },
          ]);
          updateArea(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.NOTE && a.id !== undefined) {
        const note = notes.find((n) => n.id === a.id);
        if (note) {
          setUndoStack((prev) => [
            ...prev,
            { ...a, x: note.x, y: note.y },
          ]);
          updateNote(a.id, { x: a.x, y: a.y });
        }
      } else if (a.element === ObjectType.TEXT && a.id !== undefined) {
        const text = texts.find((t) => t.id === a.id);
        if (text) {
          setUndoStack((prev) => [
            ...prev,
            { ...a, x: text.x, y: text.y },
          ]);
          updateText(a.id, { x: a.x, y: a.y });
        }
      }
    } else if (a.action === Action.DELETE) {
      if (a.element === ObjectType.TABLE) {
        deleteTable(a.data.table.id, false);
      } else if (a.element === ObjectType.RELATIONSHIP) {
        deleteRelationship(a.data.relationship.id, false);
      } else if (a.element === ObjectType.NOTE) {
        deleteNote(a.data.id, false);
      } else if (a.element === ObjectType.AREA) {
        deleteArea(a.data.id, false);
      } else if (a.element === ObjectType.TYPE) {
        deleteType(a.data.type.id, false);
      } else if (a.element === ObjectType.ENUM) {
        deleteEnum(a.data.enum.id, false);
      } else if (a.element === ObjectType.TEXT) {
        deleteText(a.data.id, false);
      }
      setUndoStack((prev) => [...prev, a]);
    } else if (a.action === Action.EDIT) {
      if (a.element === ObjectType.AREA) {
        updateArea(a.aid, a.redo);
      } else if (a.element === ObjectType.NOTE) {
        updateNote(a.nid, a.redo);
      } else if (a.element === ObjectType.TEXT) {
        updateText(a.tid, a.redo);
      } else if (a.element === ObjectType.TABLE) {
        const table = tables.find((t) => t.id === a.tid);
        if (a.component === "field") {
          updateField(a.tid, a.fid, a.redo);
        } else if (a.component === "field_delete") {
          deleteField(a.data.field, a.tid, false);
        } else if (a.component === "field_add") {
          updateTable(a.tid, {
            fields: [
              ...table.fields,
              {
                name: "",
                type: "",
                default: "",
                check: "",
                primary: false,
                unique: false,
                notNull: false,
                increment: false,
                comment: "",
                id: nanoid(),
              },
            ],
          });
        } else if (a.component === "index_add") {
          updateTable(a.tid, {
            indices: [
              ...table.indices,
              {
                id: table.indices.length,
                name: `index_${table.indices.length}`,
                unique: false,
                fields: [],
              },
            ],
          });
        } else if (a.component === "index") {
          updateTable(a.tid, {
            indices: table.indices.map((index) =>
              index.id === a.iid
                ? {
                    ...index,
                    ...a.redo,
                  }
                : index,
            ),
          });
        } else if (a.component === "index_delete") {
          updateTable(a.tid, {
            indices: table.indices
              .filter((e) => e.id !== a.data.id)
              .map((t, i) => ({ ...t, id: i })),
          });
        } else if (a.component === "self") {
          updateTable(a.tid, a.redo, false);
        }
      } else if (a.element === ObjectType.RELATIONSHIP) {
        updateRelationship(a.rid, a.redo);
      } else if (a.element === ObjectType.TYPE) {
        if (a.component === "field_add") {
          const type = types.find((t, i) =>
            typeof a.tid === "number" ? i === a.tid : t.id === a.tid,
          );
          updateType(a.tid, {
            fields: [...type.fields, a.data.field],
          });
        } else if (a.component === "field") {
          updateType(a.tid, {
            fields: types[a.tid].fields.map((e, i) =>
              i === a.fid ? { ...e, ...a.redo } : e,
            ),
          });
        } else if (a.component === "field_delete") {
          updateType(a.tid, {
            fields: types[a.tid].fields.filter((field, i) => i !== a.fid),
          });
        } else if (a.component === "self") {
          updateType(a.tid, a.redo);
          if (a.updatedFields) {
            if (a.redo.name) {
              a.updatedFields.forEach((x) =>
                updateField(x.tid, x.fid, { type: a.redo.name.toUpperCase() }),
              );
            }
          }
        }
      } else if (a.element === ObjectType.ENUM) {
        updateEnum(a.id, a.redo);
        if (a.updatedFields) {
          if (a.redo.name) {
            a.updatedFields.forEach((x) =>
              updateField(x.tid, x.fid, { type: a.redo.name.toUpperCase() }),
            );
          }
        }
      }
      setUndoStack((prev) => [...prev, a]);
    }
  };

  const fileImport = () => setModal(MODAL.IMPORT);
  const viewGrid = () =>
    setSettings((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  const snapToGrid = () =>
    setSettings((prev) => ({ ...prev, snapToGrid: !prev.snapToGrid }));
  const zoomIn = () =>
    setTransform((prev) => ({ ...prev, zoom: prev.zoom * 1.2 }));
  const zoomOut = () =>
    setTransform((prev) => ({ ...prev, zoom: prev.zoom / 1.2 }));
  const viewStrictMode = () => {
    setSettings((prev) => ({ ...prev, strictMode: !prev.strictMode }));
  };
  const viewFieldSummary = () => {
    setSettings((prev) => {
      const nextValue = !prev.showFieldSummary;
      if (nextValue) {
        Toast.info(t("field_details") + ": " + t("on"));
      } else {
        Toast.info(t("field_details") + ": " + t("off"));
        setHoveredTable({ tableId: null, fieldId: null });
        setTables((prevTables) => [...prevTables]);
      }
      return {
        ...prev,
        showFieldSummary: nextValue,
      };
    });
  };
  const copyAsImage = () => {
    toPng(document.getElementById("canvas"), {
      pixelRatio: pngExportPixelRatio,
    }).then(function (dataUrl) {
      const blob = dataURItoBlob(dataUrl);
      navigator.clipboard
        .write([new ClipboardItem({ "image/png": blob })])
        .then(() => {
          Toast.success(t("copied_to_clipboard"));
        })
        .catch(() => {
          Toast.error(t("oops_smth_went_wrong"));
        });
    });
  };
  const resetView = () =>
    setTransform((prev) => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }));
  const fitWindow = (margin = 10) => {
    const canvasElement = document.getElementById("canvas");
    if (!canvasElement) return;
    const canvas = canvasElement.getBoundingClientRect();

    const minMaxXY = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    };

    tables.forEach((table) => {
      minMaxXY.minX = Math.min(minMaxXY.minX, table.x);
      minMaxXY.minY = Math.min(minMaxXY.minY, table.y);
      minMaxXY.maxX = Math.max(minMaxXY.maxX, table.x + table.width);
      minMaxXY.maxY = Math.max(minMaxXY.maxY, table.y + table.height);
    });

    areas.forEach((area) => {
      minMaxXY.minX = Math.min(minMaxXY.minX, area.x);
      minMaxXY.minY = Math.min(minMaxXY.minY, area.y);
      minMaxXY.maxX = Math.max(minMaxXY.maxX, area.x + area.width);
      minMaxXY.maxY = Math.max(minMaxXY.maxY, area.y + area.height);
    });

    notes.forEach((note) => {
      minMaxXY.minX = Math.min(minMaxXY.minX, note.x);
      minMaxXY.minY = Math.min(minMaxXY.minY, note.y);
      minMaxXY.maxX = Math.max(
        minMaxXY.maxX,
        note.x + (note.width ?? noteWidth),
      );
      minMaxXY.maxY = Math.max(minMaxXY.maxY, note.y + note.height);
    });

    if (minMaxXY.minX === Infinity) return;

    const width = minMaxXY.maxX - minMaxXY.minX + margin * 2;
    const height = minMaxXY.maxY - minMaxXY.minY + margin * 2;

    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;
    // Making sure the scale is a multiple of 0.05
    const scale = Math.floor(Math.min(scaleX, scaleY) * 20) / 20;

    const centerX = (minMaxXY.minX + minMaxXY.maxX) / 2;
    const centerY = (minMaxXY.minY + minMaxXY.maxY) / 2;

    setTransform((prev) => ({
      ...prev,
      zoom: scale,
      pan: { x: centerX, y: centerY },
    }));
  };
  const edit = () => {
    if (selectedElement.element === ObjectType.TABLE) {
      if (!layout.sidebar) {
        setSelectedElement((prev) => ({
          ...prev,
          open: true,
        }));
      } else {
        setSelectedElement((prev) => ({
          ...prev,
          open: true,
          currentTab: Tab.TABLES,
        }));
        if (selectedElement.currentTab !== Tab.TABLES) return;
        document
          .getElementById(`scroll_table_${selectedElement.id}`)
          .scrollIntoView({ behavior: "smooth" });
      }
    } else if (selectedElement.element === ObjectType.AREA) {
      if (layout.sidebar) {
        setSelectedElement((prev) => ({
          ...prev,
          currentTab: Tab.AREAS,
        }));
        if (selectedElement.currentTab !== Tab.AREAS) return;
        document
          .getElementById(`scroll_area_${selectedElement.id}`)
          .scrollIntoView({ behavior: "smooth" });
      } else {
        setSelectedElement((prev) => ({
          ...prev,
          open: true,
          editFromToolbar: true,
        }));
      }
    } else if (selectedElement.element === ObjectType.NOTE) {
      if (layout.sidebar) {
        setSelectedElement((prev) => ({
          ...prev,
          currentTab: Tab.NOTES,
          open: false,
        }));
        if (selectedElement.currentTab !== Tab.NOTES) return;
        document
          .getElementById(`scroll_note_${selectedElement.id}`)
          .scrollIntoView({ behavior: "smooth" });
      } else {
        setSelectedElement((prev) => ({
          ...prev,
          open: true,
          editFromToolbar: true,
        }));
      }
    }
  };
  const del = () => {
    if (layout.readOnly) {
      return;
    }
    if (bulkSelectedElements.length > 0) {
      bulkSelectedElements.forEach((el) => {
        switch (el.type) {
          case ObjectType.TABLE:
            deleteTable(el.id as any);
            break;
          case ObjectType.NOTE:
            deleteNote(el.id as any);
            break;
          case ObjectType.AREA:
            deleteArea(el.id as any);
            break;
          case ObjectType.RELATIONSHIP:
            deleteRelationship(el.id as any);
            break;
          case ObjectType.XOR_GROUP:
            deleteXorGroup(el.id as any);
            break;
          case ObjectType.OR_GROUP:
            deleteOrGroup(el.id as any);
            break;
          case ObjectType.WAYPOINT: {
            const rel = relationships.find((r) => r.id === el.id);
            if (rel && rel.waypoints) {
              const newWaypoints = rel.waypoints.filter(
                (_, i) => i !== (el as any).waypointIndex,
              );
              setUndoStack((prev) => [
                ...prev,
                {
                  action: Action.EDIT,
                  element: ObjectType.RELATIONSHIP,
                  rid: el.id as any,
                  undo: { waypoints: rel.waypoints || [] },
                  redo: { waypoints: newWaypoints },
                  message: t("edit_relationship", {
                    refName: rel.name,
                    extra: `[${t("delete_waypoint") || "Delete waypoint"}]`,
                  }),
                },
              ]);
              setRedoStack([]);
              updateRelationship(el.id as any, { waypoints: newWaypoints });
            }
            break;
          }
          default:
            break;
        }
      });
      setBulkSelectedElements([]);
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.NONE,
        id: "",
        open: false,
      }));
      return;
    }

    switch (selectedElement.element) {
      case ObjectType.TABLE:
        deleteTable(selectedElement.id as any);
        break;
      case ObjectType.NOTE:
        deleteNote(selectedElement.id as any);
        break;
      case ObjectType.AREA:
        deleteArea(selectedElement.id as any);
        break;
      case ObjectType.RELATIONSHIP:
        deleteRelationship(selectedElement.id as any);
        break;
      case ObjectType.XOR_GROUP:
        deleteXorGroup(selectedElement.id as any);
        break;
      case ObjectType.OR_GROUP:
        deleteOrGroup(selectedElement.id as any);
        break;
      case ObjectType.WAYPOINT: {
        const rel = relationships.find((r) => r.id === selectedElement.id);
        if (rel && rel.waypoints) {
          const newWaypoints = rel.waypoints.filter(
            (_, i) => i !== (selectedElement as any).waypointIndex,
          );
          setUndoStack((prev) => [
            ...prev,
            {
              action: Action.EDIT,
              element: ObjectType.RELATIONSHIP,
              rid: selectedElement.id as any,
              undo: { waypoints: rel.waypoints || [] },
              redo: { waypoints: newWaypoints },
              message: t("edit_relationship", {
                noteTitle: rel.name,
                extra: `[${t("delete_waypoint") || "Delete waypoint"}]`,
              }),
            },
          ]);
          setRedoStack([]);
          updateRelationship(selectedElement.id as any, { waypoints: newWaypoints });
        }
        break;
      }
      default:
        break;
    }
  };
  const duplicate = () => {
    if (layout.readOnly) {
      return;
    }
    switch (selectedElement.element) {
      case ObjectType.TABLE: {
        const table = tables.find((t) => t.id === selectedElement.id);
        if (table) {
          addTable({
            table: {
              ...table,
              x: table.x + 20,
              y: table.y + 20,
              id: nanoid(),
            },
            index: tables.length,
          });
        }
        break;
      }
      case ObjectType.NOTE: {
        const note = notes.find((n) => n.id === selectedElement.id);
        if (note) {
          addNote({
            note: {
              ...note,
              x: note.x + 20,
              y: note.y + 20,
              id: nanoid(),
            },
            index: notes.length,
          });
        }
        break;
      }
      case ObjectType.AREA: {
        const area = areas.find((a) => a.id === selectedElement.id);
        if (area) {
          addArea({
            area: {
              ...area,
              x: area.x + 20,
              y: area.y + 20,
              id: nanoid(),
            },
            index: areas.length,
          });
        }
        break;
      }
      default:
        break;
    }
  };
  const copy = () => {
    switch (selectedElement.element) {
      case ObjectType.TABLE: {
        const table = tables.find((t) => t.id === selectedElement.id);
        if (table) {
          navigator.clipboard
            .writeText(JSON.stringify(table))
            .catch(() => Toast.error(t("oops_smth_went_wrong")));
        }
        break;
      }
      case ObjectType.NOTE: {
        const note = notes.find((n) => n.id === selectedElement.id);
        if (note) {
          navigator.clipboard
            .writeText(JSON.stringify(note))
            .catch(() => Toast.error(t("oops_smth_went_wrong")));
        }
        break;
      }
      case ObjectType.AREA: {
        const area = areas.find((a) => a.id === selectedElement.id);
        if (area) {
          navigator.clipboard
            .writeText(JSON.stringify(area))
            .catch(() => Toast.error(t("oops_smth_went_wrong")));
        }
        break;
      }
      default:
        break;
    }
  };
  const paste = () => {
    if (layout.readOnly) {
      return;
    }
    navigator.clipboard.readText().then((text) => {
      let obj = null;
      try {
        obj = JSON.parse(text);
      } catch (error) {
        return;
      }
      const v = new Validator();
      if (v.validate(obj, tableSchema).valid) {
        addTable({
          table: {
            ...obj,
            x: obj.x + 20,
            y: obj.y + 20,
            id: nanoid(),
          },
          index: tables.length,
        });
      } else if (v.validate(obj, areaSchema).valid) {
        addArea({
          area: {
            ...obj,
            x: obj.x + 20,
            y: obj.y + 20,
            id: nanoid(),
          },
          index: areas.length,
        });
      } else if (v.validate(obj, noteSchema)) {
        addNote({
          note: {
            ...obj,
            x: obj.x + 20,
            y: obj.y + 20,
            id: nanoid(),
          },
          index: notes.length,
        });
      }
    });
  };
  const cut = () => {
    if (layout.readOnly) {
      return;
    }
    copy();
    del();
  };
  const toggleDBMLEditor = () => {
    setLayout((prev: any) => ({ ...prev, dbmlEditor: !prev.dbmlEditor }));
  };
  const save = () => setSaveState(State.SAVING);
  const recentlyOpenedDiagrams = useLiveQuery(() =>
    (db as any).diagrams.orderBy("lastModified").reverse().limit(10).toArray(),
  );

  const open = () => setModal(MODAL.OPEN);
  const saveDiagramAs = () => setModal(MODAL.SAVEAS);
  const fullscreen = useFullscreen();
  const { setTasks } = useTasks();
  const loadDiagram = async (id: any) => {
    await (db as any).diagrams
      .get(id)
      .then((diagram) => {
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
              diagram.enums.map((e: any) => (!e.id ? { ...e, id: nanoid() } : e)) ??
                [],
            );
          }
          window.name = `d ${diagram.id}`;
        } else {
          window.name = "";
          Toast.error(t("didnt_find_diagram"));
        }
      })
      .catch((error) => {
        console.log(error);
        Toast.error(t("didnt_find_diagram"));
      });
  };
  const saveDiagramAsTemplate = () => {
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
  };
  const delDiagram = async () => {
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
  };
  const openSettings = (tab?: string, option?: string) => {
    setSettingsTab(tab);
    setSettingsOption(option);
    setModal(MODAL.SETTINGS);
  };

  const menu = {
    file: {
      new: {
        function: () => setModal(MODAL.NEW),
      },
      new_window: {
        function: () => {
          const newWindow = window.open("/editor", "_blank");
          newWindow.name = window.name;
        },
      },
      open: {
        function: open,
        shortcut: "Ctrl+O",
      },
      open_recent: {
        children: [
          ...(recentlyOpenedDiagrams && recentlyOpenedDiagrams.length > 0
            ? [
                ...recentlyOpenedDiagrams.map((diagram) => ({
                  name: diagram.name,
                  label: DateTime.fromJSDate(new Date(diagram.lastModified))
                    .setLocale(i18n.language)
                    .toRelative(),
                  function: async () => {
                    await loadDiagram(diagram.id);
                    save();
                  },
                })),
                { divider: true },
                {
                  name: t("see_all"),
                  function: () => open(),
                },
              ]
            : [
                {
                  name: t("no_saved_diagrams"),
                  disabled: true,
                },
              ]),
        ],

        function: () => {},
      },
      save: {
        function: save,
        shortcut: "Ctrl+S",
        disabled: layout.readOnly,
      },
      save_as: {
        function: saveDiagramAs,
        shortcut: "Ctrl+Shift+S",
        disabled: layout.readOnly,
      },
      save_as_template: {
        function: saveDiagramAsTemplate,
      },
      rename: {
        function: () => {
          setModal(MODAL.RENAME);
        },
        disabled: layout.readOnly,
      },
      delete_diagram: {
        warning: {
          title: t("delete_diagram"),
          message: t("are_you_sure_delete_diagram"),
        },
        function: delDiagram,
      },
      import_from: {
        children: [
          {
            function: fileImport,
            name: "JSON",
            disabled: layout.readOnly,
          },
          {
            function: () => {
              setModal(MODAL.IMPORT);
              setImportFrom(IMPORT_FROM.DBML);
            },
            name: "DBML",
            disabled: layout.readOnly,
          },
        ],
      },
      import_from_source: {
        ...(database === DB.GENERIC && {
          children: [
            {
              function: () => {
                setModal(MODAL.IMPORT_SRC);
                setImportDb(DB.MYSQL);
              },
              name: "MySQL",
              disabled: layout.readOnly,
            },
            {
              function: () => {
                setModal(MODAL.IMPORT_SRC);
                setImportDb(DB.POSTGRES);
              },
              name: "PostgreSQL",
              disabled: layout.readOnly,
            },
            {
              function: () => {
                setModal(MODAL.IMPORT_SRC);
                setImportDb(DB.SQLITE);
              },
              name: "SQLite",
              disabled: layout.readOnly,
            },
            {
              function: () => {
                setModal(MODAL.IMPORT_SRC);
                setImportDb(DB.MARIADB);
              },
              name: "MariaDB",
              disabled: layout.readOnly,
            },
            {
              function: () => {
                setModal(MODAL.IMPORT_SRC);
                setImportDb(DB.MSSQL);
              },
              name: "MSSQL",
              disabled: layout.readOnly,
            },
            {
              function: () => {
                setModal(MODAL.IMPORT_SRC);
                setImportDb(DB.ORACLESQL);
              },
              name: "Oracle",
              label: "Beta",
              disabled: layout.readOnly,
            },
          ],
        }),
        function: () => {
          if (database === DB.GENERIC) return;

          setModal(MODAL.IMPORT_SRC);
        },
        disabled: layout.readOnly,
      },
      export_source: {
        ...(database === DB.GENERIC && {
          children: [
            {
              name: "MySQL",
              function: () => {
                setModal(MODAL.CODE);
                const src = jsonToMySQL({
                  tables: tables,
                  references: relationships,
                  types: types,
                  database: database,
                });
                setExportData((prev) => ({
                  ...prev,
                  data: src,
                  extension: "sql",
                }));
              },
            },
            {
              name: "PostgreSQL",
              function: () => {
                setModal(MODAL.CODE);
                const src = jsonToPostgreSQL({
                  tables: tables,
                  references: relationships,
                  types: types,
                  database: database,
                });
                setExportData((prev) => ({
                  ...prev,
                  data: src,
                  extension: "sql",
                }));
              },
            },
            {
              name: "SQLite",
              function: () => {
                setModal(MODAL.CODE);
                const src = jsonToSQLite({
                  tables: tables,
                  references: relationships,
                  types: types,
                  database: database,
                });
                setExportData((prev) => ({
                  ...prev,
                  data: src,
                  extension: "sql",
                }));
              },
            },
            {
              name: "MariaDB",
              function: () => {
                setModal(MODAL.CODE);
                const src = jsonToMariaDB({
                  tables: tables,
                  references: relationships,
                  types: types,
                  database: database,
                });
                setExportData((prev) => ({
                  ...prev,
                  data: src,
                  extension: "sql",
                }));
              },
            },
            {
              name: "MSSQL",
              function: () => {
                setModal(MODAL.CODE);
                const src = jsonToSQLServer({
                  tables: tables,
                  references: relationships,
                  types: types,
                  database: database,
                });
                setExportData((prev) => ({
                  ...prev,
                  data: src,
                  extension: "sql",
                }));
              },
            },
            {
              label: "Beta",
              name: "Oracle",
              function: () => {
                setModal(MODAL.CODE);
                const src = jsonToOracleSQL({
                  tables: tables,
                  references: relationships,
                  types: types,
                  database: database,
                });
                setExportData((prev) => ({
                  ...prev,
                  data: src,
                  extension: "sql",
                }));
              },
            },
          ],
        }),
        function: () => {
          if (database === DB.GENERIC) return;
          setModal(MODAL.CODE);
          const src = exportSQL({
            tables: tables,
            references: relationships,
            types: types,
            database: database,
            enums: enums,
          });
          setExportData((prev) => ({
            ...prev,
            data: src,
            extension: "sql",
          }));
        },
      },
      export_as: {
        children: [
          {
            name: "PNG",
            function: () => {
              toPng(document.getElementById("canvas"), {
                pixelRatio: pngExportPixelRatio,
              }).then(function (dataUrl) {
                setExportData((prev) => ({
                  ...prev,
                  data: dataUrl,
                  extension: "png",
                }));
              });
              setModal(MODAL.IMG);
            },
          },
          {
            name: "JPEG",
            function: () => {
              toJpeg(document.getElementById("canvas"), { quality: 0.95 }).then(
                function (dataUrl) {
                  setExportData((prev) => ({
                    ...prev,
                    data: dataUrl,
                    extension: "jpeg",
                  }));
                },
              );
              setModal(MODAL.IMG);
            },
          },
          {
            name: "SVG",
            function: () => {
              const filter = (node) => node.tagName !== "i";
              toSvg(document.getElementById("canvas"), { filter: filter }).then(
                function (dataUrl) {
                  setExportData((prev) => ({
                    ...prev,
                    data: dataUrl,
                    extension: "svg",
                  }));
                },
              );
              setModal(MODAL.IMG);
            },
          },
          {
            name: "JSON",
            function: () => {
              setModal(MODAL.CODE);
              const result = JSON.stringify(
                {
                  tables: tables,
                  relationships: relationships.map((rel) => ({
                    ...rel,
                    waypoints: (rel.waypoints || []).map((wp) => ({
                      ...wp,
                      mode: wp.mode || "waypoint",
                      ...((wp.mode === "floating" || wp.mode === "divider") && {
                        pathRatio: wp.pathRatio,
                      }),
                    })),
                    startXOffset: rel.startXOffset || 0,
                    endXOffset: rel.endXOffset || 0,
                    startYCorrection: rel.startYCorrection || 0,
                    endYCorrection: rel.endYCorrection || 0,
                  })),
                  xorGroups: xorGroups,
                  orGroups: orGroups,
                  notes: notes,
                  subjectAreas: areas,
                  database: database,
                  ...(databases[database].hasTypes && { types: types }),
                  ...(databases[database].hasEnums && { enums: enums }),
                  title: title,
                },
                null,
                2,
              );
              setExportData((prev) => ({
                ...prev,
                data: result,
                extension: "json",
              }));
            },
          },
          {
            name: "DBML",
            function: () => {
              setModal(MODAL.CODE);
              const result = toDBML({
                tables,
                relationships,
                enums,
                database,
              });
              setExportData((prev) => ({
                ...prev,
                data: result,
                extension: "dbml",
              }));
            },
          },
          {
            name: "PDF",
            function: () => {
              const canvas = document.getElementById("canvas");
              toJpeg(canvas).then(function (dataUrl) {
                const doc = new jsPDF("l", "px", [
                  canvas.offsetWidth,
                  canvas.offsetHeight,
                ]);
                doc.addImage(
                  dataUrl,
                  "jpeg",
                  0,
                  0,
                  canvas.offsetWidth,
                  canvas.offsetHeight,
                );
                doc.save(`${exportData.filename}.pdf`);
              });
            },
          },
          {
            name: "Mermaid",
            function: () => {
              setModal(MODAL.CODE);
              const result = jsonToMermaid({
                tables: tables,
                relationships: relationships,
                notes: notes,
                subjectAreas: areas,
                database: database,
                title: title,
              });
              setExportData((prev) => ({
                ...prev,
                data: result,
                extension: "md",
              }));
            },
          },
          {
            name: "Markdown",
            function: () => {
              setModal(MODAL.CODE);
              const result = jsonToDocumentation({
                tables: tables,
                relationships: relationships,
                notes: notes,
                subjectAreas: areas,
                database: database,
                title: title,
                ...(databases[database].hasTypes && { types: types }),
                ...(databases[database].hasEnums && { enums: enums }),
              });
              setExportData((prev) => ({
                ...prev,
                data: result,
                extension: "md",
              }));
            },
          },
        ],
        function: () => {},
      },
      exit: {
        function: () => {
          save();
          if (saveState === State.SAVED) navigate("/");
        },
      },
    },
    edit: {
      undo: {
        function: undo,
        shortcut: "Ctrl+Z",
        disabled: layout.readOnly || undoStack.length === 0,
      },
      redo: {
        function: redo,
        shortcut: "Ctrl+Y",
        disabled: layout.readOnly || redoStack.length === 0,
      },
      clear: {
        warning: {
          title: t("clear"),
          message: t("are_you_sure_clear"),
        },
        function: async () => {
          setTables([]);
          setRelationships([]);
          setAreas([]);
          setNotes([]);
          setEnums([]);
          setTypes([]);
          setUndoStack([]);
          setRedoStack([]);

          if (!diagramId) {
            Toast.error(t("oops_smth_went_wrong"));
            return;
          }

          db.table("diagrams")
            .delete(diagramId)
            .catch((error) => {
              Toast.error(t("oops_smth_went_wrong"));
              console.error(
                `Error deleting records with gistId '${diagramId}':`,
                error,
              );
            });
        },
        disabled: layout.readOnly,
      },
      edit: {
        function: edit,
        shortcut: "Ctrl+E",
        disabled: layout.readOnly,
      },
      cut: {
        function: cut,
        shortcut: "Ctrl+X",
        disabled: layout.readOnly,
      },
      copy: {
        function: copy,
        shortcut: "Ctrl+C",
      },
      paste: {
        function: paste,
        shortcut: "Ctrl+V",
        disabled: layout.readOnly,
      },
      duplicate: {
        function: duplicate,
        shortcut: "Ctrl+D",
        disabled: layout.readOnly,
      },
      delete: {
        function: del,
        shortcut: "Del",
        disabled: layout.readOnly,
      },
      copy_as_image: {
        function: copyAsImage,
        shortcut: "Ctrl+Alt+C",
      },
    },
    view: {
      header: {
        state: layout.header ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("ui_visibility", "header"),
      },
      sidebar: {
        state: layout.sidebar ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("ui_visibility", "sidebar"),
      },
      issues: {
        state: layout.issues ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("ui_visibility", "issues"),
      },
      dbml_view: {
        state: layout.dbmlEditor ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("ui_visibility", "dbml_view"),
        shortcut: "Alt+E",
      },
      divider1: { divider: true },
      dark_mode: {
        state: settings.mode === "dark" ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("ui_visibility", "dark_mode"),
      },
      fullscreen: {
        state: fullscreen ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => {
          if (fullscreen) {
            exitFullscreen();
          } else {
            enterFullscreen();
          }
        },
      },
      presentation_mode: {
        function: () => {
          setLayout((prev) => ({
            ...prev,
            header: false,
            sidebar: false,
            toolbar: false,
          }));
          enterFullscreen();
        },
      },
      divider2: { divider: true },
      fit_window: {
        name: t("fit_window_reset"),
        function: () => fitWindow(100),
        shortcut: "Enter/Return",
      },
      all_settings: {
        name: t("all_settings"),
        function: () => openSettings(),
      },
    },
    settings: {
      show_grid: {
        name: t("grid"),
        state: settings.showGrid ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("editor_settings", "show_grid"),
      },
      snap_to_grid: {
        name: t("snap_to_grid"),
        state: settings.snapToGrid ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("editor_settings", "snap_to_grid"),
      },
      strict_mode: {
        name: t("strict_mode"),
        state: settings.strictMode ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("editor_settings", "strict_mode"),
      },
      divider1: { divider: true },
      show_datatype: {
        name: t("show_datatype"),
        state: settings.showDataTypes ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("diagram_display", "show_datatype"),
      },
      show_cardinality: {
        name: t("show_cardinality"),
        state: settings.showCardinality ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("diagram_display", "show_cardinality"),
      },
      show_pk_icons: {
        name: t("show_pk_icons"),
        state: settings.showPKIcons ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("diagram_display", "show_pk_icons"),
      },
      show_fk_icons: {
        name: t("show_fk_icons"),
        state: settings.showFKIcons ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("diagram_display", "show_fk_icons"),
      },
      field_details: {
        name: t("field_details"),
        state: settings.showFieldSummary ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("diagram_display", "field_details"),
      },
      table_names_uppercase: {
        name: t("table_names_uppercase"),
        state: settings.tableNamesUppercase ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("diagram_display", "table_names_uppercase"),
      },
      divider2: { divider: true },
      relationship_style: {
        name: t("relationship_style"),
        function: () => openSettings("diagram_display", "relationship_style"),
      },
      show_relationship_labels: {
        name: t("show_relationship_labels"),
        state: settings.showRelationshipLabels ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("editor_settings", "show_relationship_labels"),
      },
      spread_relations: {
        name: t("spread_relations"),
        state: settings.spreadRelations ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("editor_settings", "spread_relations"),
      },
      outbound_relations_in_table_color: {
        name: t("outbound_relations_in_table_color"),
        state: settings.outboundRelationsInTableColor ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("color_and_theme", "outbound_relations_in_table_color"),
      },
      relation_animations_in_table_color: {
        name: t("relation_animations_in_table_color"),
        state: settings.relationAnimationsInTableColor ? (
          <i className="bi bi-toggle-on" />
        ) : (
          <i className="bi bi-toggle-off" />
        ),
        function: () => openSettings("color_and_theme", "relation_animations_in_table_color"),
      },
      divider3: { divider: true },
      language: {
        name: t("language"),
        function: () => openSettings("language"),
      },
      side_margin: {
        name: t("side_margin"),
        function: () => openSettings("diagram_display", "side_margin"),
      },
      table_colors: {
        name: t("table_colors"),
        function: () => openSettings("color_and_theme", "table_colors"),
      },
      divider4: { divider: true },
      all_settings: {
        name: t("all_settings"),
        function: () => openSettings(),
      },
    },
    help: {
      docs: {
        function: () => window.open(`${socials.docs}`, "_blank"),
        shortcut: "Ctrl+H",
      },
      shortcuts: {
        function: () => window.open(`${socials.docs}/shortcuts`, "_blank"),
      },
      ask_on_discord: {
        function: () => window.open(socials.discord, "_blank"),
      },
      report_bug: {
        function: () => window.open("/bug-report", "_blank"),
      },
    },
  };

  useHotkeys("mod+i", fileImport, { preventDefault: true });
  useHotkeys("mod+z", undo, { preventDefault: true });
  useHotkeys("mod+y", redo, { preventDefault: true });
  useHotkeys("mod+s", save, { preventDefault: true });
  useHotkeys("mod+o", open, { preventDefault: true });
  useHotkeys("mod+e", edit, { preventDefault: true });
  useHotkeys("mod+d", duplicate, { preventDefault: true });
  useHotkeys("mod+c", copy, { preventDefault: true });
  useHotkeys("mod+v", paste, { preventDefault: true });
  useHotkeys("mod+x", cut, { preventDefault: true });
  useHotkeys("delete", del, { preventDefault: true });
  useHotkeys("mod+shift+g", viewGrid, { preventDefault: true });
  useHotkeys("mod+up", zoomIn, { preventDefault: true });
  useHotkeys("mod+down", zoomOut, { preventDefault: true });
  useHotkeys("mod+shift+m", viewStrictMode, {
    preventDefault: true,
  });
  useHotkeys("mod+shift+f", viewFieldSummary, {
    preventDefault: true,
  });
  useHotkeys("mod+shift+s", saveDiagramAs, {
    preventDefault: true,
  });
  useHotkeys("mod+alt+c", copyAsImage, { preventDefault: true });
  useHotkeys("enter", () => fitWindow(100), { preventDefault: true });
  useHotkeys("mod+h", () => window.open(socials.docs, "_blank"), {
    preventDefault: true,
  });
  useHotkeys("mod+alt+w", () => fitWindow(100), { preventDefault: true });
  useHotkeys("alt+e", toggleDBMLEditor, { preventDefault: true });

  return (
    <>
      <div>
        {layout.header && (
          <div
            className="flex justify-between items-center me-7"
            style={isRtl(i18n.language) ? { direction: "rtl" } : {}}
          >
            {header()}
            {window.name.split(" ")[0] !== "t" && (
              <Button
                type="primary"
                className="!text-base me-2 !pe-6 !ps-5 !py-[18px] !rounded-md"
                size="default"
                icon={<IconShareStroked />}
                onClick={() => setModal(MODAL.SHARE)}
              >
                {t("share")}
              </Button>
            )}
          </div>
        )}
        {layout.toolbar && toolbar()}
      </div>
      <Modal
        modal={modal}
        exportData={exportData}
        setExportData={setExportData}
        title={title}
        setTitle={setTitle}
        setDiagramId={setDiagramId}
        setModal={setModal}
        importFrom={importFrom}
        importDb={importDb}
        settingsTab={settingsTab}
        settingsOption={settingsOption}
      />
      <Sidesheet
        type={sidesheet}
        title={title}
        setTitle={setTitle}
        onClose={() => setSidesheet(SIDESHEET.NONE)}
      />
    </>
  );

  function toolbar() {
    return (
      <div
        className="py-1.5 px-5 flex justify-between items-center rounded-xl my-1 sm:mx-1 xl:mx-6 select-none overflow-hidden toolbar-theme"
        style={isRtl(i18n.language) ? { direction: "rtl" } : {}}
      >
        <div className="flex justify-start items-center">
          <LayoutDropdown setModal={setModal} />
          <Divider layout="vertical" margin="8px" />
          <Tooltip content={t("zoom_out")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm text-lg"
              onClick={() =>
                setTransform((prev) => ({ ...prev, zoom: prev.zoom / 1.2 }))
              }
            >
              <i className="fa-solid fa-magnifying-glass-minus" />
            </button>
          </Tooltip>
          <Dropdown
            style={{ width: "240px" }}
            position={isRtl(i18n.language) ? "bottomRight" : "bottomLeft"}
            render={
              <Dropdown.Menu
                style={isRtl(i18n.language) ? { direction: "rtl" } : {}}
              >
                <Dropdown.Item
                  onClick={() => fitWindow(100)}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>{t("fit_window_reset")}</div>
                  <div className="text-gray-400">Ctrl+Alt+W</div>
                </Dropdown.Item>
                <Dropdown.Divider />
                {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0].map((e, i) => (
                  <Dropdown.Item
                    key={i}
                    onClick={() => {
                      setTransform((prev) => ({ ...prev, zoom: e }));
                    }}
                  >
                    {Math.floor(e * 100)}%
                  </Dropdown.Item>
                ))}
                <Dropdown.Divider />
                <Dropdown.Item>
                  <InputNumber
                    // @ts-ignore
                    field="zoom"
                    label={t("zoom")}
                    placeholder={t("zoom")}
                    suffix={<div className="p-1">%</div>}
                    onChange={(v: any) =>
                      setTransform((prev: any) => ({
                        ...prev,
                        zoom: parseFloat(v.toString()) * 0.01,
                      }))
                    }
                  />
                </Dropdown.Item>
              </Dropdown.Menu>
            }
            trigger="click"
          >
            <div className="py-1 px-2 hover-2 rounded-sm flex items-center justify-center">
              <div className="w-[40px]">
                {Math.floor(transform.zoom * 100)}%
              </div>
              <div>
                <IconCaretdown />
              </div>
            </div>
          </Dropdown>
          <Tooltip content={t("zoom_in")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm text-lg"
              onClick={() =>
                setTransform((prev) => ({ ...prev, zoom: prev.zoom * 1.2 }))
              }
            >
              <i className="fa-solid fa-magnifying-glass-plus" />
            </button>
          </Tooltip>
          <Divider layout="vertical" margin="8px" />
          <Tooltip content={t("fit_window_reset")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm text-lg"
              onClick={() => fitWindow(100)}
            >
              <i className="fa-solid fa-expand" />
            </button>
          </Tooltip>
          <Divider layout="vertical" margin="8px" />
          <Tooltip content={t("undo")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
              disabled={undoStack.length === 0 || layout.readOnly}
              onClick={undo}
            >
              <IconUndo size="large" />
            </button>
          </Tooltip>
          <Tooltip content={t("redo")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
              disabled={redoStack.length === 0 || layout.readOnly}
              onClick={redo}
            >
              <IconRedo size="large" />
            </button>
          </Tooltip>
          <Divider layout="vertical" margin="8px" />
          <Tooltip content={t("add_table")} position="bottom">
            <button
              className="flex items-center py-1 px-2 hover-2 rounded-sm disabled:opacity-50"
              onClick={() => addTable()}
              disabled={layout.readOnly}
            >
              <IconAddTable />
            </button>
          </Tooltip>
          <Tooltip content={t("add_area")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
              onClick={() => addArea()}
              disabled={layout.readOnly}
            >
              <IconAddArea />
            </button>
          </Tooltip>
          <Tooltip content={t("add_note")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
              onClick={() => addNote()}
              disabled={layout.readOnly}
            >
              <IconAddNote />
            </button>
          </Tooltip>
          <Tooltip content={t("add_text")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
              onClick={() => addText()}
              disabled={layout.readOnly}
            >
              <IconAddText />
            </button>
          </Tooltip>
          <Tooltip content="Assign supertype" position="bottom">
            <button
              className={`py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 ${linking ? "text-blue-500" : ""}`}
              onClick={() => {
                if (bulkSelectedElements.length === 1 && bulkSelectedElements[0].type === ObjectType.TABLE) {
                  setLinking(true);
                  setLinkingLine({
                    startX: 0,
                    startY: 0,
                    endX: pointer.spaces.diagram.x,
                    endY: pointer.spaces.diagram.y,
                    startTableId: bulkSelectedElements[0].id,
                    startFieldId: -1,
                  });
                  setBulkSelectedElements([]);
                } else {
                  Toast.info("Select a table first");
                }
              }}
              disabled={layout.readOnly}
            >
              <IconSupertype />
            </button>
          </Tooltip>
          {isSingleXorGroupSelected && (
            <Tooltip content={t("convert_to_or")} position="bottom">
              <button
                className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-green-500"
                onClick={() => convertXorToOr(bulkSelectedElements[0].id)}
                disabled={layout.readOnly}
              >
                <IconAddOrGroup />
              </button>
            </Tooltip>
          )}
          {isSingleOrGroupSelected && (
            <Tooltip content={t("convert_to_xor")} position="bottom">
              <button
                className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-blue-500"
                onClick={() => convertOrToXor(bulkSelectedElements[0].id)}
                disabled={layout.readOnly}
              >
                <IconAddXorGroup />
              </button>
            </Tooltip>
          )}
          {(selectedElement.element !== ObjectType.NONE ||
            bulkSelectedElements.length > 0) && (
            <Tooltip content={t("delete")} position="bottom">
              <button
                className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-red-500"
                onClick={del}
                disabled={layout.readOnly}
              >
                <IconDeleteStroked />
              </button>
            </Tooltip>
          )}
          {canCreateXorGroup && (
            <Tooltip content={t("add_xor_group")} position="bottom">
              <button
                className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-blue-500"
                onClick={createXorGroup}
                disabled={layout.readOnly}
              >
                <IconAddXorGroup />
              </button>
            </Tooltip>
          )}
          {canCreateOrGroup && (
            <Tooltip content={t("add_or_group")} position="bottom">
              <button
                className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-green-500"
                onClick={createOrGroup}
                disabled={layout.readOnly}
              >
                <IconAddOrGroup />
              </button>
            </Tooltip>
          )}
          <Divider layout="vertical" margin="8px" />
          <Tooltip content={t("save")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
              onClick={save}
              disabled={layout.readOnly}
            >
              <IconSaveStroked size="extra-large" />
            </button>
          </Tooltip>

          <Tooltip content={t("to_do")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm text-xl -mt-0.5"
              onClick={() => setSidesheet(SIDESHEET.TODO)}
            >
              <i className="fa-regular fa-calendar-check" />
            </button>
          </Tooltip>
          <Divider layout="vertical" margin="8px" />
          <Tooltip content={t("versions")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm text-xl -mt-0.5"
              onClick={() => setSidesheet(SIDESHEET.VERSIONS)}
            >
              <i className="fa-solid fa-code-branch" />
            </button>
          </Tooltip>
          <Divider layout="vertical" margin="8px" />
          <Tooltip content={t("theme")} position="bottom">
            <button
              className="py-1 px-2 hover-2 rounded-sm text-xl -mt-0.5"
              onClick={() => {
                const body = document.body;
                if (body.hasAttribute("theme-mode")) {
                  if (body.getAttribute("theme-mode") === "light") {
                    menu["view"]["theme"].children[1].function();
                  } else {
                    menu["view"]["theme"].children[0].function();
                  }
                }
              }}
            >
              <i className="fa-solid fa-circle-half-stroke" />
            </button>
          </Tooltip>
        </div>
        <button
          onClick={() => invertLayout("header")}
          className="flex items-center"
        >
          {layout.header ? <IconChevronUp /> : <IconChevronDown />}
        </button>
      </div>
    );
  }

  function getState() {
    switch (saveState) {
      case State.NONE:
        return t("no_changes");
      case State.LOADING:
        return t("loading");
      case State.SAVED:
        return `${t("last_saved")} ${lastSaved}`;
      case State.SAVING:
        return t("saving");
      case State.ERROR:
        return t("failed_to_save");
      case State.FAILED_TO_LOAD:
        return t("failed_to_load");
      default:
        return "";
    }
  }

  function header() {
    return (
      <nav
        className="flex justify-between pt-1 items-center whitespace-nowrap"
        style={isRtl(i18n.language) ? { direction: "rtl" } : {}}
      >
        <div className="flex justify-start items-center">
          <Link to="/">
            <img
              width={54}
              src={icon}
              alt="logo"
              className="ms-7 min-w-[54px]"
            />
          </Link>
          <div className="ms-1 mt-1">
            <div className="flex items-center ms-3 gap-2">
              {databases[database].image && (
                <img
                  src={databases[database].image}
                  className="h-5"
                  style={{
                    filter:
                      "opacity(0.4) drop-shadow(0 0 0 white) drop-shadow(0 0 0 white)",
                  }}
                  alt={databases[database].name + " icon"}
                  title={databases[database].name + " diagram"}
                />
              )}
              <div
                className="text-xl flex items-center gap-1 me-1"
                onPointerEnter={(e) => e.isPrimary && setShowEditName(true)}
                onPointerLeave={(e) => e.isPrimary && setShowEditName(false)}
                onPointerDown={(e) => {
                  // Required for onPointerLeave to trigger when a touch pointer leaves
                  // https://stackoverflow.com/a/70976017/1137077
                  (e.target as any).releasePointerCapture(e.pointerId);
                }}
                onClick={!layout.readOnly && (() => setModal(MODAL.RENAME))}
              >
                <span>
                  {(window.name.split(" ")[0] === "t"
                    ? "Templates/"
                    : "Diagrams/") + title}
                </span>
                {version && (
                  <Tag className="mt-1" color="blue" size="small">
                    {version.substring(0, 7)}
                  </Tag>
                )}
              </div>
              {(showEditName || modal === MODAL.RENAME) && !layout.readOnly && (
                <IconEdit />
              )}
            </div>
            <div className="flex items-center">
              <div className="flex justify-start text-md select-none me-2">
                {Object.keys(menu).map((category) => (
                  <Dropdown
                    key={category}
                    position="bottomLeft"
                    style={{
                      width: "240px",
                      direction: isRtl(i18n.language) ? "rtl" : "ltr",
                    }}
                    render={
                      <Dropdown.Menu className="menu max-h-[calc(100vh-80px)] overflow-auto">
                        {Object.keys(menu[category]).map((item, index) => {
                          if (menu[category][item].divider) {
                            return <Dropdown.Divider key={index} />;
                          }
                          if (menu[category][item].children) {
                            return (
                              <Dropdown
                                className="min-w-36 max-w-72"
                                key={item}
                                position="rightTop"
                                render={
                                  <Dropdown.Menu>
                                    {menu[category][item].children.map(
                                      (e, i) => {
                                        if (e.divider) {
                                          return (
                                            <Dropdown.Divider
                                              key={`divider-${i}`}
                                            />
                                          );
                                        }
                                        return (
                                          <Dropdown.Item
                                            key={i}
                                            onClick={e.function}
                                            className="flex w-full items-center justify-between gap-1"
                                            disabled={e.disabled}
                                          >
                                            <span className="truncate flex-1 min-w-0">
                                              {e.name}
                                            </span>
                                            {e.label && (
                                              <Tag
                                                size="small"
                                                className="flex-shrink-0"
                                              >
                                                {e.label}
                                              </Tag>
                                            )}
                                          </Dropdown.Item>
                                        );
                                      },
                                    )}
                                  </Dropdown.Menu>
                                }
                              >
                                <Dropdown.Item
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                  onClick={menu[category][item].function}
                                >
                                  {t(item)}

                                  {isRtl(i18n.language) ? (
                                    <IconChevronLeft />
                                  ) : (
                                    <IconChevronRight />
                                  )}
                                </Dropdown.Item>
                              </Dropdown>
                            );
                          }
                          if (
                            menu[category][item].warning &&
                            !menu[category][item].disabled
                          ) {
                            return (
                              <Popconfirm
                                key={index}
                                title={menu[category][item].warning.title}
                                content={menu[category][item].warning.message}
                                onConfirm={menu[category][item].function}
                                position="right"
                                okText={t("confirm")}
                                cancelText={t("cancel")}
                              >
                                <Dropdown.Item>{t(item)}</Dropdown.Item>
                              </Popconfirm>
                            );
                          }
                          return (
                            <Dropdown.Item
                              key={index}
                              disabled={menu[category][item].disabled}
                              onClick={menu[category][item].function}
                              style={
                                (menu[category][item].shortcut ||
                                  menu[category][item].state) && {
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }
                              }
                            >
                              <div className="w-full flex items-center justify-between">
                                <div>
                                  {menu[category][item].name || t(item)}
                                </div>
                                <div className="flex items-center gap-2">
                                  {menu[category][item].shortcut && (
                                    <div className="text-gray-400">
                                      {menu[category][item].shortcut}
                                    </div>
                                  )}
                                  {menu[category][item].state && (
                                    <div className="text-lg flex items-center">
                                      {menu[category][item].state}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Dropdown.Item>
                          );
                        })}
                      </Dropdown.Menu>
                    }
                  >
                    <div className="px-3 py-1 hover-2 rounded-sm">
                      {t(category)}
                    </div>
                  </Dropdown>
                ))}
              </div>
              {layout.readOnly && <Tag size="small">{t("read_only")}</Tag>}
              {!layout.readOnly && (
                <Tag
                  size="small"
                  type="light"
                  prefixIcon={
                    saveState === State.LOADING ||
                    saveState === State.SAVING ? (
                      <Spin size="small" />
                    ) : null
                  }
                >
                  {getState()}
                </Tag>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
