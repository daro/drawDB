import { useMemo } from "react";
import { useLayout, useSelect } from "@hooks";

/**
 * Generyczny hook do zarządzania statusem zaznaczenia i edycji obiektów na płótnie.
 * 
 * @param data Obiekt danych (musi posiadać id)
 * @param objectType Typ obiektu z ObjectType (np. ObjectType.AREA, ObjectType.NOTE)
 * @param tab Klucz zakładki w panelu bocznym (z Tab)
 * @param scrollPrefix Prefiks ID elementu do przewijania (np. "scroll_area_", "scroll_note_")
 */
export const useObjectStatus = <T extends { id: string | number }>(
  data: T,
  objectType: number,
  tab: string,
  scrollPrefix: string
) => {
  const { layout } = useLayout();
  const {
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
  } = useSelect();

  const isOpen = useMemo(() => 
    selectedElement.element === objectType &&
    selectedElement.id === data.id &&
    selectedElement.open,
  [selectedElement, data.id, objectType]);

  const isSelected = useMemo(() => {
    return (
      (selectedElement.id === data.id &&
        selectedElement.element === objectType) ||
      bulkSelectedElements.some(
        (e) => e.type === objectType && e.id === data.id,
      )
    );
  }, [selectedElement, data.id, bulkSelectedElements, objectType]);

  const edit = () => {
    if (layout.sidebar) {
      setSelectedElement((prev) => ({
        ...prev,
        element: objectType,
        id: data.id,
        currentTab: tab,
        open: true,
      }));
      // Jeśli zakładka jest już aktywna, przewijamy. Jeśli nie, samo setSelectedElement przełączy zakładkę.
      if (selectedElement.currentTab === tab) {
        document
          .getElementById(`${scrollPrefix}${data.id}`)
          ?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setSelectedElement((prev) => ({
        ...prev,
        element: objectType,
        id: data.id,
        open: true,
      }));
    }
  };

  return {
    isSelected,
    isOpen,
    edit,
    selectedElement,
    setSelectedElement,
    setBulkSelectedElements,
  };
};
