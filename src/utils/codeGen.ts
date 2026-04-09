import type {
    Project,
    Page,
    Route,
    PageComponent,
    DataAttribute,
    SecondaryDataclass,
} from "../types";

function formatType(type: string): string {
    return type;
}

function generateDataclassFields(attrs: DataAttribute[]): string {
    if (attrs.length === 0) {
        return "    pass";
    }
    return attrs
        .map((a) => `    ${a.name}: ${formatType(a.type)}  # ${a.description}`)
        .join("\n");
}

function generateSecondaryDataclass(sec: SecondaryDataclass): string {
    return `@dataclass\nclass ${sec.name}:\n${generateDataclassFields(sec.attributes)}\n`;
}

function generateComponentCode(comp: PageComponent, indent: string): string {
    switch (comp.type) {
        case "Text":
            return `${indent}Text(${JSON.stringify((comp.config as { content: string }).content)})`;
        case "TextBox": {
            const cfg = comp.config as { name: string; defaultValue: string };
            return `${indent}TextBox(${JSON.stringify(cfg.name)}, state.${cfg.name} if hasattr(state, ${JSON.stringify(cfg.name)}) else ${JSON.stringify(cfg.defaultValue)})`;
        }
        case "TextArea": {
            const cfg = comp.config as { name: string; defaultValue: string };
            return `${indent}TextArea(${JSON.stringify(cfg.name)}, state.${cfg.name} if hasattr(state, ${JSON.stringify(cfg.name)}) else ${JSON.stringify(cfg.defaultValue)})`;
        }
        case "CheckBox": {
            const cfg = comp.config as {
                name: string;
                defaultValue: boolean;
            };
            return `${indent}CheckBox(${JSON.stringify(cfg.name)}, ${cfg.defaultValue ? "True" : "False"})`;
        }
        case "SelectBox": {
            const cfg = comp.config as {
                name: string;
                options: string[];
                defaultValue: string;
            };
            const opts = cfg.options.map((o) => JSON.stringify(o)).join(", ");
            return `${indent}SelectBox(${JSON.stringify(cfg.name)}, [${opts}], ${JSON.stringify(cfg.defaultValue)})`;
        }
        case "Button": {
            const cfg = comp.config as { label: string; route: string };
            return `${indent}Button(${JSON.stringify(cfg.label)}, ${JSON.stringify(cfg.route)})`;
        }
        case "Header": {
            const cfg = comp.config as {
                content: string;
                level: number;
            };
            return `${indent}Header(${JSON.stringify(cfg.content)}, ${cfg.level})`;
        }
        default:
            return `${indent}Text("Unknown component")`;
    }
}

function generatePageFunction(
    page: Page,
    routes: Route[],
    stateClassName: string,
): string {
    const outgoingRoutes = routes.filter((r) => r.sourcePageId === page.id);
    const pageName = page.name.replace(/\s+/g, "_").toLowerCase();

    // Collect input component names for parameters
    const inputParams: string[] = [];
    for (const comp of page.components) {
        if (
            comp.type === "TextBox" ||
            comp.type === "TextArea" ||
            comp.type === "CheckBox" ||
            comp.type === "SelectBox"
        ) {
            const cfg = comp.config as { name: string };
            inputParams.push(`${cfg.name}: str = ""`);
        }
    }

    const params =
        inputParams.length > 0
            ? `state: ${stateClassName}, ${inputParams.join(", ")}`
            : `state: ${stateClassName}`;

    const componentLines = page.components
        .map((c) => generateComponentCode(c, "        "))
        .join(",\n");

    const routeDefs = outgoingRoutes.map((r) => {
        const routeName = r.name.replace(/\s+/g, "_").toLowerCase();
        return `        # Route: ${routeName}\n        # ${r.description}`;
    });

    const routeComments =
        routeDefs.length > 0 ? routeDefs.join("\n") + "\n" : "";

    const stateChangeComment = page.stateChanges
        ? `    # State changes: ${page.stateChanges}\n`
        : "";

    const ifComments = page.ifStatements
        .map((ann) => `    # IF: ${ann.explanation}`)
        .join("\n");
    const forComments = page.forLoops
        .map((ann) => `    # FOR: ${ann.explanation}`)
        .join("\n");
    const annotationComments =
        (ifComments ? ifComments + "\n" : "") +
        (forComments ? forComments + "\n" : "");

    return `@route\ndef ${pageName}(${params}) -> Page:\n${stateChangeComment}${annotationComments}    return Page(\n${routeComments}        [\n${componentLines || "            # No components"}\n        ]\n    )\n`;
}

export function generatePythonCode(project: Project): string {
    const stateClassName = project.stateModel.name || "State";
    const sec = project.stateModel.secondaryDataclass;

    const imports = [
        "from drafter import *",
        "from dataclasses import dataclass, field",
        "from typing import List",
        "",
    ].join("\n");

    const secondarySection = sec ? generateSecondaryDataclass(sec) + "\n" : "";

    const stateFields = generateDataclassFields(project.stateModel.attributes);
    const stateSection = `@dataclass\nclass ${stateClassName}:\n${stateFields}\n\n`;

    const routeFunctions = project.pages
        .map((p) =>
            generatePageFunction(p, project.routes, stateClassName),
        )
        .join("\n\n");

    const firstPageName =
        project.pages.length > 0
            ? project.pages[0].name.replace(/\s+/g, "_").toLowerCase()
            : "index";

    const startServer = `\nstart_server(State(), debug=True, default_page=${JSON.stringify(firstPageName)})\n`;

    return (
        imports +
        "\n" +
        secondarySection +
        stateSection +
        routeFunctions +
        startServer
    );
}
