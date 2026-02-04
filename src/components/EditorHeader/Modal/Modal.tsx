import {
  Image,
  Input,
  Modal as SemiUIModal,
  Spin,
  Toast,
} from "@douyinfe/semi-ui";
import { saveAs } from "file-saver";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { DB, MODAL, STATUS, State } from "../../../data/constants";
import { databases } from "../../../data/databases";
import { db } from "../../../data/db";
import {
  useAreas,
  useDiagram,
  useEnums,
  useNotes,
  useSaveState,
  useTasks,
  useTransform,
  useTypes,
  useUndoRedo,
  useTexts,
  useSettings,
} from "../../../hooks";
import { isRtl } from "../../../i18n/utils/rtl";
import { importSQL } from "../../../utils/importSQL";
import {
  getModalTitle,
  getModalWidth,
  getOkText,
} from "../../../utils/modalData";
import CodeEditor from "../../CodeEditor";
import ImportDiagram from "./ImportDiagram";
import ImportSource from "./ImportSource";
import Language from "./Language";
import New from "./New";
import Open from "./Open";
import Rename from "./Rename";
import SetTableWidth from "./SetTableWidth";
import SetSideMargin from "./SetSideMargin";
import SetTableColors from "./SetTableColors";
import Share from "./Share";
import Settings from "./Settings";
import { IdContext } from "../../Workspace";
import { nanoid } from "nanoid";
import { ModalProps } from "../../../types";

const extensionToLanguage = {
  md: "markdown",
  sql: "sql",
  dbml: "dbml",
  json: "json",
};

export default function Modal({
  modal,
  setModal,
  title,
  setTitle,
  setDiagramId,
  exportData,
  setExportData,
  importDb,
  importFrom,
  settingsTab,
  settingsOption,
}: ModalProps) {
  const { t, i18n } = useTranslation();
  const { setGistId } = useContext(IdContext);
  const {
    setTables,
    setRelationships,
    setXorGroups,
    setOrGroups,
    database,
    setDatabase,
  } = useDiagram();
  const { setNotes } = useNotes();
  const { setTexts } = useTexts();
  const { setAreas } = useAreas();
  const { setTypes } = useTypes();
  const { setEnums } = useEnums();
  const { setTasks } = useTasks();
  const { setTransform } = useTransform();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { setSaveState } = useSaveState();
  const { settings, setSettings } = useSettings();
  const [uncontrolledTitle, setUncontrolledTitle] = useState(title);
  const [uncontrolledLanguage, setUncontrolledLanguage] = useState(
    i18n.language,
  );
  const [importSource, setImportSource] = useState({
    src: "",
    overwrite: false,
  });
  const [importData, setImportData] = useState(null);
  const [error, setError] = useState({
    type: STATUS.NONE,
    message: "",
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState(-1);
  const [selectedDiagramId, setSelectedDiagramId] = useState(0);
  const [saveAsTitle, setSaveAsTitle] = useState(title);

  const overwriteDiagram = () => {
    setTables(importData.tables);
    setRelationships(importData.relationships);
    setXorGroups(importData.xorGroups ?? []);
    setOrGroups(importData.orGroups ?? []);
    setAreas(importData.subjectAreas ?? []);
    setNotes(importData.notes ?? []);
    setTexts(importData.texts ?? []);
    setTasks(importData.todos ?? []);
    if (importData.title) {
      setTitle(importData.title);
    }
    if (databases[database].hasEnums && importData.enums) {
      setEnums(importData.enums);
    }
    if (databases[database].hasTypes && importData.types) {
      setTypes(importData.types);
    }
  };

  const loadDiagram = async (id) => {
    await (db as any).diagrams
      .get(id)
      .then((diagram) => {
        if (diagram) {
          if (diagram.database) {
            setDatabase(diagram.database);
          } else {
            setDatabase(DB.GENERIC);
          }
          setDiagramId(diagram.id);
          setTitle(diagram.name);
          setTables(diagram.tables);
          setRelationships(diagram.references);
          setXorGroups(diagram.xorGroups ?? []);
          setOrGroups(diagram.orGroups ?? []);
          setAreas(diagram.areas);
          setNotes(diagram.notes);
          setTasks(diagram.todos ?? []);
          setGistId(diagram.gistId ?? "");
          setTransform({
            pan: diagram.pan,
            zoom: diagram.zoom,
          });
          setUndoStack([]);
          setRedoStack([]);
          if (databases[diagram.database].hasTypes) {
            setTypes(
              diagram.types.map((t) =>
                t.id
                  ? t
                  : {
                      ...t,
                      id: nanoid(),
                      fields: t.fields.map((f) =>
                        f.id ? f : { ...f, id: nanoid() },
                      ),
                    },
              ),
            );
          }
          if (databases[diagram.database].hasEnums) {
            setEnums(
              diagram.enums.map((e) => (!e.id ? { ...e, id: nanoid() } : e)) ??
                [],
            );
          }
          window.name = `d ${diagram.id}`;
          setSaveState(State.SAVING);
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

  const parseSQLAndLoadDiagram = async () => {
    const targetDatabase = database === DB.GENERIC ? importDb : database;

    let ast = null;
    try {
      if (targetDatabase === DB.ORACLESQL) {
        // Lazy load Oracle parser only when needed
        const { Parser: OracleParser } = await import("oracle-sql-parser");
        const oracleParser = new OracleParser();

        ast = oracleParser.parse(importSource.src);
      } else {
        // Lazy load SQL parser only when needed
        const { Parser } = await import("node-sql-parser");
        const parser = new Parser();

        ast = parser.astify(importSource.src, {
          database: targetDatabase,
        });
      }
    } catch (error) {
      const message = error.location
        ? `${error.name} [Ln ${error.location.start.line}, Col ${error.location.start.column}]: ${error.message}`
        : error.message;

      setError({ type: STATUS.ERROR, message });
      return;
    }

    try {
      const diagramData = importSQL(
        ast,
        database === DB.GENERIC ? importDb : database,
        database,
      );

      if (importSource.overwrite) {
        setTables(diagramData.tables);
        setRelationships(diagramData.relationships);
        setXorGroups(diagramData.xorGroups ?? []);
        setOrGroups(diagramData.orGroups ?? []);
        if (databases[database].hasTypes) setTypes(diagramData.types ?? []);
        if (databases[database].hasEnums) setEnums(diagramData.enums ?? []);
        setTransform((prev) => ({ ...prev, pan: { x: 0, y: 0 } }));
        setNotes([]);
        setAreas([]);
      } else {
        setTables((prev) => [...prev, ...diagramData.tables]);
        setRelationships((prev) =>
          [...prev, ...diagramData.relationships].map((r, i) => ({
            ...r,
            id: i,
          })),
        );
        if (databases[database].hasTypes && diagramData.types.length)
          setTypes((prev) => [...prev, ...diagramData.types]);
        if (databases[database].hasEnums && diagramData.enums.length)
          setEnums((prev) => [...prev, ...diagramData.enums]);
      }

      setUndoStack([]);
      setRedoStack([]);

      setModal(MODAL.NONE);
    } catch (e) {
      setError({
        type: STATUS.ERROR,
        message: `Please check for syntax errors or let us know about the error.`,
      });
    }
  };

  const createNewDiagram = (id) => {
    const newWindow = window.open("/editor");
    newWindow.name = "lt " + id;
  };

  const getModalOnOk = async () => {
    switch (modal) {
      case MODAL.IMG:
        saveAs(
          exportData.data,
          `${exportData.filename}.${exportData.extension}`,
        );
        return;
      case MODAL.CODE: {
        const blob = new Blob([exportData.data], {
          type: "application/json",
        });
        saveAs(blob, `${exportData.filename}.${exportData.extension}`);
        return;
      }
      case MODAL.IMPORT:
        if (error.type !== STATUS.ERROR) {
          setTransform((prev) => ({ ...prev, pan: { x: 0, y: 0 } }));
          overwriteDiagram();
          setImportData(null);
          setModal(MODAL.NONE);
          setUndoStack([]);
          setRedoStack([]);
        }
        return;
      case MODAL.IMPORT_SRC:
        parseSQLAndLoadDiagram();
        return;
      case MODAL.OPEN:
        if (selectedDiagramId === 0) return;
        loadDiagram(selectedDiagramId);
        setModal(MODAL.NONE);
        return;
      case MODAL.RENAME:
        setTitle(uncontrolledTitle);
        setModal(MODAL.NONE);
        return;
      case MODAL.SAVEAS:
        setTitle(saveAsTitle);
        setModal(MODAL.NONE);
        return;
      case MODAL.NEW:
        createNewDiagram(selectedTemplateId);
        setModal(MODAL.NONE);
        return;
      case MODAL.LANGUAGE:
        i18n.changeLanguage(uncontrolledLanguage);
        setModal(MODAL.NONE);
        return;
      default:
        setModal(MODAL.NONE);
        return;
    }
  };

  const getModalBody = () => {
    switch (modal) {
      case MODAL.IMPORT:
        return (
          <ImportDiagram
            setImportData={setImportData}
            error={error}
            setError={setError}
            importFrom={importFrom}
          />
        );
      case MODAL.IMPORT_SRC:
        return (
          <ImportSource
            importData={importSource}
            setImportData={setImportSource}
            error={error}
            setError={setError}
          />
        );
      case MODAL.NEW:
        return (
          <New
            selectedTemplateId={selectedTemplateId}
            setSelectedTemplateId={setSelectedTemplateId}
          />
        );
      case MODAL.RENAME:
        return (
          <Rename key={title} title={title} setTitle={setUncontrolledTitle} />
        );
      case MODAL.OPEN:
        return (
          <Open
            selectedDiagramId={selectedDiagramId}
            setSelectedDiagramId={(id: any) => setSelectedDiagramId(id)}
          />
        );
      case MODAL.SAVEAS:
        return (
          <Input
            placeholder={t("name")}
            value={saveAsTitle}
            onChange={(v) => setSaveAsTitle(v)}
          />
        );
      case MODAL.CODE:
      case MODAL.IMG:
        if (exportData.data !== "" || exportData.data) {
          return (
            <>
              {modal === MODAL.IMG ? (
                <Image src={exportData.data} alt="Diagram" height={280} />
              ) : (
                <CodeEditor
                  // @ts-ignore
                  extraControls={null}
                  filename=""
                  height={360}
                  value={exportData.data}
                  language={extensionToLanguage[exportData.extension]}
                  options={{ readOnly: true }}
                  showCopyButton={true}
                />
              )}
              <div className="text-sm font-semibold mt-2">{t("filename")}:</div>
              <Input
                value={exportData.filename}
                placeholder={t("filename")}
                suffix={<div className="p-2">{`.${exportData.extension}`}</div>}
                onChange={(value) =>
                  setExportData((prev) => ({ ...prev, filename: value }))
                }
                // @ts-ignore
                field="filename"
              />
            </>
          );
        } else {
          return (
            <div className="text-center my-3 text-sky-600">
              <Spin tip={t("loading")} size="large" />
            </div>
          );
        }
      case MODAL.TABLE_WIDTH:
        return <SetTableWidth />;
      case MODAL.SIDE_MARGIN:
        return <SetSideMargin />;
      case MODAL.TABLE_COLORS:
        return <SetTableColors />;
      case MODAL.LANGUAGE:
        return (
          <Language
            language={uncontrolledLanguage}
            setLanguage={setUncontrolledLanguage}
          />
        );
      case MODAL.SHARE:
        return <Share title={title} setModal={setModal} />;
      case MODAL.SETTINGS:
        return (
          <Settings
            settingsTab={settingsTab}
            settingsOption={settingsOption}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <SemiUIModal
      style={
        modal === MODAL.SETTINGS
          ? {
              position: "fixed",
              top: `calc(50% + ${settings.settingsPosition.y}px)`,
              left: `calc(50% + ${settings.settingsPosition.x}px)`,
              transform: "translate(-50%, -50%)",
              margin: 0,
              pointerEvents: "auto",
              direction: isRtl(i18n.language) ? "rtl" : "ltr",
              zIndex: 1001,
            }
          : isRtl(i18n.language)
            ? { direction: "rtl" }
            : {}
      }
      title={
        <div
          onMouseDown={(e) => {
            if (modal !== MODAL.SETTINGS) return;
            const startX = e.clientX;
            const startY = e.clientY;
            const initialX = settings.settingsPosition.x;
            const initialY = settings.settingsPosition.y;

            const onMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX;
              const deltaY = moveEvent.clientY - startY;
              setSettings((prev) => ({
                ...prev,
                settingsPosition: {
                  x: initialX + deltaX,
                  y: initialY + deltaY,
                },
              }));
            };

            const onMouseUp = () => {
              window.removeEventListener("mousemove", onMouseMove);
              window.removeEventListener("mouseup", onMouseUp);
            };

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
          }}
          className={modal === MODAL.SETTINGS ? "w-full cursor-move select-none" : ""}
        >
          {getModalTitle(modal)}
        </div>
      }
      visible={modal !== MODAL.NONE}
      onOk={getModalOnOk}
      afterClose={() => {
        setExportData({
          data: "",
          extension: "",
          filename: `${title}_${new Date().toISOString()}`,
        });
        setError({
          type: STATUS.NONE,
          message: "",
        });
        setImportData(null);
        setImportSource({
          src: "",
          overwrite: false,
        });
      }}
      onCancel={() => {
        if (modal === MODAL.RENAME) setUncontrolledTitle(title);
        if (modal === MODAL.LANGUAGE) setUncontrolledLanguage(i18n.language);
        setModal(MODAL.NONE);
      }}
      mask={modal !== MODAL.SETTINGS}
      maskStyle={modal === MODAL.SETTINGS ? { pointerEvents: "none" } : {}}
      maskClosable={modal !== MODAL.SETTINGS}
      centered={modal !== MODAL.SETTINGS}
      closeOnEsc={true}
      okText={getOkText(modal)}
      okButtonProps={{
        disabled:
          (error && error?.type === STATUS.ERROR) ||
          (modal === MODAL.IMPORT &&
            (error.type === STATUS.ERROR || !importData)) ||
          (modal === MODAL.RENAME && title === "") ||
          ((modal === MODAL.IMG || modal === MODAL.CODE) && !exportData.data) ||
          (modal === MODAL.SAVEAS && saveAsTitle === "") ||
          (modal === MODAL.IMPORT_SRC && importSource.src === ""),
        hidden: modal === MODAL.SHARE,
      }}
      hasCancel={modal !== MODAL.SHARE}
      cancelText={t("cancel")}
      width={getModalWidth(modal)}
      bodyStyle={{
        maxHeight: window.innerHeight - 280,
        overflow:
          modal === MODAL.CODE || modal === MODAL.IMG ? "hidden" : "auto",
        direction: "ltr",
      }}
    >
      {getModalBody()}
    </SemiUIModal>
  );
}
