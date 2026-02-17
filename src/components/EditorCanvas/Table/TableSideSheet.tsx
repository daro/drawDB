import React from "react";
import { SideSheet } from "@douyinfe/semi-ui";
import { useSelect } from "@hooks";
import { ObjectType } from "@data/constants";
import TableInfo from "../../EditorSidePanel/TablesTab/TableInfo";
import { ITable } from "@types";

interface TableSideSheetProps {
  tableData: ITable;
}

export const TableSideSheet: React.FC<TableSideSheetProps> = ({ tableData }) => {
  const { selectedElement, setSelectedElement } = useSelect();

  return (
    <SideSheet
      title={tableData.name}
      visible={
        selectedElement.element === ObjectType.TABLE &&
        selectedElement.id === tableData.id &&
        selectedElement.open
      }
      onCancel={() =>
        setSelectedElement((prev) => ({
          ...prev,
          open: false,
        }))
      }
      width={400}
    >
      <TableInfo data={tableData} />
    </SideSheet>
  );
};
