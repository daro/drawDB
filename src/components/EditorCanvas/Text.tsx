import React, { useMemo, useState, ReactNode } from "react";
import { Action, ObjectType, Tab, State } from "../../data/constants";
import { Button } from "@douyinfe/semi-ui";
import {
  IconEdit,
  IconDeleteStroked,
} from "@douyinfe/semi-icons";
import {
  useLayout,
  useUndoRedo,
  useSelect,
  useTexts,
  useSaveState,
} from "../../hooks";
import { useTranslation } from "react-i18next";
import { IText, TextProps } from "../../types";

/**
 * A component that renders a custom text element on the canvas.
 * 
 * @param {TextProps} props - The component props.
 * @returns {JSX.Element} The rendered text element.
 */
function Text({ data, onPointerDown }: TextProps) {
  const [hovered, setHovered] = useState(false);
  const { layout } = useLayout();
  const { t } = useTranslation();
  const { deleteText } = useTexts();
  const {
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
  } = useSelect();

  const isSelected = useMemo(() => {
    return (
      (selectedElement.id === data.id &&
        selectedElement.element === ObjectType.TEXT) ||
      bulkSelectedElements.some(
        (e) => e.type === ObjectType.TEXT && e.id === data.id
      )
    );
  }, [selectedElement, data.id, bulkSelectedElements]);

  const edit = () => {
    if (layout.sidebar) {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.TEXT,
        id: data.id,
        currentTab: Tab.TEXT,
        open: true,
      }));
      if (selectedElement.currentTab !== Tab.TEXT) return;
      document
        .getElementById(`scroll_text_${data.id}`)
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      setSelectedElement((prev) => ({
        ...prev,
        open: true,
        editFromToolbar: true,
      }));
    }
  };

  return (
    <g
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={(e) => {
        if (e.defaultPrevented) return;
        onPointerDown(e);
      }}
      onDoubleClick={edit}
      className="cursor-move select-none"
    >
      <rect
        x={data.x - 5}
        y={data.y - data.fontSize}
        width={data.text.length * (data.fontSize * 0.6) + 10}
        height={data.fontSize + 10}
        fill="transparent"
        stroke={isSelected ? "#0084d1" : hovered ? "#0084d1" : "transparent"}
        strokeWidth={2}
        strokeDasharray={isSelected ? "none" : "5,5"}
        rx={4}
      />
      <text
        x={data.x}
        y={data.y}
        fill={data.color}
        fontSize={data.fontSize}
        fontWeight={data.fontWeight}
        fontFamily="sans-serif"
      >
        {data.text || t("text")}
      </text>
      {isSelected && !layout.readOnly && (
        <foreignObject
          x={data.x + data.text.length * (data.fontSize * 0.6) + 15}
          y={data.y - data.fontSize - 5}
          width={100}
          height={40}
        >
          <div className="flex gap-1">
            <Button
              size="small"
              icon={<IconEdit />}
              onClick={edit}
              theme="solid"
            />
            <Button
              size="small"
              type="danger"
              icon={<IconDeleteStroked />}
              onClick={() => deleteText(data.id)}
              theme="solid"
            />
          </div>
        </foreignObject>
      )}
    </g>
  );
}

export default React.memo(Text);
