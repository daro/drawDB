import { InputNumber } from "@douyinfe/semi-ui";
import { useLayout, useSettings } from "@hooks";
import React from "react";

export default function SetTableWidth() {
  const { layout } = useLayout();
  const { settings, setSettings } = useSettings();

  return (
    <InputNumber
      className="w-full"
      value={settings.tableWidth}
      readOnly={layout.readOnly}
      onChange={(c) => {
        if (typeof c !== "number" || c < 180) return;
        setSettings((prev) => ({ ...prev, tableWidth: c }));
      }}
    />
  );
}
