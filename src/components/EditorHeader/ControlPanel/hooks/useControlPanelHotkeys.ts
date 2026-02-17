import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { socials } from "@data/socials.js";

export const useControlPanelHotkeys = ({
  undo,
  redo,
  save,
  open,
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
}: any) => {
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
};
