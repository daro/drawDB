import { Typography } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { languages } from "@i18n/i18n";

const { Title } = Typography;

interface LanguageSettingsProps {
  settings: Record<string, unknown>;
  setLanguage: (code: string) => void;
}

export default function LanguageSettings({
  settings,
  setLanguage,
}: LanguageSettingsProps) {
  const { t, i18n } = useTranslation();

  return (
    <section>
      <Title heading={5} className="pb-6">
        {t("language")}
      </Title>
      <div id="setting_language">
        <div className="grid grid-cols-2 gap-4">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`space-y-1 py-3 px-4 rounded-md border-2 transition-all shadow-sm hover:shadow-md ${
                settings.mode === "dark"
                  ? "bg-zinc-700/50 hover:bg-zinc-600"
                  : "bg-zinc-50 hover:bg-zinc-100"
              } ${
                i18n.language === l.code
                  ? "border-blue-500 ring-2 ring-blue-500/20"
                  : "border-transparent"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="font-semibold text-start">
                  {l.native_name}
                </div>
                <div className="opacity-40 text-[10px] font-mono uppercase tracking-wider">
                  {l.code}
                </div>
              </div>
              <div className="text-start text-xs opacity-60">
                {l.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
