import { useState, useCallback } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    type Connection,
    type NodeChange,
    type EdgeChange,
    type NodePositionChange,
    MarkerType,
    BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Project, Page, Route } from "../types";

interface PageGraphProps {
    project: Project;
    onProjectChange: (project: Project) => void;
    onEditPage: (pageId: string) => void;
}

type NodeData = {
    label: string;
    pageId: string;
    componentCount: number;
};

function buildNodes(pages: Page[]): Node<NodeData>[] {
    return pages.map((page) => ({
        id: page.id,
        type: "default",
        position: page.position,
        data: {
            label: page.name,
            pageId: page.id,
            componentCount: page.components.length,
        },
        style: {
            background: "white",
            border: "2px solid #4361ee",
            borderRadius: "8px",
            padding: "10px 20px",
            minWidth: "140px",
            textAlign: "center" as const,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
    }));
}

function buildEdges(routes: Route[]): Edge[] {
    return routes.map((route) => ({
        id: route.id,
        source: route.sourcePageId,
        target: route.targetPageId,
        label: route.name,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#4361ee" },
        labelStyle: {
            fill: "#333",
            fontWeight: 600,
            fontSize: 12,
        },
        labelBgStyle: {
            fill: "white",
            fillOpacity: 0.9,
        },
        animated: false,
        type: "default",
    }));
}

export function PageGraph({
    project,
    onProjectChange,
    onEditPage,
}: PageGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(
        buildNodes(project.pages),
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState(
        buildEdges(project.routes),
    );

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [showAddPage, setShowAddPage] = useState(false);
    const [newPageName, setNewPageName] = useState("");
    const [showEditPage, setShowEditPage] = useState(false);
    const [showEditRoute, setShowEditRoute] = useState(false);

    // For editing page
    const selectedPage = project.pages.find((p) => p.id === selectedNodeId);
    const selectedRoute = project.routes.find((r) => r.id === selectedEdgeId);

    const [editPageName, setEditPageName] = useState("");
    const [editPageDesc, setEditPageDesc] = useState("");
    const [editRouteName, setEditRouteName] = useState("");
    const [editRouteDesc, setEditRouteDesc] = useState("");

    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target) return;
            const routeId = crypto.randomUUID();
            const sourcePage = project.pages.find(
                (p) => p.id === connection.source,
            );
            const targetPage = project.pages.find(
                (p) => p.id === connection.target,
            );
            const routeName =
                targetPage?.name.replace(/\s+/g, "_").toLowerCase() ??
                "route";
            const newRoute: Route = {
                id: routeId,
                name: routeName,
                sourcePageId: connection.source,
                targetPageId: connection.target,
                description: `Route from ${sourcePage?.name ?? "?"} to ${targetPage?.name ?? "?"}`,
                stateChanges: "",
                ifStatements: [],
                forLoops: [],
            };
            const newEdge: Edge = {
                id: routeId,
                source: connection.source,
                target: connection.target,
                label: routeName,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: "#4361ee" },
            };
            setEdges((eds) => addEdge(newEdge, eds));
            onProjectChange({
                ...project,
                routes: [...project.routes, newRoute],
                lastModified: new Date().toISOString(),
            });
        },
        [project, onProjectChange, setEdges],
    );

    function handleNodesChange(changes: NodeChange<Node<NodeData>>[]) {
        onNodesChange(changes);
        // Sync position changes back to project
        const positionChanges = changes.filter(
            (c): c is NodePositionChange => c.type === "position",
        );
        if (positionChanges.length > 0) {
            const updatedPages = project.pages.map((page) => {
                const change = positionChanges.find((c) => c.id === page.id);
                if (change?.position) {
                    return {
                        ...page,
                        position: change.position,
                    };
                }
                return page;
            });
            onProjectChange({
                ...project,
                pages: updatedPages,
                lastModified: new Date().toISOString(),
            });
        }
    }

    function handleEdgesChange(changes: EdgeChange[]) {
        onEdgesChange(changes);
        // Sync removals
        const removals = changes.filter((c) => c.type === "remove");
        if (removals.length > 0) {
            const removedIds = removals.map((c) => c.id);
            const updatedRoutes = project.routes.filter(
                (r) => !removedIds.includes(r.id),
            );
            onProjectChange({
                ...project,
                routes: updatedRoutes,
                lastModified: new Date().toISOString(),
            });
        }
    }

    function handleAddPage() {
        if (!newPageName.trim()) return;
        const pageId = crypto.randomUUID();
        const page: Page = {
            id: pageId,
            name: newPageName.trim().replace(/\s+/g, "_").toLowerCase(),
            description: "",
            components: [],
            style: {
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
            },
            position: {
                x: 100 + project.pages.length * 200,
                y: 200,
            },
            ifStatements: [],
            forLoops: [],
            stateChanges: "",
        };
        const newNode: Node<NodeData> = {
            id: pageId,
            type: "default",
            position: page.position,
            data: {
                label: page.name,
                pageId,
                componentCount: 0,
            },
            style: {
                background: "white",
                border: "2px solid #4361ee",
                borderRadius: "8px",
                padding: "10px 20px",
                minWidth: "140px",
                textAlign: "center" as const,
            },
        };
        setNodes((nds) => [...nds, newNode]);
        onProjectChange({
            ...project,
            pages: [...project.pages, page],
            lastModified: new Date().toISOString(),
        });
        setNewPageName("");
        setShowAddPage(false);
    }

    function handleDeletePage() {
        if (!selectedNodeId) return;
        if (
            !confirm(
                "Delete this page and all its routes? This cannot be undone.",
            )
        )
            return;
        const updatedPages = project.pages.filter(
            (p) => p.id !== selectedNodeId,
        );
        const updatedRoutes = project.routes.filter(
            (r) =>
                r.sourcePageId !== selectedNodeId &&
                r.targetPageId !== selectedNodeId,
        );
        setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
        setEdges((eds) =>
            eds.filter(
                (e) =>
                    e.source !== selectedNodeId &&
                    e.target !== selectedNodeId,
            ),
        );
        setSelectedNodeId(null);
        onProjectChange({
            ...project,
            pages: updatedPages,
            routes: updatedRoutes,
            lastModified: new Date().toISOString(),
        });
    }

    function handleOpenEditPage() {
        if (!selectedPage) return;
        setEditPageName(selectedPage.name);
        setEditPageDesc(selectedPage.description);
        setShowEditPage(true);
    }

    function handleSaveEditPage() {
        if (!selectedPage) return;
        const updatedPage: Page = {
            ...selectedPage,
            name: editPageName.trim() || selectedPage.name,
            description: editPageDesc,
        };
        const updatedPages = project.pages.map((p) =>
            p.id === selectedPage.id ? updatedPage : p,
        );
        // Update node label
        setNodes((nds) =>
            nds.map((n) =>
                n.id === selectedPage.id
                    ? {
                          ...n,
                          data: {
                              ...n.data,
                              label: updatedPage.name,
                          },
                      }
                    : n,
            ),
        );
        onProjectChange({
            ...project,
            pages: updatedPages,
            lastModified: new Date().toISOString(),
        });
        setShowEditPage(false);
    }

    function handleOpenEditRoute() {
        if (!selectedRoute) return;
        setEditRouteName(selectedRoute.name);
        setEditRouteDesc(selectedRoute.description);
        setShowEditRoute(true);
    }

    function handleSaveEditRoute() {
        if (!selectedRoute) return;
        const updatedRoute: Route = {
            ...selectedRoute,
            name: editRouteName.trim() || selectedRoute.name,
            description: editRouteDesc,
        };
        const updatedRoutes = project.routes.map((r) =>
            r.id === selectedRoute.id ? updatedRoute : r,
        );
        setEdges((eds) =>
            eds.map((e) =>
                e.id === selectedRoute.id
                    ? { ...e, label: updatedRoute.name }
                    : e,
            ),
        );
        onProjectChange({
            ...project,
            routes: updatedRoutes,
            lastModified: new Date().toISOString(),
        });
        setShowEditRoute(false);
    }

    function handleDeleteRoute() {
        if (!selectedEdgeId) return;
        const updatedRoutes = project.routes.filter(
            (r) => r.id !== selectedEdgeId,
        );
        setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
        setSelectedEdgeId(null);
        onProjectChange({
            ...project,
            routes: updatedRoutes,
            lastModified: new Date().toISOString(),
        });
    }

    return (
        <div className="page-graph-container">
            {/* Toolbar */}
            <div className="page-graph-toolbar">
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddPage(true)}
                >
                    ✚ Add Page
                </button>
                {selectedNodeId && (
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={handleOpenEditPage}
                        >
                            ✏️ Edit Page
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={() => {
                                if (selectedNodeId)
                                    onEditPage(selectedNodeId);
                            }}
                        >
                            🖊️ Edit Components
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleDeletePage}
                        >
                            🗑️ Delete Page
                        </button>
                    </>
                )}
                {selectedEdgeId && (
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={handleOpenEditRoute}
                        >
                            ✏️ Edit Route
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleDeleteRoute}
                        >
                            🗑️ Delete Route
                        </button>
                    </>
                )}
                <span style={{ color: "#888", fontSize: "0.8rem", marginLeft: "auto" }}>
                    Drag pages to reposition. Connect pages by dragging from a
                    handle to another page.
                </span>
            </div>

            {/* Graph */}
            <div className="graph-area">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={(_e, node) => {
                        setSelectedNodeId(node.id);
                        setSelectedEdgeId(null);
                    }}
                    onEdgeClick={(_e, edge) => {
                        setSelectedEdgeId(edge.id);
                        setSelectedNodeId(null);
                    }}
                    onPaneClick={() => {
                        setSelectedNodeId(null);
                        setSelectedEdgeId(null);
                    }}
                    fitView
                >
                    <Background variant={BackgroundVariant.Dots} gap={16} />
                    <Controls />
                    <MiniMap />
                </ReactFlow>
            </div>

            {/* Add Page Modal */}
            {showAddPage && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowAddPage(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Add New Page</h3>
                        <div className="form-group">
                            <label>Page Name (used as route function name)</label>
                            <input
                                className="form-control"
                                placeholder="e.g. index, about, results"
                                value={newPageName}
                                onChange={(e) =>
                                    setNewPageName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddPage();
                                }}
                                autoFocus
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowAddPage(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddPage}
                                disabled={!newPageName.trim()}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Page Modal */}
            {showEditPage && selectedPage && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowEditPage(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Edit Page: {selectedPage.name}</h3>
                        <div className="form-group">
                            <label>Page Name</label>
                            <input
                                className="form-control"
                                value={editPageName}
                                onChange={(e) =>
                                    setEditPageName(e.target.value)
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                className="form-control"
                                value={editPageDesc}
                                onChange={(e) =>
                                    setEditPageDesc(e.target.value)
                                }
                                rows={3}
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowEditPage(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveEditPage}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Route Modal */}
            {showEditRoute && selectedRoute && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowEditRoute(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Edit Route: {selectedRoute.name}</h3>
                        <div className="form-group">
                            <label>Route Name</label>
                            <input
                                className="form-control"
                                value={editRouteName}
                                onChange={(e) =>
                                    setEditRouteName(e.target.value)
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                className="form-control"
                                value={editRouteDesc}
                                onChange={(e) =>
                                    setEditRouteDesc(e.target.value)
                                }
                                rows={3}
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowEditRoute(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveEditRoute}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
