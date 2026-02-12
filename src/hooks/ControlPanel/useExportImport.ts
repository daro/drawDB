import { useCallback } from "react";
import { toPng, toJpeg, toSvg } from "html-to-image";
import jsPDF from "jspdf";
import { MODAL, DB } from "../../data/constants";
import { toDBML } from "../../utils/exportAs/dbml";
import { jsonToMermaid } from "../../utils/exportAs/mermaid";

export const useExportImport = (
  setModal: (val: string) => void,
  setExportData: (val: any | ((prev: any) => any)) => void,
  tables: any[],
  relationships: any[],
  xorGroups: any[],
  orGroups: any[],
  notes: any[],
  areas: any[],
  database: string,
  types: any[],
  enums: any[],
  title: string,
  exportData: any,
  databases: any,
) => {
  const copyAsImage = useCallback(() => {
    const filter = (node: any) => node.tagName !== "i";
    toPng(document.getElementById("canvas") as HTMLElement, { filter: filter }).then(
      function (dataUrl) {
        setExportData((prev: any) => ({
          ...prev,
          data: dataUrl,
          extension: "png",
        }));
      },
    );
    setModal(MODAL.IMG);
  }, [setExportData, setModal]);

  const exportAsJSON = useCallback(() => {
    setModal(MODAL.CODE);
    const result = JSON.stringify(
      {
        tables: tables,
        relationships: relationships.map((rel) => ({
          ...rel,
          waypoints: (rel.waypoints || []).map((wp: any) => ({
            ...wp,
            mode: wp.mode || "waypoint",
            ...((wp.mode === "floating" || wp.mode === "divider") && {
              pathRatio: wp.pathRatio,
            }),
          })),
          startXOffset: rel.startXOffset || 0,
          endXOffset: rel.endXOffset || 0,
          startYCorrection: rel.startYCorrection || 0,
          endYCorrection: rel.endYCorrection || 0,
        })),
        xorGroups: xorGroups,
        orGroups: orGroups,
        notes: notes,
        subjectAreas: areas,
        database: database,
        ...(databases[database].hasTypes && { types: types }),
        ...(databases[database].hasEnums && { enums: enums }),
        title: title,
      },
      null,
      2,
    );
    setExportData((prev: any) => ({
      ...prev,
      data: result,
      extension: "json",
    }));
  }, [setModal, tables, relationships, xorGroups, orGroups, notes, areas, database, types, enums, title, setExportData, databases]);

  const exportAsDBML = useCallback(() => {
    setModal(MODAL.CODE);
    const result = toDBML({
      tables,
      relationships,
      enums,
      database,
    });
    setExportData((prev: any) => ({
      ...prev,
      data: result,
      extension: "dbml",
    }));
  }, [setModal, tables, relationships, enums, database, setExportData]);

  return {
    copyAsImage,
    exportAsJSON,
    exportAsDBML,
  };
};
