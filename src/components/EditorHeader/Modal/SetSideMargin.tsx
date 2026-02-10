import { InputNumber } from "@douyinfe/semi-ui";
import { useLayout, useSettings } from "../../../hooks";
import React from "react";

export default function SetSideMargin() {
  const { layout } = useLayout();
  const { settings, setSettings } = useSettings();

  return (
    <InputNumber
      className="w-full"
      value={settings.sideMargin}
      readOnly={layout.readOnly}
      onChange={(c) => {
        if (typeof c !== "number" || c < 0) return;
        setSettings((prev) => ({ ...prev, sideMargin: c }));
      }}
    />
  );
}
