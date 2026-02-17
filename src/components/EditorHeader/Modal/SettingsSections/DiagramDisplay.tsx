import { Switch, Typography, Select, InputNumber } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { SettingItem } from "../Settings";

const { Title } = Typography;

interface DiagramDisplayProps {
  settings: Record<string, unknown>;
  setSettings: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
  invertSettings: (setting: string) => void;
  viewFieldSummary: () => void;
}

export default function DiagramDisplay({
  settings,
  setSettings,
  invertSettings,
  viewFieldSummary,
}: DiagramDisplayProps) {
  const { t } = useTranslation();

  return (
    <section>
      <Title heading={5} className="pb-6">
        {(t as any)("diagram_display")}
      </Title>
      <div className="space-y-1">
        <SettingItem
          id="setting_show_datatype"
          label={(t as any)("show_datatype")}
          tooltip={(t as any)("show_datatype_info")}
        >
          <Switch
            checked={settings.showDataTypes as boolean}
            onChange={() => invertSettings("showDataTypes")}
          />
        </SettingItem>
        <SettingItem
          id="setting_show_cardinality"
          label={(t as any)("show_cardinality")}
          tooltip={(t as any)("show_cardinality_info")}
        >
          <Switch
            checked={settings.showCardinality as boolean}
            onChange={() => invertSettings("showCardinality")}
          />
        </SettingItem>
        <SettingItem
          id="setting_show_pk_icons"
          label={(t as any)("show_pk_icons")}
          tooltip={(t as any)("show_pk_icons_info")}
        >
          <Switch
            checked={settings.showPKIcons as boolean}
            onChange={() => invertSettings("showPKIcons")}
          />
        </SettingItem>
        <SettingItem
          id="setting_show_fk_icons"
          label={(t as any)("show_fk_icons")}
          tooltip={(t as any)("show_fk_icons_info")}
        >
          <Switch
            checked={settings.showFKIcons as boolean}
            onChange={() => invertSettings("showFKIcons")}
          />
        </SettingItem>
        <SettingItem
          id="setting_field_details"
          label={(t as any)("field_details")}
          tooltip={(t as any)("field_details_info")}
        >
          <Switch
            checked={settings.showFieldSummary as boolean}
            onChange={viewFieldSummary}
          />
        </SettingItem>
        <SettingItem
          id="setting_table_names_uppercase"
          label={(t as any)("table_names_uppercase")}
          tooltip={(t as any)("table_names_uppercase_info")}
        >
          <Switch
            checked={settings.tableNamesUppercase as boolean}
            onChange={() => invertSettings("tableNamesUppercase")}
          />
        </SettingItem>
        <SettingItem
          id="setting_show_relationship_labels"
          label={(t as any)("show_relationship_labels")}
          tooltip={(t as any)("show_relationship_labels_info")}
        >
          <Switch
            checked={settings.showRelationshipLabels as boolean}
            onChange={() => invertSettings("showRelationshipLabels")}
          />
        </SettingItem>
        <SettingItem
          id="setting_show_relationship_names"
          label={(t as any)("show_relationship_names")}
          tooltip={(t as any)("show_relationship_names_info")}
        >
          <Switch
            checked={settings.showRelationshipNames as boolean}
            onChange={() => invertSettings("showRelationshipNames")}
          />
        </SettingItem>
        <SettingItem
          id="setting_rename_fk"
          label={(t as any)("rename_fk")}
          tooltip={(t as any)("rename_fk_info")}
        >
          <Switch
            checked={settings.renameFK as boolean}
            onChange={() => invertSettings("renameFK")}
          />
        </SettingItem>
        <SettingItem
          id="setting_spread_relations"
          label={(t as any)("spread_relations")}
          tooltip={(t as any)("spread_relations_info")}
        >
          <Switch
            checked={settings.spreadRelations as boolean}
            onChange={() => invertSettings("spreadRelations")}
          />
        </SettingItem>
        <SettingItem
          id="setting_relationship_style"
          label={(t as any)("relationship_style")}
        >
          <Select
            value={settings.relationshipStyle}
            style={{ width: 140 }}
            onChange={(v) =>
              setSettings((prev: any) => ({
                ...prev,
                relationshipStyle: v,
              }))
            }
          >
            <Select.Option value="default">
              {(t as any)("default")}
            </Select.Option>
            <Select.Option value="erd">ERD</Select.Option>
            <Select.Option value="uml">UML</Select.Option>
            <Select.Option value="idef1x">IDEF1X</Select.Option>
          </Select>
        </SettingItem>
        <SettingItem
          id="setting_side_margin"
          label={(t as any)("side_margin")}
          tooltip={(t as any)("side_margin_info")}
        >
          <InputNumber
            value={settings.sideMargin as number}
            style={{ width: 140 }}
            onChange={(v) =>
              setSettings((prev: any) => ({
                ...prev,
                sideMargin: v as number,
              }))
            }
          />
        </SettingItem>
        <SettingItem
          id="setting_relationship_name_font_size"
          label={(t as any)("relationship_name_font_size")}
        >
          <InputNumber
            value={settings.relationshipNameFontSize as number}
            style={{ width: 140 }}
            onChange={(v) =>
              setSettings((prev: any) => ({
                ...prev,
                relationshipNameFontSize: v as number,
              }))
            }
          />
        </SettingItem>
        <SettingItem
          id="setting_relationship_side_label_font_size"
          label={(t as any)("relationship_side_label_font_size")}
        >
          <InputNumber
            value={settings.relationshipSideLabelFontSize as number}
            style={{ width: 140 }}
            onChange={(v) =>
              setSettings((prev: any) => ({
                ...prev,
                relationshipSideLabelFontSize: v as number,
              }))
            }
          />
        </SettingItem>
      </div>
    </section>
  );
}
