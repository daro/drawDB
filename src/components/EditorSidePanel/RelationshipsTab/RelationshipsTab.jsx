import { Collapse, Button } from "@douyinfe/semi-ui";
import { useSelect, useDiagram, useSaveState, useLayout } from "../../../hooks";
import { useMemo } from "react";
import Empty from "../Empty";
import SearchBar from "./SearchBar";
import RelationshipInfo from "./RelationshipInfo";
import XorGroupInfo from "./XorGroupInfo";
import OrGroupInfo from "./OrGroupInfo";
import { ObjectType, State } from "../../../data/constants";
import { useTranslation } from "react-i18next";
import { SortableList } from "../../SortableList/SortableList";
import { DragHandle } from "../../SortableList/DragHandle";

export default function RelationshipsTab() {
  const {
    relationships,
    setRelationships,
    xorGroups,
    addXorGroup,
    orGroups,
    addOrGroup,
    tables,
  } = useDiagram();
  const { selectedElement, setSelectedElement, bulkSelectedElements } = useSelect();
  const { setSaveState } = useSaveState();
  const { layout } = useLayout();
  const { t } = useTranslation();

  const canCreateXorGroup = useMemo(() => {
    if (bulkSelectedElements.length < 2) return false;
    const selectedRels = bulkSelectedElements.filter(
      (e) => e.type === ObjectType.RELATIONSHIP,
    );
    if (selectedRels.length < 2) return false;

    // Check if they are already in an XOR group
    const ids = selectedRels.map((r) => r.id);
    if (xorGroups.some((g) => ids.some((id) => g.childRelationshipIds.includes(id))))
      return false;

    const relObjects = relationships.filter((r) => ids.includes(r.id));
    if (relObjects.length < 2) return false;

    const startTableId = relObjects[0].startTableId;
    const isParentStart = relObjects.every((r) => r.startTableId === startTableId);
    
    if (isParentStart) return true;

    const endTableId = relObjects[0].endTableId;
    const isParentEnd = relObjects.every((r) => r.endTableId === endTableId);
    
    return isParentEnd;
  }, [bulkSelectedElements, xorGroups, relationships]);

  const canCreateOrGroup = useMemo(() => {
    if (bulkSelectedElements.length < 2) return false;
    const selectedRels = bulkSelectedElements.filter(
      (e) => e.type === ObjectType.RELATIONSHIP,
    );
    if (selectedRels.length < 2) return false;

    // Check if they are already in an OR group
    const ids = selectedRels.map((r) => r.id);
    if (orGroups.some((g) => ids.some((id) => g.childRelationshipIds.includes(id))))
      return false;

    const relObjects = relationships.filter((r) => ids.includes(r.id));
    if (relObjects.length < 2) return false;

    const startTableId = relObjects[0].startTableId;
    const isParentStart = relObjects.every((r) => r.startTableId === startTableId);
    
    if (isParentStart) return true;

    const endTableId = relObjects[0].endTableId;
    const isParentEnd = relObjects.every((r) => r.endTableId === endTableId);
    
    return isParentEnd;
  }, [bulkSelectedElements, orGroups, relationships]);

  const createXorGroup = () => {
    const selectedRels = bulkSelectedElements.filter(
      (e) => e.type === ObjectType.RELATIONSHIP,
    );
    const ids = selectedRels.map((r) => r.id);
    const relObjects = relationships.filter((r) => ids.includes(r.id));

    const startTableId = relObjects[0].startTableId;
    const isParentStart = relObjects.every((r) => r.startTableId === startTableId);
    
    addXorGroup({
      parentTableId: isParentStart ? startTableId : relObjects[0].endTableId,
      childRelationshipIds: ids,
    });
  };

  const createOrGroup = () => {
    const selectedRels = bulkSelectedElements.filter(
      (e) => e.type === ObjectType.RELATIONSHIP,
    );
    const ids = selectedRels.map((r) => r.id);
    const relObjects = relationships.filter((r) => ids.includes(r.id));

    const startTableId = relObjects[0].startTableId;
    const isParentStart = relObjects.every(
      (r) => r.startTableId === startTableId,
    );

    addOrGroup({
      parentTableId: isParentStart ? startTableId : relObjects[0].endTableId,
      childRelationshipIds: ids,
    });
  };

  const getGroupDescription = (group) => {
    const parentTable = tables.find((t) => t.id === group.parentTableId);
    if (!parentTable) return "";

    const childTableNames = group.childRelationshipIds
      .map((rid) => {
        const rel = relationships.find((r) => r.id === rid);
        if (!rel) return null;
        const childTableId =
          rel.startTableId === group.parentTableId
            ? rel.endTableId
            : rel.startTableId;
        return tables.find((t) => t.id === childTableId)?.name;
      })
      .filter(Boolean);

    return `${parentTable.name} → {${childTableNames.join(", ")}}`;
  };

  return (
    <>
      <SearchBar />
      {canCreateXorGroup && (
        <div className="px-4 mb-4">
          <Button block onClick={createXorGroup}>
            {t("add_xor_group")}
          </Button>
        </div>
      )}
      {canCreateOrGroup && (
        <div className="px-4 mb-4">
          <Button block onClick={createOrGroup}>
            {t("add_or_group")}
          </Button>
        </div>
      )}
      {relationships.length <= 0 && xorGroups.length <= 0 && orGroups.length <= 0 ? (
        <Empty
          title={t("no_relationships")}
          text={t("no_relationships_text")}
        />
      ) : (
        <Collapse
          activeKey={
            selectedElement.open &&
            (selectedElement.element === ObjectType.RELATIONSHIP ||
              selectedElement.element === ObjectType.XOR_GROUP ||
              selectedElement.element === ObjectType.OR_GROUP)
              ? `${selectedElement.id}`
              : ""
          }
          keepDOM={false}
          lazyRender
          onChange={(k) => {
            if (xorGroups.some((g) => g.id === k[0])) {
              setSelectedElement((prev) => ({
                ...prev,
                open: true,
                id: k[0],
                element: ObjectType.XOR_GROUP,
              }));
            } else if (orGroups.some((g) => g.id === k[0])) {
              setSelectedElement((prev) => ({
                ...prev,
                open: true,
                id: k[0],
                element: ObjectType.OR_GROUP,
              }));
            } else {
              setSelectedElement((prev) => ({
                ...prev,
                open: true,
                id: k[0],
                element: ObjectType.RELATIONSHIP,
              }));
            }
          }}
          accordion
        >
          {xorGroups.length > 0 && (
            <div className="mb-2">
              <div className="px-4 py-2 font-bold text-xs uppercase text-gray-500">
                {t("xor_groups")}
              </div>
              {xorGroups.map((group) => (
                <div id={`scroll_ref_${group.id}`} key={"xor_group_" + group.id}>
                  <Collapse.Panel
                    header={
                      <div className="w-full flex flex-col overflow-hidden">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-blue-500">
                          {group.label}
                        </div>
                        <div className="text-xs text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                          {getGroupDescription(group)}
                        </div>
                      </div>
                    }
                    itemKey={`${group.id}`}
                  >
                    <XorGroupInfo data={group} />
                  </Collapse.Panel>
                </div>
              ))}
            </div>
          )}
          {orGroups.length > 0 && (
            <div className="mb-2">
              <div className="px-4 py-2 font-bold text-xs uppercase text-gray-500">
                {t("or_groups")}
              </div>
              {orGroups.map((group) => (
                <div id={`scroll_ref_${group.id}`} key={"or_group_" + group.id}>
                  <Collapse.Panel
                    header={
                      <div className="w-full flex flex-col overflow-hidden">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-green-500">
                          {group.label}
                        </div>
                        <div className="text-xs text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                          {getGroupDescription(group)}
                        </div>
                      </div>
                    }
                    itemKey={`${group.id}`}
                  >
                    <OrGroupInfo data={group} />
                  </Collapse.Panel>
                </div>
              ))}
            </div>
          )}
          {relationships.length > 0 && (
            <>
              {(xorGroups.length > 0 || orGroups.length > 0) && (
                <div className="px-4 py-2 font-bold text-xs uppercase text-gray-500">
                  {t("relationships")}
                </div>
              )}
              <SortableList
                keyPrefix="relationships-tab"
                items={relationships}
                onChange={(newRelationships) =>
                  setRelationships(newRelationships)
                }
                afterChange={() => setSaveState(State.SAVING)}
                renderItem={(item) => (
                  <div
                    id={`scroll_ref_${item.id}`}
                    key={"relationship_" + item.id}
                  >
                    <Collapse.Panel
                      className="relative"
                      header={
                        <div className="w-full flex items-center gap-2">
                          <DragHandle readOnly={layout.readOnly} id={item.id} />
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {item.name}
                          </div>
                        </div>
                      }
                      itemKey={`${item.id}`}
                    >
                      <RelationshipInfo data={item} />
                    </Collapse.Panel>
                  </div>
                )}
              />
            </>
          )}
        </Collapse>
      )}
    </>
  );
}
