import { useLayout, useSettings, useTransform, useDiagram, useAreas, useNotes, useFullscreen } from "../../../hooks";
import { Typography, Toast, Nav } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  IconEyeOpened,
  IconGlobe,
  IconColorPalette as IconPalette,
  IconSetting,
  IconLanguage,
} from "@douyinfe/semi-icons";
import { enterFullscreen, exitFullscreen } from "../../../utils/fullscreen";
import { noteWidth } from "../../../data/constants";
import UIVisibility from "./SettingsSections/UIVisibility";
import DiagramDisplay from "./SettingsSections/DiagramDisplay";
import ColorAndTheme from "./SettingsSections/ColorAndTheme";
import EditorSettings from "./SettingsSections/EditorSettings";
import LanguageSettings from "./SettingsSections/LanguageSettings";

const { Text } = Typography;

export const SettingItem = ({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) => (
  <div id={id} className="flex justify-between items-center py-2 px-1 rounded transition-colors group">
    <Text className="group-hover:text-blue-500 transition-colors">{label}</Text>
    {children}
  </div>
);

export default function Settings({
  settingsTab,
  settingsOption,
}: {
  settingsTab?: string;
  settingsOption?: string;
}) {
  const { layout, setLayout } = useLayout();
  const { settings, setSettings } = useSettings();
  const { setTransform } = useTransform();
  const { tables, relationships, setHoveredTable, setTables } = useDiagram();
  const { areas } = useAreas();
  const { notes } = useNotes();
  const fullscreen = useFullscreen();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(settingsTab || "ui_visibility");

  useEffect(() => {
    if (settingsTab) {
      setActiveTab(settingsTab);
    }
  }, [settingsTab]);

  useEffect(() => {
    if (settingsOption) {
      const element = document.getElementById(`setting_${settingsOption}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-1", "ring-blue-200", "dark:ring-blue-800");
        setTimeout(() => {
          element.classList.remove("ring-1", "ring-blue-200", "dark:ring-blue-800");
        }, 2500);
      }
    }
  }, [settingsOption, activeTab]);

  const setLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  const invertLayout = (component: string) =>
    setLayout((prev) => ({ ...prev, [component]: !prev[component as keyof typeof prev] }));

  const invertSettings = (setting: string) =>
    setSettings((prev) => ({ ...prev, [setting]: !prev[setting as keyof typeof prev] }));

  const toggleTheme = () =>
    setSettings((prev) => ({
      ...prev,
      mode: prev.mode === "light" ? "dark" : "light",
    }));

  const toggleFullscreen = () => {
    if (fullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  const resetView = () =>
    setTransform((prev) => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }));

  const resetSettingsPosition = () => {
    setSettings((prev) => ({
      ...prev,
      settingsPosition: { x: 0, y: 0 },
    }));
  };

  const fitWindow = (margin = 10) => {
    const canvasElement = document.getElementById("canvas");
    if (!canvasElement) return;
    const canvas = canvasElement.getBoundingClientRect();

    const minMaxXY = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    };

    tables.forEach((table) => {
      minMaxXY.minX = Math.min(minMaxXY.minX, table.x);
      minMaxXY.minY = Math.min(minMaxXY.minY, table.y);
      minMaxXY.maxX = Math.max(minMaxXY.maxX, table.x + table.width);
      minMaxXY.maxY = Math.max(minMaxXY.maxY, table.y + table.height);
    });

    areas.forEach((area) => {
      minMaxXY.minX = Math.min(minMaxXY.minX, area.x);
      minMaxXY.minY = Math.min(minMaxXY.minY, area.y);
      minMaxXY.maxX = Math.max(minMaxXY.maxX, area.x + area.width);
      minMaxXY.maxY = Math.max(minMaxXY.maxY, area.y + area.height);
    });

    notes.forEach((note) => {
      minMaxXY.minX = Math.min(minMaxXY.minX, note.x);
      minMaxXY.minY = Math.min(minMaxXY.minY, note.y);
      minMaxXY.maxX = Math.max(
        minMaxXY.maxX,
        note.x + (note.width ?? noteWidth),
      );
      minMaxXY.maxY = Math.max(minMaxXY.maxY, note.y + note.height);
    });

    if (minMaxXY.minX === Infinity) return;

    const width = minMaxXY.maxX - minMaxXY.minX + margin * 2;
    const height = minMaxXY.maxY - minMaxXY.minY + margin * 2;

    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;
    // Making sure the scale is a multiple of 0.05
    const scale = Math.floor(Math.min(scaleX, scaleY) * 20) / 20;

    const centerX = (minMaxXY.minX + minMaxXY.maxX) / 2;
    const centerY = (minMaxXY.minY + minMaxXY.maxY) / 2;

    setTransform((prev) => ({
      ...prev,
      zoom: scale,
      pan: { x: centerX, y: centerY },
    }));
  };

  const viewFieldSummary = () => {
    setSettings((prev) => {
      const nextValue = !prev.showFieldSummary;
      if (nextValue) {
        Toast.info(t("field_details") + ": " + t("on"));
      } else {
        Toast.info(t("field_details") + ": " + t("off"));
        setHoveredTable({ tableId: null, fieldId: null });
        setTables((prevTables) => [...prevTables]);
      }
      return {
        ...prev,
        showFieldSummary: nextValue,
      };
    });
  };

  const presentationMode = () => {
    setLayout((prev) => ({
      ...prev,
      header: false,
      sidebar: false,
      toolbar: false,
    }));
    enterFullscreen();
  };

  const tableColors = settings.tableColors || [];

  const addColor = () => {
    setSettings((prev) => ({
      ...prev,
      tableColors: [...(prev.tableColors || []), "#175e7a"],
    }));
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...tableColors];
    newColors[index] = color;
    setSettings((prev) => ({ ...prev, tableColors: newColors }));
  };

  const removeColor = (index: number) => {
    const newColors = tableColors.filter((_, i) => i !== index);
    setSettings((prev) => ({ ...prev, tableColors: newColors }));
  };

  const applyPreset = (preset: { colors: string[] }) => {
    setSettings((prev) => ({ ...prev, tableColors: preset.colors }));
  };

  return (
    <div className="flex h-[550px] overflow-hidden ">

        <Nav
          className="settings-nav h-full bg-transparent"
          items={[
            {
              itemKey: "ui_visibility",
              text: t("ui_visibility"),
              icon: <IconEyeOpened />,
            },
            {
              itemKey: "diagram_display",
              text: (t as any)("diagram_display"),
              icon: <IconGlobe />,
            },
            {
              itemKey: "color_and_theme",
              text: (t as any)("color_and_theme"),
              icon: <IconPalette />,
            },
            {
              itemKey: "editor_settings",
              text: (t as any)("editor_settings"),
              icon: <IconSetting />,
            },
            {
              itemKey: "language",
              text: t("language"),
              icon: <IconLanguage />,
            },
          ]}
          onSelect={(data) => setActiveTab(data.itemKey as string)}
          selectedKeys={[activeTab]}
        />

      <div className="flex-1 overflow-y-auto pl-6 scrollbar-hide">
        {activeTab === "ui_visibility" && (
          <UIVisibility
            layout={layout}
            fullscreen={fullscreen}
            settings={settings}
            invertLayout={invertLayout}
            setLayout={setLayout}
            toggleFullscreen={toggleFullscreen}
            toggleTheme={toggleTheme}
            presentationMode={presentationMode}
          />
        )}

        {activeTab === "diagram_display" && (
          <DiagramDisplay
            settings={settings}
            setSettings={setSettings}
            invertSettings={invertSettings}
            viewFieldSummary={viewFieldSummary}
          />
        )}

        {activeTab === "color_and_theme" && (
          <ColorAndTheme
            settings={settings}
            layout={layout}
            invertSettings={invertSettings}
            addColor={addColor}
            updateColor={updateColor}
            removeColor={removeColor}
            applyPreset={applyPreset}
          />
        )}

        {activeTab === "editor_settings" && (
          <EditorSettings
            settings={settings}
            invertSettings={invertSettings}
            fitWindow={fitWindow}
            resetSettingsPosition={resetSettingsPosition}
          />
        )}

        {activeTab === "language" && (
          <LanguageSettings settings={settings} setLanguage={setLanguage} />
        )}
      </div>
    </div>
  );
}
