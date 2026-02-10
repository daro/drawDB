import { Input } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { useLayout } from "../../../hooks";
import { RenameProps } from "../../../types";

export default function Rename({ title, setTitle }: RenameProps) {
  const { t } = useTranslation();
  const { layout } = useLayout();

  return (
    <Input
      placeholder={t("name")}
      defaultValue={title}
      onChange={(v) => setTitle(v)}
      readOnly={layout.readOnly}
    />
  );
}
