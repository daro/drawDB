import React from "react";
import { SideSheet } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { ObjectType } from "../../data/constants";
import XorGroupInfo from "../EditorSidePanel/RelationshipsTab/XorGroupInfo";
import OrGroupInfo from "../EditorSidePanel/RelationshipsTab/OrGroupInfo";

interface EditorSideSheetsProps {
  selectedElement: {
    element: number;
    id: string | number;
    open: boolean;
  };
  setSelectedElement: (val: any | ((prev: any) => any)) => void;
  xorGroups: any[];
  orGroups: any[];
  layout: {
    sidebar: boolean;
  };
}

const EditorSideSheets: React.FC<EditorSideSheetsProps> = ({
  selectedElement,
  setSelectedElement,
  xorGroups,
  orGroups,
  layout,
}) => {
  const { t } = useTranslation();

  return (
    <SideSheet
      title={t("edit")}
      size="small"
      visible={
        (selectedElement.element === ObjectType.XOR_GROUP ||
          selectedElement.element === ObjectType.OR_GROUP) &&
        selectedElement.open &&
        !layout.sidebar
      }
      onCancel={() => {
        setSelectedElement((prev) => ({
          ...prev,
          open: false,
        }));
      }}
      style={{ paddingBottom: "16px" }}
    >
      <div className="sidesheet-theme">
        {selectedElement.element === ObjectType.XOR_GROUP ? (
          xorGroups.find((g) => g.id === selectedElement.id) && (
            <XorGroupInfo
              data={xorGroups.find((g) => g.id === selectedElement.id)}
            />
          )
        ) : (
          orGroups.find((g) => g.id === selectedElement.id) && (
            <OrGroupInfo
              data={orGroups.find((g) => g.id === selectedElement.id)}
            />
          )
        )}
      </div>
    </SideSheet>
  );
};

export default React.memo(EditorSideSheets);
