import { Switch, Typography, Button } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { SettingItem } from "../Settings";

const { Title } = Typography;

interface EditorSettingsProps {
  settings: Record<string, unknown>;
  invertSettings: (setting: string) => void;
  fitWindow: (margin?: number) => void;
  resetSettingsPosition: () => void;
}

export default function EditorSettings({
  settings,
  invertSettings,
  fitWindow,
  resetSettingsPosition,
}: EditorSettingsProps) {
  const { t } = useTranslation();

  return (
    <section>
      <Title heading={5} className="pb-6">
        {(t as any)("editor_settings")}
      </Title>
      <div className="space-y-1">
        <SettingItem 
          id="setting_strict_mode" 
          label={(t as any)("strict_mode")}
          tooltip={(t as any)("strict_mode_info")}
        >
          <Switch
            checked={settings.strictMode as boolean}
            onChange={() => invertSettings("strictMode")}
          />
        </SettingItem>
        <SettingItem 
          id="setting_show_grid" 
          label={(t as any)("show_grid")}
          tooltip={(t as any)("show_grid_info")}
        >
          <Switch
            checked={settings.showGrid as boolean}
            onChange={() => invertSettings("showGrid")}
          />
        </SettingItem>
        <SettingItem 
          id="setting_snap_to_grid" 
          label={(t as any)("snap_to_grid")}
          tooltip={(t as any)("snap_to_grid_info")}
        >
          <Switch
            checked={settings.snapToGrid as boolean}
            onChange={() => invertSettings("snapToGrid")}
          />
        </SettingItem>
        <SettingItem id="setting_show_debug_coordinates" label={(t as any)("show_debug_coordinates")}>
          <Switch
            checked={settings.showDebugCoordinates}
            onChange={() => invertSettings("showDebugCoordinates")}
          />
        </SettingItem>
        <SettingItem id="setting_show_debug_console" label={(t as any)("show_debug_console")}>
          <Switch
            checked={settings.showDebugConsole}
            onChange={() => invertSettings("showDebugConsole")}
          />
        </SettingItem>
        <SettingItem id="setting_debug_path" label={(t as any)("debug_path")}>
          <Switch
            checked={settings.debugPath as boolean}
            onChange={() => invertSettings("debugPath")}
          />
        </SettingItem>
        <div className="grid grid-cols-2 gap-3 pt-6">
          <Button
            id="setting_fit_window_reset"
            onClick={() => fitWindow(100)}
            // @ts-ignore
            theme="light"
            {...( {} as any )}
            className="col-span-2"
            icon={<i className="bi bi-arrows-angle-expand mr-2" />}
          >
            {(t as any)("fit_window_reset")}
          </Button>
          <Button
            onClick={resetSettingsPosition}
            // @ts-ignore
            theme="light"
            {...( {} as any )}
            className="col-span-2"
          >
            {(t as any)("reset_settings_position")}
          </Button>
        </div>
      </div>
    </section>
  );
}
