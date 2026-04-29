import { useState, useCallback } from "react";
import MIT from "../data/mit-data.json";

// ─── Color Palette ─────────────────────────────────────────────────────
const C = {
  bg: "#0a0d12",
  panel: "#111622",
  card: "#161d2b",
  cardHover: "#1b2438",
  border: "#1e2940",
  borderFocus: "#3b82f6",
  text: "#d8dee9",
  textMuted: "#6b7a96",
  textDim: "#3d4f6e",
  accent: "#3b82f6",
  accentDim: "#172554",
  green: "#10b981",
  greenDim: "#052e16",
  yellow: "#eab308",
  yellowDim: "#422006",
  orange: "#f97316",
  purple: "#a78bfa",
  purpleDim: "#1e1b4b",
  red: "#ef4444",
  cyan: "#22d3ee",
};

const CLASS_COLORS = {
  topRoot: C.textMuted,
  polUni: C.accent,
  fvTenant: C.green,
  fvCtx: C.cyan,
  fvBD: C.yellow,
  fvSubnet: C.yellow,
  fvAp: C.purple,
  fvAEPg: C.purple,
  fvESg: C.purple,
  vzBrCP: C.orange,
  vzSubj: C.orange,
  vzFilter: C.orange,
  vzEntry: C.orange,
  vzTaboo: C.red,
  vzAny: C.orange,
  l3extOut: C.cyan,
  l3extInstP: C.cyan,
  vnsAbsGraph: C.red,
  infraInfra: C.accent,
  infraNodeP: C.accent,
  infraAccPortP: C.accent,
  infraAttEntityP: C.accent,
  physDomP: C.green,
  l3extDomP: C.cyan,
  vmmProvP: C.purple,
  vmmDomP: C.purple,
  fabricTopology: C.textMuted,
  fabricPod: C.textMuted,
  fabricNode: C.textMuted,
  fabricInst: C.accent,
  aaaUserEp: C.red,
};

function getColor(cls) {
  return CLASS_COLORS[cls] || C.textMuted;
}

// ─── Components ────────────────────────────────────────────────────────

function TreeNode({ node, depth, selected, onSelect, expanded, onToggle }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded[node.id] !== false;
  const isSelected = selected?.id === node.id;
  const color = getColor(node.cls);

  return (
    <div>
      <div
        onClick={() => { onSelect(node); if (hasChildren) onToggle(node.id); }}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 8px", paddingLeft: 8 + depth * 16,
          cursor: "pointer", borderRadius: 4, transition: "background 0.12s",
          background: isSelected ? C.accentDim : "transparent",
          borderLeft: isSelected ? `2px solid ${C.accent}` : "2px solid transparent",
        }}
        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = C.cardHover; }}
        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
      >
        {hasChildren ? (
          <span style={{ fontSize: 9, color: C.textDim, width: 10, textAlign: "center", transition: "transform 0.15s", transform: isExpanded ? "rotate(90deg)" : "rotate(0)", flexShrink: 0 }}>▶</span>
        ) : (
          <span style={{ width: 10, flexShrink: 0 }} />
        )}
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, opacity: 0.8 }} />
        <span style={{ fontSize: 11, color: isSelected ? C.text : C.textMuted, fontWeight: isSelected ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.label}
        </span>
        <span style={{ fontSize: 9, color: C.textDim, flexShrink: 0, marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>
          {node.cls !== node.label ? node.cls : ""}
        </span>
      </div>
      {hasChildren && isExpanded && node.children.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} expanded={expanded} onToggle={onToggle} />
      ))}
    </div>
  );
}

function CodeBlock({ title, code }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}
          style={{ fontSize: 9, color: copied ? C.green : C.textDim, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "2px 6px" }}
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre style={{
        background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
        padding: "10px 12px", margin: 0, overflow: "auto",
        fontSize: 11, lineHeight: 1.5, color: C.text,
        fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      }}>
        {code}
      </pre>
    </div>
  );
}

function DetailPanel({ node, studyMode }) {
  if (!node) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.textDim, fontSize: 13 }}>
        ← Select a node to explore
      </div>
    );
  }

  const color = getColor(node.cls);

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{node.label}</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color, marginBottom: 4 }}>
          {node.cls}
        </div>
        {node.dn && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.textMuted, background: C.bg, padding: "4px 8px", borderRadius: 4, display: "inline-block" }}>
            DN: {node.dn}
          </div>
        )}
        {node.rn && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.textDim, marginTop: 4 }}>
            RN: {node.rn}
          </div>
        )}
      </div>

      {/* Exam Mapping (only shown in study mode) */}
      {studyMode && node.exam && (
        <div style={{ background: C.purpleDim, border: `1px solid ${C.purple}33`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: C.purple, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>DCACI Exam Objective</div>
          <div style={{ fontSize: 11, color: C.text, whiteSpace: "pre-line", lineHeight: 1.5 }}>{node.exam}</div>
        </div>
      )}

      {/* Description */}
      <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7, marginBottom: 16 }}>
        {node.desc}
      </div>

      {/* Children summary */}
      {node.children && node.children.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Child Objects</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {node.children.map((child) => (
              <span key={child.id} style={{
                fontSize: 10, padding: "3px 8px", borderRadius: 4,
                background: C.bg, border: `1px solid ${C.border}`, color: getColor(child.cls),
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {child.cls}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* REST API */}
      {node.rest && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>REST API</div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: node.rest.method === "GET" ? C.greenDim : C.accentDim, color: node.rest.method === "GET" ? C.green : C.accent, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              {node.rest.method}
            </span>
            <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 8, fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all" }}>
              {node.rest.url}
            </span>
          </div>
          {node.rest.body && <CodeBlock title="Request Body (JSON)" code={node.rest.body.trim()} />}
          {node.rest.note && <div style={{ fontSize: 11, color: C.textDim, fontStyle: "italic" }}>{node.rest.note}</div>}
        </div>
      )}

      {/* Ansible */}
      {node.ansible && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ansible</span>
            <span style={{ fontSize: 9, color: C.red, fontFamily: "'JetBrains Mono', monospace" }}>{node.ansible.module}</span>
          </div>
          <CodeBlock title="Playbook Task" code={node.ansible.example.trim()} />
        </div>
      )}

      {/* Terraform */}
      {node.terraform && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Terraform</span>
            <span style={{ fontSize: 9, color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>{node.terraform.resource}</span>
          </div>
          <CodeBlock title="Resource Block" code={node.terraform.example.trim()} />
        </div>
      )}

      {/* DN Anatomy */}
      {node.dn && node.dn.includes("/") && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>DN → URL Mapping</div>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: C.textDim, marginBottom: 4 }}>API Endpoint:</div>
            <div style={{ fontSize: 11, color: C.cyan, fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all" }}>
              /api/mo/{node.dn}.json
            </div>
            <div style={{ fontSize: 10, color: C.textDim, marginTop: 8, marginBottom: 4 }}>Class Query (all instances):</div>
            <div style={{ fontSize: 11, color: C.cyan, fontFamily: "'JetBrains Mono', monospace" }}>
              /api/class/{node.cls}.json
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Legend ─────────────────────────────────────────────────────────────
function Legend() {
  const groups = [
    { label: "Tenant / Networking", colors: [{ c: C.green, l: "Tenant/Domain" }, { c: C.cyan, l: "VRF/L3Out" }, { c: C.yellow, l: "Bridge Domain" }] },
    { label: "Application / Security", colors: [{ c: C.purple, l: "App/EPG/VMM" }, { c: C.orange, l: "Contracts" }, { c: C.red, l: "Deny/AAA/Svc" }] },
    { label: "Infrastructure", colors: [{ c: C.accent, l: "Access/Fabric" }, { c: C.textMuted, l: "Topology" }] },
  ];
  return (
    <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 16, flexWrap: "wrap" }}>
      {groups.map((g) => (
        <div key={g.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {g.colors.map((c) => (
            <div key={c.l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.c }} />
              <span style={{ fontSize: 9, color: C.textDim }}>{c.l}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────
export default function ACIMITExplorer() {
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(() => {
    // Expand first two levels by default
    const init = {};
    const expand = (node, depth) => {
      if (depth < 2) { init[node.id] = true; node.children?.forEach((c) => expand(c, depth + 1)); }
    };
    expand(MIT, 0);
    return init;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [studyMode, setStudyMode] = useState(false);

  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const expandAll = () => {
    const all = {};
    const walk = (node) => { all[node.id] = true; node.children?.forEach(walk); };
    walk(MIT);
    setExpanded(all);
  };

  const collapseAll = () => {
    setExpanded({ topRoot: true, polUni: true });
  };

  // Flat search
  const flatNodes = [];
  const flatten = (node) => { flatNodes.push(node); node.children?.forEach(flatten); };
  flatten(MIT);

  const filtered = searchTerm.trim()
    ? flatNodes.filter((n) => {
        const q = searchTerm.toLowerCase();
        return n.label.toLowerCase().includes(q) || n.cls.toLowerCase().includes(q) || n.dn?.toLowerCase().includes(q) || n.desc?.toLowerCase().includes(q);
      })
    : null;

  return (
    <div style={{
      background: C.bg, color: C.text, height: "100vh", display: "flex", flexDirection: "column",
      fontFamily: "'IBM Plex Sans', 'Inter', -apple-system, sans-serif", fontSize: 13,
    }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
            <span style={{ color: C.green }}>ACI</span> <span style={{ color: C.textMuted }}>MIT Explorer</span>
          </div>
          <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>
            Object Model Reference · Part of <a href="https://github.com/jsconnects/fabricate" style={{ color: C.textMuted, textDecoration: "none" }}>Fabricate</a>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <label style={{
            fontSize: 10, padding: "4px 8px",
            background: studyMode ? C.purpleDim : C.card,
            border: `1px solid ${studyMode ? C.purple + "55" : C.border}`,
            borderRadius: 4,
            color: studyMode ? C.purple : C.textMuted,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 4,
            userSelect: "none",
          }}>
            <input
              type="checkbox"
              checked={studyMode}
              onChange={(e) => setStudyMode(e.target.checked)}
              style={{ margin: 0, cursor: "pointer" }}
            />
            Study Mode
          </label>
          <button onClick={expandAll} style={{ fontSize: 10, padding: "4px 8px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, color: C.textMuted, cursor: "pointer", fontFamily: "inherit" }}>Expand All</button>
          <button onClick={collapseAll} style={{ fontSize: 10, padding: "4px 8px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, color: C.textMuted, cursor: "pointer", fontFamily: "inherit" }}>Collapse</button>
        </div>
      </div>

      <Legend />

      {/* Search */}
      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search classes, DNs, descriptions..."
          style={{
            width: "100%", padding: "6px 10px", background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 4, color: C.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            outline: "none", boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.borderFocus)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Tree Panel */}
        <div style={{ width: "38%", minWidth: 260, borderRight: `1px solid ${C.border}`, overflowY: "auto", padding: "8px 0" }}>
          {filtered ? (
            filtered.length > 0 ? (
              filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelected(n)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
                    cursor: "pointer", background: selected?.id === n.id ? C.accentDim : "transparent",
                    borderLeft: selected?.id === n.id ? `2px solid ${C.accent}` : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => { if (selected?.id !== n.id) e.currentTarget.style.background = C.cardHover; }}
                  onMouseLeave={(e) => { if (selected?.id !== n.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: getColor(n.cls), flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.text }}>{n.label}</span>
                  <span style={{ fontSize: 9, color: C.textDim, marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>{n.cls}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: 16, textAlign: "center", color: C.textDim, fontSize: 12 }}>No matches</div>
            )
          ) : (
            <TreeNode node={MIT} depth={0} selected={selected} onSelect={setSelected} expanded={expanded} onToggle={toggleExpand} />
          )}
        </div>

        {/* Detail Panel */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <DetailPanel node={selected} studyMode={studyMode} />
        </div>
      </div>
    </div>
  );
}
