import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from "docx";
import type { Project } from "../types";

function safeText(text: string): string {
    return text || "";
}

function makeAttrTable(attrs: { name: string; type: string; description: string }[]): Table {
    const headerRow = new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Name" })] }),
            new TableCell({ children: [new Paragraph({ text: "Type" })] }),
            new TableCell({ children: [new Paragraph({ text: "Description" })] }),
        ],
    });
    const rows = attrs.map(
        (attr) =>
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ text: safeText(attr.name) })] }),
                    new TableCell({ children: [new Paragraph({ text: safeText(attr.type) })] }),
                    new TableCell({ children: [new Paragraph({ text: safeText(attr.description) })] }),
                ],
            }),
    );
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...rows],
    });
}

export async function exportDocx(project: Project): Promise<void> {
    const docChildren: (Paragraph | Table)[] = [];

    // Title
    docChildren.push(
        new Paragraph({
            text: `Project: ${safeText(project.name)}`,
            heading: HeadingLevel.TITLE,
        }),
    );

    // Description
    if (project.description) {
        docChildren.push(
            new Paragraph({ text: "Purpose", heading: HeadingLevel.HEADING_1 }),
        );
        docChildren.push(new Paragraph({ text: safeText(project.description) }));
    }

    // Page Graph section
    docChildren.push(
        new Paragraph({ text: "Page Graph & Routes", heading: HeadingLevel.HEADING_1 }),
    );
    docChildren.push(
        new Paragraph({ text: `Pages (${project.pages.length}):`, heading: HeadingLevel.HEADING_2 }),
    );

    for (const page of project.pages) {
        docChildren.push(
            new Paragraph({ text: `Page: ${safeText(page.name)}`, heading: HeadingLevel.HEADING_3 }),
        );
        if (page.description) {
            docChildren.push(
                new Paragraph({ children: [new TextRun({ text: `Description: ${safeText(page.description)}` })] }),
            );
        }
        if (page.stateChanges) {
            docChildren.push(
                new Paragraph({ children: [new TextRun({ text: `State Changes: ${safeText(page.stateChanges)}` })] }),
            );
        }

        // Components
        if (page.components.length > 0) {
            docChildren.push(
                new Paragraph({ text: "Components:", heading: HeadingLevel.HEADING_4 }),
            );
            for (const comp of page.components) {
                let configSummary = "";
                switch (comp.type) {
                    case "Text":
                        configSummary = `Content: "${(comp.config as { content: string }).content}"`;
                        break;
                    case "TextBox":
                    case "TextArea":
                        configSummary = `Name: "${(comp.config as { name: string }).name}", Default: "${(comp.config as { defaultValue: string }).defaultValue}"`;
                        break;
                    case "CheckBox":
                        configSummary = `Name: "${(comp.config as { name: string }).name}", Default: ${String((comp.config as { defaultValue: boolean }).defaultValue)}`;
                        break;
                    case "SelectBox":
                        configSummary = `Name: "${(comp.config as { name: string }).name}", Options: [${(comp.config as { options: string[] }).options.join(", ")}]`;
                        break;
                    case "Button":
                        configSummary = `Label: "${(comp.config as { label: string }).label}", Route: "${(comp.config as { route: string }).route}"`;
                        break;
                    case "Header":
                        configSummary = `Content: "${(comp.config as { content: string }).content}", Level: H${String((comp.config as { level: number }).level)}`;
                        break;
                    default:
                        configSummary = "";
                }
                docChildren.push(
                    new Paragraph({ children: [new TextRun({ text: `  • [${comp.type}] ${configSummary}` })] }),
                );
            }
        }

        // Logic annotations
        if (page.ifStatements.length > 0) {
            docChildren.push(
                new Paragraph({ text: "If Statements:", heading: HeadingLevel.HEADING_4 }),
            );
            for (const ann of page.ifStatements) {
                docChildren.push(
                    new Paragraph({ children: [new TextRun({ text: `  ✓ ${safeText(ann.explanation)}` })] }),
                );
            }
        }
        if (page.forLoops.length > 0) {
            docChildren.push(
                new Paragraph({ text: "For Loops:", heading: HeadingLevel.HEADING_4 }),
            );
            for (const ann of page.forLoops) {
                docChildren.push(
                    new Paragraph({ children: [new TextRun({ text: `  ✓ ${safeText(ann.explanation)}` })] }),
                );
            }
        }
    }

    // Routes
    docChildren.push(
        new Paragraph({ text: `Routes (${project.routes.length}):`, heading: HeadingLevel.HEADING_2 }),
    );

    for (const route of project.routes) {
        const sourcePage = project.pages.find((p) => p.id === route.sourcePageId);
        const targetPage = project.pages.find((p) => p.id === route.targetPageId);
        const fromName = sourcePage?.name ?? "Unknown";
        const toName = targetPage?.name ?? "Unknown";

        docChildren.push(
            new Paragraph({
                children: [
                    new TextRun({ text: `Route "${safeText(route.name)}": ${fromName} → ${toName}`, bold: true }),
                ],
            }),
        );
        if (route.description) {
            docChildren.push(
                new Paragraph({ children: [new TextRun({ text: `  Description: ${safeText(route.description)}` })] }),
            );
        }
        if (route.stateChanges) {
            docChildren.push(
                new Paragraph({ children: [new TextRun({ text: `  State Changes: ${safeText(route.stateChanges)}` })] }),
            );
        }
        for (const ann of route.ifStatements) {
            docChildren.push(
                new Paragraph({ children: [new TextRun({ text: `  IF: ${safeText(ann.explanation)}` })] }),
            );
        }
        for (const ann of route.forLoops) {
            docChildren.push(
                new Paragraph({ children: [new TextRun({ text: `  FOR: ${safeText(ann.explanation)}` })] }),
            );
        }
    }

    // State model
    docChildren.push(
        new Paragraph({ text: "State Model", heading: HeadingLevel.HEADING_1 }),
    );

    const model = project.stateModel;
    docChildren.push(
        new Paragraph({ text: `Dataclass: ${safeText(model.name)}`, heading: HeadingLevel.HEADING_2 }),
    );

    if (model.attributes.length > 0) {
        docChildren.push(makeAttrTable(model.attributes));
    } else {
        docChildren.push(new Paragraph({ text: "No attributes defined." }));
    }

    // Secondary dataclass
    if (model.secondaryDataclass) {
        const sec = model.secondaryDataclass;
        docChildren.push(
            new Paragraph({ text: `Secondary Dataclass: ${safeText(sec.name)}`, heading: HeadingLevel.HEADING_2 }),
        );
        if (sec.attributes.length > 0) {
            docChildren.push(makeAttrTable(sec.attributes));
        } else {
            docChildren.push(new Paragraph({ text: "No attributes defined." }));
        }
    }

    const doc = new Document({
        sections: [{ children: docChildren }],
    });

    const buffer = await Packer.toBlob(doc);
    const url = URL.createObjectURL(buffer);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "-")}-design.docx`;
    a.click();
    URL.revokeObjectURL(url);
}
