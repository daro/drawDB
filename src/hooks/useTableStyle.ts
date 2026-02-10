import { useMemo } from "react";
import { ObjectType } from "../data/constants";
import { ITable } from "../types";
import { ISelectedElement, IBulkSelectedElement } from "../context/SelectContext";

/**
 * Hook to calculate table styles based on selection and settings.
 *
 * @param tableData - The data of the table to style.
 * @param selectedElement - The currently selected element.
 * @param bulkSelectedElements - Array of bulk selected elements.
 * @param settings - Application settings (e.g., mode).
 * @returns Object containing isSelected flag and calculated colors.
 */
export function useTableStyle(
  tableData: ITable,
  selectedElement: ISelectedElement,
  bulkSelectedElements: IBulkSelectedElement[],
  settings: { mode: "light" | "dark" }
) {
  const isSelected = useMemo(() => {
    return (
      (selectedElement.id == tableData.id &&
        selectedElement.element === ObjectType.TABLE) ||
      bulkSelectedElements.some(
        (e) => e.type === ObjectType.TABLE && e.id === tableData.id,
      )
    );
  }, [selectedElement, tableData.id, bulkSelectedElements]);

  const borderColor = useMemo(
    () => (settings.mode === "light" ? "border-zinc-300" : "border-zinc-600"),
    [settings.mode]
  );

  const headerColor = useMemo(
    () => (settings.mode === "light" ? tableData.color || "#0084d1" : tableData.color || "#0084d1"),
    [settings.mode, tableData.color]
  );

  return { isSelected, borderColor, headerColor };
}
