import React from "react";
import GroupArc from "./GroupArc";

function XorGroup({ data, onPointerDown }) {
  return <GroupArc data={data} type="XOR" onPointerDown={onPointerDown} />;
}

export default React.memo(XorGroup);
