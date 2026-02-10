import { useEffect, useState, useMemo, useRef } from "react";
import { useDiagram, useEnums, useLayout } from "../../hooks";
import { toDBML } from "../../utils/exportAs/dbml";
import { fromDBML } from "../../utils/importFrom/dbml";
import { Button, Tooltip } from "@douyinfe/semi-ui";
import { IconTemplate } from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import CodeEditor from "../CodeEditor";
import debounce from "lodash/debounce";

export default function DBMLEditor() {
  const { tables: currentTables, relationships, setTables, setRelationships } = useDiagram();
  const diagram = useDiagram();
  const { enums, setEnums } = useEnums();
  const [value, setValue] = useState(() => toDBML({ ...diagram, enums }));
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const { setLayout } = useLayout();
  const { t } = useTranslation();

  const toggleDBMLEditor = () => {
    setLayout((prev) => ({ ...prev, dbmlEditor: !prev.dbmlEditor }));
  };

  const tablesRef = useRef(currentTables);
  tablesRef.current = currentTables;
  const enumsRef = useRef(enums);
  enumsRef.current = enums;

  const debouncedUpdateDiagram = useMemo(
    () =>
      debounce(async (dbml) => {
        try {
          const result = await fromDBML(dbml, tablesRef.current, enumsRef.current);
          setTables(result.tables);
          setRelationships(result.relationships);
          setEnums(result.enums);
          setError(null);
        } catch (e) {
          console.error("Failed to parse DBML", e);
          setError(e.message);
        } finally {
          setTimeout(() => setIsTyping(false), 1000);
        }
      }, 1000),
    [setTables, setRelationships, setEnums],
  );

  const handleEditorChange = (newValue) => {
    setValue(newValue);
    setIsTyping(true);
    debouncedUpdateDiagram(newValue);
  };

  useEffect(() => {
    if (!isTyping && !error) {
      const newDBML = toDBML({
        tables: currentTables,
        enums,
        relationships,
        database: diagram.database,
      });
      if (newDBML !== value) {
        setValue(newDBML);
      }
    }
  }, [
    currentTables,
    enums,
    relationships,
    isTyping,
    error,
    diagram.database,
    value,
  ]);

  return (
    <div className="flex flex-col h-full relative">
      <CodeEditor
        showCopyButton
        value={value}
        language="dbml"
        onChange={handleEditorChange}
        height="100%"
        options={{
          readOnly: false,
          minimap: { enabled: false },
        }}
        extraControls={
          <Tooltip content={t("tab_view")}>
            <Button icon={<IconTemplate />} onClick={toggleDBMLEditor} />
          </Tooltip>
        }
      />
      {error && (
        <div className="absolute bottom-2 left-2 right-2 p-2 bg-red-500 text-white text-xs rounded opacity-90 z-10">
          {error}
        </div>
      )}
    </div>
  );
}
