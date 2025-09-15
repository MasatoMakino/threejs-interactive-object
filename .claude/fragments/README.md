# CLAUDE.md Fragments Directory

This directory implements a modular fragment management system for CLAUDE.md using Claude Code's @import functionality.

## Purpose

- **Modularization**: Split large CLAUDE.md into logical, manageable sections
- **Maintainability**: Enable independent editing and updates of individual sections
- **Reusability**: Provide universal content applicable across different projects
- **Context Integration**: Allow Claude Code to retrieve related information in a single file read

## Usage

### Import Syntax

Reference from main CLAUDE.md:
```markdown
## Section Name
@.claude/fragments/category/filename.md
```

### Directory Structure

```
.claude/fragments/
├── README.md                    # This file
└── documentation/              # Documentation-related content
    └── jsdoc-guidelines.md     # JSDoc best practices
```

## Important Notes

### Project-Shared Content

**⚠️ This directory content is shared across the project**

- **Git Managed**: All files are under version control
- **Team Shared**: Distributed to all members via Pull Requests
- **Project Standards**: Functions as common team guidelines and conventions

**Use `.local-note/` directory for personal notes**

### Creation Guidelines

**Universal Applicability**:
- Minimize project-specific information
- Create content applicable to other projects
- Avoid technology stack dependencies

**Quality Standards**:
- Structure optimized for LLM agent understanding
- Include concrete examples and practical guidance
- Consider ease of updates and maintenance

**Naming Conventions**:
- Files: `kebab-case.md`
- Directories: Logical functional grouping
- Clear names that indicate content

## Import Functionality Constraints

Claude Code @import limitations:

- **Recursion Depth**: Maximum 5 levels
- **Relative Paths**: Recommended from `.claude/`
- **Code Blocks**: @import not evaluated inside code blocks

## Existing Sections

### documentation/

**jsdoc-guidelines.md**
- LLM-first JSDoc documentation approach
- @motivation/@scope custom tag system
- Contract-focused @description methodology
- Comparative expression prohibition principles
- IDE optimization considerations

## Future Extensions

Planned sections for future addition:

- `architecture/` - System design and architecture documents
- `testing/` - Testing strategies and quality assurance
- `workflow/` - Development flow and process definitions
- `tools/` - Development tool configuration and usage

## Operational Policy

**Update Frequency**: As needed basis
**Review Process**: Quality assurance via Pull Requests
**Version Control**: Change tracking through Git history
**Compatibility**: Updates must not break existing imports