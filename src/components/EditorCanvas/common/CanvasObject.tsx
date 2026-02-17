import React, { useState } from "react";
import { Popover } from "@douyinfe/semi-ui";
import { useLayout, useSettings, useObjectStatus, useObjectResize, useObjectRotation } from "@hooks";
import { ObjectType, Tab, State, GRID_CONFIG } from "@data/constants";
import { useSaveState } from "@hooks";

interface CanvasObjectProps<T> {
  data: T;
  objectType: number;
  tab: string;
  scrollIdPrefix: string;
  minWidth?: number;
  minHeight?: number;
  gridSize?: number;
  updateCallback: (id: string | number, updates: Partial<T>) => void;
  children: (props: { 
    isSelected: boolean; 
    isHovered: boolean; 
    isOpen: boolean; 
    edit: () => void;
  }) => React.ReactNode;
  popoverContent: React.ReactNode;
  onPointerDown?: (e: React.PointerEvent) => void;
  showResizeHandles?: boolean;
  showRotationHandle?: boolean;
  resizeDirections?: string[];
}

/**
 * A generic wrapper for canvas objects (Area, Note, etc.) using the Composition pattern.
 * It manages common logic like selection, resizing, and the edit popover.
 */
export function CanvasObject<T extends { 
  id: string | number; 
  x: number; 
  y: number; 
  width: number; 
  height: number; 
  locked?: boolean;
  color?: string;
  name?: string;
  title?: string;
  rotation?: number;
}>({
  data,
  objectType,
  tab,
  scrollIdPrefix,
  minWidth = 100,
  minHeight = 100,
  gridSize = GRID_CONFIG.SIZE,
  updateCallback,
  children,
  popoverContent,
  onPointerDown,
  showResizeHandles = true,
  showRotationHandle = false,
  resizeDirections = ["tl", "tr", "bl", "br"]
}: CanvasObjectProps<T>) {
  const [isHovered, setIsHovered] = useState(false);
  const { layout } = useLayout();
  const { settings } = useSettings();
  const { setSaveState } = useSaveState();

  const {
    isSelected,
    isOpen,
    edit,
    setSelectedElement,
    selectedElement,
  } = useObjectStatus(data, objectType, tab, scrollIdPrefix);

  const {
    startResize,
    onPointerMove,
    stopResize,
  } = useObjectResize(data, objectType, updateCallback, {
    minWidth,
    minHeight,
    gridSize,
  });

  const {
    startRotation,
    onPointerMove: onPointerMoveRotation,
    stopRotation,
  } = useObjectRotation(data, objectType, updateCallback);

  const onClickOutSide = () => {
    if (selectedElement.editFromToolbar) {
      setSelectedElement((prev) => ({
        ...prev,
        editFromToolbar: false,
      }));
      return;
    }
    setSelectedElement((prev) => ({
      ...prev,
      open: false,
    }));
    setSaveState(State.SAVING);
  };

  const renderResizeHandle = (dir: string) => {
    let cx = data.x;
    let cy = data.y;
    let cursor = "nwse-resize";

    if (dir.includes("r")) cx += data.width;
    if (dir.includes("b")) cy += data.height;

    if (dir === "tr" || dir === "bl") cursor = "nesw-resize";
    if (dir === "l" || dir === "r") {
      cursor = "ew-resize";
      cy += data.height / 2;
    }
    if (dir === "t" || dir === "b") {
      cursor = "ns-resize";
      cx += data.width / 2;
    }

    return (
      <circle
        key={dir}
        cx={cx}
        cy={cy}
        r={6}
        fill={settings.mode === "light" ? "white" : "rgb(28, 31, 35)"}
        stroke="#5891db"
        strokeWidth={2}
        cursor={cursor}
        onPointerDown={(e) => startResize(e, dir)}
        onPointerMove={onPointerMove}
        onPointerUp={stopResize}
      />
    );
  };

  const renderRotationHandle = () => {
    const cx = data.x + data.width / 2;
    const cy = data.y - 30;

    return (
      <g key="rotation-handle">
        <line
          x1={cx}
          y1={data.y}
          x2={cx}
          y2={cy}
          stroke="#5891db"
          strokeWidth={2}
        />
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={settings.mode === "light" ? "white" : "rgb(28, 31, 35)"}
          stroke="#5891db"
          strokeWidth={2}
          cursor="alias"
          onPointerDown={startRotation}
          onPointerMove={onPointerMoveRotation}
          onPointerUp={stopRotation}
        />
      </g>
    );
  };

  return (
    <g
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      transform={data.rotation ? `rotate(${data.rotation}, ${data.x + (data.width || 0) / 2}, ${data.y + (data.height || 0) / 2})` : undefined}
    >
      {(isSelected || isHovered) && (
        <rect
          x={data.x - 2}
          y={data.y - 2}
          width={(data.width || 0) + 4}
          height={(data.height || 0) + 4}
          fill="none"
          stroke="#5891db"
          strokeWidth={2}
          strokeDasharray={isSelected ? "0" : "5,5"}
          rx={8}
          pointerEvents="none"
        />
      )}
      <Popover
        visible={isOpen && !layout.sidebar}
        onClickOutSide={onClickOutSide}
        stopPropagation
        content={popoverContent}
        trigger="custom"
        position="rightTop"
        showArrow
      >
        <g onDoubleClick={edit}>
          <g>
            {children({ isSelected, isHovered, isOpen, edit })}
          </g>
        </g>
      </Popover>

      {(isHovered || isSelected) && !layout.readOnly && !data.locked && (
        <>
          {showResizeHandles && resizeDirections.map(renderResizeHandle)}
          {showRotationHandle && renderRotationHandle()}
        </>
      )}
    </g>
  );
}
