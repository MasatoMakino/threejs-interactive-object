# Cross-Platform Text Styling Guidelines

This document establishes consistent text styling standards across all project documentation including README, Pull Requests, Issues, Wiki pages, and commit messages. These guidelines prioritize professionalism, readability, and GitHub platform optimization.

## Core Principles

### Professional Documentation Standards
- Maintain high professionalism across all platforms
- Prioritize readability and accessibility
- Ensure consistency in style and structure
- Optimize for GitHub's markdown rendering

### Minimalist Visual Approach
- Reduce visual noise and distractions
- Focus on content structure over decoration
- Use visual elements only when technically necessary
- Preserve document professionalism

## Emoji Usage Guidelines

### Strict Limitation Policy
**Emoji usage should be extremely limited and avoided whenever possible.** Only 3 emoji types are permitted as a last resort when no other method exists for critical user attention:

#### Permitted Emojis (Last Resort Only)
- **✅ Green Check**: Good examples, recommended approaches, correct methods, best practices
- **❌ Red X**: Bad examples, deprecated approaches, incorrect methods, practices to avoid  
- **⚠️ Warning**: Conditional usage, requires caution, has risks, context-dependent

#### Use Only When
- Text alternatives cannot adequately convey critical safety or correctness information
- Quick visual distinction is essential for preventing user errors
- Code examples require immediate good/bad/caution identification

#### Prohibited Emojis
- Decorative emojis (🎉, 🚀, 💡, etc.)
- Emotional expressions (😀, 👍, ❤️, etc.)
- Status indicators (📝, 📋, ✨, etc.)
- Information symbols (ℹ️, 📖, 💭, etc.)
- All other emojis not listed above

#### Approved Usage Contexts (Minimal Use)
**Consider text alternatives first. Use emojis only when absolutely necessary for:**
- Critical code safety warnings that could cause system damage
- Dangerous configuration examples that must be immediately recognizable
- Security-related good/bad practice distinctions where errors have serious consequences

#### Prefer Text Alternatives For
- General code quality evaluation → Use headings and text labels
- Routine technical comparisons → Use structured lists
- Standard implementation guidance → Use Alert notation

#### Usage Examples

#### Critical Safety Examples (Emoji Justified)
```markdown
#### Security Configuration Examples
- ✅ Secure: `process.env.API_KEY` // Environment variable
- ❌ Dangerous: `const API_KEY = "sk-1234..."` // Hardcoded secret
- ⚠️ Risk: `config.apiKey` // Ensure config file is excluded from version control

#### Database Operations
- ✅ Safe: `db.query(sql, [userInput])` // Parameterized query
- ❌ Vulnerable: `db.query("SELECT * FROM users WHERE id = " + userInput)` // SQL injection risk
- ⚠️ Conditional: `db.query(trustedQuery)` // Only with validated trusted input
```

#### Preferred Text Alternatives for Routine Cases
```markdown
#### Code Style Comparison
> [!TIP]
> Use const for immutable values to prevent accidental reassignment.

**Recommended approach:** `const API_URL = 'https://api.example.com'`
**Avoid:** `var API_URL = 'https://api.example.com'`

#### Implementation Options
**Option A: Connection Pooling**
- Advantages: Better performance, resource management
- Use case: Production applications

**Option B: Direct Connections**  
- Advantages: Simpler setup
- Use case: Development or lightweight applications
```

### Text-Based Alternatives

#### Status and Progress Display
Replace emoji-based status with text labels:

```markdown
#### Implementation Status
- Completed: User authentication feature
- In Progress: Database optimization
- Not Implemented: Real-time notifications

#### Feature Checklist
- [x] API endpoint design
- [ ] Frontend implementation  
- [ ] Test automation
- [ ] Performance optimization
```

#### Information Classification
Use text labels for information categorization:

```markdown
**Note:** This feature is available from version 1.5.
**Reference:** See official documentation for detailed configuration.
**Important:** Take backup before execution.
**Caution:** This operation cannot be undone.
**Tip:** Enable cache functionality for performance improvement.
```

## Bold Expression Minimization

### Usage Restriction Policy
Bold expressions should be minimized and used only for specific emphasis within long sentences.

#### Permitted Bold Usage
- **Specific word emphasis** within long sentences
- **Text labels** for information classification (Note:, Important:, etc.)

#### Prohibited Bold Usage
- Section headers (use proper heading levels instead)
- List item emphasis (use bullet structure instead)
- Bullet point prefixes or status indicators
- Code or technical terms (use code blocks instead)
- Entire sentences or phrases

#### Conversion Guidelines

#### Replace Bold Headers with Proper Headings
```markdown
❌ **Configuration Options**
✅ #### Configuration Options
```

#### Replace Bold Lists with Structured Lists
```markdown
❌ **Requirements:**
   - Node.js: Version 16+
   - NPM: Version 8+

✅ #### Requirements
   - Node.js: Version 16+
   - NPM: Version 8+
```

## GitHub Alert Notation Standards

### Alert Types and Usage
GitHub Alert notation provides structured emphasis for important information:

```markdown
> [!NOTE]
> Reference information and supplementary details

> [!TIP]
> Performance hints and optimization suggestions

> [!IMPORTANT]
> Critical information requiring attention

> [!WARNING]
> Important warnings about potential issues

> [!CAUTION]
> Critical warnings about dangerous operations
```

### Alert vs. Emoji Usage Decision

#### Use Alert Notation For
- Multi-line important notices
- Section-wide warnings or information
- Hierarchical importance levels
- Detailed explanations and references

#### Use Emojis For
- Single-line code example evaluation
- Brief technical approach assessment
- Inline good/bad practice indication

#### Combined Usage Example
```markdown
> [!WARNING]
> The following database migration is irreversible. Ensure you have a complete backup.

#### Migration Commands
- ✅ Recommended: `npm run migrate:safe`
- ❌ Dangerous: `npm run migrate:force`
- ⚠️ Manual: `npm run migrate:custom` // Requires database expertise
```

## @ Symbol Usage Guidelines

### Prohibited Usage
Avoid @ symbols that may trigger unintended GitHub user mentions:

#### Common Problematic Cases
- JSDoc tags: `@param`, `@returns`, `@since`
- Technical terms: `@example tags`, `@decorator syntax`
- Framework features: `@Component`, `@Injectable`

#### Escaping Methods
Use code blocks to safely reference @ symbols:
```markdown
❌ Use @param to document function parameters
✅ Use `@param` to document function parameters

❌ Add @returns and @throws documentation
✅ Add `@param`, `@returns`, and `@throws` documentation
```

#### Alternative Expressions
Replace direct @ usage with descriptive terms:
```markdown
❌ @param tags for better developer experience
✅ JSDoc parameter tags for better developer experience
✅ Parameter documentation tags for better developer experience
```

### Permitted Usage
@ symbols are acceptable in these contexts:

#### Email Addresses
- <mailto:contact@example.com>
- <mailto:support@example.org>
- <mailto:developer@example.net>

#### URL Contexts
- <https://github.com/username/repository>
- `npm install @scope/package-name`
- <https://docs.example.com/@latest/api>

#### Official Documentation References
When referencing official documentation that uses @ symbols in their standard notation.

## Platform-Specific Guidelines

### README.md
- Use structured headings for clear navigation
- Apply Alert notation for important setup information
- Employ text-based status indicators for project status
- Limit emoji usage to code example evaluation only

#### Example Structure
```markdown
# Project Name

## Installation

> [!IMPORTANT]
> Node.js version 16 or higher is required.

#### Package Manager Options
- ✅ Recommended: `npm install package-name`
- ⚠️ Alternative: `yarn add package-name` // Ensure version compatibility

## Status
- Development: Active
- Documentation: Complete
- Testing: In Progress
```

### Pull Requests
Follow comprehensive Pull Request guidelines for reviewer load reduction:

> [!IMPORTANT]
> See `@.claude/fragments/documentation/pull-request-guidelines.md` for complete guidelines.

#### Key Principles for Text Styling
- **Out-of-Scope Emphasis** - Explicitly state what reviewers should NOT examine
- **Issue-First Motivation** - Link to GitHub Issues when available
- **Reviewer Load Reduction** - Structure information to minimize cognitive overhead
- **CodeRabbit Complement** - Focus on human decisions, not code analysis

#### Essential Structure
```markdown
## Summary
Brief one-sentence description of change and motivation.

## Motivation
Resolves #123 - [Issue summary] OR [Development context when no issue exists]

## Out of Scope
- **Component X**: Specific reason why unchanged
- **Feature Y**: Justification for deferral  
- **System Z**: Explanation of intentional non-modification

## Scope
### Target
- Specific changes made

### Dependencies
- Integration points affected

### Boundaries
- Clear limits of PR responsibility
```

#### Text Styling Applications
- **Alert Notation**: Use GitHub alerts for critical review guidance
- **Emoji Limitation**: Only ✅❌⚠️ for code example evaluation
- **@ Symbol Safety**: Escape JSDoc references in code blocks
- **Professional Structure**: Clear headings without bold emphasis

### Issues
Structure issues for clear problem identification and resolution:

#### Bug Reports
```markdown
## Problem Description
Clear description of the issue.

## Reproduction Steps
1. Step one
2. Step two
3. Step three

## Expected vs. Actual Behavior
#### Expected
What should happen.

#### Actual
What actually happens.

## Environment
- OS: macOS 13.0
- Browser: Chrome 120
- Version: 2.1.0

## Solution Analysis
- ✅ Viable: Update dependency version
- ❌ Not Viable: Complete rewrite
- ⚠️ Complex: Modify core architecture // Requires careful planning
```

#### Feature Requests
```markdown
## Feature Description
Detailed description of the requested feature.

## Motivation
Why this feature is needed and what problem it solves.

## Proposed Implementation
#### Approach Options
- ✅ Recommended: Extend existing API
- ❌ Discouraged: Create separate service
- ⚠️ Alternative: Modify core behavior // May affect backward compatibility

> [!NOTE]
> Consider backward compatibility requirements.
```

### Wiki and Long-Form Documentation
- Establish clear chapter hierarchy with proper headings
- Use Alert notation for section-wide warnings
- Apply text labels for information classification
- Reserve emoji usage for technical comparisons

### Commit Messages
- Eliminate emoji usage
- Avoid @ symbol usage entirely
- Focus on clear, concise change descriptions
- Follow conventional commit format when applicable

#### @ Symbol Restrictions in Commit Messages
Since commit messages are plain text (not Markdown), code block escaping does not work. Always replace @ symbols with alternative expressions:

**Prohibited in Commit Messages:**
```
❌ docs: add @param documentation to utility functions
❌ feat: implement @Component decorator for views
❌ fix: resolve @returns type annotation issues
```

**Required Alternative Expressions:**
```
✅ docs: add parameter documentation to utility functions
✅ feat: implement Component decorator for views  
✅ fix: resolve return type annotation issues
✅ docs: add JSDoc param tags to helper methods
✅ refactor: update function parameter documentation
```

#### Good Commit Message Examples
```
feat: add user authentication middleware
fix: resolve memory leak in data processing
docs: update API documentation for v2.0
refactor: simplify database connection logic
docs: add JSDoc parameter documentation
feat: implement component decorator pattern
```

## Quality Verification Checklist

### Emoji Usage Verification
- [ ] Emoji usage minimized to absolute necessity only?
- [ ] Text alternatives considered and rejected before using emojis?
- [ ] Only ✅❌⚠️ emojis used for critical safety warnings?
- [ ] No decorative or status emojis present?
- [ ] Routine comparisons use text alternatives instead of emojis?
- [ ] Status displays use text labels instead of emojis?

### Bold Expression Verification
- [ ] Bold used only for specific word emphasis in long sentences?
- [ ] Headers converted to proper heading levels?
- [ ] List items restructured without bold emphasis?
- [ ] Text labels properly formatted?

### @ Symbol Safety Verification
- [ ] No unescaped JSDoc tags or technical terms?
- [ ] Code blocks used for @ symbol references in Markdown?
- [ ] Alternative expressions used in commit messages?
- [ ] Email addresses and URLs properly contextualized?
- [ ] No risk of unintended user mentions?

### Structure and Readability Verification
- [ ] Clear heading hierarchy established?
- [ ] Alert notation used appropriately?
- [ ] Information properly categorized with text labels?
- [ ] Overall professional appearance maintained?

### Platform-Specific Compliance
- [ ] README structure optimized for project overview?
- [ ] PR follows Summary/Motivation/Scope format?
- [ ] Issues provide clear problem/solution structure?
- [ ] Commit messages are concise and descriptive?

## Integration with Existing Guidelines

### Relationship to JSDoc Guidelines
These text styling guidelines complement the existing JSDoc documentation guidelines by:
- Extending the motivation/scope approach to PR and Issue structure
- Maintaining consistent professional standards across all documentation
- Applying the same quality verification principles

### GitHub Platform Optimization
All guidelines are optimized for GitHub's markdown rendering and platform features:
- Alert notation utilizes GitHub's native alert system
- @ symbol guidelines prevent unintended mentions
- Emoji limitations maintain professional appearance
- Structure guidelines enhance readability in GitHub's interface

This comprehensive styling guide ensures consistent, professional, and effective communication across all project documentation platforms while optimizing for technical clarity and GitHub platform best practices.