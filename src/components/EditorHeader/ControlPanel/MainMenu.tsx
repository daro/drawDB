import { Link } from "react-router-dom";
import { Dropdown, Tag, Popconfirm } from "@douyinfe/semi-ui";
import { IconCaretdown, IconChevronRight } from "@douyinfe/semi-icons";
import { isRtl } from "../../../i18n/utils/rtl";
import icon from "../../../assets/icon_dark_64.png";

interface MainMenuProps {
  i18n: any;
  t: any;
  menu: any;
}

export default function MainMenu({ i18n, t, menu }: MainMenuProps) {
  return (
    <div className="flex justify-start items-center">
      <Link to="/">
        <img
          width={54}
          src={icon}
          alt="logo"
          className="ms-7 min-w-[54px]"
        />
      </Link>
      <div className="flex justify-start text-md select-none ms-3 mt-1">
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
                              (e: any, i: number) => {
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
                        <Dropdown.Item className="flex justify-between items-center">
                          {t(item)}
                          <IconChevronRight />
                        </Dropdown.Item>
                      </Dropdown>
                    );
                  }
                  return (
                    <Dropdown.Item
                      key={item}
                      onClick={
                        menu[category][item].warning
                          ? undefined
                          : menu[category][item].function
                      }
                      disabled={menu[category][item].disabled}
                    >
                      {menu[category][item].warning ? (
                        <Popconfirm
                          title={menu[category][item].warning.title}
                          content={menu[category][item].warning.message}
                          onConfirm={menu[category][item].function}
                        >
                          <div className="w-full">{t(item)}</div>
                        </Popconfirm>
                      ) : (
                        <div className="flex justify-between items-center w-full">
                          <div>{t(item)}</div>
                          <div className="text-gray-400 ms-5">
                            {menu[category][item].shortcut}
                          </div>
                        </div>
                      )}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            }
          >
            <div className="px-3 py-1 hover-2 rounded-md cursor-pointer flex items-center gap-1">
              {t(category)}
              <IconCaretdown size="small" />
            </div>
          </Dropdown>
        ))}
      </div>
    </div>
  );
}
