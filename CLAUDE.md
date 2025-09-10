# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js thesis evaluation tool that helps academic evaluators assess theses using weighted scoring criteria. The application provides a structured evaluation workflow across predefined categories (Preface, Form, Structure, Content).

### Core Architecture Pattern

The application follows a provider-based state management pattern with three main contexts:

1. **ConfigProvider** (`src/components/providers/ConfigProvider.tsx`) - Manages evaluation configuration, templates, and sections
2. **EvaluationStateProvider** (`src/components/providers/EvaluationStateProvider.tsx`) - Handles evaluation progress and criterion scores
3. **GradeProvider** (`src/components/providers/GradeProvider.tsx`) - Manages grade thresholds and calculations

### Key Components Structure

- **MainSplitView** (`src/components/MainSplitView.tsx`) - Main layout orchestrating the evaluation interface with sidebar navigation and content areas
- **ConfigurationSidebar** (`src/components/ConfigurationSidebar.tsx`) - Configuration management for sections, criteria, and templates
- **EvaluationNavigation** (`src/components/EvaluationNavigation.tsx`) - Section navigation with progress tracking and analytics
- **Criterion** (`src/components/Criterion.tsx`) - Individual criterion evaluation with option selection
- **Dialog Components** (`src/components/dialogs/`) - Modal dialogs for various management tasks (templates, analytics, notes, etc.)

### Data Flow & State Management

The application uses React Context for state management rather than external libraries like Redux. State flows through three provider layers:

- Configuration data (sections, criteria, templates) flows through ConfigProvider
- Evaluation progress and scores flow through EvaluationStateProvider  
- Grade calculations and thresholds flow through GradeProvider

### Type System

Core types are defined in `src/lib/types/types.ts`:
- `EvaluationConfig` - Main configuration structure
- `Section` & `Criterion` - Evaluation structure with weights
- `Template` - Configuration templates (default/saved)
- `GradeConfig` - Grade thresholds and calculations

### Key Features

- **Template System**: Default and custom evaluation templates stored in `src/lib/config/evaluation-templates.ts`
- **Weighted Scoring**: Each section and criterion has configurable weights for final grade calculation
- **Rich Text Support**: TipTap integration for notes and custom text
- **Import/Export**: JSON-based configuration persistence
- **Drag & Drop**: Uses @dnd-kit for reordering sections/criteria
- **Visual Analytics**: Recharts integration for progress visualization

### File Organization

```
src/
├── app/              # Next.js app router (layout, page, globals)
├── components/       # React components
│   ├── providers/    # Context providers for state management
│   ├── dialogs/      # Modal components
│   └── ui/          # shadcn/ui components
└── lib/
    ├── config/      # Configuration files and templates
    ├── types/       # TypeScript type definitions
    └── utils/       # Utility functions for calculations and text generation
```

### Component Path Resolution

The project uses TypeScript path mapping with `@/*` pointing to `./src/*` for clean imports.

### UI Framework

Built with shadcn/ui components on top of Radix UI primitives and Tailwind CSS. All UI components are in `src/components/ui/` and follow the shadcn/ui patterns.