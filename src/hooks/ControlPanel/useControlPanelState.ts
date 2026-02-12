import { useState, useCallback } from "react";
import { MODAL, SIDESHEET, IMPORT_FROM } from "../../data/constants";

export const useControlPanelState = (title: string) => {
  const [modal, setModal] = useState(MODAL.NONE);
  const [settingsTab, setSettingsTab] = useState<string | undefined>(undefined);
  const [settingsOption, setSettingsOption] = useState<string | undefined>(undefined);
  const [sidesheet, setSidesheet] = useState(SIDESHEET.NONE);
  const [showEditName, setShowEditName] = useState(false);
  const [importDb, setImportDb] = useState("");
  const [importFrom, setImportFrom] = useState(IMPORT_FROM.JSON);
  const [exportData, setExportData] = useState({
    data: null,
    filename: `${title}_${new Date().toISOString()}`,
    extension: "",
  });

  const openSettings = useCallback((tab?: string, option?: string) => {
    setSettingsTab(tab);
    setSettingsOption(option);
    setModal(MODAL.SETTINGS);
  }, []);

  const closeSidesheet = useCallback(() => setSidesheet(SIDESHEET.NONE), []);

  return {
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
  };
};
