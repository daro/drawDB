import { createContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { TABLE_CONFIG } from "../data/constants";
import { ISettings } from "../types/settings";

const defaultSettings: ISettings = {
  strictMode: false,
  showFieldSummary: true,
  showGrid: true,
  snapToGrid: false,
  showDataTypes: true,
  mode: "light",
  autosave: true,
  showCardinality: true,
  relationshipStyle: "erd",
  relationshipNameFontSize: 16,
  relationshipSideLabelFontSize: 12,
  showRelationshipLabels: true,
  showRelationshipNames: true,
  tableWidth: TABLE_CONFIG.WIDTH,
  showDebugCoordinates: false,
  tableNamesUppercase: false,
  showPKIcons: false,
  showFKIcons: false,
  sideMargin: 20,
  spreadRelations: false,
  tableColors: [...TABLE_CONFIG.DEFAULT_COLORS],
  outboundRelationsInTableColor: false,
  relationAnimationsInTableColor: false,
  autoSplitRelationships: false,
  renameFK: false,
  showDebugConsole: false,
  debugPath: false,
  settingsPosition: { x: 0, y: 0 },
};

interface SettingsContextType {
  settings: ISettings;
  setSettings: Dispatch<SetStateAction<ISettings>>;
}

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  setSettings: () => {},
});

export default function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ISettings>(() => {
    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    document.body.setAttribute("theme-mode", settings.mode);
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
