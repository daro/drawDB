import { Tooltip, Toast } from "@douyinfe/semi-ui";
import { 
  IconAddTable, 
  IconAddArea, 
  IconAddNote, 
  IconAddText, 
  IconSupertype 
} from "@icons";
import { ObjectType } from "@data/constants";

interface ObjectToolbarProps {
  t: any;
  layout: any;
  addTable: () => void;
  addArea: () => void;
  addNote: () => void;
  addText: () => void;
  linking: boolean;
  linkingLine: any;
  setLinking: (val: boolean) => void;
  setLinkingLine: (val: any) => void;
  bulkSelectedElements: any[];
  setBulkSelectedElements: (val: any[]) => void;
  tables: any[];
  pointer: any;
}

export default function ObjectToolbar({
  t,
  layout,
  addTable,
  addArea,
  addNote,
  addText,
  linking,
  linkingLine,
  setLinking,
  setLinkingLine,
  bulkSelectedElements,
  setBulkSelectedElements,
  tables,
  pointer,
}: ObjectToolbarProps) {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? 'Cmd' : 'Ctrl';

  return (
    <>
      <Tooltip content={t("add_table")} position="bottom">
        <button
          className="flex items-center py-1 px-2 hover-2 rounded-sm disabled:opacity-50"
          onClick={() => addTable()}
          disabled={layout.readOnly}
        >
          <IconAddTable />
        </button>
      </Tooltip>
      <Tooltip content={t("add_area")} position="bottom">
        <button
          className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
          onClick={() => addArea()}
          disabled={layout.readOnly}
        >
          <IconAddArea />
        </button>
      </Tooltip>
      <Tooltip content={t("add_note")} position="bottom">
        <button
          className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
          onClick={() => addNote()}
          disabled={layout.readOnly}
        >
          <IconAddNote />
        </button>
      </Tooltip>
      <Tooltip content={t("add_text")} position="bottom">
        <button
          className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50"
          onClick={() => addText()}
          disabled={layout.readOnly}
        >
          <IconAddText />
        </button>
      </Tooltip>
      <Tooltip content={`${t("assign_supertype")} (${modKey} + Click)`} position="bottom">
        <button
          className={`py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 ${linking && linkingLine.startFieldId === "" ? "text-blue-500" : ""}`}
          onClick={() => {
            if (bulkSelectedElements.length === 1 && bulkSelectedElements[0].type === ObjectType.TABLE) {
              const selectedTable = tables.find((t) => t.id === bulkSelectedElements[0].id);
              setLinking(true);
              setLinkingLine({
                startX: selectedTable ? selectedTable.x + selectedTable.width / 2 : 0,
                startY: selectedTable ? selectedTable.y + (selectedTable.height || 0) / 2 : 0,
                endX: pointer.spaces.diagram.x,
                endY: pointer.spaces.diagram.y,
                startTableId: bulkSelectedElements[0].id,
                startFieldId: "",
              });
              setBulkSelectedElements([]);
            } else {
              Toast.info("Select a table first");
            }
          }}
          disabled={layout.readOnly}
        >
          <IconSupertype />
        </button>
      </Tooltip>
    </>
  );
}
