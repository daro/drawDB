import { Tag } from "@douyinfe/semi-ui";
import { IconEdit } from "@douyinfe/semi-icons";
import { databases } from "@data/databases";
import { MODAL } from "@data/constants";

interface DiagramTitleProps {
  database: string;
  title: string;
  version?: string;
  layout: any;
  modal: string;
  showEditName: boolean;
  setShowEditName: (val: boolean) => void;
  setModal: (val: string) => void;
}

export default function DiagramTitle({
  database,
  title,
  version,
  layout,
  modal,
  showEditName,
  setShowEditName,
  setModal,
}: DiagramTitleProps) {
  return (
    <div className="flex items-center ms-3 gap-2">
      {databases[database].image && (
        <img
          src={databases[database].image}
          className="h-5"
          style={{
            filter:
              "opacity(0.4) drop-shadow(0 0 0 white) drop-shadow(0 0 0 white)",
          }}
          alt={databases[database].name + " icon"}
          title={databases[database].name + " diagram"}
        />
      )}
      <div
        className="text-xl flex items-center gap-1 me-1"
        onPointerEnter={(e) => e.isPrimary && setShowEditName(true)}
        onPointerLeave={(e) => e.isPrimary && setShowEditName(false)}
        onPointerDown={(e) => {
          (e.target as any).releasePointerCapture(e.pointerId);
        }}
        onClick={!layout.readOnly ? (() => setModal(MODAL.RENAME)) : undefined}
      >
        <span>
          {(window.name.split(" ")[0] === "t"
            ? "Templates/"
            : "Diagrams/") + title}
        </span>
        {version && (
          <Tag className="mt-1" color="blue" size="small">
            {version.substring(0, 7)}
          </Tag>
        )}
      </div>
      {(showEditName || modal === MODAL.RENAME) && !layout.readOnly && (
        <IconEdit />
      )}
    </div>
  );
}
