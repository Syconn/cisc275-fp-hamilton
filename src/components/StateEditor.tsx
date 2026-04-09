import { useState } from "react";
import type {
    Project,
    DataAttribute,
    SecondaryDataclass,
    LogicAnnotation,
} from "../types";

interface StateEditorProps {
    project: Project;
    onProjectChange: (project: Project) => void;
}

const COMMON_TYPES = [
    "str",
    "int",
    "float",
    "bool",
    "List[str]",
    "List[int]",
    "List[bool]",
];

function AttributeRow({
    attr,
    secondaryName,
    onChange,
    onDelete,
}: {
    attr: DataAttribute;
    secondaryName?: string;
    onChange: (attr: DataAttribute) => void;
    onDelete: () => void;
}) {
    const typeOptions = secondaryName
        ? [...COMMON_TYPES, `List[${secondaryName}]`]
        : COMMON_TYPES;

    return (
        <div className="attribute-row">
            <input
                className="form-control"
                placeholder="attribute_name"
                value={attr.name}
                onChange={(e) => onChange({ ...attr, name: e.target.value })}
            />
            <select
                className="form-control"
                value={typeOptions.includes(attr.type) ? attr.type : "__custom__"}
                onChange={(e) => {
                    if (e.target.value !== "__custom__") {
                        onChange({ ...attr, type: e.target.value });
                    }
                }}
            >
                {typeOptions.map((t) => (
                    <option key={t} value={t}>
                        {t}
                    </option>
                ))}
                <option value="__custom__">Custom…</option>
            </select>
            {(!typeOptions.includes(attr.type) || attr.type === "") && (
                <input
                    className="form-control"
                    placeholder="Custom type"
                    value={attr.type}
                    onChange={(e) =>
                        onChange({ ...attr, type: e.target.value })
                    }
                    style={{ gridColumn: "1 / -1" }}
                />
            )}
            <input
                className="form-control"
                placeholder="Description of this attribute"
                value={attr.description}
                onChange={(e) =>
                    onChange({ ...attr, description: e.target.value })
                }
            />
            <button
                className="btn btn-danger btn-sm"
                onClick={onDelete}
                style={{ alignSelf: "center" }}
            >
                ✕
            </button>
        </div>
    );
}

function AnnotationSection({
    title,
    icon,
    items,
    onAdd,
    onUpdate,
    onDelete,
}: {
    title: string;
    icon: string;
    items: LogicAnnotation[];
    onAdd: () => void;
    onUpdate: (id: string, explanation: string) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <div style={{ marginBottom: "24px" }}>
            <div className="section-header">
                <h3>
                    {icon} {title}
                </h3>
                <button className="btn btn-outline btn-sm" onClick={onAdd}>
                    ✚ Add
                </button>
            </div>
            {items.length === 0 ? (
                <p style={{ color: "#bbb", fontSize: "0.85rem" }}>
                    No annotations yet.
                </p>
            ) : (
                items.map((ann) => (
                    <div key={ann.id} className="annotation-item">
                        <span className="ann-icon">{icon}</span>
                        <textarea
                            value={ann.explanation}
                            onChange={(e) =>
                                onUpdate(ann.id, e.target.value)
                            }
                            placeholder={`Describe where ${title.toLowerCase()} occurs...`}
                        />
                        <button
                            className="ann-delete"
                            onClick={() => onDelete(ann.id)}
                        >
                            ✕
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export function StateEditor({
    project,
    onProjectChange,
}: StateEditorProps) {
    const [activeTab, setActiveTab] = useState<"primary" | "secondary" | "routes">(
        "primary",
    );

    const stateModel = project.stateModel;

    function updateStateModel(updates: Partial<typeof stateModel>) {
        onProjectChange({
            ...project,
            stateModel: { ...stateModel, ...updates },
            lastModified: new Date().toISOString(),
        });
    }

    function addAttribute() {
        const newAttr: DataAttribute = {
            id: crypto.randomUUID(),
            name: "",
            type: "str",
            description: "",
        };
        updateStateModel({ attributes: [...stateModel.attributes, newAttr] });
    }

    function updateAttribute(id: string, attr: DataAttribute) {
        updateStateModel({
            attributes: stateModel.attributes.map((a) =>
                a.id === id ? attr : a,
            ),
        });
    }

    function deleteAttribute(id: string) {
        updateStateModel({
            attributes: stateModel.attributes.filter((a) => a.id !== id),
        });
    }

    function createSecondaryDataclass() {
        const sec: SecondaryDataclass = {
            id: crypto.randomUUID(),
            name: "Item",
            attributes: [
                {
                    id: crypto.randomUUID(),
                    name: "name",
                    type: "str",
                    description: "Name of this item",
                },
            ],
        };
        updateStateModel({ secondaryDataclass: sec });
    }

    function removeSecondaryDataclass() {
        updateStateModel({ secondaryDataclass: null });
    }

    const sec = stateModel.secondaryDataclass;

    function addSecAttr() {
        if (!sec) return;
        const newAttr: DataAttribute = {
            id: crypto.randomUUID(),
            name: "",
            type: "str",
            description: "",
        };
        updateStateModel({
            secondaryDataclass: {
                ...sec,
                attributes: [...sec.attributes, newAttr],
            },
        });
    }

    function updateSecAttr(id: string, attr: DataAttribute) {
        if (!sec) return;
        updateStateModel({
            secondaryDataclass: {
                ...sec,
                attributes: sec.attributes.map((a) =>
                    a.id === id ? attr : a,
                ),
            },
        });
    }

    function deleteSecAttr(id: string) {
        if (!sec) return;
        updateStateModel({
            secondaryDataclass: {
                ...sec,
                attributes: sec.attributes.filter((a) => a.id !== id),
            },
        });
    }

    // Route annotations
    function updateRouteAnnotation(
        routeId: string,
        type: "if" | "for",
        annId: string,
        explanation: string,
    ) {
        const updatedRoutes = project.routes.map((r) => {
            if (r.id !== routeId) return r;
            if (type === "if") {
                return {
                    ...r,
                    ifStatements: r.ifStatements.map((a) =>
                        a.id === annId ? { ...a, explanation } : a,
                    ),
                };
            } else {
                return {
                    ...r,
                    forLoops: r.forLoops.map((a) =>
                        a.id === annId ? { ...a, explanation } : a,
                    ),
                };
            }
        });
        onProjectChange({
            ...project,
            routes: updatedRoutes,
            lastModified: new Date().toISOString(),
        });
    }

    function addRouteAnnotation(routeId: string, type: "if" | "for") {
        const ann: LogicAnnotation = {
            id: crypto.randomUUID(),
            explanation: "",
        };
        const updatedRoutes = project.routes.map((r) => {
            if (r.id !== routeId) return r;
            if (type === "if") {
                return { ...r, ifStatements: [...r.ifStatements, ann] };
            } else {
                return { ...r, forLoops: [...r.forLoops, ann] };
            }
        });
        onProjectChange({
            ...project,
            routes: updatedRoutes,
            lastModified: new Date().toISOString(),
        });
    }

    function deleteRouteAnnotation(routeId: string, type: "if" | "for", annId: string) {
        const updatedRoutes = project.routes.map((r) => {
            if (r.id !== routeId) return r;
            if (type === "if") {
                return {
                    ...r,
                    ifStatements: r.ifStatements.filter((a) => a.id !== annId),
                };
            } else {
                return {
                    ...r,
                    forLoops: r.forLoops.filter((a) => a.id !== annId),
                };
            }
        });
        onProjectChange({
            ...project,
            routes: updatedRoutes,
            lastModified: new Date().toISOString(),
        });
    }

    function updateRouteStateChanges(routeId: string, text: string) {
        const updatedRoutes = project.routes.map((r) =>
            r.id === routeId ? { ...r, stateChanges: text } : r,
        );
        onProjectChange({
            ...project,
            routes: updatedRoutes,
            lastModified: new Date().toISOString(),
        });
    }

    return (
        <div className="state-editor">
            <h2
                style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginBottom: "16px",
                }}
            >
                🗄️ State Model Designer
            </h2>

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === "primary" ? "active" : ""}`}
                    onClick={() => setActiveTab("primary")}
                >
                    Primary State
                </button>
                <button
                    className={`tab-btn ${activeTab === "secondary" ? "active" : ""}`}
                    onClick={() => setActiveTab("secondary")}
                >
                    Secondary Dataclass
                </button>
                <button
                    className={`tab-btn ${activeTab === "routes" ? "active" : ""}`}
                    onClick={() => setActiveTab("routes")}
                >
                    Route Annotations
                </button>
            </div>

            {activeTab === "primary" && (
                <div className="card">
                    <div className="card-header">
                        <h2>Primary State Dataclass</h2>
                    </div>

                    <div className="form-group">
                        <label>Dataclass Name</label>
                        <input
                            className="form-control"
                            value={stateModel.name}
                            onChange={(e) =>
                                updateStateModel({ name: e.target.value })
                            }
                            style={{ maxWidth: "300px" }}
                        />
                    </div>

                    <div className="divider" />

                    <div className="section-header">
                        <h3>Attributes (at least 4 required)</h3>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={addAttribute}
                        >
                            ✚ Add Attribute
                        </button>
                    </div>

                    {stateModel.attributes.length > 0 && (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 2fr auto",
                                gap: "8px",
                                marginBottom: "8px",
                                padding: "8px 0",
                                borderBottom: "2px solid #eee",
                                fontWeight: 600,
                                fontSize: "0.8rem",
                                color: "#666",
                            }}
                        >
                            <span>Name</span>
                            <span>Type</span>
                            <span>Description</span>
                            <span></span>
                        </div>
                    )}

                    {stateModel.attributes.length === 0 ? (
                        <div className="empty-state">
                            <p>
                                No attributes yet. Add at least 4 for your
                                State class.
                            </p>
                        </div>
                    ) : (
                        stateModel.attributes.map((attr) => (
                            <AttributeRow
                                key={attr.id}
                                attr={attr}
                                secondaryName={sec?.name}
                                onChange={(a) => updateAttribute(attr.id, a)}
                                onDelete={() => deleteAttribute(attr.id)}
                            />
                        ))
                    )}

                    {stateModel.attributes.length < 4 && (
                        <p
                            style={{
                                color: "#e74c3c",
                                fontSize: "0.85rem",
                                marginTop: "8px",
                            }}
                        >
                            ⚠️ Requirement: at least 4 attributes needed (
                            {stateModel.attributes.length} / 4)
                        </p>
                    )}
                </div>
            )}

            {activeTab === "secondary" && (
                <div className="card">
                    <div className="card-header">
                        <h2>Secondary Dataclass</h2>
                        {sec ? (
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={removeSecondaryDataclass}
                            >
                                Remove
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={createSecondaryDataclass}
                            >
                                ✚ Create Dataclass
                            </button>
                        )}
                    </div>

                    {!sec ? (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <h3>No secondary dataclass yet</h3>
                            <p>
                                Create a secondary dataclass to be used in a
                                List inside the primary State.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div className="form-group">
                                <label>Dataclass Name</label>
                                <input
                                    className="form-control"
                                    value={sec.name}
                                    onChange={(e) =>
                                        updateStateModel({
                                            secondaryDataclass: {
                                                ...sec,
                                                name: e.target.value,
                                            },
                                        })
                                    }
                                    style={{ maxWidth: "300px" }}
                                />
                            </div>

                            <p
                                style={{
                                    fontSize: "0.85rem",
                                    color: "#888",
                                    marginBottom: "16px",
                                }}
                            >
                                Use{" "}
                                <code
                                    style={{
                                        background: "#f0f0f0",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                    }}
                                >
                                    List[{sec.name}]
                                </code>{" "}
                                as the type for a primary state attribute.
                            </p>

                            <div className="section-header">
                                <h3>Attributes</h3>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={addSecAttr}
                                >
                                    ✚ Add Attribute
                                </button>
                            </div>

                            {sec.attributes.length > 0 && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr 2fr auto",
                                        gap: "8px",
                                        marginBottom: "8px",
                                        padding: "8px 0",
                                        borderBottom: "2px solid #eee",
                                        fontWeight: 600,
                                        fontSize: "0.8rem",
                                        color: "#666",
                                    }}
                                >
                                    <span>Name</span>
                                    <span>Type</span>
                                    <span>Description</span>
                                    <span></span>
                                </div>
                            )}

                            {sec.attributes.map((attr) => (
                                <AttributeRow
                                    key={attr.id}
                                    attr={attr}
                                    onChange={(a) => updateSecAttr(attr.id, a)}
                                    onDelete={() => deleteSecAttr(attr.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "routes" && (
                <div>
                    {project.routes.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🛤️</div>
                            <h3>No routes yet</h3>
                            <p>
                                Add routes in the Page Graph editor first.
                            </p>
                        </div>
                    ) : (
                        project.routes.map((route) => {
                            const sourcePage = project.pages.find(
                                (p) => p.id === route.sourcePageId,
                            );
                            const targetPage = project.pages.find(
                                (p) => p.id === route.targetPageId,
                            );
                            return (
                                <div key={route.id} className="card">
                                    <div className="card-header">
                                        <h2>
                                            Route: <code>{route.name}</code>
                                        </h2>
                                        <span
                                            style={{
                                                fontSize: "0.85rem",
                                                color: "#888",
                                            }}
                                        >
                                            {sourcePage?.name ?? "?"} →{" "}
                                            {targetPage?.name ?? "?"}
                                        </span>
                                    </div>

                                    <div className="form-group">
                                        <label>State Changes Description</label>
                                        <textarea
                                            className="form-control"
                                            rows={2}
                                            value={route.stateChanges}
                                            onChange={(e) =>
                                                updateRouteStateChanges(
                                                    route.id,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="How does this route modify state attributes?"
                                        />
                                    </div>

                                    <AnnotationSection
                                        title="If Statements"
                                        icon="🔀"
                                        items={route.ifStatements}
                                        onAdd={() =>
                                            addRouteAnnotation(route.id, "if")
                                        }
                                        onUpdate={(id, exp) =>
                                            updateRouteAnnotation(
                                                route.id,
                                                "if",
                                                id,
                                                exp,
                                            )
                                        }
                                        onDelete={(id) =>
                                            deleteRouteAnnotation(
                                                route.id,
                                                "if",
                                                id,
                                            )
                                        }
                                    />
                                    <AnnotationSection
                                        title="For Loops"
                                        icon="🔁"
                                        items={route.forLoops}
                                        onAdd={() =>
                                            addRouteAnnotation(route.id, "for")
                                        }
                                        onUpdate={(id, exp) =>
                                            updateRouteAnnotation(
                                                route.id,
                                                "for",
                                                id,
                                                exp,
                                            )
                                        }
                                        onDelete={(id) =>
                                            deleteRouteAnnotation(
                                                route.id,
                                                "for",
                                                id,
                                            )
                                        }
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
