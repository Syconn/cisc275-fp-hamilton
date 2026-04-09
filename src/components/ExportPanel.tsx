import { useState } from "react";
import type { Project } from "../types";
import { generatePythonCode } from "../utils/codeGen";
import { exportDocx } from "../utils/docxExport";

interface ExportPanelProps {
    project: Project;
}

export function ExportPanel({ project }: ExportPanelProps) {
    const [activeTab, setActiveTab] = useState<"code" | "docx">("code");
    const [exporting, setExporting] = useState(false);

    const code = generatePythonCode(project);

    function handleCopy() {
        void navigator.clipboard.writeText(code);
    }

    async function handleDocxExport() {
        setExporting(true);
        try {
            await exportDocx(project);
        } finally {
            setExporting(false);
        }
    }

    return (
        <div>
            <h2
                style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginBottom: "16px",
                }}
            >
                📤 Export
            </h2>

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === "code" ? "active" : ""}`}
                    onClick={() => setActiveTab("code")}
                >
                    🐍 Python Code
                </button>
                <button
                    className={`tab-btn ${activeTab === "docx" ? "active" : ""}`}
                    onClick={() => setActiveTab("docx")}
                >
                    📄 DOCX Document
                </button>
            </div>

            {activeTab === "code" && (
                <div className="card">
                    <div className="card-header">
                        <h2>Generated Drafter Python Code</h2>
                        <button
                            className="btn btn-secondary"
                            onClick={handleCopy}
                        >
                            📋 Copy to Clipboard
                        </button>
                    </div>
                    <p
                        style={{
                            color: "#888",
                            fontSize: "0.85rem",
                            marginBottom: "12px",
                        }}
                    >
                        This is starter code for your Drafter application.
                        Copy it into your Python file and complete the logic.
                    </p>
                    <pre className="code-output">{code}</pre>
                </div>
            )}

            {activeTab === "docx" && (
                <div className="card">
                    <div className="card-header">
                        <h2>Export Design Document</h2>
                    </div>
                    <p
                        style={{
                            color: "#555",
                            fontSize: "0.9rem",
                            marginBottom: "20px",
                            lineHeight: 1.6,
                        }}
                    >
                        Export a professionally formatted DOCX document
                        containing:
                    </p>
                    <ul
                        style={{
                            marginLeft: "24px",
                            color: "#555",
                            fontSize: "0.9rem",
                            lineHeight: 1.8,
                            marginBottom: "24px",
                        }}
                    >
                        <li>Project name and purpose</li>
                        <li>All pages with their components</li>
                        <li>Routes and state change descriptions</li>
                        <li>State model dataclass definitions</li>
                        <li>Logic annotations (if statements and for loops)</li>
                    </ul>
                    <button
                        className="btn btn-primary"
                        onClick={() => void handleDocxExport()}
                        disabled={exporting}
                    >
                        {exporting ? "⏳ Generating..." : "📄 Download DOCX"}
                    </button>
                </div>
            )}
        </div>
    );
}
