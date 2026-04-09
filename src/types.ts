// Component types supported by Drafter
export type ComponentType =
    | "Text"
    | "TextBox"
    | "TextArea"
    | "CheckBox"
    | "SelectBox"
    | "Button"
    | "Header";

// Style for individual components
export interface ComponentStyle {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    border?: string;
    borderRadius?: string;
    padding?: string;
    margin?: string;
    width?: string;
    height?: string;
    display?: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    gap?: string;
}

// Style for the entire page
export interface PageStyle {
    backgroundColor?: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    display?: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    gap?: string;
    padding?: string;
    margin?: string;
    textAlign?: string;
}

// Configuration for each component type
export interface TextConfig {
    content: string;
}

export interface TextBoxConfig {
    name: string;
    defaultValue: string;
}

export interface TextAreaConfig {
    name: string;
    defaultValue: string;
}

export interface CheckBoxConfig {
    name: string;
    defaultValue: boolean;
}

export interface SelectBoxConfig {
    name: string;
    options: string[];
    defaultValue: string;
}

export interface ButtonConfig {
    label: string;
    route: string;
}

export interface HeaderConfig {
    content: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
}

export type ComponentConfig =
    | TextConfig
    | TextBoxConfig
    | TextAreaConfig
    | CheckBoxConfig
    | SelectBoxConfig
    | ButtonConfig
    | HeaderConfig;

// A single UI component on a page
export interface PageComponent {
    id: string;
    type: ComponentType;
    config: ComponentConfig;
    style: ComponentStyle;
}

// A logic annotation (if statement or for loop)
export interface LogicAnnotation {
    id: string;
    explanation: string;
}

// A page in the application
export interface Page {
    id: string;
    name: string;
    description: string;
    components: PageComponent[];
    style: PageStyle;
    position: { x: number; y: number };
    ifStatements: LogicAnnotation[];
    forLoops: LogicAnnotation[];
    stateChanges: string;
}

// A route between two pages
export interface Route {
    id: string;
    name: string;
    sourcePageId: string;
    targetPageId: string;
    description: string;
    stateChanges: string;
    ifStatements: LogicAnnotation[];
    forLoops: LogicAnnotation[];
}

// An attribute in a dataclass
export interface DataAttribute {
    id: string;
    name: string;
    type: string;
    description: string;
}

// A secondary dataclass
export interface SecondaryDataclass {
    id: string;
    name: string;
    attributes: DataAttribute[];
}

// The full state model
export interface StateModel {
    name: string;
    attributes: DataAttribute[];
    secondaryDataclass: SecondaryDataclass | null;
}

// A project (the top-level entity)
export interface Project {
    id: string;
    name: string;
    description: string;
    lastModified: string;
    pages: Page[];
    routes: Route[];
    stateModel: StateModel;
}

// View names for navigation
export type ViewName =
    | "dashboard"
    | "project-overview"
    | "page-graph"
    | "page-editor"
    | "state-editor"
    | "code-export"
    | "docx-export";
