import React from "react";
import { Button, Popover, Tag } from "@douyinfe/semi-ui";
import { IconLock, IconUnlock, IconEdit, IconMore } from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import { useLayout, useSettings, useSelect } from "@hooks";
import { ObjectType, Tab } from "@data/constants";
import { ITable } from "@types";
import { TablePopover } from "./TablePopover";

interface TableHeaderProps {
  tableData: ITable;
  lockUnlockTable: (e: React.MouseEvent) => void;
  openEditor: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ tableData, lockUnlockTable, openEditor }) => {
  const { t } = useTranslation();
  const { layout } = useLayout();
  const { settings } = useSettings();

  return (
    <div className="hidden group-hover:block">
      <div className="flex justify-end items-center mx-2 space-x-1.5">
        <Button
          icon={tableData.locked ? <IconLock /> : <IconUnlock />}
          size="small"
          theme="solid"
          style={{
            backgroundColor: "#2f68adb3",
          }}
          disabled={layout.readOnly}
          onClick={lockUnlockTable}
        />
        <Button
          icon={<IconEdit />}
          size="small"
          theme="solid"
          style={{
            backgroundColor: "#2f68adb3",
          }}
          onClick={openEditor}
        />
        <Popover
          key={`table_more_${tableData.id}`}
          content={<TablePopover tableData={tableData} />}
          position="rightTop"
          showArrow
          trigger="click"
          style={{ width: "200px", wordBreak: "break-word" }}
        >
          <span>
            <Button
              icon={<IconMore />}
              type="tertiary"
              size="small"
              style={{
                backgroundColor: "#808080b3",
                color: "white",
              }}
            />
          </span>
        </Popover>
      </div>
    </div>
  );
};
