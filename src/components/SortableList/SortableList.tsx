import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { ReactNode } from "react";

/**
 * Props for the SortableList component.
 * 
 * @interface SortableListProps
 * @template T
 * @property {T[]} items - The array of items to display and sort. Each item must have an `id`.
 * @property {(items: T[]) => void} onChange - Callback function invoked when the order of items changes.
 * @property {() => void} afterChange - Callback function invoked after the sorting process is complete.
 * @property {(item: T, index: number) => ReactNode} renderItem - A function that renders a single item.
 * @property {string} keyPrefix - A prefix used for generating unique React keys.
 */
interface SortableListProps<T extends { id: string | number }> {
  items: T[];
  onChange: (items: T[]) => void;
  afterChange: () => void;
  renderItem: (item: T, index: number) => ReactNode;
  keyPrefix: string;
}

/**
 * A component that renders a list of items that can be reordered via drag and drop.
 * 
 * @template T
 * @param {SortableListProps<T>} props - The component props.
 * @returns {JSX.Element} The rendered sortable list.
 */
export function SortableList<T extends { id: string | number }>({
  items,
  onChange,
  afterChange,
  renderItem,
  keyPrefix,
}: SortableListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onChange(newItems);
      afterChange();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item, i) => (
          <SortableItem
            id={item.id}
            key={`${keyPrefix}-sortable-item-${item.id}`}
          >
            {renderItem(item, i)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
