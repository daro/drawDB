import { useCallback } from "react";
import { Toast } from "@douyinfe/semi-ui";
import { toPng, toJpeg, toSvg } from "html-to-image";
import jsPDF from "jspdf";
import {
  jsonToMySQL,
  jsonToPostgreSQL,
  jsonToSQLite,
  jsonToMariaDB,
  jsonToSQLServer,
  jsonToOracleSQL,
} from "../../utils/exportSQL/generic";
import { exportSQL } from "../../utils/exportSQL";
import { jsonToMermaid } from "../../utils/exportAs/mermaid";
import { jsonToDocumentation } from "../../utils/exportAs/documentation";
import { toDBML } from "../../utils/exportAs/dbml";
import {
  DB,
  MODAL,
  EXPORT_CONFIG,
} from "../../data/constants";
import { databases } from "../../data/databases";

export const useExportActions = ({
  tables,
  relationships,
  types,
  enums,
  database,
  notes,
  areas,
  title,
  setModal,
  setExportData,
  exportData,
  t,
}: any) => {
  const exportSource = useCallback(() => {
    if (database === DB.GENERIC) return;
    setModal(MODAL.CODE);
    const src = exportSQL({
      tables: tables,
      references: relationships,
      types: types,
      database: database,
      enums: enums,
    });
    setExportData((prev: any) => ({
      ...prev,
      data: src,
      extension: "sql",
    }));
  }, [database, tables, relationships, types, enums, setModal, setExportData]);

  const exportGenericSQL = useCallback((targetDb: string) => {
    setModal(MODAL.CODE);
    let src = "";
    const params = {
      tables: tables,
      references: relationships,
      types: types,
      database: database,
    };

    switch (targetDb) {
      case DB.MYSQL:
        src = jsonToMySQL(params);
        break;
      case DB.POSTGRES:
        src = jsonToPostgreSQL(params);
        break;
      case DB.SQLITE:
        src = jsonToSQLite(params);
        break;
      case DB.MARIADB:
        src = jsonToMariaDB(params);
        break;
      case DB.MSSQL:
        src = jsonToSQLServer(params);
        break;
      case DB.ORACLESQL:
        src = jsonToOracleSQL(params);
        break;
    }

    setExportData((prev: any) => ({
      ...prev,
      data: src,
      extension: "sql",
    }));
  }, [tables, relationships, types, database, setModal, setExportData]);

  const exportAsImage = useCallback((format: "png" | "jpeg" | "svg", transparent = false) => {
    const node = document.getElementById("canvas");
    if (!node) {
      Toast.error(t("oops_smth_went_wrong"));
      return;
    }

    const filter = (n: any) => (n?.tagName || "").toUpperCase() !== "I";
    const options: any = { filter };

    if (format === "png") {
      options.pixelRatio = EXPORT_CONFIG.PNG_PIXEL_RATIO;
      if (transparent) {
        options.backgroundColor = "rgba(0,0,0,0)";
      }
    } else if (format === "jpeg") {
      options.quality = 0.95;
    }

    let wrapper: HTMLElement | null = null;
    let prevBg: string | null = null;
    if (transparent) {
      wrapper = document.querySelector("#canvas > div") as HTMLElement | null;
      prevBg = wrapper ? wrapper.style.backgroundColor : null;
      if (wrapper) wrapper.style.backgroundColor = "transparent";
    }

    const promise = 
      format === "png" ? toPng(node, options) :
      format === "jpeg" ? toJpeg(node, options) :
      toSvg(node, options);

    promise
      .then((dataUrl) => {
        setExportData((prev: any) => ({
          ...prev,
          data: dataUrl,
          extension: format,
        }));
        setModal(MODAL.IMG);
      })
      .catch(() => {
        Toast.error(t("oops_smth_went_wrong"));
      })
      .finally(() => {
        if (transparent && wrapper && prevBg !== null) {
          wrapper.style.backgroundColor = prevBg;
        }
      });
  }, [t, setExportData, setModal]);

  const exportAsJSON = useCallback(() => {
    setModal(MODAL.CODE);
    const result = JSON.stringify(
      {
        tables: tables,
        relationships: relationships.map((rel: any) => ({
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
        xorGroups: [], // Should pass these if needed
        orGroups: [],  // Should pass these if needed
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
  }, [tables, relationships, notes, areas, database, types, enums, title, setModal, setExportData]);

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
  }, [tables, relationships, enums, database, setModal, setExportData]);

  const exportAsPDF = useCallback(() => {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    toJpeg(canvas).then((dataUrl) => {
      const doc = new jsPDF("l", "px", [
        canvas.offsetWidth,
        canvas.offsetHeight,
      ]);
      doc.addImage(
        dataUrl,
        "jpeg",
        0,
        0,
        canvas.offsetWidth,
        canvas.offsetHeight,
      );
      doc.save(`${exportData.filename}.pdf`);
    });
  }, [exportData.filename]);

  const exportAsMermaid = useCallback(() => {
    setModal(MODAL.CODE);
    const result = jsonToMermaid({
      tables: tables,
      relationships: relationships,
      notes: notes,
      subjectAreas: areas,
      database: database,
      title: title,
    });
    setExportData((prev: any) => ({
      ...prev,
      data: result,
      extension: "md",
    }));
  }, [tables, relationships, notes, areas, database, title, setModal, setExportData]);

  const exportAsMarkdown = useCallback(() => {
    setModal(MODAL.CODE);
    const result = jsonToDocumentation({
      tables: tables,
      relationships: relationships,
      notes: notes,
      subjectAreas: areas,
      database: database,
      title: title,
      ...(databases[database].hasTypes && { types: types }),
      ...(databases[database].hasEnums && { enums: enums }),
    });
    setExportData((prev: any) => ({
      ...prev,
      data: result,
      extension: "md",
    }));
  }, [tables, relationships, notes, areas, database, title, types, enums, setModal, setExportData]);

  return {
    exportSource,
    exportGenericSQL,
    exportAsImage,
    exportAsJSON,
    exportAsDBML,
    exportAsPDF,
    exportAsMermaid,
    exportAsMarkdown,
  };
};
