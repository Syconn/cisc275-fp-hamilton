import { useState } from "react";
import type { Project } from "../types";

interface ProjectOverviewProps {
    project: Project;
    onProjectChange: (project: Project) => void;
    onNavigate: (view: string) => void;
}

export function ProjectOverview({
    project,
    onProjectChange,
    onNavigate,
}: ProjectOverviewProps) {
    const [editingName, setEditingName] = useState(false);
    const [editingDesc, setEditingDesc] = useState(false);
    const [nameDraft, setNameDraft] = useState(project.name);
    const [descDraft, setDescDraft] = useState(project.description);

    function saveName() {
        if (nameDraft.trim()) {
            onProjectChange({
                ...project,
                name: nameDraft.trim(),
                lastModified: new Date().toISOString(),
            });
        }
        setEditingName(false);
    }

    function saveDesc() {
        onProjectChange({
            ...project,
            description: descDraft,
            lastModified: new Date().toISOString(),
        });
        setEditingDesc(false);
    }

    const navItems = [
        {
            id: "page-graph",
            icon: "🗺️",
            title: "Page Graph",
            desc: `${project.pages.length} pages, ${project.routes.length} routes`,
        },
        {
            id: "state-editor",
            icon: "🗄️",
            title: "State Model",
            desc: `${project.stateModel.attributes.length} attributes`,
        },
        {
            id: "code-export",
            icon: "🐍",
            title: "Export Code",
            desc: "Generate Python starter code",
        },
        {
            id: "docx-export",
            icon: "📄",
            title: "Export DOCX",
            desc: "Download design document",
        },
    ];

    return (
        <div className="project-overview">
            {/* Project header */}
            <div className="card">
                <div className="card-header">
                    <h2>Project Details</h2>
                </div>

                {/* Name */}
                <div className="form-group">
                    <label>Project Name</label>
                    {editingName ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                            <input
                                className="form-control"
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") saveName();
                                    if (e.key === "Escape")
                                        setEditingName(false);
                                }}
                                autoFocus
                            />
                            <button className="btn btn-success" onClick={saveName}>
                                Save
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setEditingName(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                                {project.name}
                            </span>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                    setNameDraft(project.name);
                                    setEditingName(true);
                                }}
                            >
                                ✏️ Edit
                            </button>
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="form-group">
                    <label>Purpose / Description</label>
                    {editingDesc ? (
                        <div>
                            <textarea
                                className="form-control"
                                value={descDraft}
                                onChange={(e) => setDescDraft(e.target.value)}
                                rows={4}
                                placeholder="What does this website do?"
                                autoFocus
                            />
                            <div
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    marginTop: "8px",
                                }}
                            >
                                <button
                                    className="btn btn-success"
                                    onClick={saveDesc}
                                >
                                    Save
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setEditingDesc(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <p
                                style={{
                                    color: project.description ? "#333" : "#bbb",
                                    fontSize: "0.9rem",
                                    flex: 1,
                                    lineHeight: 1.5,
                                }}
                            >
                                {project.description || "No description yet. Click Edit to add one."}
                            </p>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                    setDescDraft(project.description);
                                    setEditingDesc(true);
                                }}
                                style={{ flexShrink: 0 }}
                            >
                                ✏️ Edit
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div
                    style={{
                        display: "flex",
                        gap: "16px",
                        fontSize: "0.85rem",
                        color: "#888",
                        marginTop: "8px",
                    }}
                >
                    <span>
                        Last modified:{" "}
                        {new Date(project.lastModified).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Navigation cards */}
            <div className="project-nav">
                {navItems.map((item) => (
                    <div
                        className="nav-card"
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                    >
                        <div className="nav-icon">{item.icon}</div>
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Pages quick summary */}
            {project.pages.length > 0 && (
                <div className="card" style={{ marginTop: "24px" }}>
                    <div className="card-header">
                        <h2>Pages</h2>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onNavigate("page-graph")}
                        >
                            Open Graph Editor
                        </button>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(200px, 1fr))",
                            gap: "12px",
                        }}
                    >
                        {project.pages.map((page) => (
                            <div
                                key={page.id}
                                style={{
                                    background: "#f8f9fa",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    border: "1px solid #eee",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        marginBottom: "4px",
                                    }}
                                >
                                    {page.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "#888",
                                    }}
                                >
                                    {page.components.length} component
                                    {page.components.length !== 1 ? "s" : ""}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
