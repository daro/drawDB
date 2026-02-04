import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

/**
 * Props for the SortableItem component.
 * 
 * @interface SortableItemProps
 * @property {ReactNode} children - The content of the sortable item.
 * @property {string | number} id - The unique identifier for the sortable item.
 */
interface SortableItemProps {
  children: ReactNode;
  id: string | number;
}

/**
 * A wrapper component that makes its children sortable within a SortableList.
 * 
 * @param {SortableItemProps} props - The component props.
 * @returns {JSX.Element} The rendered sortable item.
 */
export function SortableItem({ children, id }: SortableItemProps) {
  const { attributes, setNodeRef, transform, transition } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children}
    </div>
  );
}
