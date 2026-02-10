import React, { useMemo } from "react";
import { ObjectType } from "../../data/constants";
import Relationship from "./Relationship";
import XorGroup from "./XorGroup";
import OrGroup from "./OrGroup";
import { IRelationship, IGroup } from "../../types";

/**
 * Props for the RelationshipsLayer component.
 */
interface RelationshipsLayerProps {
  /** Array of relationship objects to render. */
  relationships: IRelationship[];
  /** Array of XOR group objects to render. */
  xorGroups: IGroup[];
  /** Array of OR group objects to render. */
  orGroups: IGroup[];
  /** Callback to handle pointer down on an element. */
  setElementPointerDown: (element: any, type: number) => (e: React.PointerEvent) => void;
}

/**
 * RelationshipsLayer component renders the relationship lines and group arcs (XOR/OR).
 * It uses React.memo and useMemo to optimize rendering.
 *
 * @param props - Component props.
 * @returns Rendered SVG elements.
 */
const RelationshipsLayer: React.FC<RelationshipsLayerProps> = ({
  relationships,
  xorGroups,
  orGroups,
  setElementPointerDown,
}) => {
  const renderedXorGroups = useMemo(() => xorGroups.map((group) => group && (
    <XorGroup
      key={group.id}
      data={group}
      onPointerDown={setElementPointerDown(group, ObjectType.XOR_GROUP)}
    />
  )), [xorGroups, setElementPointerDown]);

  const renderedOrGroups = useMemo(() => orGroups.map((group) => group && (
    <OrGroup
      key={group.id}
      data={group}
      onPointerDown={setElementPointerDown(group, ObjectType.OR_GROUP)}
    />
  )), [orGroups, setElementPointerDown]);

  const renderedRelationships = useMemo(() => relationships.map((rel) => rel && (
    <Relationship
      key={rel.id}
      data={rel}
      onPointerDown={setElementPointerDown(rel, ObjectType.RELATIONSHIP)}
    />
  )), [relationships, setElementPointerDown]);

  return (
    <>
      {renderedXorGroups}
      {renderedOrGroups}
      {renderedRelationships}
    </>
  );
};

export default React.memo(RelationshipsLayer);
