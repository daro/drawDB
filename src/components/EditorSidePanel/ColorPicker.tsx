import { ColorPicker as SemiColorPicker } from "@douyinfe/semi-ui";
import { useState, ReactNode } from "react";

/**
 * Props for the ColorPicker component.
 * 
 * @interface ColorPickerProps
 * @property {string} [value] - The current color value in hex format.
 * @property {boolean} [readOnly] - Whether the color picker is in read-only mode.
 * @property {ReactNode} [children] - Optional custom trigger element.
 * @property {(color: string) => void} onChange - Callback function invoked when the color changes.
 * @property {(color: string) => void} [onColorPick] - Callback function invoked when a color selection is finalized.
 * @property {any} [props] - Additional props passed to the underlying Semi UI ColorPicker.
 */
interface ColorPickerProps {
  value?: string;
  readOnly?: boolean;
  children?: ReactNode;
  onChange: (color: string) => void;
  onColorPick?: (color: string) => void;
  [key: string]: any;
}

/**
 * A wrapper component around Semi UI's ColorPicker with additional safety checks and behavior.
 * 
 * @param {ColorPickerProps} props - The component props.
 * @returns {JSX.Element} The rendered color picker.
 */
export default function ColorPicker({
  value,
  readOnly,
  children,
  onChange,
  onColorPick,
  ...props
}: ColorPickerProps) {
  const [pickedColor, setPickedColor] = useState<string | null>(null);

  const handleColorPick = () => {
    if (onColorPick && pickedColor) onColorPick(pickedColor);
    setPickedColor(null);
  };

  /**
   * Safely converts a color string to a value compatible with Semi UI's ColorPicker.
   * 
   * @param {string} colorStr - The color string to convert.
   * @returns {any} The parsed color value or a fallback.
   */
  const safeColorStringToValue = (colorStr: string): any => {
    try {
      // @ts-ignore - SemiColorPicker might not have types for colorStringToValue
      if (SemiColorPicker.colorStringToValue) {
        // @ts-ignore
        return SemiColorPicker.colorStringToValue(colorStr) || SemiColorPicker.colorStringToValue("#000000");
      }
      return colorStr;
    } catch (e) {
      console.error("ColorPicker: Failed to parse color", colorStr, e);
      // @ts-ignore
      return SemiColorPicker.colorStringToValue ? SemiColorPicker.colorStringToValue("#000000") : "#000000";
    }
  };

  return (
    <div
      onPointerUp={handleColorPick}
      onBlur={handleColorPick}
      onMouseLeave={handleColorPick}
    >
      <SemiColorPicker
        // @ts-ignore
        alpha={false}
        {...props}
        value={safeColorStringToValue(value || "#000000")}
        onChange={(colorData: any) => {
          if (readOnly) return;
          const color = colorData?.hex || "#000000";
          setPickedColor(color);
          onChange(color);
        }}
      >
        {children || (
          <div
            className="h-8 w-8 rounded-md"
            style={{ backgroundColor: value || "#000000" }}
          />
        )}
      </SemiColorPicker>
    </div>
  );
}
