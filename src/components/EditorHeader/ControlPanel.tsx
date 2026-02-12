import { useContext, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Toast,
} from "@douyinfe/semi-ui";
import { dataURItoBlob } from "../../utils/utils";
import {
  ObjectType,
  Action,
  Tab,
  State,
  MODAL,
  SIDESHEET,
  DB,
  IMPORT_FROM,
  Cardinality,
  NOTE_CONFIG,
  EXPORT_CONFIG,
} from "../../data/constants";
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
  useTasks,
  useTexts,
  useCanvas,
  useFullscreen,
} from "../../hooks";
import { enterFullscreen, exitFullscreen } from "../../utils/fullscreen";
import Sidesheet from "./SideSheet/Sidesheet";
import Modal from "./Modal/Modal";
import Toolbar from "./ControlPanel/Toolbar/Toolbar";
import Header from "./ControlPanel/Header/Header";
import { useTranslation } from "react-i18next";
import { databases } from "../../data/databases";
import { isRtl } from "../../i18n/utils/rtl";
import { IdContext } from "../Workspace";
import { socials } from "../../data/socials";
import { nanoid } from "nanoid";
import { DateTime } from "luxon";
import { ControlPanelProps, } from "../../types";
import { getMenuConfig } from "./ControlPanel/utils/menuConfig";
import { toPng } from "html-to-image";

import { useControlPanelHotkeys } from "../../hooks/ControlPanel/useControlPanelHotkeys";
import { useControlPanelActions } from "../../hooks/ControlPanel/useControlPanelActions";
import { useClipboardActions } from "../../hooks/ControlPanel/useClipboardActions";
import { useControlPanelState } from "../../hooks/ControlPanel/useControlPanelState";
import { useDiagramActions } from "../../hooks/ControlPanel/useDiagramActions";
import { useExportActions } from "../../hooks/ControlPanel/useExportActions";
import { useViewActions } from "../../hooks/ControlPanel/useViewActions";

export default function ControlPanel({
  diagramId,
  setDiagramId,
  title,
  setTitle,
  lastSaved,
}: ControlPanelProps) {
  const {
    modal,
    setModal,
    settingsTab,
    setSettingsTab,
    settingsOption,
    setSettingsOption,
    sidesheet,
    setSidesheet,
    showEditName,
    setShowEditName,
    importDb,
    setImportDb,
    importFrom,
    setImportFrom,
    exportData,
    setExportData,
    openSettings,
    closeSidesheet,
  } = useControlPanelState(title);

  const { saveState, setSaveState } = useSaveState();
  const { layout, setLayout } = useLayout();
  const { settings, setSettings } = useSettings();
  const {
    relationships,
    tables,
    setTables,
    addTable,
    updateTable,
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
    setHoveredTable,

  } = useDiagram();
  const { pointer } = useCanvas();
  const { enums, setEnums } = useEnums();
  const { types, setTypes } = useTypes();
  const { notes, setNotes, updateNote, addNote, deleteNote } = useNotes();
  const { texts, addText, deleteText, updateText } = useTexts();
  const { areas, setAreas, updateArea, addArea, deleteArea } = useAreas();
  const { tasks, setTasks } = useTasks();
  const { undoStack, redoStack, setUndoStack, setRedoStack } = useUndoRedo();
  const {
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
  } = useSelect();
  const { transform, setTransform } = useTransform();
  const fullscreen = useFullscreen();
  const { t, i18n } = useTranslation();
  const { version, gistId, setGistId } = useContext(IdContext);
  const navigate = useNavigate();

  const {
    save,
    loadDiagram,
    saveDiagramAsTemplate,
    delDiagram,
    recentlyOpenedDiagrams,
  } = useDiagramActions({
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
  });

  const {
    copy,
    paste,
    cut,
    duplicate,
    del,
    edit,
  } = useClipboardActions({
    tables,
    addTable,
    deleteTable,
    notes,
    addNote,
    deleteNote,
    areas,
    addArea,
    deleteArea,
    relationships,
    deleteRelationship,
    updateRelationship,
    xorGroups,
    deleteXorGroup,
    orGroups,
    deleteOrGroup,
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
    setUndoStack,
    setRedoStack,
    layout,
    t,
  });

  const {
    undo,
    redo,
    rotateRelationshipName,
    createXorGroup,
    createOrGroup,
    canCreateXorGroup,
    canCreateOrGroup,
    isSingleXorGroupSelected,
    isSingleOrGroupSelected,
    hasSelectedRelationships,
    relationshipOptions,
  } = useControlPanelActions({
    tables,
    setTables,
    addTable,
    updateTable,
    deleteTable,
    updateField,
    relationships,
    setRelationships,
    addRelationship,
    deleteRelationship,
    updateRelationship,
    undoStack,
    redoStack,
    setUndoStack,
    setRedoStack,
    areas,
    deleteArea,
    addArea,
    updateArea,
    notes,
    deleteNote,
    addNote,
    updateNote,
    texts,
    deleteText,
    addText,
    updateText,
    xorGroups,
    addXorGroup,
    deleteXorGroup,
    orGroups,
    addOrGroup,
    deleteOrGroup,
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
    layout,
    t,
  });

  const {
    exportSource,
    exportGenericSQL,
    exportAsImage,
    exportAsJSON,
    exportAsDBML,
    exportAsPDF,
    exportAsMermaid,
    exportAsMarkdown,
  } = useExportActions({
    tables,
    relationships,
    types,
    enums,
    database,
    notes,
    areas,
    title,
    setModal,
    setExportData,
    exportData,
    t,
  });

  const {
    fileImport,
    viewGrid,
    snapToGrid,
    zoomIn,
    zoomOut,
    viewStrictMode,
    viewFieldSummary,
    copyAsImage,
    resetView,
    fitWindow,
    toggleDBMLEditor,
    invertLayout,
  } = useViewActions({
    setModal,
    setSettings,
    setTransform,
    setHoveredTable,
    setTables,
    tables,
    areas,
    notes,
    setLayout,
    t,
  });


  const saveDiagramAs = useCallback(() => setModal(MODAL.SAVE_AS), [setModal]);

  const menu = useMemo(
    () =>
      getMenuConfig({
        t,
        i18n,
        setModal,
        loadDiagram,
        save,
        recentlyOpenedDiagrams,
        layout,
        saveDiagramAs,
        saveDiagramAsTemplate,
        delDiagram,
        setImportFrom,
        database,
        setImportDb,
        exportGenericSQL,
        exportSource,
        exportAsImage,
        exportAsJSON,
        exportAsDBML,
        exportAsPDF,
        exportAsMermaid,
        exportAsMarkdown,
        saveState,
        navigate,
        undo,
        redo,
        undoStack,
        redoStack,
        setTables,
        setRelationships,
        setAreas,
        setNotes,
        setEnums,
        setTypes,
        setUndoStack,
        setRedoStack,
        diagramId,
        db,
        edit,
        cut,
        copy,
        paste,
        duplicate,
        del,
        copyAsImage,
        openSettings,
        settings,
        fullscreen,
        setLayout,
        fitWindow,
      }),
    [
      t,
      i18n,
      setModal,
      loadDiagram,
      save,
      recentlyOpenedDiagrams,
      layout,
      saveDiagramAs,
      saveDiagramAsTemplate,
      delDiagram,
      setImportFrom,
      database,
      setImportDb,
      exportGenericSQL,
      exportSource,
      exportAsImage,
      exportAsJSON,
      exportAsDBML,
      exportAsPDF,
      exportAsMermaid,
      exportAsMarkdown,
      saveState,
      navigate,
      undo,
      redo,
      undoStack,
      redoStack,
      setTables,
      setRelationships,
      setAreas,
      setNotes,
      setEnums,
      setTypes,
      setUndoStack,
      setRedoStack,
      diagramId,
      edit,
      cut,
      copy,
      paste,
      duplicate,
      del,
      copyAsImage,
      openSettings,
      settings,
      fullscreen,
      setLayout,
      fitWindow,
    ],
  );

  useControlPanelHotkeys({
    undo,
    redo,
    save,
    open: () => {},
    edit,
    duplicate,
    copy,
    paste,
    cut,
    del,
    viewGrid,
    zoomIn,
    zoomOut,
    viewStrictMode,
    viewFieldSummary,
    saveDiagramAs,
    copyAsImage,
    fitWindow,
    toggleDBMLEditor,
    fileImport,
  });

  return (
    <>
      <div>
        {layout.header && (
          <Header
            title={title}
            version={version}
            modal={modal}
            setModal={setModal}
            showEditName={showEditName}
            setShowEditName={setShowEditName}
            menu={menu}
          />
        )}
        {layout.toolbar && (
          <Toolbar
            setModal={setModal}
            setSidesheet={setSidesheet}
            undo={undo}
            redo={redo}
            save={save}
            addTable={addTable}
            addArea={addArea}
            addNote={addNote}
            addText={addText}
            fitWindow={fitWindow}
            createXorGroup={createXorGroup}
            createOrGroup={createOrGroup}
            rotateRelationshipName={rotateRelationshipName}
            del={del}
            isSingleXorGroupSelected={isSingleXorGroupSelected}
            isSingleOrGroupSelected={isSingleOrGroupSelected}
            hasSelectedRelationships={hasSelectedRelationships}
            convertXorToOr={convertXorToOr}
            convertOrToXor={convertOrToXor}
            relationshipOptions={relationshipOptions}
            canCreateXorGroup={canCreateXorGroup}
            canCreateOrGroup={canCreateOrGroup}
          />
        )}
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
        onClose={closeSidesheet}
      />
    </>
  );
}
