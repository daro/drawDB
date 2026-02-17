import React from "react";
import { Popover } from "@douyinfe/semi-ui";
import { useSettings } from "@hooks";
import { IField } from "@types";

interface FieldPopoverProps {
  field: IField;
  children: React.ReactNode;
}

export const FieldPopover: React.FC<FieldPopoverProps> = ({ field, children }) => {
  const { settings } = useSettings();

  if (!settings.showFieldSummary) return <>{children}</>;

  return (
    <Popover
      key={field.id}
      content={
        <div className="popover-theme">
          <div
            className="flex justify-between items-center pb-2"
            style={{ direction: "ltr" }}
          >
            <p className="me-4 font-bold">{field.name}</p>
          </div>
          <div className="text-xs">
            <p>
              <strong>Type:</strong> {field.type}
              {field.size ? `(${field.size})` : ""}
            </p>
            {field.default && (
              <p>
                <strong>Default:</strong> {field.default}
              </p>
            )}
            {field.check && (
              <p>
                <strong>Check:</strong> {field.check}
              </p>
            )}
            {field.comment && (
              <p>
                <strong>Comment:</strong> {field.comment}
              </p>
            )}
          </div>
        </div>
      }
      position="rightTop"
      showArrow
      trigger="hover"
    >
      {children}
    </Popover>
  );
};
