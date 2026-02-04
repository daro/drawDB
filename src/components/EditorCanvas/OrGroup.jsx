import GroupArc from "./GroupArc";

export default function OrGroup({ data, onPointerDown }) {
  return <GroupArc data={data} type="OR" onPointerDown={onPointerDown} />;
}
