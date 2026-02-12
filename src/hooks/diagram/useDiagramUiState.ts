import { useState } from "react";
import { Cardinality } from "../../data/constants";

import { ILinkingLine, IHoveredTable } from "../../types";

export const useDiagramUiState = () => {
  const [linking, setLinking] = useState(false);
  const [linkingLine, setLinkingLine] = useState<ILinkingLine>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    startTableId: "",
    startFieldId: "",
  });
  const [hoveredTable, setHoveredTable] = useState<IHoveredTable>({
    tableId: null,
    fieldId: null,
  });
  const [relationshipType, setRelationshipType] = useState<string>(
    Cardinality.AUTO,
  );

  return {
    linking,
    setLinking,
    linkingLine,
    setLinkingLine,
    hoveredTable,
    setHoveredTable,
    relationshipType,
    setRelationshipType,
  };
};
