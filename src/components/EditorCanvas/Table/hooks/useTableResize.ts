import { useState, useCallback } from "react";
import { Action, ObjectType, State } from "@data/constants";
import { useDiagram, useUndoRedo, useSaveState } from "@hooks";
import { useTranslation } from "react-i18next";
import { ITable } from "@types";
import { getTableHeight, getTableWidth } from "@utils/utils";

export const useTableResize = (tableData: ITable) => {
  const { tables, updateTable } = useDiagram();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { setSaveState } = useSaveState();
  const { t } = useTranslation();

  const handleResize = useCallback((id: string | number, updates: Partial<ITable>) => {
    updateTable(id, updates, false);

    // Handle subtype/supertype logic if necessary
    if (tableData.supertypeId) {
      const supertype = tables.find((t) => t.id === tableData.supertypeId);
      if (supertype) {
        const currentSubtypes = tables
          .filter((t) => t.supertypeId === supertype.id)
          .map((t) =>
            t.id === tableData.id
              ? { ...t, ...updates }
              : t,
          );
        const newHeight = getTableHeight(supertype, currentSubtypes);
        const newWidth = getTableWidth(supertype, currentSubtypes);
        updateTable(supertype.id, { height: newHeight, width: newWidth }, false);
      }
    }
  }, [tableData, tables, updateTable]);

  return { handleResize };
};
