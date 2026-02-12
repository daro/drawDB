import { useState, useCallback } from "react";
import { isRtl } from "../i18n/utils/rtl";

const SIDEPANEL_MIN_WIDTH = 384;

export const useWorkspaceState = (initialTitle: string) => {
  const [id, setId] = useState<string | number>(0);
  const [gistId, setGistId] = useState("");
  const [version, setVersion] = useState("");
  const [loadedFromGistId, setLoadedFromGistId] = useState("");
  const [title, setTitle] = useState(initialTitle);
  const [resize, setResize] = useState(false);
  const [width, setWidth] = useState(SIDEPANEL_MIN_WIDTH);
  const [lastSaved, setLastSaved] = useState("");
  const [showSelectDbModal, setShowSelectDbModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedDb, setSelectedDb] = useState("");

  const handleResize = useCallback((e: any, language: string) => {
    if (!resize) return;
    const w = isRtl(language) ? window.innerWidth - e.clientX : e.clientX;
    if (w > SIDEPANEL_MIN_WIDTH) setWidth(w);
  }, [resize]);

  return {
    id,
    setId,
    gistId,
    setGistId,
    version,
    setVersion,
    loadedFromGistId,
    setLoadedFromGistId,
    title,
    setTitle,
    resize,
    setResize,
    width,
    setWidth,
    lastSaved,
    setLastSaved,
    showSelectDbModal,
    setShowSelectDbModal,
    showRestoreModal,
    setShowRestoreModal,
    selectedDb,
    setSelectedDb,
    handleResize,
  };
};
