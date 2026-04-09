import { useState } from "react";
import type {
    Page,
    Project,
    PageComponent,
    ComponentType,
    ComponentConfig,
    ComponentStyle,
    PageStyle,
    TextConfig,
    TextBoxConfig,
    TextAreaConfig,
    CheckBoxConfig,
    SelectBoxConfig,
    ButtonConfig,
    HeaderConfig,
    LogicAnnotation,
} from "../types";

interface PageEditorProps {
    pageId: string;
    project: Project;
    onProjectChange: (project: Project) => void;
}

type EditorTab = "components" | "style" | "annotations";

function getDefaultConfig(type: ComponentType): ComponentConfig {
    switch (type) {
        case "Text":
            return { content: "Sample text" };
        case "TextBox":
            return { name: "text_input", defaultValue: "" };
        case "TextArea":
            return { name: "textarea_input", defaultValue: "" };
        case "CheckBox":
            return { name: "check_input", defaultValue: false };
        case "SelectBox":
            return {
                name: "select_input",
                options: ["Option 1", "Option 2"],
                defaultValue: "Option 1",
            };
        case "Button":
            return { label: "Click Me", route: "index" };
        case "Header":
            return { content: "Heading", level: 1 as const };
        default:
            return { content: "" };
    }
}

function ComponentPreview({
    comp,
    selected,
    onSelect,
    onDelete,
}: {
    comp: PageComponent;
    selected: boolean;
    onSelect: () => void;
    onDelete: () => void;
}) {
    const style: React.CSSProperties = {
        color: comp.style.color,
        backgroundColor: comp.style.backgroundColor,
        fontSize: comp.style.fontSize,
        fontFamily: comp.style.fontFamily,
        fontWeight: comp.style.fontWeight,
        border: comp.style.border,
        borderRadius: comp.style.borderRadius,
        padding: comp.style.padding,
        margin: comp.style.margin,
        width: comp.style.width,
    };

    let preview: React.ReactNode;

    switch (comp.type) {
        case "Text": {
            const cfg = comp.config as TextConfig;
            preview = <p style={style}>{cfg.content}</p>;
            break;
        }
        case "TextBox": {
            const cfg = comp.config as TextBoxConfig;
            preview = (
                <div>
                    <label style={{ fontSize: "0.85rem", color: "#555" }}>
                        {cfg.name}
                    </label>
                    <input
                        type="text"
                        defaultValue={cfg.defaultValue}
                        placeholder={cfg.name}
                        style={{ ...style, display: "block", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", width: "200px" }}
                        readOnly
                    />
                </div>
            );
            break;
        }
        case "TextArea": {
            const cfg = comp.config as TextAreaConfig;
            preview = (
                <div>
                    <label style={{ fontSize: "0.85rem", color: "#555" }}>
                        {cfg.name}
                    </label>
                    <textarea
                        defaultValue={cfg.defaultValue}
                        placeholder={cfg.name}
                        style={{ ...style, display: "block", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", width: "200px", minHeight: "60px" }}
                        readOnly
                    />
                </div>
            );
            break;
        }
        case "CheckBox": {
            const cfg = comp.config as CheckBoxConfig;
            preview = (
                <label style={{ display: "flex", alignItems: "center", gap: "8px", ...style }}>
                    <input
                        type="checkbox"
                        defaultChecked={cfg.defaultValue}
                        readOnly
                    />
                    {cfg.name}
                </label>
            );
            break;
        }
        case "SelectBox": {
            const cfg = comp.config as SelectBoxConfig;
            preview = (
                <div>
                    <label style={{ fontSize: "0.85rem", color: "#555" }}>
                        {cfg.name}
                    </label>
                    <select style={{ ...style, display: "block", padding: "6px", border: "1px solid #ccc", borderRadius: "4px" }}>
                        {cfg.options.map((opt, i) => (
                            <option key={i}>{opt}</option>
                        ))}
                    </select>
                </div>
            );
            break;
        }
        case "Button": {
            const cfg = comp.config as ButtonConfig;
            preview = (
                <button
                    style={{
                        padding: "8px 16px",
                        background: "#4361ee",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "default",
                        ...style,
                    }}
                >
                    {cfg.label}
                </button>
            );
            break;
        }
        case "Header": {
            const cfg = comp.config as HeaderConfig;
            const sizes = {
                1: "1.8rem",
                2: "1.5rem",
                3: "1.25rem",
                4: "1.1rem",
                5: "1rem",
                6: "0.9rem",
            } as const;
            preview = (
                <div
                    style={{
                        fontSize: sizes[cfg.level],
                        fontWeight: 700,
                        ...style,
                    }}
                >
                    {cfg.content}
                </div>
            );
            break;
        }
        default:
            preview = <span>Unknown</span>;
    }

    return (
        <div
            className={`preview-component ${selected ? "selected" : ""}`}
            onClick={onSelect}
        >
            {preview}
            <button
                className="component-delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
            >
                ✕
            </button>
        </div>
    );
}

function ComponentConfigEditor({
    comp,
    onChange,
}: {
    comp: PageComponent;
    onChange: (config: ComponentConfig) => void;
}) {
    switch (comp.type) {
        case "Text": {
            const cfg = comp.config as TextConfig;
            return (
                <div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={cfg.content}
                            onChange={(e) =>
                                onChange({ content: e.target.value })
                            }
                        />
                    </div>
                </div>
            );
        }
        case "TextBox": {
            const cfg = comp.config as TextBoxConfig;
            return (
                <div>
                    <div className="form-group">
                        <label>Field Name</label>
                        <input
                            className="form-control"
                            value={cfg.name}
                            onChange={(e) =>
                                onChange({ ...cfg, name: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>Default Value</label>
                        <input
                            className="form-control"
                            value={cfg.defaultValue}
                            onChange={(e) =>
                                onChange({ ...cfg, defaultValue: e.target.value })
                            }
                        />
                    </div>
                </div>
            );
        }
        case "TextArea": {
            const cfg = comp.config as TextAreaConfig;
            return (
                <div>
                    <div className="form-group">
                        <label>Field Name</label>
                        <input
                            className="form-control"
                            value={cfg.name}
                            onChange={(e) =>
                                onChange({ ...cfg, name: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>Default Value</label>
                        <textarea
                            className="form-control"
                            rows={2}
                            value={cfg.defaultValue}
                            onChange={(e) =>
                                onChange({ ...cfg, defaultValue: e.target.value })
                            }
                        />
                    </div>
                </div>
            );
        }
        case "CheckBox": {
            const cfg = comp.config as CheckBoxConfig;
            return (
                <div>
                    <div className="form-group">
                        <label>Field Name</label>
                        <input
                            className="form-control"
                            value={cfg.name}
                            onChange={(e) =>
                                onChange({ ...cfg, name: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>Default Value</label>
                        <select
                            className="form-control"
                            value={cfg.defaultValue ? "true" : "false"}
                            onChange={(e) =>
                                onChange({
                                    ...cfg,
                                    defaultValue: e.target.value === "true",
                                })
                            }
                        >
                            <option value="false">False (unchecked)</option>
                            <option value="true">True (checked)</option>
                        </select>
                    </div>
                </div>
            );
        }
        case "SelectBox": {
            const cfg = comp.config as SelectBoxConfig;
            return (
                <div>
                    <div className="form-group">
                        <label>Field Name</label>
                        <input
                            className="form-control"
                            value={cfg.name}
                            onChange={(e) =>
                                onChange({ ...cfg, name: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>Options (one per line)</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            value={cfg.options.join("\n")}
                            onChange={(e) => {
                                const opts = e.target.value
                                    .split("\n")
                                    .map((o) => o.trim())
                                    .filter((o) => o.length > 0);
                                onChange({
                                    ...cfg,
                                    options: opts,
                                    defaultValue: opts[0] ?? "",
                                });
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Default Value</label>
                        <select
                            className="form-control"
                            value={cfg.defaultValue}
                            onChange={(e) =>
                                onChange({ ...cfg, defaultValue: e.target.value })
                            }
                        >
                            {cfg.options.map((opt, i) => (
                                <option key={i} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            );
        }
        case "Button": {
            const cfg = comp.config as ButtonConfig;
            return (
                <div>
                    <div className="form-group">
                        <label>Button Label</label>
                        <input
                            className="form-control"
                            value={cfg.label}
                            onChange={(e) =>
                                onChange({ ...cfg, label: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>Route (target page function name)</label>
                        <input
                            className="form-control"
                            value={cfg.route}
                            onChange={(e) =>
                                onChange({ ...cfg, route: e.target.value })
                            }
                        />
                    </div>
                </div>
            );
        }
        case "Header": {
            const cfg = comp.config as HeaderConfig;
            return (
                <div>
                    <div className="form-group">
                        <label>Header Content</label>
                        <input
                            className="form-control"
                            value={cfg.content}
                            onChange={(e) =>
                                onChange({ ...cfg, content: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>Level (1 = largest)</label>
                        <select
                            className="form-control"
                            value={cfg.level}
                            onChange={(e) =>
                                onChange({
                                    ...cfg,
                                    level: parseInt(e.target.value) as
                                        | 1
                                        | 2
                                        | 3
                                        | 4
                                        | 5
                                        | 6,
                                })
                            }
                        >
                            {[1, 2, 3, 4, 5, 6].map((l) => (
                                <option key={l} value={l}>
                                    H{l}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            );
        }
        default:
            return <div>No configuration available.</div>;
    }
}

function StyleEditor({
    style,
    onChange,
}: {
    style: ComponentStyle | PageStyle;
    onChange: (style: ComponentStyle | PageStyle) => void;
}) {
    return (
        <div>
            <div className="form-row">
                <div className="form-group">
                    <label>Color</label>
                    <input
                        type="color"
                        className="form-control"
                        value={style.color ?? "#333333"}
                        onChange={(e) =>
                            onChange({ ...style, color: e.target.value })
                        }
                    />
                </div>
                <div className="form-group">
                    <label>Background Color</label>
                    <input
                        type="color"
                        className="form-control"
                        value={style.backgroundColor ?? "#ffffff"}
                        onChange={(e) =>
                            onChange({
                                ...style,
                                backgroundColor: e.target.value,
                            })
                        }
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Font Size</label>
                    <input
                        className="form-control"
                        placeholder="1rem"
                        value={style.fontSize ?? ""}
                        onChange={(e) =>
                            onChange({ ...style, fontSize: e.target.value })
                        }
                    />
                </div>
                <div className="form-group">
                    <label>Font Family</label>
                    <select
                        className="form-control"
                        value={style.fontFamily ?? ""}
                        onChange={(e) =>
                            onChange({ ...style, fontFamily: e.target.value })
                        }
                    >
                        <option value="">Default</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Courier New', monospace">
                            Courier New
                        </option>
                        <option value="'Times New Roman', serif">
                            Times New Roman
                        </option>
                        <option value="Verdana, sans-serif">Verdana</option>
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Padding</label>
                    <input
                        className="form-control"
                        placeholder="8px"
                        value={style.padding ?? ""}
                        onChange={(e) =>
                            onChange({ ...style, padding: e.target.value })
                        }
                    />
                </div>
                <div className="form-group">
                    <label>Margin</label>
                    <input
                        className="form-control"
                        placeholder="0"
                        value={style.margin ?? ""}
                        onChange={(e) =>
                            onChange({ ...style, margin: e.target.value })
                        }
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Display</label>
                <select
                    className="form-control"
                    value={style.display ?? ""}
                    onChange={(e) =>
                        onChange({ ...style, display: e.target.value })
                    }
                >
                    <option value="">Default</option>
                    <option value="flex">Flex</option>
                    <option value="block">Block</option>
                    <option value="inline">Inline</option>
                    <option value="grid">Grid</option>
                </select>
            </div>
            {style.display === "flex" && (
                <>
                    <div className="form-group">
                        <label>Flex Direction</label>
                        <select
                            className="form-control"
                            value={style.flexDirection ?? ""}
                            onChange={(e) =>
                                onChange({
                                    ...style,
                                    flexDirection: e.target.value,
                                })
                            }
                        >
                            <option value="">Default (row)</option>
                            <option value="row">Row</option>
                            <option value="column">Column</option>
                            <option value="row-reverse">Row Reverse</option>
                            <option value="column-reverse">
                                Column Reverse
                            </option>
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Justify Content</label>
                            <select
                                className="form-control"
                                value={style.justifyContent ?? ""}
                                onChange={(e) =>
                                    onChange({
                                        ...style,
                                        justifyContent: e.target.value,
                                    })
                                }
                            >
                                <option value="">Default</option>
                                <option value="flex-start">Flex Start</option>
                                <option value="center">Center</option>
                                <option value="flex-end">Flex End</option>
                                <option value="space-between">Space Between</option>
                                <option value="space-around">Space Around</option>
                                <option value="space-evenly">Space Evenly</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Align Items</label>
                            <select
                                className="form-control"
                                value={style.alignItems ?? ""}
                                onChange={(e) =>
                                    onChange({
                                        ...style,
                                        alignItems: e.target.value,
                                    })
                                }
                            >
                                <option value="">Default</option>
                                <option value="flex-start">Flex Start</option>
                                <option value="center">Center</option>
                                <option value="flex-end">Flex End</option>
                                <option value="stretch">Stretch</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Gap</label>
                        <input
                            className="form-control"
                            placeholder="10px"
                            value={style.gap ?? ""}
                            onChange={(e) =>
                                onChange({ ...style, gap: e.target.value })
                            }
                        />
                    </div>
                </>
            )}
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
                    No {title.toLowerCase()} annotations yet.
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

export function PageEditor({
    pageId,
    project,
    onProjectChange,
}: PageEditorProps) {
    const foundPage = project.pages.find((p) => p.id === pageId);
    const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<EditorTab>("components");

    if (!foundPage) {
        return (
            <div className="empty-state">
                <div className="empty-icon">❌</div>
                <h3>Page not found</h3>
            </div>
        );
    }

    const page: Page = foundPage;
    const selectedComp = page.components.find((c) => c.id === selectedCompId);

    function updatePage(updatedPage: Page) {
        const updatedPages = project.pages.map((p) =>
            p.id === pageId ? updatedPage : p,
        );
        onProjectChange({
            ...project,
            pages: updatedPages,
            lastModified: new Date().toISOString(),
        });
    }

    function addComponent(type: ComponentType) {
        const newComp: PageComponent = {
            id: crypto.randomUUID(),
            type,
            config: getDefaultConfig(type),
            style: {},
        };
        updatePage({
            ...page,
            components: [...page.components, newComp],
        });
        setSelectedCompId(newComp.id);
    }

    function deleteComponent(id: string) {
        updatePage({
            ...page,
            components: page.components.filter((c) => c.id !== id),
        });
        if (selectedCompId === id) setSelectedCompId(null);
    }

    function updateComponentConfig(id: string, config: ComponentConfig) {
        updatePage({
            ...page,
            components: page.components.map((c) =>
                c.id === id ? { ...c, config } : c,
            ),
        });
    }

    function updateComponentStyle(id: string, style: ComponentStyle) {
        updatePage({
            ...page,
            components: page.components.map((c) =>
                c.id === id ? { ...c, style } : c,
            ),
        });
    }

    function updatePageStyle(style: PageStyle) {
        updatePage({ ...page, style });
    }

    function addAnnotation(type: "if" | "for") {
        const ann: LogicAnnotation = {
            id: crypto.randomUUID(),
            explanation: "",
        };
        if (type === "if") {
            updatePage({
                ...page,
                ifStatements: [...page.ifStatements, ann],
            });
        } else {
            updatePage({ ...page, forLoops: [...page.forLoops, ann] });
        }
    }

    function updateAnnotation(
        type: "if" | "for",
        id: string,
        explanation: string,
    ) {
        if (type === "if") {
            updatePage({
                ...page,
                ifStatements: page.ifStatements.map((a) =>
                    a.id === id ? { ...a, explanation } : a,
                ),
            });
        } else {
            updatePage({
                ...page,
                forLoops: page.forLoops.map((a) =>
                    a.id === id ? { ...a, explanation } : a,
                ),
            });
        }
    }

    function deleteAnnotation(type: "if" | "for", id: string) {
        if (type === "if") {
            updatePage({
                ...page,
                ifStatements: page.ifStatements.filter((a) => a.id !== id),
            });
        } else {
            updatePage({
                ...page,
                forLoops: page.forLoops.filter((a) => a.id !== id),
            });
        }
    }

    function moveComponentUp(idx: number) {
        if (idx === 0) return;
        const comps = [...page.components];
        [comps[idx - 1], comps[idx]] = [comps[idx], comps[idx - 1]];
        updatePage({ ...page, components: comps });
    }

    function moveComponentDown(idx: number) {
        if (idx === page.components.length - 1) return;
        const comps = [...page.components];
        [comps[idx], comps[idx + 1]] = [comps[idx + 1], comps[idx]];
        updatePage({ ...page, components: comps });
    }

    const COMPONENT_TYPES: ComponentType[] = [
        "Text",
        "TextBox",
        "TextArea",
        "CheckBox",
        "SelectBox",
        "Button",
        "Header",
    ];

    const pagePreviewStyle: React.CSSProperties = {
        backgroundColor: page.style.backgroundColor,
        color: page.style.color,
        fontFamily: page.style.fontFamily,
        fontSize: page.style.fontSize,
        display: page.style.display,
        flexDirection: page.style.flexDirection as React.CSSProperties["flexDirection"],
        justifyContent: page.style.justifyContent,
        alignItems: page.style.alignItems,
        gap: page.style.gap,
        padding: page.style.padding ?? "16px",
    };

    return (
        <div>
            <div style={{ marginBottom: "16px" }}>
                <h2
                    style={{
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        color: "#1a1a2e",
                    }}
                >
                    📝 Editing: {page.name}
                </h2>
                <div className="form-group" style={{ marginTop: "8px" }}>
                    <label>State Changes Description</label>
                    <textarea
                        className="form-control"
                        rows={2}
                        value={page.stateChanges}
                        onChange={(e) =>
                            updatePage({
                                ...page,
                                stateChanges: e.target.value,
                            })
                        }
                        placeholder="How does this page use or modify state?"
                    />
                </div>
            </div>

            <div className="page-editor">
                {/* Left panel: component palette + list */}
                <div className="editor-panel">
                    <h3>Add Component</h3>
                    <div className="component-palette">
                        {COMPONENT_TYPES.map((type) => (
                            <button
                                key={type}
                                className="palette-btn"
                                onClick={() => addComponent(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="divider" />

                    <h3 style={{ marginBottom: "8px" }}>Components</h3>
                    {page.components.length === 0 ? (
                        <p
                            style={{
                                color: "#bbb",
                                fontSize: "0.85rem",
                                textAlign: "center",
                                marginTop: "16px",
                            }}
                        >
                            No components yet.
                            <br />
                            Add one above.
                        </p>
                    ) : (
                        page.components.map((comp, idx) => (
                            <div key={comp.id}>
                                <div
                                    className={`component-list-item ${selectedCompId === comp.id ? "selected" : ""}`}
                                    onClick={() =>
                                        setSelectedCompId(comp.id)
                                    }
                                >
                                    <span className="comp-type-badge">
                                        {comp.type}
                                    </span>
                                    <span className="comp-label">
                                        {comp.type === "Text" &&
                                            (comp.config as TextConfig).content.slice(0, 20)}
                                        {comp.type === "TextBox" &&
                                            (comp.config as TextBoxConfig).name}
                                        {comp.type === "TextArea" &&
                                            (comp.config as TextAreaConfig).name}
                                        {comp.type === "CheckBox" &&
                                            (comp.config as CheckBoxConfig).name}
                                        {comp.type === "SelectBox" &&
                                            (comp.config as SelectBoxConfig).name}
                                        {comp.type === "Button" &&
                                            (comp.config as ButtonConfig).label}
                                        {comp.type === "Header" &&
                                            (comp.config as HeaderConfig).content.slice(0, 20)}
                                    </span>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "2px",
                                        }}
                                    >
                                        <button
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "0.7rem",
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveComponentUp(idx);
                                            }}
                                            disabled={idx === 0}
                                        >
                                            ▲
                                        </button>
                                        <button
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "0.7rem",
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveComponentDown(idx);
                                            }}
                                            disabled={
                                                idx ===
                                                page.components.length - 1
                                            }
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Center panel: preview */}
                <div className="editor-panel">
                    <h3>Page Preview</h3>
                    <div className="page-preview" style={pagePreviewStyle}>
                        {page.components.length === 0 ? (
                            <div className="empty-state">
                                <p>Empty page — add components from the left panel</p>
                            </div>
                        ) : (
                            page.components.map((comp) => (
                                <ComponentPreview
                                    key={comp.id}
                                    comp={comp}
                                    selected={selectedCompId === comp.id}
                                    onSelect={() =>
                                        setSelectedCompId(comp.id)
                                    }
                                    onDelete={() => deleteComponent(comp.id)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Right panel: configure selected component or page style */}
                <div className="editor-panel">
                    <div className="tabs">
                        <button
                            className={`tab-btn ${activeTab === "components" ? "active" : ""}`}
                            onClick={() => setActiveTab("components")}
                        >
                            Configure
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "style" ? "active" : ""}`}
                            onClick={() => setActiveTab("style")}
                        >
                            Style
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "annotations" ? "active" : ""}`}
                            onClick={() => setActiveTab("annotations")}
                        >
                            Logic
                        </button>
                    </div>

                    {activeTab === "components" && (
                        <div>
                            {selectedComp ? (
                                <div>
                                    <h3>
                                        {selectedComp.type} Configuration
                                    </h3>
                                    <ComponentConfigEditor
                                        comp={selectedComp}
                                        onChange={(config) =>
                                            updateComponentConfig(
                                                selectedComp.id,
                                                config,
                                            )
                                        }
                                    />
                                </div>
                            ) : (
                                <div
                                    className="empty-state"
                                    style={{ padding: "24px" }}
                                >
                                    <p>
                                        Select a component to configure it.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "style" && (
                        <div>
                            {selectedComp ? (
                                <div>
                                    <h3>Component Style</h3>
                                    <StyleEditor
                                        style={selectedComp.style}
                                        onChange={(s) =>
                                            updateComponentStyle(
                                                selectedComp.id,
                                                s as ComponentStyle,
                                            )
                                        }
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h3>Page Style</h3>
                                    <StyleEditor
                                        style={page.style}
                                        onChange={(s) =>
                                            updatePageStyle(s as PageStyle)
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "annotations" && (
                        <div>
                            <AnnotationSection
                                title="If Statements"
                                icon="🔀"
                                items={page.ifStatements}
                                onAdd={() => addAnnotation("if")}
                                onUpdate={(id, exp) =>
                                    updateAnnotation("if", id, exp)
                                }
                                onDelete={(id) => deleteAnnotation("if", id)}
                            />
                            <AnnotationSection
                                title="For Loops"
                                icon="🔁"
                                items={page.forLoops}
                                onAdd={() => addAnnotation("for")}
                                onUpdate={(id, exp) =>
                                    updateAnnotation("for", id, exp)
                                }
                                onDelete={(id) => deleteAnnotation("for", id)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
