export interface ISettings {
  strictMode: boolean;
  showFieldSummary: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  showDataTypes: boolean;
  mode: "light" | "dark";
  autosave: boolean;
  showCardinality: boolean;
  relationshipStyle: "erd" | "uml" | "idef1x" | "default";
  showRelationshipLabels: boolean;
  tableWidth: number;
  showDebugCoordinates: boolean;
  tableNamesUppercase: boolean;
  showPKIcons: boolean;
  showFKIcons: boolean;
  sideMargin: number;
  spreadRelations: boolean;
  tableColors: string[];
  outboundRelationsInTableColor: boolean;
  relationAnimationsInTableColor: boolean;
  settingsPosition: { x: number; y: number };
}
