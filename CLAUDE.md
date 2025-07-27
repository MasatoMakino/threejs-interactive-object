# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run build` - Full build: TypeScript compilation, demo generation, and API docs
- `npm run buildTS` - TypeScript compilation only
- `npm run start:dev` - Start development server with file watching

### Testing
- `npm test` - Run all tests using Vitest with Chrome browser
- `npm run test:watch` - Run tests in watch mode
- `npm run coverage` - Generate test coverage report

### Code Quality
- `npx biome check` - Run linter and formatter
- `npx biome check --write` - Run linter and formatter with auto-fix

### Documentation
- `npm run typedocs` - Generate TypeDoc API documentation
- `npm run demo` - Generate demo pages

## Architecture Overview

This is a TypeScript library for creating mouse-interactive objects in Three.js applications. The architecture follows a clear separation of concerns:

### Core Components

**MouseEventManager** (`src/MouseEventManager.ts`)
- Central event dispatcher that handles mouse interactions on canvas
- Uses raycasting to detect object intersections
- Manages throttling for performance (33ms default)
- Identifies interactive objects via `IClickableObject3D` interface

**Interactive Views** (`src/view/`)
- `InteractiveMesh` - Base class for interactive 3D meshes
- `ClickableMesh` - Basic clickable mesh implementation
- `CheckBoxMesh` - Checkbox-style interactive mesh
- `RadioButtonMesh` - Radio button-style interactive mesh
- Similar sprite and group variants available

**Interaction Handlers** (`src/interactionHandler/`)
- `ButtonInteractionHandler` - Base interaction logic with EventEmitter
- `CheckBoxInteractionHandler` - Checkbox-specific behavior (toggle state)
- `RadioButtonInteractionHandler` - Radio button behavior (exclusive selection)

**State Management** (`src/StateMaterial.ts`)
- `StateMaterial` - Wraps Three.js materials with opacity management
- `StateMaterialSet` - Manages materials for different interaction states (normal, over, down, disable, selected variants)

### Key Patterns

**Event-Driven Architecture**
Interactive objects extend EventEmitter and emit standardized events:
- `click`, `down`, `up`, `over`, `out`
- Events include typed `ThreeMouseEvent` with target reference

**Interface-Based Detection**
Objects become interactive by implementing `IClickableObject3D<Value>`:
```typescript
interface IClickableObject3D<Value> {
  interactionHandler: ButtonInteractionHandler<Value>;
}
```

**Generic Value System**
All interactive objects support a generic `Value` type for associating arbitrary data with UI elements.

**Conversion Utilities** (`src/convertToInteractiveView.ts`)
Functions like `convertToClickableMesh()` allow converting existing Three.js meshes to interactive objects without reconstruction.

## Project Structure

- `src/` - Source TypeScript files
- `esm/` - Compiled ES modules (build output)
- `__test__/` - Vitest test files with browser automation
- `docs/` - Generated documentation and demo pages
- `demoSrc/` - Demo assets and source files

## Testing Strategy

Tests run in actual Chrome browser using WebDriverIO provider. This ensures real DOM/WebGL behavior rather than mocked environments. Tests verify mouse interaction behavior, state transitions, and event emission.

## Build System

- TypeScript compilation to ES2022 modules
- Biome for linting/formatting (replaces ESLint/Prettier)
- Vitest for testing with browser automation
- TypeDoc for API documentation generation
- Husky + lint-staged for pre-commit hooks

## Git Branch Strategy

This project follows [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) as the branch strategy:

### Workflow Steps

1. **Create a Branch**
   - Create descriptive branch names (e.g., `feature/add-hover-effects`, `fix/memory-leak`)
   - Branch from `main` for all new work
   - Each branch represents a safe workspace for isolated changes

2. **Make Changes**
   - Commit changes with clear, descriptive messages
   - Push changes to remote branch regularly
   - Make isolated and complete changes in each commit

3. **Create a Pull Request**
   - Request feedback from collaborators before merging
   - Summarize changes and problems solved
   - Link related issues using keywords (closes #123)
   - Use draft PRs for early feedback on work-in-progress

4. **Address Review Comments**
   - Respond to reviewer suggestions promptly
   - Continue committing and pushing changes to the same branch
   - Collaborate through line-specific or general comments

5. **Merge Pull Request**
   - Merge only after approval and CI passes
   - Use "Squash and merge" for cleaner history when appropriate
   - Automatically integrates branch into `main`

6. **Delete Branch**
   - Remove feature branch after successful merge
   - Indicates work completion and keeps repository clean

### Key Principles

- **One branch per feature/fix**: Create separate branches for unrelated changes
- **Short-lived branches**: Keep branches focused and merge quickly
- **Continuous integration**: All changes go through pull request review
- **Main branch stability**: `main` branch should always be deployable

## Local Work Notes Strategy

This project uses a local note system for personal thought organization and work efficiency improvement.

### Directory Structure

**`.local-note/`** - Personal work notes directory (not shared with team)
- Git-ignored for privacy
- Individual developer workspace for ideas and investigation notes

### Usage Workflow

1. **Create Work Notes**
   - File naming: `YYYY-MM-DD-brief-description.md`
   - Store ideas, investigation notes, and work-in-progress thoughts
   - Use `/new-note` command (future implementation) or manual creation

2. **Note Escalation to Issues**
   - When a problem requires team attention, create GitHub Issue
   - Transfer note content to Issue description
   - Delete original work note file

3. **Work Completion**
   - Include note content in PR description when completing work
   - Delete work note file after PR creation
   - Maintains clean local workspace

### Benefits

- **Privacy**: Individual thinking space without team exposure
- **Efficiency**: Quick note-taking without formal Issue overhead
- **Organization**: Structured approach to personal task management
- **Quality**: Thoughtful preparation before creating Issues/PRs