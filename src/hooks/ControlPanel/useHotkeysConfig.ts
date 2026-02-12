import { useHotkeys } from "react-hotkeys-hook";
import { socials } from "../../data/socials";

export const useHotkeysConfig = (
  undo: () => void,
  redo: () => void,
  save: () => void,
  addTable: () => void,
  addArea: () => void,
  addNote: () => void,
  addText: () => void,
  del: () => void,
  copyAsImage: () => void,
  fitWindow: (val: number) => void,
  saveDiagramAs: () => void,
  toggleDBMLEditor: () => void,
) => {
  useHotkeys("mod+z", undo, { preventDefault: true });
  useHotkeys("mod+shift+z", redo, { preventDefault: true });
  useHotkeys("mod+s", save, { preventDefault: true });
  useHotkeys("mod+shift+s", saveDiagramAs, { preventDefault: true });
  useHotkeys("alt+t", addTable, { preventDefault: true });
  useHotkeys("alt+a", addArea, { preventDefault: true });
  useHotkeys("alt+n", addNote, { preventDefault: true });
  useHotkeys("alt+x", addText, { preventDefault: true });
  useHotkeys("delete, backspace", del);
  useHotkeys("mod+alt+c", copyAsImage, { preventDefault: true });
  useHotkeys("enter", () => fitWindow(100), { preventDefault: true });
  useHotkeys("mod+alt+w", () => fitWindow(100), { preventDefault: true });
  useHotkeys("alt+e", toggleDBMLEditor, { preventDefault: true });
  useHotkeys("mod+h", () => window.open(socials.docs, "_blank"), {
    preventDefault: true,
  });
};
