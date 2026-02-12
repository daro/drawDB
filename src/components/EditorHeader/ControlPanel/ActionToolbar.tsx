import { Tooltip } from "@douyinfe/semi-ui";
import { IconSaveStroked } from "@douyinfe/semi-icons";

interface ActionToolbarProps {
  t: any;
  layout: any;
  save: () => void;
}

export default function ActionToolbar({
  t,
  layout,
  save,
}: ActionToolbarProps) {
  return (
    <>
      <Tooltip content={t("save")} position="bottom">
        <button
          className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
          onClick={save}
          disabled={layout.readOnly}
        >
          <IconSaveStroked size="extra-large" />
        </button>
      </Tooltip>
    </>
  );
}
