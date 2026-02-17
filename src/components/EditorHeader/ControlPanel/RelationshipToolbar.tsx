import { Tooltip } from "@douyinfe/semi-ui";
import { 
  IconAddXorGroup, 
  IconAddOrGroup,
  IconWaypoint,
  IconDivider,
} from "@icons";
import { IconDeleteStroked } from "@douyinfe/semi-icons";
import { ObjectType } from "@data/constants";

interface RelationshipToolbarProps {
  t: any;
  layout: any;
  relationshipOptions: any[];
  relationshipType: string;
  setRelationshipType: (val: string) => void;
  isSingleXorGroupSelected: boolean;
  convertXorToOr: (id: string | number) => void;
  bulkSelectedElements: any[];
  isSingleOrGroupSelected: boolean;
  convertOrToXor: (id: string | number) => void;
  selectedElement: any;
  del: () => void;
  canCreateXorGroup: boolean;
  createXorGroup: () => void;
  canCreateOrGroup: boolean;
  createOrGroup: () => void;
  waypointMode: string;
  setWaypointMode: (val: string) => void;
}

export default function RelationshipToolbar({
  t,
  layout,
  relationshipOptions,
  relationshipType,
  setRelationshipType,
  isSingleXorGroupSelected,
  convertXorToOr,
  bulkSelectedElements,
  isSingleOrGroupSelected,
  convertOrToXor,
  selectedElement,
  del,
  canCreateXorGroup,
  createXorGroup,
  canCreateOrGroup,
  createOrGroup,
  waypointMode,
  setWaypointMode,
}: RelationshipToolbarProps) {
  return (
    <>
      <Tooltip content={t("waypoint")} position="bottom">
        <button
          className={`py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 ${waypointMode === "waypoint" ? "text-blue-500" : ""}`}
          onClick={() => setWaypointMode("waypoint")}
          disabled={layout.readOnly}
        >
          <IconWaypoint />
        </button>
      </Tooltip>
      <Tooltip content={t("divider")} position="bottom">
        <button
          className={`py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 ${waypointMode === "divider" ? "text-blue-500" : ""}`}
          onClick={() => setWaypointMode("divider")}
          disabled={layout.readOnly}
        >
          <IconDivider />
        </button>
      </Tooltip>
      <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-600 mx-1" />
      {relationshipOptions.map((option) => (
        <Tooltip
          key={option.type}
          content={option.tooltip}
          position="bottom"
        >
          <button
            className={`py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 ${relationshipType === option.type ? "text-blue-500" : ""}`}
            onClick={() => setRelationshipType(option.type)}
            disabled={layout.readOnly}
          >
            {option.icon}
          </button>
        </Tooltip>
      ))}
      {isSingleXorGroupSelected && (
        <Tooltip content={t("convert_to_or")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-green-500"
            onClick={() => convertXorToOr(bulkSelectedElements[0].id)}
            disabled={layout.readOnly}
          >
            <IconAddOrGroup />
          </button>
        </Tooltip>
      )}
      {isSingleOrGroupSelected && (
        <Tooltip content={t("convert_to_xor")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-blue-500"
            onClick={() => convertOrToXor(bulkSelectedElements[0].id)}
            disabled={layout.readOnly}
          >
            <IconAddXorGroup />
          </button>
        </Tooltip>
      )}
      {(selectedElement.element !== ObjectType.NONE ||
        bulkSelectedElements.length > 0) && (
        <Tooltip content={t("delete")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-red-500"
            onClick={del}
            disabled={layout.readOnly}
          >
            <IconDeleteStroked />
          </button>
        </Tooltip>
      )}
      {canCreateXorGroup && (
        <Tooltip content={t("add_xor_group")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-blue-500"
            onClick={createXorGroup}
            disabled={layout.readOnly}
          >
            <IconAddXorGroup />
          </button>
        </Tooltip>
      )}
      {canCreateOrGroup && (
        <Tooltip content={t("add_or_group")} position="bottom">
          <button
            className="py-1 px-2 hover-2 rounded-sm flex items-center disabled:opacity-50 text-green-500"
            onClick={createOrGroup}
            disabled={layout.readOnly}
          >
            <IconAddOrGroup />
          </button>
        </Tooltip>
      )}
    </>
  );
}
