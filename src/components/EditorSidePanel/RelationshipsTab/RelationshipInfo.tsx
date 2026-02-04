import {
  Row,
  Col,
  Select,
  Button,
  Popover,
  Table,
  Input,
  Checkbox,
} from "@douyinfe/semi-ui";
import {
  IconDeleteStroked,
  IconLoopTextStroked,
  IconMore,
} from "@douyinfe/semi-icons";
import {
  Cardinality,
  Constraint,
  Action,
  ObjectType,
} from "../../../data/constants";
import { useDiagram, useLayout, useUndoRedo, useSettings, useSelect } from "../../../hooks";
import i18n from "../../../i18n/i18n";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { findClosestPoint } from "../../../utils/calcPath";

const columns = [
  {
    title: i18n.t("primary"),
    dataIndex: "primary",
  },
  {
    title: i18n.t("foreign"),
    dataIndex: "foreign",
  },
];

import { RelationshipInfoProps, IRelationship, IWaypoint } from "../../../types";
import { useCanvas } from "../../../hooks";

export default function RelationshipInfo({ data }: RelationshipInfoProps) {
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const {
    tables,
    relationships,
    deleteRelationship,
    updateRelationship,
    xorGroups,
    deleteXorGroup,
    orGroups,
    deleteOrGroup,
  } = useDiagram();
  const { pointer } = useCanvas();
  const { t } = useTranslation();
  const { layout } = useLayout();
  const { settings } = useSettings();
  const { setSelectedElement } = useSelect();
  const [editField, setEditField] = useState<Partial<IRelationship>>({});

  const isPartOfXorGroup = useMemo(() => {
    return xorGroups.find((g) => g.childRelationshipIds.includes(data.id));
  }, [xorGroups, data.id]);

  const isPartOfOrGroup = useMemo(() => {
    return orGroups.find((g) => g.childRelationshipIds.includes(data.id));
  }, [orGroups, data.id]);

  const relValues = useMemo(() => {
    const { fields: startTableFields, name: startTableName } = tables.find(
      (t) => t.id === data.startTableId,
    );
    const { name: startFieldName } = startTableFields.find(
      (f) => f.id === data.startFieldId,
    );
    const { fields: endTableFields, name: endTableName } = tables.find(
      (t) => t.id === data.endTableId,
    );
    const { name: endFieldName } = endTableFields.find(
      (f) => f.id === data.endFieldId,
    );
    return {
      startTableName,
      startFieldName,
      endTableName,
      endFieldName,
    };
  }, [tables, data]);

  const swapKeys = () => {
    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: {
          startTableId: data.startTableId,
          startFieldId: data.startFieldId,
          endTableId: data.endTableId,
          endFieldId: data.endFieldId,
        },
        redo: {
          startTableId: data.endTableId,
          startFieldId: data.endFieldId,
          endTableId: data.startTableId,
          endFieldId: data.startFieldId,
        },
        message: t("edit_relationship", {
          refName: data.name,
          extra: "[swap keys]",
        }),
      },
    ]);
    setRedoStack([]);

    updateRelationship(data.id, {
      name: `fk_${relValues.endTableName}_${relValues.endFieldName}_${relValues.startTableName}`,
      startTableId: data.endTableId,
      startFieldId: data.endFieldId,
      endTableId: data.startTableId,
      endFieldId: data.startFieldId,
    });
  };

  const changeCardinality = (value) => {
    if (layout.readOnly) return;

    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: { cardinality: data.cardinality },
        redo: { cardinality: value },
        message: t("edit_relationship", {
          refName: data.name,
          extra: "[cardinality]",
        }),
      },
    ]);
    setRedoStack([]);
    updateRelationship(data.id, { cardinality: value });
  };

  const changeConstraint = (key, value) => {
    if (layout.readOnly) return;

    const undoKey = `${key}Constraint`;
    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: { [undoKey]: data[undoKey] },
        redo: { [undoKey]: value },
        message: t("edit_relationship", {
          refName: data.name,
          extra: "[constraint]",
        }),
      },
    ]);
    setRedoStack([]);
    updateRelationship(data.id, { [undoKey]: value });
  };

  const toggleIdentifying = (e) => {
    if (layout.readOnly) return;

    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: { identifying: data.identifying },
        redo: { identifying: e.target.checked },
        message: t("edit_relationship", {
          refName: data.name,
          extra: "[identifying]",
        }),
      },
    ]);
    setRedoStack([]);
    updateRelationship(data.id, { identifying: e.target.checked });
  };

  const dividerWp = useMemo(() =>
    (data.waypoints || []).find(wp => wp.mode === "divider"),
    [data.waypoints]
  );

  const updateDivider = (key, value) => {
    const dividerIndex = (data.waypoints || []).findIndex(wp => wp.mode === "divider");
    if (dividerIndex === -1) return;

    const newWaypoints = [...(data.waypoints || [])];
    const wp = newWaypoints[dividerIndex];
    const val = parseFloat(value) || 0;

    const path = document.querySelector(
      `g[data-rel-id="${data.id}"] path`,
    ) as SVGPathElement | null;
    if (path && typeof path.getTotalLength === "function") {
      try {
        const closest = findClosestPoint(path, {
          x: key === "x" ? val : wp.x,
          y: key === "y" ? val : wp.y,
        });
        newWaypoints[dividerIndex] = {
          ...wp,
          x: closest.x,
          y: closest.y,
          pathRatio: closest.ratio,
        };
      } catch (e) {
        newWaypoints[dividerIndex] = { ...wp, [key]: val } as IWaypoint;
      }
    } else {
      newWaypoints[dividerIndex] = { ...wp, [key]: val } as IWaypoint;
    }
    updateRelationship(data.id, { waypoints: newWaypoints });
  };

  const removeWaypoint = (index) => {
    const newWaypoints = (data.waypoints || []).filter((_, i) => i !== index);
    updateRelationship(data.id, { waypoints: newWaypoints });
  };

  const addWaypoint = () => {
    const path = document.querySelector(
      `g[data-rel-id="${data.id}"] path`,
    ) as SVGPathElement | null;
    if (path && typeof path.getTotalLength === "function") {
      try {
        const closest = findClosestPoint(path, {
          x: pointer.spaces.diagram.x,
          y: pointer.spaces.diagram.y,
        });
        const newWaypoints: IWaypoint[] = [
          ...(data.waypoints || []),
          {
            x: closest.x,
            y: closest.y,
            mode: "waypoint" as const,
          },
        ];
        updateRelationship(data.id, { waypoints: newWaypoints });
      } catch (e) {}
    } else {
      const newWaypoints: IWaypoint[] = [
        ...(data.waypoints || []),
        { x: 100, y: 100, mode: "waypoint" as const },
      ];
      updateRelationship(data.id, { waypoints: newWaypoints });
    }
  };

  const addDivider = () => {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    const path = document.querySelector(
      `g[data-rel-id="${data.id}"] path`,
    ) as SVGPathElement | null;
    let initialPoint: IWaypoint = {
      x: 100,
      y: 100,
      pathRatio: 0.5,
      mode: "divider",
    };
    if (path && typeof path.getTotalLength === "function") {
      try {
        const pathLength = path.getTotalLength();
        const midPoint = path.getPointAtLength(pathLength / 2);
        initialPoint = {
          x: midPoint.x,
          y: midPoint.y,
          pathRatio: 0.5,
          mode: "divider",
        };
      } catch (e) {}
    }

    const currentWaypoints = data.waypoints || [];
    const newWaypoints: IWaypoint[] = currentWaypoints
      .map((wp) =>
        wp.mode === "divider" ? { ...wp, mode: "floating" as const } : wp,
      )
      .concat(initialPoint);

    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: { waypoints: currentWaypoints },
        redo: { waypoints: newWaypoints },
        message: t("edit_relationship", {
          refName: data.name,
          extra: `[${t("add_divider")}]`,
        }),
      },
    ]);
    setRedoStack([]);
    updateRelationship(data.id, { waypoints: newWaypoints });
  };

  const removeDivider = () => {
    const currentWaypoints = data.waypoints || [];
    const newWaypoints = currentWaypoints.filter((wp) => wp.mode !== "divider");

    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: { waypoints: currentWaypoints },
        redo: { waypoints: newWaypoints },
        message: t("edit_relationship", {
          refName: data.name,
          extra: `[${t("delete_divider")}]`,
        }),
      },
    ]);
    setRedoStack([]);
    updateRelationship(data.id, { waypoints: newWaypoints });
  };

  const updateWaypoint = (index, key, value) => {
    const newWaypoints = (data.waypoints || []).map((wp, i) => {
      if (i === index) {
        let updatedWp = {
          ...wp,
          [key]: key === "mode" ? value : parseFloat(value) || 0,
        };

        if (key === "mode") {
          if (value === "divider") {
            // Ensure only one divider exists
            return { ...updatedWp, mode: "divider" };
          }
        }

        if (
          (key === "mode" || key === "x" || key === "y") &&
          (updatedWp.mode === "floating" || updatedWp.mode === "divider")
        ) {
          const path = document.querySelector(
            `g[data-rel-id="${data.id}"] path`,
          ) as SVGPathElement | null;
          if (path && typeof path.getTotalLength === "function") {
            try {
              const closest = findClosestPoint(path, {
                x: updatedWp.x,
                y: updatedWp.y,
              });
              updatedWp.x = closest.x;
              updatedWp.y = closest.y;
              updatedWp.pathRatio = closest.ratio;
            } catch (e) {}
          }
        }
        return updatedWp as IWaypoint;
      }
      if (key === "mode" && value === "divider" && wp.mode === "divider") {
        return { ...wp, mode: "floating" as const };
      }
      return wp;
    });
    updateRelationship(data.id, { waypoints: newWaypoints as IWaypoint[] });
  };

  const updateOffset = (key, value) => {
    let val = parseFloat(value) || 0;
    updateRelationship(data.id, { [key]: val });
  };

  const handleOffsetBlur = (key, value) => {
    let val = parseFloat(value) || 0;
    if (val === (editField[key] ?? 0)) return;
    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        component: "self",
        rid: data.id,
        undo: { [key]: editField[key] ?? 0 },
        redo: { [key]: val },
        message: t("edit_relationship", {
          refName: data.name,
          extra: `[${key}]`,
        }),
      },
    ]);
    setRedoStack([]);
  };

  return (
    <>
      {isPartOfXorGroup && (
        <div className="mb-3 p-2 border border-blue-400 rounded bg-blue-50/10 flex justify-between items-center">
          <span className="font-semibold text-blue-500">XOR Group: {isPartOfXorGroup.label}</span>
          <Button 
            size="small" 
            type="danger" 
            icon={<IconDeleteStroked />}
            onClick={() => deleteXorGroup(isPartOfXorGroup.id)}
          />
        </div>
      )}
      {isPartOfOrGroup && (
        <div className="mb-3 p-2 border border-green-400 rounded bg-green-50/10 flex justify-between items-center">
          <span className="font-semibold text-green-500">OR Group: {isPartOfOrGroup.label}</span>
          <Button 
            size="small" 
            type="danger" 
            icon={<IconDeleteStroked />}
            onClick={() => deleteOrGroup(isPartOfOrGroup.id)}
          />
        </div>
      )}
      <div className="flex items-center mb-2.5">
        <div className="text-md font-semibold break-keep">{t("name")}: </div>
        <Input
          value={data.name}
          validateStatus={data.name.trim() === "" ? "error" : "default"}
          placeholder={t("name")}
          className="ms-2"
          readOnly={layout.readOnly}
          onChange={(value) => updateRelationship(data.id, { name: value })}
          onFocus={(e) => setEditField({ name: e.target.value })}
          onBlur={(e) => {
            if (e.target.value === editField.name) return;
            setUndoStack((prev) => [
              ...prev,
              {
                action: Action.EDIT,
                element: ObjectType.RELATIONSHIP,
                component: "self",
                rid: data.id,
                undo: editField,
                redo: { name: e.target.value },
                message: t("edit_relationship", {
                  refName: e.target.value,
                  extra: "[name]",
                }),
              },
            ]);
            setRedoStack([]);
          }}
        />
      </div>
      <div className="flex justify-between items-center mb-3">
        <div className="me-3">
          <span className="font-semibold">{t("primary")}: </span>
          {settings.tableNamesUppercase
            ? relValues.endTableName.toUpperCase()
            : relValues.endTableName}
        </div>
        <div className="mx-1">
          <span className="font-semibold">{t("foreign")}: </span>
          {settings.tableNamesUppercase
            ? relValues.startTableName.toUpperCase()
            : relValues.startTableName}
        </div>
        <div className="ms-1">
          <Popover
            content={
              <div className="p-2 popover-theme">
                <Table
                  columns={columns}
                  dataSource={[
                    {
                      key: "1",
                      foreign: `${
                        settings.tableNamesUppercase
                          ? relValues.startTableName.toUpperCase()
                          : relValues.startTableName
                      }(${relValues.startFieldName})`,
                      primary: `${
                        settings.tableNamesUppercase
                          ? relValues.endTableName.toUpperCase()
                          : relValues.endTableName
                      }(${relValues.endFieldName})`,
                    },
                  ]}
                  pagination={false}
                  size="small"
                  bordered
                />
                <div className="mt-2">
                  <Button
                    block
                    icon={<IconLoopTextStroked />}
                    onClick={swapKeys}
                    disabled={layout.readOnly}
                  >
                    {t("swap")}
                  </Button>
                </div>
              </div>
            }
            trigger="click"
            position="rightTop"
            showArrow
          >
            <Button icon={<IconMore />} type="tertiary" />
          </Popover>
        </div>
      </div>
      <div className="font-semibold my-1">{t("cardinality")}:</div>
      <Select
        optionList={Object.values(Cardinality).map((v) => ({
          label: t(v),
          value: v,
        }))}
        value={data.cardinality}
        className="w-full"
        onChange={changeCardinality}
      />

      <div className="mt-3">
        <Checkbox
          checked={data.identifying}
          onChange={toggleIdentifying}
          disabled={layout.readOnly}
        >
          {t("identifying")}
        </Checkbox>
      </div>

      {data.cardinality !== Cardinality.ONE_TO_ONE && (
        <>
          <div className="text-md font-semibold break-keep mt-2">
            {t("many_side_label")}:
          </div>
          <Input
            value={data.manyLabel}
            placeholder={t("label")}
            onChange={(value) => updateRelationship(data.id, { manyLabel: value })}
            onFocus={(e) => setEditField({ manyLabel: e.target.value })}
            readOnly={layout.readOnly}
            onBlur={(e) => {
              if (e.target.value === editField.manyLabel) return;
              setUndoStack((prev) => [
                ...prev,
                {
                  action: Action.EDIT,
                  element: ObjectType.RELATIONSHIP,
                  component: "self",
                  rid: data.id,
                  undo: editField,
                  redo: { manyLabel: e.target.value },
                  message: t("edit_relationship", {
                    refName: e.target.value,
                    extra: "[manyLabel]",
                  }),
                },
              ]);
              setRedoStack([]);
            }}
          />
        </>
      )}

      <div className="text-md font-semibold break-keep mt-2">
        {t("reverse_label")}:
      </div>
      <Input
        value={data.reverseName}
        placeholder={t("label")}
        onChange={(value) => updateRelationship(data.id, { reverseName: value })}
        onFocus={(e) => setEditField({ reverseName: e.target.value })}
        readOnly={layout.readOnly}
        onBlur={(e) => {
          if (e.target.value === (editField.reverseName || "")) return;
          setUndoStack((prev) => [
            ...prev,
            {
              action: Action.EDIT,
              element: ObjectType.RELATIONSHIP,
              component: "self",
              rid: data.id,
              undo: editField,
              redo: { reverseName: e.target.value },
              message: t("edit_relationship", {
                refName: e.target.value,
                extra: "[reverseName]",
              }),
            },
          ]);
          setRedoStack([]);
        }}
      />

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold">{t("edge_offsets") || "Edge offsets"}:</div>
        </div>
        <Row gutter={4} className="mb-2 items-center">
          <Col span={12}>
            <Input
              size="small"
              prefix="Start X"
              value={data.startXOffset ?? 0}
              type="number"
              onChange={(v) => updateOffset("startXOffset", v)}
              onFocus={(e) => setEditField({ ...editField, startXOffset: parseFloat(e.target.value) || 0 })}
              onBlur={(e) => handleOffsetBlur("startXOffset", e.target.value)}
              readOnly={layout.readOnly}
            />
          </Col>
          <Col span={12}>
            <Input
              size="small"
              prefix="End X"
              value={data.endXOffset ?? 0}
              type="number"
              onChange={(v) => updateOffset("endXOffset", v)}
              onFocus={(e) => setEditField({ ...editField, endXOffset: parseFloat(e.target.value) || 0 })}
              onBlur={(e) => handleOffsetBlur("endXOffset", e.target.value)}
              readOnly={layout.readOnly}
            />
          </Col>
        </Row>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold">{t("vertical_correction") || "Vertical correction"}:</div>
        </div>
        <Row gutter={4} className="mb-2 items-center">
          <Col span={12}>
            <Input
              size="small"
              prefix="Start Y"
              value={data.startYCorrection ?? 0}
              type="number"
              onChange={(v) => updateOffset("startYCorrection", v)}
              onFocus={(e) => setEditField({ ...editField, startYCorrection: parseFloat(e.target.value) || 0 })}
              onBlur={(e) => handleOffsetBlur("startYCorrection", e.target.value)}
              readOnly={layout.readOnly}
            />
          </Col>
          <Col span={12}>
            <Input
              size="small"
              prefix="End Y"
              value={data.endYCorrection ?? 0}
              type="number"
              onChange={(v) => updateOffset("endYCorrection", v)}
              onFocus={(e) => setEditField({ ...editField, endYCorrection: parseFloat(e.target.value) || 0 })}
              onBlur={(e) => handleOffsetBlur("endYCorrection", e.target.value)}
              readOnly={layout.readOnly}
            />
          </Col>
        </Row>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold">{t("divider") || "Divider"}:</div>
          {dividerWp ? (
            <Button size="small" type="danger" onClick={removeDivider} disabled={layout.readOnly}>
              {t("delete") || "Delete"}
            </Button>
          ) : (
            <Button size="small" onClick={addDivider} disabled={layout.readOnly}>
              {t("add") || "Add"}
            </Button>
          )}
        </div>
        {dividerWp && (
          <Row gutter={4} className="mb-2 items-center">
            <Col span={12}>
              <Input
                size="small"
                prefix="X"
                value={dividerWp.x}
                type="number"
                onChange={(v) => updateDivider("x", v)}
                readOnly={layout.readOnly}
              />
            </Col>
            <Col span={12}>
              <Input
                size="small"
                prefix="Y"
                value={dividerWp.y}
                type="number"
                onChange={(v) => updateDivider("y", v)}
                readOnly={layout.readOnly}
              />
            </Col>
          </Row>
        )}
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold">{t("waypoints") || "Waypoints"}:</div>
          <Button size="small" onClick={addWaypoint} disabled={layout.readOnly}>
            {t("add") || "Add"}
          </Button>
        </div>
        {(data.waypoints || []).map((wp, i) => (
          <div key={i} className="mb-2">
            <Row gutter={4} className="items-center mb-1">
              <Col span={10}>
                <Input
                  size="small"
                  prefix="X"
                  value={wp.x}
                  type="number"
                  onChange={(v) => updateWaypoint(i, "x", v)}
                  readOnly={layout.readOnly}
                />
              </Col>
              <Col span={10}>
                <Input
                  size="small"
                  prefix="Y"
                  value={wp.y}
                  type="number"
                  onChange={(v) => updateWaypoint(i, "y", v)}
                  readOnly={layout.readOnly}
                />
              </Col>
              <Col span={4}>
                <Button
                  type="danger"
                  size="small"
                  icon={<IconDeleteStroked />}
                  onClick={() => removeWaypoint(i)}
                  disabled={layout.readOnly}
                />
              </Col>
            </Row>
            <Select
              size="small"
              value={wp.mode || "waypoint"}
              onChange={(v) => updateWaypoint(i, "mode", v)}
              className="w-full"
              optionList={[
                { label: t("waypoint") || "Waypoint", value: "waypoint" },
                { label: t("floating") || "Floating", value: "floating" },
                { label: t("divider") || "Divider", value: "divider" },
              ]}
              disabled={layout.readOnly}
            />
          </div>
        ))}
      </div>

      <Row gutter={6} className="my-3">
        <Col span={12}>
          <div className="font-semibold">{t("on_update")}: </div>
          <Select
            optionList={Object.values(Constraint).map((v) => ({
              label: v,
              value: v,
            }))}
            value={data.updateConstraint}
            className="w-full"
            onChange={(value) => changeConstraint("update", value)}
          />
        </Col>
        <Col span={12}>
          <div className="font-semibold">{t("on_delete")}: </div>
          <Select
            optionList={Object.values(Constraint).map((v) => ({
              label: v,
              value: v,
            }))}
            value={data.deleteConstraint}
            className="w-full"
            onChange={(value) => changeConstraint("delete", value)}
          />
        </Col>
      </Row>
      <Button
        block
        type="danger"
        disabled={layout.readOnly}
        icon={<IconDeleteStroked />}
        onClick={() => deleteRelationship(data.id)}
      >
        {t("delete")}
      </Button>
    </>
  );
}
