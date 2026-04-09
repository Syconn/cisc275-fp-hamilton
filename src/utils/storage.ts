import type { Project, StateModel } from "../types";

const STORAGE_KEY = "drafter-drafter-projects";

export function loadProjects(): Project[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw) as Project[];
        return parsed;
    } catch {
        return [];
    }
}

export function saveProjects(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createEmptyStateModel(): StateModel {
    return {
        name: "State",
        attributes: [],
        secondaryDataclass: null,
    };
}

export function createNewProject(name: string): Project {
    return {
        id: crypto.randomUUID(),
        name,
        description: "",
        lastModified: new Date().toISOString(),
        pages: [],
        routes: [],
        stateModel: createEmptyStateModel(),
    };
}

export function exportProjectAsJSON(project: Project): void {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
