import { useState, useCallback } from "react";
import { useEventListener } from "usehooks-ts";
import { ITransform } from "@context/TransformContext";
import { ICanvasContext } from "@context/CanvasContext";
import { StateType } from "@data/constants";
import { ISelectedElement } from "@context/SelectContext";
import { ILayout } from "@context/LayoutContext";

/**
 * Hook to handle canvas panning and zooming (via wheel).
 *
 * @param canvasRef - Reference to the SVG canvas element.
 * @param transform - Current transform state (zoom and pan).
 * @param setTransform - Function to update the transform state.
 * @param pointer - Pointer state from CanvasContext.
 * @param setSaveState - Function to update the application save state.
 * @param selectedElement - The currently selected element (used to skip panning if editing).
 * @param layout - Current layout configuration.
 * @param State - State constants (enum-like object).
 * @returns Object containing panning state and handlers.
 */
export function useCanvasPanning(
  canvasRef: React.RefObject<SVGSVGElement>,
  transform: ITransform,
  setTransform: (val: ITransform | ((prev: ITransform) => ITransform)) => void,
  pointer: ICanvasContext["pointer"],
  setSaveState: (val: StateType) => void,
  selectedElement: ISelectedElement,
  layout: ILayout,
  State: { SAVING: StateType }
) {
  const [panning, setPanning] = useState({
    isPanning: false,
    panStart: { x: 0, y: 0 },
    cursorStart: { x: 0, y: 0 },
  });

  const didPan = useCallback(() =>
    !(
      transform.pan.x === panning.panStart.x &&
      transform.pan.y === panning.panStart.y
    ), [transform.pan, panning.panStart]);

  const startPanning = useCallback((cursorScreen: { x: number; y: number }) => {
    setPanning({
      isPanning: true,
      panStart: transform.pan,
      cursorStart: cursorScreen,
    });
    pointer.setStyle("grabbing");
  }, [transform.pan, pointer]);

  const stopPanning = useCallback(() => {
    setPanning((old) => ({ ...old, isPanning: false }));
    pointer.setStyle("default");
  }, [pointer]);

  const handlePointerMovePanning = useCallback(() => {
    if (panning.isPanning) {
      setTransform((prev: ITransform) => ({
        ...prev,
        pan: {
          x:
            panning.panStart.x +
            (panning.cursorStart.x - pointer.spaces.screen.x!) / transform.zoom,
          y:
            panning.panStart.y +
            (panning.cursorStart.y - pointer.spaces.screen.y!) / transform.zoom,
        },
      }));
      return true;
    }
    return false;
  }, [panning, pointer.spaces.screen, transform.zoom, setTransform]);

  useEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const eagernessFactor = 0.05;
        setTransform((prev) => ({
          pan: {
            x:
              prev.pan.x -
              (pointer.spaces.diagram.x - prev.pan.x) *
              eagernessFactor *
              Math.sign(e.deltaY),
            y:
              prev.pan.y -
              (pointer.spaces.diagram.y - prev.pan.y) *
              eagernessFactor *
              Math.sign(e.deltaY),
          },
          zoom: e.deltaY <= 0 ? prev.zoom * 1.05 : prev.zoom / 1.05,
        }));
      } else if (e.shiftKey) {
        setTransform((prev) => ({
          ...prev,
          pan: {
            ...prev.pan,
            x: prev.pan.x + e.deltaY / prev.zoom,
          },
        }));
      } else {
        setTransform((prev) => ({
          ...prev,
          pan: {
            x: prev.pan.x + e.deltaX / prev.zoom,
            y: prev.pan.y + e.deltaY / prev.zoom,
          },
        }));
      }
    },
    canvasRef,
    { passive: false },
  );

  return { panning, startPanning, stopPanning, handlePointerMovePanning };
}
