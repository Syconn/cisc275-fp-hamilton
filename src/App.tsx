import { useState, useEffect } from "react";
import type { Project, ViewName } from "./types";
import { loadProjects, saveProjects } from "./utils/storage";
import { Dashboard } from "./components/Dashboard";
import { ProjectOverview } from "./components/ProjectOverview";
import { PageGraph } from "./components/PageGraph";
import { PageEditor } from "./components/PageEditor";
import { StateEditor } from "./components/StateEditor";
import { ExportPanel } from "./components/ExportPanel";
import "./App.css";

export function App() {
    const [projects, setProjects] = useState<Project[]>(() => loadProjects());
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(
        null,
    );
    const [view, setView] = useState<ViewName>("dashboard");
    const [editingPageId, setEditingPageId] = useState<string | null>(null);

    const currentProject = projects.find((p) => p.id === currentProjectId);

    // Auto-save on every change
    useEffect(() => {
        saveProjects(projects);
    }, [projects]);

    function updateProject(updated: Project) {
        setProjects((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
        );
    }

    function openProject(project: Project) {
        setCurrentProjectId(project.id);
        setView("project-overview");
    }

    function deleteProject(id: string) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (currentProjectId === id) {
            setCurrentProjectId(null);
            setView("dashboard");
        }
    }

    function navigateTo(viewName: string) {
        if (
            viewName === "dashboard" ||
            viewName === "project-overview" ||
            viewName === "page-graph" ||
            viewName === "page-editor" ||
            viewName === "state-editor" ||
            viewName === "code-export" ||
            viewName === "docx-export"
        ) {
            setView(viewName as ViewName);
        }
    }

    function handleEditPage(pageId: string) {
        setEditingPageId(pageId);
        setView("page-editor");
    }

    // Breadcrumb
    function renderBreadcrumb() {
        const crumbs: { label: string; action?: () => void }[] = [
            { label: "🏠 Dashboard", action: () => setView("dashboard") },
        ];

        if (currentProject && view !== "dashboard") {
            crumbs.push({
                label: currentProject.name,
                action: () => setView("project-overview"),
            });
        }

        if (view === "page-graph") {
            crumbs.push({ label: "Page Graph" });
        } else if (view === "page-editor" && editingPageId && currentProject) {
            crumbs.push({
                label: "Page Graph",
                action: () => setView("page-graph"),
            });
            const page = currentProject.pages.find(
                (p) => p.id === editingPageId,
            );
            crumbs.push({ label: `Edit: ${page?.name ?? "Page"}` });
        } else if (view === "state-editor") {
            crumbs.push({ label: "State Model" });
        } else if (view === "code-export" || view === "docx-export") {
            crumbs.push({ label: "Export" });
        }

        return (
            <div className="breadcrumb">
                {crumbs.map((c, i) => (
                    <span key={i}>
                        {i > 0 && <span style={{ margin: "0 4px" }}>›</span>}
                        {c.action ? (
                            <span
                                className="crumb-link"
                                onClick={c.action}
                            >
                                {c.label}
                            </span>
                        ) : (
                            <span>{c.label}</span>
                        )}
                    </span>
                ))}
            </div>
        );
    }

    function renderView() {
        if (view === "dashboard") {
            return (
                <Dashboard
                    projects={projects}
                    onOpenProject={openProject}
                    onDeleteProject={deleteProject}
                    onProjectsChange={setProjects}
                />
            );
        }

        if (!currentProject) {
            setView("dashboard");
            return null;
        }

        if (view === "project-overview") {
            return (
                <ProjectOverview
                    project={currentProject}
                    onProjectChange={updateProject}
                    onNavigate={navigateTo}
                />
            );
        }

        if (view === "page-graph") {
            return (
                <PageGraph
                    project={currentProject}
                    onProjectChange={updateProject}
                    onEditPage={handleEditPage}
                />
            );
        }

        if (view === "page-editor" && editingPageId) {
            return (
                <PageEditor
                    pageId={editingPageId}
                    project={currentProject}
                    onProjectChange={updateProject}
                />
            );
        }

        if (view === "state-editor") {
            return (
                <StateEditor
                    project={currentProject}
                    onProjectChange={updateProject}
                />
            );
        }

        if (view === "code-export" || view === "docx-export") {
            return <ExportPanel project={currentProject} />;
        }

        return null;
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <h1 onClick={() => setView("dashboard")}>Drafter Drafter</h1>
                {renderBreadcrumb()}
            </header>
            <main className="app-main">{renderView()}</main>
        </div>
    );
}

export default App;
