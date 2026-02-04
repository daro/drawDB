import GroupArc from "./GroupArc";

export default function XorGroup({ data, onPointerDown }) {
  return <GroupArc data={data} type="XOR" onPointerDown={onPointerDown} />;
}
