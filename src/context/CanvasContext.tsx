import { useTransform } from "@hooks";
import { createContext, useCallback, useMemo, useRef, useState, ReactNode } from "react";
import { useEventListener, useResizeObserver } from "usehooks-ts";

export interface ICoords {
  x: number;
  y: number;
}

export interface ICanvasContext {
  canvas: {
    screenSize: ICoords;
    viewBox: DOMRect;
  };
  coords: {
    toDiagramSpace: (coords: ICoords) => ICoords;
    toScreenSpace: (coords: ICoords) => ICoords;
  };
  pointer: {
    spaces: {
      screen: ICoords;
      diagram: ICoords;
    };
    style: string;
    setStyle: (style: string) => void;
  };
}

export const CanvasContext = createContext<ICanvasContext>({
  canvas: {
    screenSize: { x: 0, y: 0 },
    viewBox: new DOMRect(),
  },
  coords: {
    toDiagramSpace: (coords) => coords,
    toScreenSpace: (coords) => coords,
  },
  pointer: {
    spaces: {
      screen: { x: 0, y: 0 },
      diagram: { x: 0, y: 0 },
    },
    style: "default",
    setStyle: () => {},
  },
});

export function CanvasContextProvider({ children, ...attrs }: { children: ReactNode; [key: string]: unknown }) {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const { transform } = useTransform();
  const canvasSize = useResizeObserver({
    ref: canvasWrapRef,
    box: "content-box",
  });
  const screenSize = useMemo(
    () => ({
      x: canvasSize.width ?? 0,
      y: canvasSize.height ?? 0,
    }),
    [canvasSize.height, canvasSize.width],
  );
  const viewBoxSize = useMemo(
    () => ({
      x: screenSize.x / transform.zoom,
      y: screenSize.y / transform.zoom,
    }),
    [screenSize.x, screenSize.y, transform.zoom],
  );
  const viewBox = useMemo(
    () =>
      new DOMRect(
        transform.pan.x - viewBoxSize.x / 2,
        transform.pan.y - viewBoxSize.y / 2,
        viewBoxSize.x,
        viewBoxSize.y,
      ),
    [transform.pan.x, transform.pan.y, viewBoxSize.x, viewBoxSize.y],
  );

  const toDiagramSpace = useCallback(
    (coord: ICoords): ICoords => ({
      x: (coord.x / screenSize.x) * viewBox.width + viewBox.left,
      y: (coord.y / screenSize.y) * viewBox.height + viewBox.top,
    }),
    [
      screenSize.x,
      screenSize.y,
      viewBox.height,
      viewBox.left,
      viewBox.top,
      viewBox.width,
    ],
  );

  const toScreenSpace = useCallback(
    (coord: ICoords): ICoords => ({
      x: ((coord.x - viewBox.left) / viewBox.width) * screenSize.x,
      y: ((coord.y - viewBox.top) / viewBox.height) * screenSize.y,
    }),
    [
      screenSize.x,
      screenSize.y,
      viewBox.height,
      viewBox.left,
      viewBox.top,
      viewBox.width,
    ],
  );

  const [pointerScreenCoords, setPointerScreenCoords] = useState<ICoords>({
    x: 0,
    y: 0,
  });
  const pointerDiagramCoords = useMemo(
    () => toDiagramSpace(pointerScreenCoords),
    [pointerScreenCoords, toDiagramSpace],
  );
  const [pointerStyle, setPointerStyle] = useState("default");

  function detectPointerMovement(e: PointerEvent) {
    const targetElm = e.currentTarget as HTMLElement | null;
    if (!e.isPrimary || !targetElm) return;

    const canvasBounds = targetElm.getBoundingClientRect();

    setPointerScreenCoords({
      x: e.clientX - canvasBounds.left,
      y: e.clientY - canvasBounds.top,
    });
  }

  // Important for touch screen devices!
  useEventListener("pointerdown", detectPointerMovement, canvasWrapRef as React.RefObject<HTMLDivElement>);
  useEventListener("pointermove", detectPointerMovement, canvasWrapRef as React.RefObject<HTMLDivElement>);

  const contextValue: ICanvasContext = {
    canvas: {
      screenSize,
      viewBox,
    },
    coords: {
      toDiagramSpace,
      toScreenSpace,
    },
    pointer: {
      spaces: {
        screen: pointerScreenCoords,
        diagram: pointerDiagramCoords,
      },
      style: pointerStyle,
      setStyle: setPointerStyle,
    },
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      <div {...attrs} ref={canvasWrapRef}>
        {children}
      </div>
    </CanvasContext.Provider>
  )
}
