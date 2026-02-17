import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Help() {
  const { t } = useTranslation();

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? 'Cmd' : 'Ctrl';

  return (
    <div className="p-5 overflow-y-auto h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Supertype / Subtype Relationship</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Assign a supertype by selecting a table (using <strong>{modKey} + Click</strong> for selection), clicking the "Assign Supertype" button on the toolbar, and dropping the magnet icon onto another table that has an existing relationship. Subtypes are automatically nested visually inside the supertype.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Relationship Dividers</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A new type of control point for 1:n and n:1 relationships. It splits the line style (solid for identifying, dashed for non-identifying part) and serves as a persistent anchor for the relationship name.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Percentage-based Positioning</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Move relationship labels and dividers along the line using precise percentage values (Ratio %) in the side panel. This allows for consistent placement regardless of table movement.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">XOR / OR Groups</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create logical groups for relationships by selecting two or more relationship lines that share a common table (using <strong>{modKey} + Click</strong>). Then, click the "Add XOR Group" or "Add OR Group" icon on the toolbar. You can also convert existing groups between XOR and OR using the toolbar buttons when a group is selected.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Advanced UI Interactions</h3>
        <ul className="list-disc ml-5 text-sm text-slate-500 dark:text-slate-400">
          <li>Double-click any relationship line to open its properties.</li>
          <li>Subtype tables are now always rendered on top of supertypes for better accessibility.</li>
          <li>New icons for Waypoint and Divider in the relationship toolbar to select which point type to add.</li>
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Undoable Actions</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          More actions are now supported by the Undo/Redo system, including locking/unlocking tables and areas, changing waypoint modes, and adjusting divider positions.
        </p>
      </div>
    </div>
  );
}
