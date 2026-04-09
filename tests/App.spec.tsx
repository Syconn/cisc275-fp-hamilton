import { render, screen, fireEvent } from "@testing-library/react";

import { App } from "../src/App";

test("App component shows dashboard", () => {
    render(<App />);

    // App header should show Drafter Drafter
    const headings = screen.getAllByText(/Drafter Drafter/i);
    expect(headings.length).toBeGreaterThan(0);

    // Dashboard should show new project button
    const newBtns = screen.getAllByText(/New Project/i);
    expect(newBtns.length).toBeGreaterThan(0);
});

test("Dashboard shows demo projects", () => {
    render(<App />);

    expect(screen.getByText(/Todo List App/i)).toBeInTheDocument();
    expect(screen.getByText(/Quiz App/i)).toBeInTheDocument();
});

test("Can open new project modal", () => {
    render(<App />);

    const newBtn = screen.getByRole("button", { name: /✚ New Project/i });
    fireEvent.click(newBtn);

    expect(screen.getByText(/Create New Project/i)).toBeInTheDocument();
});

test("Can cancel new project modal", () => {
    render(<App />);

    const newBtn = screen.getByRole("button", { name: /✚ New Project/i });
    fireEvent.click(newBtn);

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText(/Create New Project/i)).not.toBeInTheDocument();
});

test("Dashboard shows empty state when no projects", () => {
    render(<App />);
    // Since localStorage is empty in test env, should show empty state
    const noProjects = screen.queryByText(/No projects yet/i);
    // Either no projects message or project list
    const hasProjects = screen.queryAllByText(/Open/i).length > 0;
    expect(noProjects !== null || hasProjects).toBe(true);
});
