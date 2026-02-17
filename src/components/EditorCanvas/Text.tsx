import React from "react";
import { ObjectType, Tab } from "@data/constants";
import {
  useLayout,
  useTexts,
  useSelect,
} from "@hooks";
import { useTranslation } from "react-i18next";
import { TextProps } from "@types";
import TextInfo from "../EditorSidePanel/TextsTab/TextInfo";
import { Button } from "@douyinfe/semi-ui";
import { IconEdit, IconDeleteStroked } from "@douyinfe/semi-icons";

interface TextHeaderProps {
  data: any;
  width: number;
  edit: () => void;
  deleteText: (id: string | number) => void;
}

const TextHeader: React.FC<TextHeaderProps> = ({ data, width, edit, deleteText }) => {
  return (
    <g transform={`translate(${width + 5}, 0)`}>
      <foreignObject
        width={100}
        height={40}
      >
        <div className="flex gap-1 outline-none">
          <Button
            size="small"
            icon={<IconEdit />}
            onClick={edit}
            theme="solid"
            style={{ backgroundColor: "#2F68ADB3" }}
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
    </g>
  );
};

/**
 * A component that renders a custom text element on the canvas.
 * 
 * @param {TextProps} props - The component props.
 * @returns {JSX.Element} The rendered text element.
 */
function Text({ data, onPointerDown }: TextProps) {
  const { t } = useTranslation();
  const { emitSelect } = useSelect();

  return (
    <g
      onPointerDown={(e) => {
        if (e.defaultPrevented) return;
        emitSelect(data.id, ObjectType.TEXT, e);
      }}
      className="cursor-move select-none outline-none"
    >
      <text
        x={0}
        y={0}
        fill={data.color}
        fontSize={data.fontSize}
        fontWeight={data.fontWeight}
        fontFamily="sans-serif"
        dominantBaseline="text-before-edge"
      >
        {data.text || t("text")}
      </text>
    </g>
  );
}

export { TextHeader };
export default React.memo(Text);

/**
 * The content of the edit popover for a text element.
 */
export const TextEditPopover: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="popover-theme w-[280px]">
      <TextInfo data={data} />
    </div>
  );
};
