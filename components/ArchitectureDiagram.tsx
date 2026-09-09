"use client";

import { useMemo, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  type Edge,
  type Node,
  type NodeProps,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { components, type ArchComponent, type ComponentCategory } from "@/architecture/components";
import { connections } from "@/architecture/connections";
import { eventFlows } from "@/architecture/eventFlows";
import { NodeDetailPanel } from "./NodeDetailPanel";

const categoryColor: Record<ComponentCategory, string> = {
  external: "#8a8d93",
  ingestion: "#3f7dd1",
  bus: "#a862d4",
  consumer: "#c47f2e",
  storage: "#2f6f4f",
  gateway: "#c4432e",
  frontend: "#3f7dd1",
};

function ArchNode({ data, selected }: NodeProps<{ component: ArchComponent; dimmed: boolean; highlighted: boolean }>) {
  const { component, dimmed, highlighted } = data;
  const color = categoryColor[component.category];
  return (
    <div
      style={{
        opacity: dimmed ? 0.3 : 1,
        borderColor: highlighted ? color : selected ? color : "var(--border-strong)",
        boxShadow: highlighted ? `0 0 0 3px ${color}33` : "none",
      }}
      className="w-[172px] rounded-lg border-2 bg-bg-elevated px-2.5 py-2 text-left transition-all duration-200 cursor-pointer"
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0, pointerEvents: "none" }} />
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        <span className="font-mono-tight text-[10px] uppercase tracking-wide text-fg-faint">
          {component.category}
        </span>
      </div>
      <p className="mt-1 whitespace-pre-line text-[12.5px] font-medium leading-tight text-fg">
        {component.shortLabel}
      </p>
      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: "none" }} />
    </div>
  );
}

const nodeTypes = { arch: ArchNode };

export function ArchitectureDiagram() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flowMode, setFlowMode] = useState(false);
  const [flowStep, setFlowStep] = useState(0);
  const flow = eventFlows[0];

  const activeComponentIds = useMemo(() => {
    if (!flowMode) return null;
    return new Set(flow.steps.slice(0, flowStep + 1).map((s) => s.componentId));
  }, [flowMode, flowStep, flow]);

  const activeEdgeIds = useMemo(() => {
    if (!flowMode) return null;
    return new Set(
      flow.steps
        .slice(0, flowStep + 1)
        .map((s) => s.connectionId)
        .filter((x): x is string => Boolean(x))
    );
  }, [flowMode, flowStep, flow]);

  const nodes: Node[] = useMemo(
    () =>
      components.map((c) => ({
        id: c.id,
        type: "arch",
        position: c.position,
        data: {
          component: c,
          dimmed: flowMode ? !activeComponentIds?.has(c.id) : false,
          highlighted: flowMode ? activeComponentIds?.has(c.id) ?? false : selectedId === c.id,
        },
      })),
    [activeComponentIds, flowMode, selectedId]
  );

  const edges: Edge[] = useMemo(
    () =>
      connections.map((c) => {
        const active = flowMode ? activeEdgeIds?.has(c.id) ?? false : false;
        return {
          id: c.id,
          source: c.source,
          target: c.target,
          label: c.label,
          animated: active,
          style: {
            stroke: active ? "var(--accent)" : "var(--border-strong)",
            strokeWidth: active ? 2.5 : 1.5,
            opacity: flowMode ? (active ? 1 : 0.2) : 0.8,
          },
          labelStyle: {
            fill: "var(--fg-muted)",
            fontSize: 10,
            fontFamily: "var(--mono)",
          },
          labelBgStyle: { fill: "var(--bg-inset)", fillOpacity: 0.9 },
          markerEnd: { type: MarkerType.ArrowClosed, color: active ? "var(--accent)" : "var(--border-strong)" },
        };
      }),
    [activeEdgeIds, flowMode]
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      if (flowMode) return;
      setSelectedId(node.id);
    },
    [flowMode]
  );

  const selected = selectedId ? components.find((c) => c.id === selectedId) ?? null : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="text-[13px] text-fg-muted">
            {flowMode
              ? "Follow an event: step through what actually happens end to end."
              : "Click any node for purpose, trade-offs, failure mode, and real code references."}
          </p>
          <div className="flex items-center gap-2">
            {flowMode && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFlowStep((s) => Math.max(0, s - 1))}
                  disabled={flowStep === 0}
                  className="rounded-md border border-border px-2 py-1 text-[12px] text-fg-muted hover:text-fg disabled:opacity-30"
                >
                  ← Prev
                </button>
                <span className="px-1.5 font-mono-tight text-[11px] text-fg-faint">
                  {flowStep + 1} / {flow.steps.length}
                </span>
                <button
                  onClick={() => setFlowStep((s) => Math.min(flow.steps.length - 1, s + 1))}
                  disabled={flowStep === flow.steps.length - 1}
                  className="rounded-md border border-border px-2 py-1 text-[12px] text-fg-muted hover:text-fg disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setFlowMode((v) => !v);
                setFlowStep(0);
                setSelectedId(null);
              }}
              className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                flowMode
                  ? "bg-accent text-[var(--accent-fg)]"
                  : "border border-border text-fg-muted hover:text-fg hover:border-border-strong"
              }`}
            >
              {flowMode ? "Exit follow mode" : `Follow: “${flow.name}”`}
            </button>
          </div>
        </div>
        <div style={{ height: 620 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.08 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={!flowMode}
            elementsSelectable={!flowMode}
            zoomOnScroll
            minZoom={0.4}
            maxZoom={1.8}
          >
            <Background gap={20} size={1} color="var(--border)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
        {flowMode && (
          <div className="border-t border-border px-4 py-3">
            <p className="text-[13px] leading-relaxed text-fg">
              <span className="font-mono-tight text-[11px] uppercase tracking-wide text-accent mr-2">
                Step {flowStep + 1}
              </span>
              {flow.steps[flowStep].description}
            </p>
          </div>
        )}
      </div>

      <div className="card p-4">
        {flowMode ? (
          <div>
            <p className="font-mono-tight text-xs uppercase tracking-widest text-fg-faint">
              Following
            </p>
            <h3 className="mt-1 text-lg font-semibold text-fg">{flow.name}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{flow.summary}</p>
            <p className="mt-4 text-[12px] leading-relaxed text-fg-faint">{flow.sourceNote}</p>
            <a
              href={flow.sourceLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono-tight text-[11px] text-fg-muted hover:border-border-strong hover:text-fg"
            >
              {flow.sourceLink.label} ↗
            </a>
          </div>
        ) : selected ? (
          <NodeDetailPanel component={selected} onClose={() => setSelectedId(null)} />
        ) : (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
            <p className="text-[13px] text-fg-faint">
              Select a component to see its purpose, why it exists, trade-offs, failure mode,
              scaling behavior, and links to the real source.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
