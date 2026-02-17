import { createContext, ReactNode, useMemo } from "react";
import { useTransform, useUndoRedo, useSelect, useSettings } from "@hooks";
import { useTranslation } from "react-i18next";
import { DiagramContextType } from "@types";
import { useTableActions } from "./Diagram/hooks/useTableActions";
import { useRelationshipActions } from "./Diagram/hooks/useRelationshipActions";
import { useDiagramUiState } from "./Diagram/hooks/useDiagramUiState";
import { useDiagramState } from "./Diagram/hooks/useDiagramState";
import { getGroupPoints } from "@utils/diagram/geometry";

export const DiagramContext = createContext<DiagramContextType>({} as DiagramContextType);

export default function DiagramContextProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const {
    database,
    setDatabase,
    tables,
    setTables,
    relationships,
    setRelationships,
    xorGroups,
    setXorGroups,
    orGroups,
    setOrGroups,
  } = useDiagramState();

  const { transform } = useTransform();
  const { settings } = useSettings();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { selectedElement, setSelectedElement } = useSelect();
  const {
    linking,
    setLinking,
    linkingLine,
    setLinkingLine,
    hoveredTable,
    setHoveredTable,
    relationshipType,
    setRelationshipType,
    waypointMode,
    setWaypointMode,
  } = useDiagramUiState();

  const {
    updateRelationship,
    addRelationship,
    deleteRelationship,
    addXorGroup,
    deleteXorGroup,
    updateXorGroup,
    addOrGroup,
    deleteOrGroup,
    updateOrGroup,
    convertXorToOr,
    convertOrToXor,
  } = useRelationshipActions({
    relationships,
    setRelationships,
    xorGroups,
    setXorGroups,
    orGroups,
    setOrGroups,
    tables,
    setUndoStack,
    setRedoStack,
    setSelectedElement,
    t,
    getGroupPoints,
  });

  const {
    addTable,
    deleteTable,
    updateTable,
    updateField,
    deleteField,
  } = useTableActions({
    database,
    tables,
    setTables,
    relationships,
    setRelationships,
    setXorGroups,
    setOrGroups,
    transform,
    settings,
    setUndoStack,
    setRedoStack,
    selectedElement,
    setSelectedElement,
    t,
    getGroupPoints,
    updateRelationship,
    xorGroups,
    orGroups,
  });

  const contextValue: DiagramContextType = useMemo(
    () => ({
      tables,
      setTables,
      addTable,
      updateTable,
      updateField,
      deleteField,
      deleteTable,
      relationships,
      setRelationships,
      addRelationship,
      deleteRelationship,
      updateRelationship,
      xorGroups,
      setXorGroups,
      addXorGroup,
      deleteXorGroup,
      updateXorGroup,
      orGroups,
      setOrGroups,
      addOrGroup,
      deleteOrGroup,
      updateOrGroup,
      convertXorToOr,
      convertOrToXor,
      database,
      setDatabase,
      tablesCount: tables.length,
      relationshipsCount: relationships.length,
      linking,
      setLinking,
      linkingLine,
      setLinkingLine,
      hoveredTable,
      setHoveredTable,
      relationshipType,
      setRelationshipType,
      waypointMode,
      setWaypointMode,
    }),
    [
      tables,
      setTables,
      addTable,
      updateTable,
      updateField,
      deleteField,
      deleteTable,
      relationships,
      setRelationships,
      addRelationship,
      deleteRelationship,
      updateRelationship,
      xorGroups,
      setXorGroups,
      addXorGroup,
      deleteXorGroup,
      updateXorGroup,
      orGroups,
      setOrGroups,
      addOrGroup,
      deleteOrGroup,
      updateOrGroup,
      convertXorToOr,
      convertOrToXor,
      database,
      setDatabase,
      linking,
      setLinking,
      linkingLine,
      setLinkingLine,
      hoveredTable,
      setHoveredTable,
      relationshipType,
      setRelationshipType,
      waypointMode,
      setWaypointMode,
    ],
  );

  return (
    <DiagramContext.Provider value={contextValue}>
      {children}
    </DiagramContext.Provider>
  );
}

export { DiagramContextProvider };
