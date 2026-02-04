import { Switch, Typography, Divider, Dropdown, Button } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { IconChevronDown, IconDeleteStroked, IconPlus } from "@douyinfe/semi-icons";
import { SettingItem } from "../Settings";
import { colorPresets } from "../../../../data/colorPresets";
import ColorPicker from "../../../EditorSidePanel/ColorPicker";

const { Title, Text } = Typography;

interface ColorAndThemeProps {
  settings: Record<string, unknown>;
  layout: Record<string, unknown>;
  invertSettings: (setting: string) => void;
  addColor: () => void;
  updateColor: (index: number, color: string) => void;
  removeColor: (index: number) => void;
  applyPreset: (preset: { colors: string[] }) => void;
}

export default function ColorAndTheme({
  settings,
  layout,
  invertSettings,
  addColor,
  updateColor,
  removeColor,
  applyPreset,
}: ColorAndThemeProps) {
  const { t } = useTranslation();
  const tableColors = settings.tableColors || [];

  return (
    <section>
      <Title heading={5} className="pb-6">
        {(t as any)("color_and_theme")}
      </Title>
      <div className="space-y-1">
        <SettingItem
          id="setting_outbound_relations_in_table_color"
          label={(t as any)("outbound_relations_in_table_color")}
        >
          <Switch
            checked={settings.outboundRelationsInTableColor}
            onChange={() =>
              invertSettings("outboundRelationsInTableColor")
            }
          />
        </SettingItem>
        <SettingItem
          id="setting_relation_animations_in_table_color"
          label={(t as any)("relation_animations_in_table_color")}
        >
          <Switch
            checked={settings.relationAnimationsInTableColor}
            onChange={() =>
              invertSettings("relationAnimationsInTableColor")
            }
          />
        </SettingItem>
        <Divider className="my-6" />
        <div id="setting_table_colors" className="space-y-4 px-1">
          <div className="flex justify-between items-center">
            <Text strong>{t("table_colors")}</Text>
            <Dropdown
              trigger="click"
              position="bottomRight"
              render={
                <Dropdown.Menu>
                  {colorPresets.map((preset) => (
                    <Dropdown.Item
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {preset.colors.slice(0, 4).map((c, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border border-white dark:border-zinc-800"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <span>{t(preset.name)}</span>
                      </div>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              }
            >
              <Button
                icon={<IconChevronDown />}
                iconPosition="right"
                size="small"
                // @ts-ignore
                theme="light"
                {...( {} as any )}
              >
                {t("apply_preset")}
              </Button>
            </Dropdown>
          </div>
          <div className="flex flex-wrap gap-3 py-2">
            {tableColors.map((color, index) => (
              <div key={index} className="relative group">
                <ColorPicker
                  usePopover={true}
                  value={color || "#000000"}
                  readOnly={false}
                  onChange={(hex) => {
                    updateColor(index, hex);
                  }}
                  onColorPick={(hex) => updateColor(index, hex)}
                >
                  <button
                    type="button"
                    disabled={layout.readOnly}
                    className={[
                      "h-8 w-8 rounded-full",
                      "border border-zinc-300 dark:border-zinc-600",
                      "shadow-sm",
                      "transition-all",
                      "hover:scale-110 hover:shadow-md",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      layout.readOnly
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer",
                    ].join(" ")}
                    style={{ backgroundColor: color || "#000000" }}
                    title={t("click_to_edit") || "Kliknij, aby edytować"}
                    aria-label={`edit-color-${index}`}
                  />
                </ColorPicker>

                {!layout.readOnly && (
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeColor(index);
                    }}
                    aria-label={`remove-color-${index}`}
                  >
                    <IconDeleteStroked size="extra-small" />
                  </button>
                )}
              </div>
            ))}
            {!layout.readOnly && (
              <button
                onClick={addColor}
                className="h-8 w-8 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-zinc-400 hover:border-zinc-400 hover:text-zinc-500 dark:hover:border-zinc-500 transition-colors"
              >
                <IconPlus size="small" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
