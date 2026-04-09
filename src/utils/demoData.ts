import type { Project } from "../types";

export const DEMO_PROJECTS: Project[] = [
    {
        id: "demo-todo-app",
        name: "Todo List App",
        description:
            "A simple todo list application where users can add, complete, and remove tasks.",
        lastModified: new Date().toISOString(),
        pages: [
            {
                id: "page-home",
                name: "index",
                description: "Main page showing all todo items",
                position: { x: 100, y: 100 },
                style: {
                    backgroundColor: "#f5f5f5",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                },
                stateChanges:
                    "Reads tasks list from state to display each task",
                ifStatements: [
                    {
                        id: "if-1",
                        explanation:
                            "If the task list is empty, show a 'No tasks yet' message",
                    },
                ],
                forLoops: [
                    {
                        id: "for-1",
                        explanation:
                            "Loop over all tasks in state.tasks to render each one",
                    },
                ],
                components: [
                    {
                        id: "c1",
                        type: "Header",
                        config: { content: "My Todo List", level: 1 },
                        style: { color: "#333", fontSize: "2rem" },
                    },
                    {
                        id: "c2",
                        type: "TextBox",
                        config: { name: "new_task", defaultValue: "" },
                        style: {},
                    },
                    {
                        id: "c3",
                        type: "Button",
                        config: { label: "Add Task", route: "add_task" },
                        style: {
                            backgroundColor: "#4CAF50",
                            color: "white",
                            padding: "8px 16px",
                        },
                    },
                ],
            },
            {
                id: "page-add",
                name: "add_task",
                description: "Route handler that adds a new task to the list",
                position: { x: 400, y: 100 },
                style: {},
                stateChanges: "Appends new_task to state.tasks list",
                ifStatements: [
                    {
                        id: "if-2",
                        explanation:
                            "If new_task is not empty, add it; otherwise show an error",
                    },
                ],
                forLoops: [],
                components: [
                    {
                        id: "c4",
                        type: "Text",
                        config: { content: "Task added successfully!" },
                        style: { color: "green" },
                    },
                    {
                        id: "c5",
                        type: "Button",
                        config: { label: "Back to List", route: "index" },
                        style: {},
                    },
                ],
            },
            {
                id: "page-complete",
                name: "complete_task",
                description: "Marks a task as completed",
                position: { x: 700, y: 100 },
                style: {},
                stateChanges:
                    "Updates the completed field of the selected Task in state.tasks",
                ifStatements: [
                    {
                        id: "if-3",
                        explanation:
                            "If the selected task index is valid, mark it complete",
                    },
                ],
                forLoops: [],
                components: [
                    {
                        id: "c6",
                        type: "Text",
                        config: { content: "Task marked as complete!" },
                        style: {},
                    },
                    {
                        id: "c7",
                        type: "Button",
                        config: { label: "Back to List", route: "index" },
                        style: {},
                    },
                ],
            },
        ],
        routes: [
            {
                id: "route-1",
                name: "add_task",
                sourcePageId: "page-home",
                targetPageId: "page-add",
                description: "Navigate to add a new task",
                stateChanges: "Adds new_task string to the tasks list",
                ifStatements: [],
                forLoops: [],
            },
            {
                id: "route-2",
                name: "index",
                sourcePageId: "page-add",
                targetPageId: "page-home",
                description: "Return to the main list",
                stateChanges: "",
                ifStatements: [],
                forLoops: [],
            },
            {
                id: "route-3",
                name: "complete_task",
                sourcePageId: "page-home",
                targetPageId: "page-complete",
                description: "Mark a task as done",
                stateChanges: "Updates task completed status",
                ifStatements: [],
                forLoops: [],
            },
            {
                id: "route-4",
                name: "index",
                sourcePageId: "page-complete",
                targetPageId: "page-home",
                description: "Return to the main list",
                stateChanges: "",
                ifStatements: [],
                forLoops: [],
            },
        ],
        stateModel: {
            name: "State",
            attributes: [
                {
                    id: "a1",
                    name: "tasks",
                    type: "List[Task]",
                    description: "List of all todo tasks",
                },
                {
                    id: "a2",
                    name: "username",
                    type: "str",
                    description: "The logged-in user's name",
                },
                {
                    id: "a3",
                    name: "filter_done",
                    type: "bool",
                    description: "Whether to show only completed tasks",
                },
                {
                    id: "a4",
                    name: "new_task",
                    type: "str",
                    description: "The text of the new task being created",
                },
            ],
            secondaryDataclass: {
                id: "sec1",
                name: "Task",
                attributes: [
                    {
                        id: "ta1",
                        name: "title",
                        type: "str",
                        description: "The title of the task",
                    },
                    {
                        id: "ta2",
                        name: "completed",
                        type: "bool",
                        description: "Whether the task has been completed",
                    },
                ],
            },
        },
    },
    {
        id: "demo-quiz-app",
        name: "Quiz App",
        description:
            "An interactive quiz application that presents questions and tracks scores.",
        lastModified: new Date().toISOString(),
        pages: [
            {
                id: "q-page-start",
                name: "index",
                description: "Welcome screen with quiz title and start button",
                position: { x: 100, y: 200 },
                style: {
                    backgroundColor: "#e8f4fd",
                    padding: "30px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "20px",
                },
                stateChanges: "Resets score to 0 and current_question to 0",
                ifStatements: [],
                forLoops: [],
                components: [
                    {
                        id: "qc1",
                        type: "Header",
                        config: { content: "Python Quiz!", level: 1 },
                        style: { color: "#1a73e8" },
                    },
                    {
                        id: "qc2",
                        type: "Text",
                        config: {
                            content:
                                "Test your Python knowledge with 5 questions.",
                        },
                        style: {},
                    },
                    {
                        id: "qc3",
                        type: "Button",
                        config: { label: "Start Quiz", route: "question" },
                        style: {
                            backgroundColor: "#1a73e8",
                            color: "white",
                            padding: "12px 24px",
                            borderRadius: "4px",
                        },
                    },
                ],
            },
            {
                id: "q-page-question",
                name: "question",
                description: "Displays current question and answer choices",
                position: { x: 400, y: 200 },
                style: { padding: "20px" },
                stateChanges: "Reads current_question index to display question",
                ifStatements: [
                    {
                        id: "q-if-1",
                        explanation:
                            "If current_question >= total questions, redirect to results",
                    },
                ],
                forLoops: [
                    {
                        id: "q-for-1",
                        explanation:
                            "Loop over questions list to build answer buttons",
                    },
                ],
                components: [
                    {
                        id: "qc4",
                        type: "Header",
                        config: { content: "Question", level: 2 },
                        style: {},
                    },
                    {
                        id: "qc5",
                        type: "SelectBox",
                        config: {
                            name: "answer",
                            options: ["A", "B", "C", "D"],
                            defaultValue: "A",
                        },
                        style: {},
                    },
                    {
                        id: "qc6",
                        type: "Button",
                        config: {
                            label: "Submit Answer",
                            route: "check_answer",
                        },
                        style: {},
                    },
                ],
            },
            {
                id: "q-page-result",
                name: "results",
                description: "Shows final score and a restart button",
                position: { x: 700, y: 200 },
                style: { padding: "20px", textAlign: "center" },
                stateChanges: "Reads final score from state",
                ifStatements: [
                    {
                        id: "q-if-2",
                        explanation:
                            "If score >= 4, show 'Great job!'; otherwise show 'Keep practicing'",
                    },
                ],
                forLoops: [],
                components: [
                    {
                        id: "qc7",
                        type: "Header",
                        config: { content: "Your Results", level: 1 },
                        style: {},
                    },
                    {
                        id: "qc8",
                        type: "Text",
                        config: { content: "Quiz complete! See your score." },
                        style: {},
                    },
                    {
                        id: "qc9",
                        type: "Button",
                        config: { label: "Play Again", route: "index" },
                        style: {},
                    },
                ],
            },
        ],
        routes: [
            {
                id: "qr1",
                name: "question",
                sourcePageId: "q-page-start",
                targetPageId: "q-page-question",
                description: "Start the quiz",
                stateChanges:
                    "Resets score to 0 and current_question_index to 0",
                ifStatements: [],
                forLoops: [],
            },
            {
                id: "qr2",
                name: "check_answer",
                sourcePageId: "q-page-question",
                targetPageId: "q-page-question",
                description: "Check the submitted answer and advance",
                stateChanges:
                    "Increments score if correct; advances current_question_index",
                ifStatements: [
                    {
                        id: "qr-if-1",
                        explanation:
                            "If answer matches correct answer, increment score",
                    },
                    {
                        id: "qr-if-2",
                        explanation:
                            "If current_question_index >= len(questions), redirect to results",
                    },
                ],
                forLoops: [],
            },
            {
                id: "qr3",
                name: "results",
                sourcePageId: "q-page-question",
                targetPageId: "q-page-result",
                description: "Navigate to results when done",
                stateChanges: "",
                ifStatements: [],
                forLoops: [],
            },
            {
                id: "qr4",
                name: "index",
                sourcePageId: "q-page-result",
                targetPageId: "q-page-start",
                description: "Restart the quiz",
                stateChanges: "Resets all state",
                ifStatements: [],
                forLoops: [],
            },
        ],
        stateModel: {
            name: "State",
            attributes: [
                {
                    id: "qa1",
                    name: "questions",
                    type: "List[Question]",
                    description: "List of all quiz questions",
                },
                {
                    id: "qa2",
                    name: "score",
                    type: "int",
                    description: "Current score (number of correct answers)",
                },
                {
                    id: "qa3",
                    name: "current_question_index",
                    type: "int",
                    description: "Index of the current question being shown",
                },
                {
                    id: "qa4",
                    name: "username",
                    type: "str",
                    description: "Name of the player",
                },
            ],
            secondaryDataclass: {
                id: "qsec1",
                name: "Question",
                attributes: [
                    {
                        id: "qsa1",
                        name: "text",
                        type: "str",
                        description: "The question text",
                    },
                    {
                        id: "qsa2",
                        name: "options",
                        type: "List[str]",
                        description: "List of answer choices",
                    },
                    {
                        id: "qsa3",
                        name: "correct",
                        type: "str",
                        description: "The correct answer",
                    },
                ],
            },
        },
    },
];
