import React from "react";
import { SideSheet } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { ObjectType } from "../../data/constants";
import RelationshipInfo from "../EditorSidePanel/RelationshipsTab/RelationshipInfo";
import { IRelationship } from "../../types";

interface RelationshipEditSideSheetProps {
  data: IRelationship;
  selectedElement: any;
  setSelectedElement: (val: any | ((prev: any) => any)) => void;
  layout: any;
}

const RelationshipEditSideSheet: React.FC<RelationshipEditSideSheetProps> = ({
  data,
  selectedElement,
  setSelectedElement,
  layout,
}) => {
  const { t } = useTranslation();

  return (
    <SideSheet
      title={t("edit")}
      size="small"
      visible={
        selectedElement.element === ObjectType.RELATIONSHIP &&
        selectedElement.id === data.id &&
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
        <RelationshipInfo data={data} />
      </div>
    </SideSheet>
  );
};

export default RelationshipEditSideSheet;
