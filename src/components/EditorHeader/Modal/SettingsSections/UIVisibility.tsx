import { Switch, Typography, Button } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { SettingItem } from "../Settings";

const { Title } = Typography;

interface UIVisibilityProps {
  layout: Record<string, unknown>;
  fullscreen: boolean;
  settings: Record<string, unknown>;
  invertLayout: (component: string) => void;
  setLayout: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
  toggleFullscreen: () => void;
  toggleTheme: () => void;
  presentationMode: () => void;
}

export default function UIVisibility({
  layout,
  fullscreen,
  settings,
  invertLayout,
  setLayout,
  toggleFullscreen,
  toggleTheme,
  presentationMode,
}: UIVisibilityProps) {
  const { t } = useTranslation();

  return (
    <div>
      <Title heading={5} className="pb-6">
        {t("ui_visibility")}
      </Title>
      <div className="space-y-1">
        <SettingItem id="setting_header" label={t("header")}>
          <Switch
            checked={layout.header}
            onChange={() => invertLayout("header")}
          />
        </SettingItem>
        <SettingItem id="setting_sidebar" label={t("sidebar")}>
          <Switch
            checked={layout.sidebar}
            onChange={() => invertLayout("sidebar")}
          />
        </SettingItem>
        <SettingItem id="setting_issues" label={t("issues")}>
          <Switch
            checked={layout.issues}
            onChange={() => invertLayout("issues")}
          />
        </SettingItem>
        <SettingItem id="setting_dbml_view" label={t("dbml_view")}>
          <Switch
            checked={layout.dbmlEditor}
            onChange={() =>
              setLayout((prev: any) => ({
                ...prev,
                dbmlEditor: !prev.dbmlEditor,
              }))
            }
          />
        </SettingItem>
        <SettingItem id="setting_fullscreen" label={t("fullscreen")}>
          <Switch checked={fullscreen} onChange={toggleFullscreen} />
        </SettingItem>
        <SettingItem id="setting_dark_mode" label={t("dark_mode")}>
          <Switch
            checked={settings.mode === "dark"}
            onChange={toggleTheme}
          />
        </SettingItem>
        <div className="pt-6">
          <Button
            block
            onClick={presentationMode}
            // @ts-ignore
            theme="light"
            {...( {} as any )}
          >
            {(t as any)("presentation_mode")}
          </Button>
        </div>
      </div>
    </div>
  );
}
