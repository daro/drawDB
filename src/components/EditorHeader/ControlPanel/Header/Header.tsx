import React from "react";
import { Link } from "react-router-dom";
import {
  Dropdown,
  Tag,
} from "@douyinfe/semi-ui";
import {
  IconEdit,
  IconCaretdown,
  IconChevronRight,
  IconShareStroked,
} from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import {
  MODAL,
} from "../../../../data/constants";
import {
  useLayout,
  useDiagram,
} from "../../../../hooks";
import { databases } from "../../../../data/databases";
import { isRtl } from "../../../../i18n/utils/rtl";
import icon from "../../../../assets/icon_dark_64.png";
import { Button } from "@douyinfe/semi-ui";

interface HeaderProps {
  title: string;
  version?: string;
  modal: number;
  setModal: (modal: number) => void;
  showEditName: boolean;
  setShowEditName: (show: boolean) => void;
  menu: any;
}

export default function Header({
  title,
  version,
  modal,
  setModal,
  showEditName,
  setShowEditName,
  menu,
}: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { layout } = useLayout();
  const { database } = useDiagram();

  return (
    <nav
      className="flex justify-between pt-1 items-center whitespace-nowrap"
      style={isRtl(i18n.language) ? { direction: "rtl" } : {}}
    >
      <div className="flex justify-start items-center">
        <Link to="/">
          <img
            width={54}
            src={icon}
            alt="logo"
            className="ms-7 min-w-[54px]"
          />
        </Link>
        <div className="ms-1 mt-1">
          <div className="flex items-center ms-3 gap-2">
            {databases[database].image && (
              <img
                src={databases[database].image}
                className="h-5"
                style={{
                  filter:
                    "opacity(0.4) drop-shadow(0 0 0 white) drop-shadow(0 0 0 white)",
                }}
                alt={databases[database].name + " icon"}
                title={databases[database].name + " diagram"}
              />
            )}
            <div
              className="text-xl flex items-center gap-1 me-1"
              onPointerEnter={(e) => e.isPrimary && setShowEditName(true)}
              onPointerLeave={(e) => e.isPrimary && setShowEditName(false)}
              onPointerDown={(e) => {
                // Required for onPointerLeave to trigger when a touch pointer leaves
                // https://stackoverflow.com/a/70976017/1137077
                (e.target as any).releasePointerCapture(e.pointerId);
              }}
              onClick={!layout.readOnly ? (() => setModal(MODAL.RENAME)) : undefined}
            >
              <span>
                {(window.name.split(" ")[0] === "t"
                  ? "Templates/"
                  : "Diagrams/") + title}
              </span>
              {version && (
                <Tag className="mt-1" color="blue" size="small">
                  {version.substring(0, 7)}
                </Tag>
              )}
            </div>
            {(showEditName || modal === MODAL.RENAME) && !layout.readOnly && (
              <IconEdit />
            )}
          </div>
          <div className="flex items-center">
            <div className="flex justify-start text-md select-none me-2">
              {Object.keys(menu).map((category) => (
                <Dropdown
                  key={category}
                  position="bottomLeft"
                  style={{
                    width: "240px",
                    direction: isRtl(i18n.language) ? "rtl" : "ltr",
                  }}
                  render={
                    <Dropdown.Menu className="menu max-h-[calc(100vh-80px)] overflow-auto">
                      {Object.keys(menu[category]).map((item, index) => {
                        if (!menu[category][item]) return null;
                        if (menu[category][item].divider) {
                          return <Dropdown.Divider key={index} />;
                        }
                        if (menu[category][item].children) {
                          return (
                            <Dropdown
                              className="min-w-36 max-w-72"
                              key={item}
                              position="rightTop"
                              render={
                                <Dropdown.Menu>
                                  {menu[category][item].children.map(
                                    (e, i) => {
                                      if (e.divider) {
                                        return (
                                          <Dropdown.Divider
                                            key={`divider-${i}`}
                                          />
                                        );
                                      }
                                      return (
                                        <Dropdown.Item
                                          key={i}
                                          onClick={e.function}
                                          className="flex w-full items-center justify-between gap-1"
                                          disabled={e.disabled}
                                        >
                                          <span className="truncate flex-1 min-w-0">
                                            {e.name}
                                          </span>
                                          {e.label && (
                                            <Tag
                                              size="small"
                                              className="flex-shrink-0"
                                            >
                                              {e.label}
                                            </Tag>
                                          )}
                                        </Dropdown.Item>
                                      );
                                    },
                                  )}
                                </Dropdown.Menu>
                              }
                            >
                              <Dropdown.Item
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                                onClick={menu[category][item].function}
                              >
                                {t(item)}
                                <IconChevronRight />
                              </Dropdown.Item>
                            </Dropdown>
                          );
                        }
                        return (
                          <Dropdown.Item
                            key={item}
                            onClick={menu[category][item].function}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                            disabled={menu[category][item].disabled}
                          >
                            <div>{t(item)}</div>
                            <div className="text-gray-400 ms-2">
                              {menu[category][item].shortcut}
                            </div>
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  }
                  trigger="click"
                >
                  <div className="py-1 px-3 rounded-md hover-2 flex items-center">
                    {t(category)}
                    <IconCaretdown />
                  </div>
                </Dropdown>
              ))}
            </div>
          </div>
        </div>
      </div>
      {window.name.split(" ")[0] !== "t" && (
        <Button
          type="primary"
          className="!text-base me-2 !pe-6 !ps-5 !py-[18px] !rounded-md"
          size="default"
          icon={<IconShareStroked />}
          onClick={() => setModal(MODAL.SHARE)}
        >
          {t("share")}
        </Button>
      )}
    </nav>
  );
}
