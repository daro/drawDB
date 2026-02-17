import { Tooltip, Dropdown, InputNumber, Divider } from "@douyinfe/semi-ui";
import { isRtl } from "@i18n/utils/rtl";

interface ZoomControlsProps {
  t: any;
  i18n: any;
  setTransform: (val: any | ((prev: any) => any)) => void;
  fitWindow: (val: number) => void;
}

export default function ZoomControls({
  t,
  i18n,
  setTransform,
  fitWindow,
}: ZoomControlsProps) {
  return (
    <>
      <Tooltip content={t("zoom_out")} position="bottom">
        <span>
          <button
            className="py-1 px-2 hover-2 rounded-sm text-lg"
            onClick={() =>
              setTransform((prev: any) => ({ ...prev, zoom: prev.zoom / 1.2 }))
            }
          >
            <i className="fa-solid fa-magnifying-glass-minus" />
          </button>
        </span>
      </Tooltip>
      <Dropdown
        style={{ width: "240px" }}
        position={isRtl(i18n.language) ? "bottomRight" : "bottomLeft"}
        render={
          <Dropdown.Menu
            style={isRtl(i18n.language) ? { direction: "rtl" } : {}}
          >
            <Dropdown.Item
              onClick={() => fitWindow(100)}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div>{t("fit_window_reset")}</div>
              <div className="text-gray-400">Ctrl+Alt+W</div>
            </Dropdown.Item>
            <Dropdown.Divider />
            {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0].map((e, i) => (
              <Dropdown.Item
                key={i}
                onClick={() => {
                  setTransform((prev: any) => ({ ...prev, zoom: e }));
                }}
              >
                {Math.floor(e * 100)}%
              </Dropdown.Item>
            ))}
            <Dropdown.Divider />
            <Dropdown.Item>
              <InputNumber
                // @ts-ignore
                field="zoom"
                label={t("zoom")}
                placeholder={t("zoom")}
                suffix={<div className="p-1">%</div>}
                onChange={(v: any) =>
                  setTransform((prev: any) => ({
                    ...prev,
                    zoom: parseFloat(v.toString()) * 0.01,
                  }))
                }
              />
            </Dropdown.Item>
          </Dropdown.Menu>
        }
        trigger="click"
      >
        <span>
          <button className="py-1 px-2 hover-2 rounded-sm text-lg">
            <i className="fa-solid fa-magnifying-glass" />
          </button>
        </span>
      </Dropdown>
      <Tooltip content={t("zoom_in")} position="bottom">
        <span>
          <button
            className="py-1 px-2 hover-2 rounded-sm text-lg"
            onClick={() =>
              setTransform((prev: any) => ({ ...prev, zoom: prev.zoom * 1.2 }))
            }
          >
            <i className="fa-solid fa-magnifying-glass-plus" />
          </button>
        </span>
      </Tooltip>
      <Divider layout="vertical" margin="8px" />
      <Tooltip content={t("fit_window_reset")} position="bottom">
        <span>
          <button
            className="py-1 px-2 hover-2 rounded-sm text-lg"
            onClick={() => fitWindow(100)}
          >
            <i className="fa-solid fa-expand" />
          </button>
        </span>
      </Tooltip>
    </>
  );
}
