import { useCallback } from "react";
import { Toast } from "@douyinfe/semi-ui";
import { toPng } from "html-to-image";
import { dataURItoBlob } from "../../utils/utils";
import {
  MODAL,
  EXPORT_CONFIG,
  NOTE_CONFIG,
} from "../../data/constants";

/**
 * Hook for handling view and canvas related actions.
 */
export const useViewActions = ({
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
}: any) => {
  const fileImport = useCallback(() => setModal(MODAL.IMPORT), [setModal]);

  const viewGrid = useCallback(
    () => setSettings((prev: any) => ({ ...prev, showGrid: !prev.showGrid })),
    [setSettings]
  );

  const snapToGrid = useCallback(
    () => setSettings((prev: any) => ({ ...prev, snapToGrid: !prev.snapToGrid })),
    [setSettings]
  );

  const zoomIn = useCallback(
    () => setTransform((prev: any) => ({ ...prev, zoom: prev.zoom * 1.2 })),
    [setTransform]
  );

  const zoomOut = useCallback(
    () => setTransform((prev: any) => ({ ...prev, zoom: prev.zoom / 1.2 })),
    [setTransform]
  );

  const viewStrictMode = useCallback(
    () => setSettings((prev: any) => ({ ...prev, strictMode: !prev.strictMode })),
    [setSettings]
  );

  const viewFieldSummary = useCallback(() => {
    setSettings((prev: any) => {
      const nextValue = !prev.showFieldSummary;
      if (nextValue) {
        Toast.info(t("field_details") + ": " + t("on"));
      } else {
        Toast.info(t("field_details") + ": " + t("off"));
        setHoveredTable({ tableId: null, fieldId: null });
        setTables((prevTables: any) => [...prevTables]);
      }
      return {
        ...prev,
        showFieldSummary: nextValue,
      };
    });
  }, [setSettings, setHoveredTable, setTables, t]);

  const copyAsImage = useCallback(() => {
    const node = document.getElementById("canvas");
    if (!node) {
      Toast.error(t("oops_smth_went_wrong"));
      return;
    }
    const filter = (n: any) => (n?.tagName || "").toUpperCase() !== "I";
    toPng(node, {
      pixelRatio: EXPORT_CONFIG.PNG_PIXEL_RATIO,
      filter,
    })
      .then(function (dataUrl) {
        const blob = dataURItoBlob(dataUrl);
        navigator.clipboard
          .write([new ClipboardItem({ "image/png": blob })])
          .then(() => {
            Toast.success(t("copied_to_clipboard"));
          })
          .catch(() => {
            Toast.error(t("oops_smth_went_wrong"));
          });
      })
      .catch(() => {
        Toast.error(t("oops_smth_went_wrong"));
      });
  }, [t]);

  const resetView = useCallback(
    () => setTransform((prev: any) => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } })),
    [setTransform]
  );

  const fitWindow = useCallback(
    (margin = 10) => {
      const canvasElement = document.getElementById("canvas");
      if (!canvasElement) return;
      const canvas = canvasElement.getBoundingClientRect();

      const minMaxXY = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
      };

      tables.forEach((table: any) => {
        minMaxXY.minX = Math.min(minMaxXY.minX, table.x);
        minMaxXY.minY = Math.min(minMaxXY.minY, table.y);
        minMaxXY.maxX = Math.max(minMaxXY.maxX, table.x + table.width);
        minMaxXY.maxY = Math.max(minMaxXY.maxY, table.y + table.height);
      });

      areas.forEach((area: any) => {
        minMaxXY.minX = Math.min(minMaxXY.minX, area.x);
        minMaxXY.minY = Math.min(minMaxXY.minY, area.y);
        minMaxXY.maxX = Math.max(minMaxXY.maxX, area.x + area.width);
        minMaxXY.maxY = Math.max(minMaxXY.maxY, area.y + area.height);
      });

      notes.forEach((note: any) => {
        minMaxXY.minX = Math.min(minMaxXY.minX, note.x);
        minMaxXY.minY = Math.min(minMaxXY.minY, note.y);
        minMaxXY.maxX = Math.max(
          minMaxXY.maxX,
          note.x + (note.width ?? NOTE_CONFIG.WIDTH)
        );
        minMaxXY.maxY = Math.max(minMaxXY.maxY, note.y + note.height);
      });

      if (minMaxXY.minX === Infinity) return;

      const width = minMaxXY.maxX - minMaxXY.minX + margin * 2;
      const height = minMaxXY.maxY - minMaxXY.minY + margin * 2;

      const scaleX = canvas.width / width;
      const scaleY = canvas.height / height;
      const scale = Math.floor(Math.min(scaleX, scaleY) * 20) / 20;

      const centerX = (minMaxXY.minX + minMaxXY.maxX) / 2;
      const centerY = (minMaxXY.minY + minMaxXY.maxY) / 2;

      setTransform((prev: any) => ({
        ...prev,
        zoom: scale,
        pan: { x: centerX, y: centerY },
      }));
    },
    [tables, areas, notes, setTransform]
  );

  const toggleDBMLEditor = useCallback(() => {
    setLayout((prev: any) => ({ ...prev, dbmlEditor: !prev.dbmlEditor }));
  }, [setLayout]);

  const invertLayout = useCallback(
    (component: string) =>
      setLayout((prev: any) => ({ ...prev, [component]: !prev[component] })),
    [setLayout]
  );

  return {
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
  };
};
