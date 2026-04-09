import { useState } from "react";
import type { Project } from "../types";
import { createNewProject, exportProjectAsJSON } from "../utils/storage";
import { DEMO_PROJECTS } from "../utils/demoData";

interface DashboardProps {
    projects: Project[];
    onOpenProject: (project: Project) => void;
    onDeleteProject: (id: string) => void;
    onProjectsChange: (projects: Project[]) => void;
}

export function Dashboard({
    projects,
    onOpenProject,
    onDeleteProject,
    onProjectsChange,
}: DashboardProps) {
    const [showNewModal, setShowNewModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");

    function handleCreate() {
        if (!newProjectName.trim()) return;
        const proj = createNewProject(newProjectName.trim());
        onProjectsChange([...projects, proj]);
        setNewProjectName("");
        setShowNewModal(false);
        onOpenProject(proj);
    }

    function handleLoadDemo(demo: Project) {
        // Create a copy with a new id so it doesn't conflict
        const copy: Project = {
            ...demo,
            id: crypto.randomUUID(),
            lastModified: new Date().toISOString(),
        };
        onProjectsChange([...projects, copy]);
        onOpenProject(copy);
    }

    function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const text = ev.target?.result as string;
                const imported = JSON.parse(text) as Project;
                if (!imported.id || !imported.name) {
                    alert("Invalid project file.");
                    return;
                }
                // Assign new id to avoid conflicts
                const withNewId = {
                    ...imported,
                    id: crypto.randomUUID(),
                    lastModified: new Date().toISOString(),
                };
                onProjectsChange([...projects, withNewId]);
                onOpenProject(withNewId);
            } catch {
                alert("Failed to import project. Invalid JSON.");
            }
        };
        reader.readAsText(file);
        // Reset so same file can be imported again
        e.target.value = "";
    }

    return (
        <div className="dashboard">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "16px",
                }}
            >
                <div>
                    <h1 className="dashboard-title">🎨 Drafter Drafter</h1>
                    <p className="dashboard-subtitle">
                        Plan your Drafter web application visually
                    </p>
                </div>
                <div className="btn-group">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowNewModal(true)}
                    >
                        ✚ New Project
                    </button>
                    <label className="btn btn-outline" style={{ cursor: "pointer" }}>
                        📂 Import JSON
                        <input
                            type="file"
                            accept=".json"
                            style={{ display: "none" }}
                            onChange={handleImportJSON}
                        />
                    </label>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No projects yet</h3>
                    <p>
                        Create a new project or load a demo to get started.
                    </p>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map((proj) => (
                        <div className="project-card" key={proj.id}>
                            <h3>{proj.name}</h3>
                            <div className="project-meta">
                                Last modified:{" "}
                                {new Date(proj.lastModified).toLocaleDateString()}
                                {" · "}
                                {proj.pages.length} page
                                {proj.pages.length !== 1 ? "s" : ""}
                                {" · "}
                                {proj.routes.length} route
                                {proj.routes.length !== 1 ? "s" : ""}
                            </div>
                            <div className="project-description">
                                {proj.description || (
                                    <em style={{ color: "#bbb" }}>
                                        No description
                                    </em>
                                )}
                            </div>
                            <div className="project-actions">
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => onOpenProject(proj)}
                                >
                                    Open
                                </button>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => exportProjectAsJSON(proj)}
                                >
                                    Export
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                `Delete "${proj.name}"? This cannot be undone.`,
                                            )
                                        ) {
                                            onDeleteProject(proj.id);
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="demo-section">
                <h3>🚀 Demo Projects</h3>
                <div className="btn-group">
                    {DEMO_PROJECTS.map((demo) => (
                        <button
                            key={demo.id}
                            className="btn btn-warning"
                            onClick={() => handleLoadDemo(demo)}
                        >
                            Load: {demo.name}
                        </button>
                    ))}
                </div>
            </div>

            {showNewModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowNewModal(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Create New Project</h3>
                        <div className="form-group">
                            <label>Project Name</label>
                            <input
                                className="form-control"
                                type="text"
                                placeholder="My Awesome App"
                                value={newProjectName}
                                onChange={(e) =>
                                    setNewProjectName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreate();
                                }}
                                autoFocus
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowNewModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={!newProjectName.trim()}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
