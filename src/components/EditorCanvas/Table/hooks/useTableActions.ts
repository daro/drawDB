import { useCallback } from "react";
import { useDiagram, useSelect, useUndoRedo } from "@hooks";
import { Action, ObjectType } from "@data/constants";
import { ITable } from "@types";
import { useTranslation } from "react-i18next";

export const useTableActions = (tableData: ITable) => {
  const { updateTable } = useDiagram();
  const { setSelectedElement, selectedElement, setBulkSelectedElements } = useSelect();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { t } = useTranslation();

  const lockUnlockTable = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const locking = !tableData.locked;

    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.TABLE,
        tid: tableData.id,
        undo: { locked: tableData.locked },
        redo: { locked: locking },
        message: t("edit_table", {
          tableName: tableData.name,
          extra: `[${locking ? "lock" : "unlock"}]`,
        }),
      },
    ]);
    setRedoStack([]);

    updateTable(tableData.id, { locked: locking });

    if (locking) {
      setSelectedElement({
        ...selectedElement,
        element: ObjectType.NONE,
        id: -1,
        open: false,
      });
      setBulkSelectedElements((prev) =>
        prev.filter(
          (el) => el.id !== tableData.id || el.type !== ObjectType.TABLE,
        ),
      );
    } else {
      const elementInBulk = {
        id: tableData.id,
        type: ObjectType.TABLE,
        initialCoords: { x: tableData.x, y: tableData.y },
        currentCoords: { x: tableData.x, y: tableData.y },
      };
      if (e.ctrlKey || e.metaKey) {
        setBulkSelectedElements((prev) => [...prev, elementInBulk]);
      } else {
        setBulkSelectedElements([elementInBulk]);
      }
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.TABLE,
        id: tableData.id,
        open: false,
      }));
    }
  }, [tableData, updateTable, setSelectedElement, selectedElement, setBulkSelectedElements]);

  return { lockUnlockTable };
};
