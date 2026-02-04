import { useSelect, useTexts } from "../../../hooks";
import Empty from "../Empty";
import TextInfo from "./TextInfo";
import { ObjectType } from "../../../data/constants";
import { useTranslation } from "react-i18next";
import { Collapse } from "@douyinfe/semi-ui";

export default function TextsTab() {
  const { texts } = useTexts();
  const { selectedElement, setSelectedElement } = useSelect();
  const { t } = useTranslation();

  return (
    <>
      {texts.length <= 0 ? (
        <Empty
          title={t("no_texts") || "No texts"}
          text={t("no_texts_text") || "Add texts to your diagram to document it."}
        />
      ) : (
        <Collapse
          activeKey={
            selectedElement.open && selectedElement.element === ObjectType.TEXT
              ? `${selectedElement.id}`
              : ""
          }
          keepDOM={false}
          lazyRender
          onChange={(k) =>
            setSelectedElement((prev) => ({
              ...prev,
              open: true,
              id: k[0],
              element: ObjectType.TEXT,
            }))
          }
          accordion
        >
          {texts.map((text) => (
            <div id={`scroll_text_${text.id}`} key={text.id}>
              <Collapse.Panel
                header={
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {text.text || t("text")}
                  </div>
                }
                itemKey={`${text.id}`}
              >
                <TextInfo data={text} />
              </Collapse.Panel>
            </div>
          ))}
        </Collapse>
      )}
    </>
  );
}
