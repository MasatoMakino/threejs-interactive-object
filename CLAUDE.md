# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## DevContainer Environment

This project uses DevContainer for isolated npm execution to prevent supply chain attacks.

### Required Setup
- Docker Desktop installed and running
- DevContainer CLI installed (`npm install -g @devcontainers/cli`)

### Container Management

#### Starting Container
- `devcontainer up --workspace-folder .` - Start the development container

#### Executing Commands
- `devcontainer exec --workspace-folder . <command>` - Execute command in container

#### Restarting Container
**Important**: Always use this procedure to restart the container. Using `docker start` alone will not apply DevContainer configuration (e.g., `--shm-size=2g`).

```bash
# 1. Stop the container
docker stop threejs-interactive-object-npm-runner

# 2. Start with DevContainer configuration
devcontainer up --workspace-folder .
```

**When to restart**:
- After KillShell forcefully terminates a hung test process (orphaned Chrome processes remain)
- After extended development sessions with watch mode
- When "Port 63315 is in use" messages appear

### Important Policy
- **Host OS npm/npx execution is prohibited** for security isolation
- All npm/npx commands must be executed through `devcontainer exec`
- Git hooks automatically use devcontainer for code quality checks

### Container Details
- **Image**: Node 22 (bookworm-slim) with Chrome and xvfb
- **Container Name**: `threejs-interactive-object-npm-runner`
- **Ports**: 3000 (Dev Server), 3001 (Dev Server UI)

## Development Commands

### Build and Development
- `devcontainer exec --workspace-folder . npm run build` - Full build: TypeScript compilation, demo generation, and API docs
- `devcontainer exec --workspace-folder . npm run buildTS` - TypeScript compilation only
- `devcontainer exec --workspace-folder . npm run start:dev` - Start comprehensive development environment (runs server, TypeScript watch, and demo watch in parallel)
- `devcontainer exec --workspace-folder . npm run server` - Start browser-sync server for demo pages with live reload
- `devcontainer exec --workspace-folder . npm run watch:tsc` - TypeScript compilation in watch mode with incremental builds
- `devcontainer exec --workspace-folder . npm run watch:demo` - Demo page generation in watch mode

### Testing
- `devcontainer exec --workspace-folder . npm run test:ci` - Run all tests with virtual display (for DevContainer/CI)
- `devcontainer exec --workspace-folder . npm run test:watch:ci` - Run tests in watch mode with virtual display
- `devcontainer exec --workspace-folder . npm run coverage:ci` - Generate comprehensive test coverage report with virtual display

> **Important**: Always use commands with `:ci` suffix in DevContainer (`test:ci`, `test:watch:ci`, `coverage:ci`). Commands without `:ci` suffix are kept only for backward compatibility and should not be used.

### Code Quality
- `devcontainer exec --workspace-folder . npx biome check` - Run linter and formatter
- `devcontainer exec --workspace-folder . npx biome check --write` - Run linter and formatter with auto-fix

### Documentation
- `devcontainer exec --workspace-folder . npm run typedocs` - Generate TypeDoc API documentation
- `devcontainer exec --workspace-folder . npm run demo` - Generate demo pages with custom canvas element and ES2020 compilation target

## Architecture Overview

This is a TypeScript library for creating mouse-interactive objects in Three.js applications. The architecture follows a clear separation of concerns:

### Core Components

**MouseEventManager** (`src/MouseEventManager.ts`)
- Central event dispatcher that handles mouse interactions on canvas
- Uses raycasting to detect object intersections
- Manages throttling for performance (33ms default)
- Identifies interactive objects via `IClickableObject3D` interface

**Interactive Views** (`src/view/`)
- `InteractiveMesh.ts` - Mesh-based interactive objects:
  - `InteractiveMesh<Value, InteractionHandler>` - **@internal** Generic base class (not exported; use concrete subclasses)
    - `ClickableMesh<Value>` - Basic clickable mesh with button-like behavior
    - `CheckBoxMesh<Value>` - Checkbox mesh with toggle selection behavior  
    - `RadioButtonMesh<Value>` - Radio button mesh with exclusive selection behavior
- `InteractiveSprite.ts` - Sprite-based interactive objects:
  - `InteractiveSprite<Value, Handler>` - **@internal** Generic base class (not exported; use concrete subclasses)
    - `ClickableSprite<Value>` - Basic clickable sprite with button-like behavior
    - `CheckBoxSprite<Value>` - Checkbox sprite with toggle selection behavior
    - `RadioButtonSprite<Value>` - Radio button sprite with exclusive selection behavior
- `ClickableGroup.ts` - Group-based interactive container:
  - `ClickableGroup<Value>` - Interactive Three.js Group with UUID-based collision deduplication

**Interaction Handlers** (`src/interactionHandler/`)
- `ButtonInteractionHandler` - Base interaction logic with EventEmitter
- `CheckBoxInteractionHandler` - Checkbox-specific behavior (toggle state)
- `RadioButtonInteractionHandler` - Radio button behavior (exclusive selection)

**State Management** (`src/StateMaterial.ts`)
- `StateMaterial` - Wraps Three.js materials with opacity management
- `StateMaterialSet` - Manages materials for different interaction states (normal, over, down, disable, selected variants)

**Group Management** (`src/`)
- `RadioButtonManager.ts` - Exclusive selection coordinator for radio button groups; extends EventEmitter for selection change notifications

### Utility Components

- `resizeCanvasStyle.ts` - Canvas size adjustment utility with aspect ratio preservation
- `ThreeMouseEventUtil.ts` - Mouse event object manipulation utilities (getSelection, generate, clone)
- `ViewPortUtil.ts` - Viewport coordinate transformation utilities (convertToRectangle, isContain, convertToMousePosition)
- `convertToInteractiveView.ts` - Conversion utilities for existing Three.js objects (convertToClickableMesh, convertToCheckboxMesh, convertToRadioButtonMesh)

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
  - `__test__/__screenshots__/` - **GIT-IGNORED** debug screenshots (captured on test failures)
- `coverage/` - **AUTO-GENERATED** test coverage reports (Istanbul provider)
- `docs/` - **AUTO-GENERATED** documentation and demo pages (**DO NOT EDIT**)
- `demoSrc/` - Demo assets and source files
- `node_modules/` - Dependencies (standard npm directory)

### Important: docs/ Directory Handling

**The `docs/` directory is completely auto-generated and should never be manually edited:**

- **Generated by**: 
  - `npm run demo` command → generates `docs/demo/` (using @masatomakino/gulptask-demo-page)
  - `npm run typedocs` command → generates `docs/api/` (using TypeDoc)
- **Contains**: 
  - `docs/api/` - TypeDoc-generated API documentation from JSDoc comments
  - `docs/demo/` - Demo pages compiled from `demoSrc/`
- **Regeneration**: 
  - `docs/demo/` regenerated every time `npm run demo` or `npm run build` is executed
  - `docs/api/` regenerated every time `npm run typedocs` or `npm run build` is executed
- **⚠️ Warning**: Any manual changes to files in `docs/` will be **completely overwritten** and lost
- **Source of truth**: 
  - For API docs: JSDoc comments in `src/` files
  - For demo pages: Source files in `demoSrc/`

**To update documentation:**
- **API documentation**: Edit JSDoc comments in source files, then run `npm run typedocs`
- **Demo pages**: Edit files in `demoSrc/`, then run `npm run demo`
- **Do not** directly edit anything in the `docs/` directory

## Testing Strategy

This project implements a comprehensive browser-based testing strategy with **25 test files** to ensure robust Three.js interaction behavior.

### Testing Infrastructure

#### Browser Automation
- **WebDriverIO Provider**: Tests execute in actual Chrome browser (headless mode)
- **Real DOM/WebGL**: No mocking - tests verify actual Three.js rendering and interaction behavior
- **Vitest Framework**: Modern testing framework with browser automation integration
- **Istanbul Coverage**: Comprehensive code coverage reporting (text, lcov, json formats)

### Test Categories

#### Core Component Tests
- `MouseEventManager.*.spec.ts` (7 files) - Event manager functionality, throttling, raycasting, edge cases
- `ButtonInteractionHandler.*.spec.ts` (1 file) - Base interaction logic and event object validation  
- `CheckBoxInteractionHandler.spec.ts` - Toggle behavior, state management, event emission
- `RadioButtonInteractionHandler.spec.ts` - Exclusive selection logic and RadioButtonManager integration

#### View Layer Tests
- Interactive mesh, sprite, and group component testing
- Material state transitions and visual feedback verification
- Generic value type handling and event propagation

#### Edge Case & Integration Tests
- `MouseEventManager.edge-cases.spec.ts` - Error handling, corrupted objects, boundary conditions
- `MouseEventManager.overlapping.spec.ts` - Complex collision scenarios and Z-depth processing
- Complex state transition sequences and mixed user/programmatic operations

#### Utility & Helper Tests
- Viewport coordinate transformation utilities
- Canvas resizing with aspect ratio preservation  
- Three.js object conversion utilities
- Mouse event manipulation helpers

### Debug & Development Tools

**Debug Screenshots** (Git-ignored)
- Automatic screenshot capture on test failures for debugging
- Screenshots stored in `__test__/__screenshots__/` (environment-dependent, not version-controlled)
- Used for manual debugging of visual rendering issues, not automated validation

### Performance & Throttling Tests

**Real-world Performance Validation**
- RAF (RequestAnimationFrame) ticker integration testing
- Throttling behavior verification with configurable intervals
- High-frequency event stress testing
- Event handler cleanup verification (dispose method testing)

### Test Scope Philosophy

**Test Responsibility Boundaries**
This project's testing strategy focuses on validating functionality within defined responsibility boundaries:
- **Application Layer**: MouseEventManager functional behavior and API contract compliance
- **Error Handling**: Recovery mechanisms within the application layer
- **Integration**: Three.js and DOM API integration under adverse conditions
- **Configuration**: Value validity and range checking for user-configurable options

**Explicit Testing Exclusions**
The following areas are intentionally excluded from test coverage to maintain practical scope:
- **Type System Validation**: TypeScript type checking and primitive type validation (handled by TypeScript compiler)
- **Runtime Environment**: JavaScript engine memory corruption or low-level runtime failures
- **Browser Implementation**: Browser-specific bugs, inconsistencies, or non-standard behaviors
- **System Level**: Operating system or hardware-level failures
- **Security Attacks**: Prototype pollution attacks or malicious code injection scenarios

**Design Rationale**
This project operates within TypeScript's type safety guarantees and standard browser JavaScript execution environments. Testing scenarios that assume fundamental system failures would lead to infinite test expansion and maintenance complexity without practical value for the library's intended use cases. The testing strategy prioritizes real-world robustness while avoiding theoretical edge cases that fall outside the project's operational environment.

## Build System

- TypeScript compilation to ES2022 modules
- Biome for linting/formatting (replaces ESLint/Prettier)
- Vitest for testing with browser automation
- TypeDoc for API documentation generation
- Custom git hooks with DevContainer integration for pre-commit/pre-push checks

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
   - Follow Pull Request guidelines for reviewer load reduction
   - Link related issues using keywords (closes #123)
   - Use draft PRs for early feedback on work-in-progress

4. **Address Review Comments**
   - Respond to reviewer suggestions promptly
   - Continue committing and pushing changes to the same branch
   - Collaborate through line-specific or general comments

5. **Merge Pull Request**
   - Must satisfy **all** branch protection requirements before merging is allowed:
     - ✅ All automated status checks pass (TypeScript compilation, code quality, tests)
   - See [Branch Protection Rules](#branch-protection-rules) below for complete details
   - Use "Squash and merge" for cleaner history when appropriate
   - GitHub automatically prevents merging until all protection requirements are satisfied
   - **Auto-deployment**: After successful merge to `main`, demo pages and API documentation are automatically deployed to GitHub Pages

6. **Delete Branch**
   - Remove feature branch after successful merge
   - Indicates work completion and keeps repository clean

### Branch Protection Rules

This project enforces strict branch protection on the `main` branch:

- ❌ Direct push blocked: Cannot push commits directly to `main` branch
- ✅ Pull request required: All changes must go through pull request process
- Status checks required: CI workflows must pass before merging:
  - `TypeScript compilation` - Validates code compiles without errors (`npx tsc --noEmit`)
  - `Code quality checks` - Ensures code style and quality standards (`npx biome ci .`)
  - `Test suite execution` - Verifies all tests pass (`npm run test:ci`)
- Admin enforcement: Branch protection rules apply to all users including admins

### Key Principles

- **One branch per feature/fix**: Create separate branches for unrelated changes
- **Short-lived branches**: Keep branches focused and merge quickly
- **Continuous integration**: All changes go through pull request review and automated testing
- **Main branch stability**: `main` branch should always be deployable and protected by enforced status checks

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

## Text Styling Guidelines

@.claude/fragments/documentation/text-styling-guidelines.md

## JSDoc Documentation Guidelines

@.claude/fragments/documentation/jsdoc-guidelines.md

## Pull Request Guidelines

@.claude/fragments/documentation/pull-request-guidelines.md
