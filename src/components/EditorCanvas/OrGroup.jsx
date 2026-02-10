import React from "react";
import GroupArc from "./GroupArc";

function OrGroup({ data, onPointerDown }) {
  return <GroupArc data={data} type="OR" onPointerDown={onPointerDown} />;
}

export default React.memo(OrGroup);
