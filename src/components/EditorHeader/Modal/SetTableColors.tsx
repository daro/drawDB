import ColorPicker from "../../EditorSidePanel/ColorPicker";
import { Button, Dropdown, Space } from "@douyinfe/semi-ui";
import { useLayout, useSettings } from "@hooks";
import { IconPlus, IconDeleteStroked, IconChevronDown } from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import { colorPresets } from "@data/colorPresets";

export default function SetTableColors() {
  const { layout } = useLayout();
  const { settings, setSettings } = useSettings();
  const { t } = useTranslation();

  const tableColors = settings.tableColors || [];

  const addColor = () => {
    // dodaj nowy kolor do edycji (prosty startowy)
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
    <div>
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
          {t("color_presets")}
        </div>
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
                          className="w-4 h-4 rounded-full border border-white"
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
          <Button icon={<IconChevronDown />} iconPosition="right">
            {t("apply_preset")}
          </Button>
        </Dropdown>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 p-2">
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
                  "h-9 w-9 rounded-full", // kulka
                  "border border-zinc-300", // obrys
                  "shadow-sm", // delikatny “3D”
                  "transition-transform transition-shadow",
                  "hover:scale-110 hover:shadow",
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
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
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
      </div>

      {!layout.readOnly && (
        <Button icon={<IconPlus />} onClick={addColor} block className="mt-2">
          {t("add_new_color")}
        </Button>
      )}
    </div>
  );
}
