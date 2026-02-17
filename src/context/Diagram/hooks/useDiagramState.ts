import { useState } from "react";
import { ITable, IRelationship, IGroup } from "@types";
import { DB } from "@data/constants";

export const useDiagramState = () => {
  const [database, setDatabase] = useState<string>(DB.GENERIC);
  const [tables, setTables] = useState<ITable[]>([]);
  const [relationships, setRelationships] = useState<IRelationship[]>([]);
  const [xorGroups, setXorGroups] = useState<IGroup[]>([]);
  const [orGroups, setOrGroups] = useState<IGroup[]>([]);

  return {
    database,
    setDatabase,
    tables,
    setTables,
    relationships,
    setRelationships,
    xorGroups,
    setXorGroups,
    orGroups,
    setOrGroups,
  };
};
