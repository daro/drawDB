import { DateTime } from "luxon";
import { MODAL, IMPORT_FROM, DB, Cardinality, State, SIDESHEET } from "@data/constants";
import { socials } from "@data/socials";
import { enterFullscreen, exitFullscreen } from "@utils/fullscreen";

export const getMenuConfig = ({
  t,
  i18n,
  setModal,
  loadDiagram,
  save,
  recentlyOpenedDiagrams,
  layout,
  saveDiagramAs,
  saveDiagramAsTemplate,
  delDiagram,
  setImportFrom,
  database,
  setImportDb,
  exportGenericSQL,
  exportSource,
  exportAsImage,
  exportAsJSON,
  exportAsDBML,
  exportAsPDF,
  exportAsMermaid,
  exportAsMarkdown,
  saveState,
  navigate,
  undo,
  redo,
  undoStack,
  redoStack,
  setTables,
  setRelationships,
  setAreas,
  setNotes,
  setEnums,
  setTypes,
  setUndoStack,
  setRedoStack,
  diagramId,
  db,
  edit,
  cut,
  copy,
  paste,
  duplicate,
  del,
  copyAsImage,
  openSettings,
  settings,
  fullscreen,
  setLayout,
  fitWindow,
  setSidesheet,
}) => ({
  file: {
    new: {
      function: () => setModal(MODAL.NEW),
    },
    new_window: {
      function: () => {
        const newWindow = window.open("/editor", "_blank");
        newWindow.name = window.name;
      },
    },
    open: {
      function: () => setModal(MODAL.OPEN),
      shortcut: "Ctrl+O",
    },
    open_recent: {
      children: [
        ...(recentlyOpenedDiagrams && recentlyOpenedDiagrams.length > 0
          ? [
              ...recentlyOpenedDiagrams.map((diagram) => ({
                name: diagram.name,
                label: DateTime.fromJSDate(new Date(diagram.lastModified))
                  .setLocale(i18n.language)
                  .toRelative(),
                function: async () => {
                  await loadDiagram(diagram.id);
                  save();
                },
              })),
              { divider: true },
              {
                name: t("see_all"),
                function: () => setModal(MODAL.OPEN),
              },
            ]
          : [
              {
                name: t("no_saved_diagrams"),
                disabled: true,
              },
            ]),
      ],
      function: () => {},
    },
    save: {
      function: save,
      shortcut: "Ctrl+S",
      disabled: layout.readOnly,
    },
    save_as: {
      function: saveDiagramAs,
      shortcut: "Ctrl+Shift+S",
      disabled: layout.readOnly,
    },
    save_as_template: {
      function: saveDiagramAsTemplate,
    },
    rename: {
      function: () => {
        setModal(MODAL.RENAME);
      },
      disabled: layout.readOnly,
    },
    delete_diagram: {
      warning: {
        title: t("delete_diagram"),
        message: t("are_you_sure_delete_diagram"),
      },
      function: delDiagram,
    },
    import_from: {
      children: [
        {
          function: () => setModal(MODAL.IMPORT),
          name: "JSON",
          disabled: layout.readOnly,
        },
        {
          function: () => {
            setModal(MODAL.IMPORT);
            setImportFrom(IMPORT_FROM.DBML);
          },
          name: "DBML",
          disabled: layout.readOnly,
        },
      ],
    },
    import_from_source: {
      ...(database === DB.GENERIC && {
        children: [
          {
            function: () => {
              setModal(MODAL.IMPORT_SRC);
              setImportDb(DB.MYSQL);
            },
            name: "MySQL",
            disabled: layout.readOnly,
          },
          {
            function: () => {
              setModal(MODAL.IMPORT_SRC);
              setImportDb(DB.POSTGRES);
            },
            name: "PostgreSQL",
            disabled: layout.readOnly,
          },
          {
            function: () => {
              setModal(MODAL.IMPORT_SRC);
              setImportDb(DB.SQLITE);
            },
            name: "SQLite",
            disabled: layout.readOnly,
          },
          {
            function: () => {
              setModal(MODAL.IMPORT_SRC);
              setImportDb(DB.MARIADB);
            },
            name: "MariaDB",
            disabled: layout.readOnly,
          },
          {
            function: () => {
              setModal(MODAL.IMPORT_SRC);
              setImportDb(DB.MSSQL);
            },
            name: "MSSQL",
            disabled: layout.readOnly,
          },
          {
            function: () => {
              setModal(MODAL.IMPORT_SRC);
              setImportDb(DB.ORACLESQL);
            },
            name: "Oracle",
            label: "Beta",
            disabled: layout.readOnly,
          },
        ],
      }),
      function: () => {
        if (database === DB.GENERIC) return;
        setModal(MODAL.IMPORT_SRC);
      },
      disabled: layout.readOnly,
    },
    export_source: {
      ...(database === DB.GENERIC && {
        children: [
          {
            name: "MySQL",
            function: () => exportGenericSQL(DB.MYSQL),
          },
          {
            name: "PostgreSQL",
            function: () => exportGenericSQL(DB.POSTGRES),
          },
          {
            name: "SQLite",
            function: () => exportGenericSQL(DB.SQLITE),
          },
          {
            name: "MariaDB",
            function: () => exportGenericSQL(DB.MARIADB),
          },
          {
            name: "MSSQL",
            function: () => exportGenericSQL(DB.MSSQL),
          },
          {
            label: "Beta",
            name: "Oracle",
            function: () => exportGenericSQL(DB.ORACLESQL),
          },
        ],
      }),
      function: exportSource,
    },
    export_as: {
      children: [
        {
          name: "PNG",
          function: () => exportAsImage("png"),
        },
        {
          name: "PNG (transparent)",
          function: () => exportAsImage("png", true),
        },
        {
          name: "JPEG",
          function: () => exportAsImage("jpeg"),
        },
        {
          name: "SVG",
          function: () => exportAsImage("svg"),
        },
        {
          name: "JSON",
          function: exportAsJSON,
        },
        {
          name: "DBML",
          function: exportAsDBML,
        },
        {
          name: "PDF",
          function: exportAsPDF,
        },
        {
          name: "Mermaid",
          function: exportAsMermaid,
        },
        {
          name: "Markdown",
          function: exportAsMarkdown,
        },
      ],
      function: () => {},
    },
    exit: {
      function: () => {
        save();
        if (saveState === State.SAVED) navigate("/");
      },
    },
  },
  edit: {
    undo: {
      function: undo,
      shortcut: "Ctrl+Z",
      disabled: layout.readOnly || undoStack.length === 0,
    },
    redo: {
      function: redo,
      shortcut: "Ctrl+Y",
      disabled: layout.readOnly || redoStack.length === 0,
    },
    clear: {
      warning: {
        title: t("clear"),
        message: t("are_you_sure_clear"),
      },
      function: async () => {
        setTables([]);
        setRelationships([]);
        setAreas([]);
        setNotes([]);
        setEnums([]);
        setTypes([]);
        setUndoStack([]);
        setRedoStack([]);

        if (!diagramId) {
          return;
        }

        db.table("diagrams")
          .delete(diagramId)
          .catch((error) => {
            console.error(
              `Error deleting records with gistId '${diagramId}':`,
              error,
            );
          });
      },
      disabled: layout.readOnly,
    },
    edit: {
      function: edit,
      shortcut: "Ctrl+E",
      disabled: layout.readOnly,
    },
    cut: {
      function: cut,
      shortcut: "Ctrl+X",
      disabled: layout.readOnly,
    },
    copy: {
      function: copy,
      shortcut: "Ctrl+C",
    },
    paste: {
      function: paste,
      shortcut: "Ctrl+V",
      disabled: layout.readOnly,
    },
    duplicate: {
      function: duplicate,
      shortcut: "Ctrl+D",
      disabled: layout.readOnly,
    },
    delete: {
      function: del,
      shortcut: "Del",
      disabled: layout.readOnly,
    },
    copy_as_image: {
      function: copyAsImage,
      shortcut: "Ctrl+Alt+C",
    },
  },
  view: {
    header: {
      state: layout.header ? "on" : "off",
      function: () => openSettings("ui_visibility", "header"),
    },
    sidebar: {
      state: layout.sidebar ? "on" : "off",
      function: () => openSettings("ui_visibility", "sidebar"),
    },
    issues: {
      state: layout.issues ? "on" : "off",
      function: () => openSettings("ui_visibility", "issues"),
    },
    dbml_view: {
      state: layout.dbmlEditor ? "on" : "off",
      function: () => openSettings("ui_visibility", "dbml_view"),
      shortcut: "Alt+E",
    },
    divider1: { divider: true },
    dark_mode: {
      state: settings.mode === "dark" ? "on" : "off",
      function: () => openSettings("ui_visibility", "dark_mode"),
    },
    fullscreen: {
      state: fullscreen ? "on" : "off",
      function: () => {
        if (fullscreen) {
          exitFullscreen();
        } else {
          enterFullscreen();
        }
      },
    },
    presentation_mode: {
      function: () => {
        setLayout((prev) => ({
          ...prev,
          header: false,
          sidebar: false,
          toolbar: false,
        }));
        enterFullscreen();
      },
    },
    divider2: { divider: true },
    fit_window: {
      name: t("fit_window_reset"),
      function: () => fitWindow(100),
      shortcut: "Enter/Return",
    },
    all_settings: {
      name: t("all_settings"),
      function: () => openSettings(),
    },
  },
  settings: {
    show_grid: {
      name: t("grid"),
      state: settings.showGrid ? "on" : "off",
      function: () => openSettings("editor_settings", "show_grid"),
    },
    snap_to_grid: {
      name: t("snap_to_grid"),
      state: settings.snapToGrid ? "on" : "off",
      function: () => openSettings("editor_settings", "snap_to_grid"),
    },
    strict_mode: {
      name: t("strict_mode"),
      state: settings.strictMode ? "on" : "off",
      function: () => openSettings("editor_settings", "strict_mode"),
    },
    divider1: { divider: true },
    show_datatype: {
      name: t("show_datatype"),
      state: settings.showDataTypes ? "on" : "off",
      function: () => openSettings("diagram_display", "show_datatype"),
    },
    show_cardinality: {
      name: t("show_cardinality"),
      state: settings.showCardinality ? "on" : "off",
      function: () => openSettings("diagram_display", "show_cardinality"),
    },
    show_pk_icons: {
      name: t("show_pk_icons"),
      state: settings.showPKIcons ? "on" : "off",
      function: () => openSettings("diagram_display", "show_pk_icons"),
    },
    show_fk_icons: {
      name: t("show_fk_icons"),
      state: settings.showFKIcons ? "on" : "off",
      function: () => openSettings("diagram_display", "show_fk_icons"),
    },
    field_details: {
      name: t("field_details"),
      state: settings.showFieldSummary ? "on" : "off",
      function: () => openSettings("diagram_display", "field_details"),
    },
    table_names_uppercase: {
      name: t("table_names_uppercase"),
      state: settings.tableNamesUppercase ? "on" : "off",
      function: () => openSettings("diagram_display", "table_names_uppercase"),
    },
    divider2: { divider: true },
    relationship_style: {
      name: t("relationship_style"),
      function: () => openSettings("diagram_display", "relationship_style"),
    },
    show_relationship_labels: {
      name: t("show_relationship_labels"),
      state: settings.showRelationshipLabels ? "on" : "off",
      function: () => openSettings("editor_settings", "show_relationship_labels"),
    },
    spread_relations: {
      name: t("spread_relations"),
      state: settings.spreadRelations ? "on" : "off",
      function: () => openSettings("editor_settings", "spread_relations"),
    },
    outbound_relations_in_table_color: {
      name: t("outbound_relations_in_table_color"),
      state: settings.outboundRelationsInTableColor ? "on" : "off",
      function: () => openSettings("color_and_theme", "outbound_relations_in_table_color"),
    },
    relation_animations_in_table_color: {
      name: t("relation_animations_in_table_color"),
      state: settings.relationAnimationsInTableColor ? "on" : "off",
      function: () => openSettings("color_and_theme", "relation_animations_in_table_color"),
    },
    divider3: { divider: true },
    language: {
      name: t("language"),
      function: () => openSettings("language"),
    },
    side_margin: {
      name: t("side_margin"),
      function: () => openSettings("diagram_display", "side_margin"),
    },
    table_colors: {
      name: t("table_colors"),
      function: () => openSettings("color_and_theme", "table_colors"),
    },
    divider4: { divider: true },
    all_settings: {
      name: t("all_settings"),
      function: () => openSettings(),
    },
  },
  help: {
    docs: {
      function: () => window.open(`${socials.docs}`, "_blank"),
      shortcut: "Ctrl+H",
    },
    shortcuts: {
      function: () => window.open(`${socials.docs}/shortcuts`, "_blank"),
    },
    ask_on_discord: {
      function: () => window.open(socials.discord, "_blank"),
    },
    report_bug: {
      function: () => window.open("/bug-report", "_blank"),
    },
    whats_new: {
      name: t("whats_new"),
      function: () => setSidesheet(SIDESHEET.HELP),
    },
  },
});
