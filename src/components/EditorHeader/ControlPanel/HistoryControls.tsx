import { Tooltip } from "@douyinfe/semi-ui";
import { IconUndo, IconRedo } from "@douyinfe/semi-icons";

interface HistoryControlsProps {
  t: any;
  undo: () => void;
  redo: () => void;
  undoStack: any[];
  redoStack: any[];
  layout: any;
}

export default function HistoryControls({
  t,
  undo,
  redo,
  undoStack,
  redoStack,
  layout,
}: HistoryControlsProps) {
  return (
    <>
      <Tooltip content={t("undo")} position="bottom">
        <button
          className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
          disabled={undoStack.length === 0 || layout.readOnly}
          onClick={undo}
        >
          <IconUndo size="large" />
        </button>
      </Tooltip>
      <Tooltip content={t("redo")} position="bottom">
        <button
          className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
          disabled={redoStack.length === 0 || layout.readOnly}
          onClick={redo}
        >
          <IconRedo size="large" />
        </button>
      </Tooltip>
    </>
  );
}
