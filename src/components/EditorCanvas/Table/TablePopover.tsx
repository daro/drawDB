import React from "react";
import { Button, Popover, Tag } from "@douyinfe/semi-ui";
import { IconDeleteStroked } from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import { useDiagram, useLayout, useSettings } from "@hooks";
import { ITable } from "@types";

interface TablePopoverProps {
  tableData: ITable;
}

export const TablePopover: React.FC<TablePopoverProps> = ({ tableData }) => {
  const { t } = useTranslation();
  const { deleteTable } = useDiagram();
  const { layout } = useLayout();
  const { settings } = useSettings();

  return (
    <div className="popover-theme">
      <div className="mb-2">
        <strong>{t("comment")}:</strong>{" "}
        {tableData.comment === "" ? (
          t("not_set")
        ) : (
          <div>{tableData.comment}</div>
        )}
      </div>
      <div>
        <strong
          className={`${
            tableData.indices.length === 0 ? "" : "block"
          }`}
        >
          {t("indices")}:
        </strong>{" "}
        {tableData.indices.length === 0 ? (
          t("not_set")
        ) : (
          <div>
            {tableData.indices.map((index) => (
              <div
                key={index.id || index.name || `index_${index.fields.join("_")}`}
                className={`flex items-center my-1 px-2 py-1 rounded ${
                  settings.mode === "light"
                    ? "bg-gray-100"
                    : "bg-zinc-800"
                }`}
              >
                <i className="fa-solid fa-thumbtack me-2 mt-1 text-slate-500"></i>
                <div>
                  {index.fields.map((f, fk) => (
                    <Tag color="blue" key={`${f}_${fk}`} className="me-1">
                      {f}
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Button
        icon={<IconDeleteStroked />}
        type="danger"
        block
        style={{ marginTop: "8px" }}
        onClick={() => deleteTable(tableData.id)}
        disabled={layout.readOnly}
      >
        {t("delete")}
      </Button>
    </div>
  );
};
