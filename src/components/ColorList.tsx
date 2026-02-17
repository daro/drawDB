import { useSettings, useLayout } from "@hooks";

/**
 * Props for the ColorList component.
 * 
 * @interface ColorListProps
 * @property {string} currentColor - The currently selected color hex string.
 * @property {(color: string) => void} onColorClick - Callback function invoked when a color is clicked.
 */
interface ColorListProps {
  currentColor: string;
  onColorClick: (color: string) => void;
}

/**
 * A component that displays a list of clickable color circles based on user settings.
 * 
 * @param {ColorListProps} props - The component props.
 * @returns {JSX.Element} The rendered color list.
 */
export default function ColorList({ currentColor, onColorClick }: ColorListProps) {
  const { settings } = useSettings();
  const { layout } = useLayout();

  return (
    <div className="flex flex-wrap gap-2 mb-3 px-1">
      {(settings.tableColors || []).map((color) => (
        <div
          key={color}
          className={`h-6 w-6 rounded-full cursor-pointer border-2 ${
            currentColor === color ? "border-blue-500" : "border-transparent"
          } hover:scale-110 transition-transform`}
          style={{ backgroundColor: color || "#000000" }}
          onClick={() => {
            if (layout.readOnly) return;
            onColorClick(color || "#000000");
          }}
        />
      ))}
    </div>
  );
}
