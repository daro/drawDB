import { useMemo } from "react";
import { IRelationship, ITable } from "../types";
import { ObjectType } from "../data/constants";
import { ISelectedElement, IBulkSelectedElement } from "../context/SelectContext";

/**
 * Hook to determine the current status of a relationship line (selection, animation, highlighting).
 *
 * @param data - The relationship data.
 * @param selectedElement - The currently selected element.
 * @param bulkSelectedElements - Array of bulk selected elements.
 * @param isHovered - Whether the relationship is currently hovered.
 * @param tables - Array of all tables in the diagram.
 * @returns Object containing status flags and table metadata for path calculations.
 */
export function useRelationshipStatus(
  data: IRelationship,
  selectedElement: ISelectedElement,
  bulkSelectedElements: IBulkSelectedElement[],
  isHovered: boolean,
  tables: ITable[]
) {
  const isAnimated = useMemo(() => {
    const isTableSelected = (id: string | number) =>
      (selectedElement.id == id &&
        selectedElement.element === ObjectType.TABLE) ||
      bulkSelectedElements.some(
        (e) => e.type === ObjectType.TABLE && e.id === id,
      );

    const isRelationshipEdited =
      selectedElement.id == data.id &&
      selectedElement.element === ObjectType.RELATIONSHIP &&
      selectedElement.open;

    const isRelationshipSelectedInBulk = bulkSelectedElements.some(
      (e) => e.type === ObjectType.RELATIONSHIP && e.id == data.id,
    );

    const isWaypointSelected =
      selectedElement.id == data.id &&
      selectedElement.element === ObjectType.WAYPOINT;

    const isWaypointSelectedInBulk = bulkSelectedElements.some(
      (e) => e.type === ObjectType.WAYPOINT && e.id == data.id,
    );

    return (
      isTableSelected(data.startTableId) ||
      isTableSelected(data.endTableId) ||
      isRelationshipEdited ||
      isRelationshipSelectedInBulk ||
      isWaypointSelected ||
      isWaypointSelectedInBulk
    );
  }, [
    selectedElement.id,
    selectedElement.element,
    selectedElement.open,
    bulkSelectedElements,
    data.startTableId,
    data.endTableId,
    data.id,
  ]);

  const isHighlighted = useMemo(() => {
    const isRelationshipEdited =
      selectedElement.id == data.id &&
      selectedElement.element === ObjectType.RELATIONSHIP &&
      selectedElement.open;

    const isRelationshipSelectedInBulk = bulkSelectedElements.some(
      (e) => e.type === ObjectType.RELATIONSHIP && e.id == data.id,
    );

    const isWaypointSelected =
      selectedElement.id == data.id &&
      selectedElement.element === ObjectType.WAYPOINT;

    const isWaypointSelectedInBulk = bulkSelectedElements.some(
      (e) => e.type === ObjectType.WAYPOINT && e.id == data.id,
    );

    return (
      isHovered ||
      isRelationshipEdited ||
      isRelationshipSelectedInBulk ||
      isWaypointSelected ||
      isWaypointSelectedInBulk
    );
  }, [isHovered, selectedElement.id, selectedElement.element, selectedElement.open, bulkSelectedElements, data.id]);

  const isSelected = useMemo(() => {
    const isRelationshipEdited =
      selectedElement.id == data.id &&
      selectedElement.element === ObjectType.RELATIONSHIP;

    const isRelationshipSelectedInBulk = bulkSelectedElements.some(
      (e) => e.type === ObjectType.RELATIONSHIP && e.id == data.id,
    );

    return isRelationshipEdited || isRelationshipSelectedInBulk;
  }, [selectedElement.id, selectedElement.element, bulkSelectedElements, data.id]);

  const { startTable, endTable, pathValues } = useMemo(() => {
    const sTable = tables.find((t) => t.id === data.startTableId);
    const eTable = tables.find((t) => t.id === data.endTableId);

    if (!sTable || !eTable || sTable.hidden || eTable.hidden)
      return { startTable: null, endTable: null, pathValues: null };

    return {
      startTable: sTable,
      endTable: eTable,
      pathValues: {
        startFieldIndex: sTable.fields.findIndex(
          (f) => f.id === data.startFieldId,
        ),
        endFieldIndex: eTable.fields.findIndex((f) => f.id === data.endFieldId),
        startTable: { x: sTable.x, y: sTable.y, width: sTable.width, color: sTable.color },
        endTable: { x: eTable.x, y: eTable.y, width: eTable.width, color: eTable.color },
      },
    };
  }, [tables, data.startTableId, data.endTableId, data.startFieldId, data.endFieldId]);

  return { isAnimated, isHighlighted, isSelected, startTable, endTable, pathValues };
}
