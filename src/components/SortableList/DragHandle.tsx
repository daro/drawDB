import { IconHandle } from "@douyinfe/semi-icons";
import { useSortable } from "@dnd-kit/sortable";

/**
 * Props for the DragHandle component.
 * 
 * @interface DragHandleProps
 * @property {string | number} id - The unique identifier for the sortable item.
 * @property {boolean} [readOnly] - Whether the drag handle is in read-only mode.
 */
interface DragHandleProps {
  id: string | number;
  readOnly?: boolean;
}

/**
 * A handle component that enables dragging for sortable items.
 * 
 * @param {DragHandleProps} props - The component props.
 * @returns {JSX.Element} The rendered drag handle.
 */
export function DragHandle({ id, readOnly }: DragHandleProps) {
  const { listeners } = useSortable({ id });

  return (
    <div
      className={`opacity-50 mt-1.5 ${readOnly ? "cursor-not-allowed" : "cursor-move"}`}
      {...(!readOnly && listeners)}
    >
      <IconHandle />
    </div>
  );
}
