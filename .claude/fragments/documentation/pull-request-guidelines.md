# LLM-Collaborative Pull Request Guidelines

This document establishes Pull Request title and message guidelines optimized for **reviewer load reduction** in LLM-collaborative development environments. These guidelines complement automated code analysis tools like CodeRabbit by focusing on human decision context and explicit scope boundaries.

## Core Philosophy

### Primary Goal: Minimize Reviewer Cognitive Load

In LLM-collaborative development, code review becomes the primary bottleneck. Traditional PR descriptions that summarize code changes waste reviewer time since automated tools already provide detailed code analysis. Instead, focus on:

- **Explicit out-of-scope items** - What reviewers should NOT examine
- **Human decision context** - Information automation cannot infer  
- **Scope boundaries** - Clear limits of PR responsibility
- **Strategic review guidance** - Where human attention is most valuable

### Reviewer Load Reduction Theory

#### Cognitive Load Components
- Intrinsic Load: Understanding the actual changes
- Extraneous Load: Determining what to review vs. ignore
- Germane Load: Connecting changes to broader context

#### Optimization Strategy
- Reduce extraneous load through explicit out-of-scope documentation
- Minimize intrinsic load by providing clear change boundaries
- Support germane load with motivation and constraint context

## Pull Request Title Guidelines

### Format Structure
```
type(scope): motivation-focused description
```

### Title Components

#### Type Categories
- `feat`: New functionality or capability
- `fix`: Bug resolution or error correction
- `refactor`: Code restructuring without behavior change
- `docs`: Documentation additions or improvements
- `test`: Test coverage or testing infrastructure
- `chore`: Maintenance tasks, dependency updates

#### Scope Specification
- Component or system affected (e.g., `auth`, `api`, `ui`)
- Use existing codebase terminology
- Keep concise but specific

#### Motivation-Focused Description
- Lead with WHY rather than WHAT
- Avoid comparative expressions without clear targets
- Focus on problem solved or capability enabled

### Good Title Examples
```
feat(auth): enable multi-factor authentication for enhanced security
fix(api): resolve memory leak in connection pooling under high load
refactor(ui): extract reusable button components for design system consistency
docs(api): add JSDoc parameter documentation for external integrators
```

### Poor Title Examples
```
❌ feat: add better authentication (vague, comparative without target)
❌ fix: improve API performance (what specific problem?)
❌ refactor: clean up UI code (no motivation provided)
❌ docs: update documentation (too generic)
```

## Pull Request Message Structure

### Required Sections

#### 1. Summary (Quick Scan)
Single sentence describing the change and primary motivation.

#### 2. Motivation (Context Priority)

#### First Priority - Issue Reference
```markdown
## Motivation
Resolves #123 - Authentication system lacks multi-factor support for enterprise users
```

#### Fallback - Development Context
```markdown
## Motivation
Customer feedback indicated security concerns with single-factor authentication. Technical analysis revealed current system architecture supports MFA addition without breaking changes.
```

#### Information to Include
- Problem that required human judgment
- Business or technical constraints
- Alternative approaches considered and rejected
- Decision rationale not inferable by automated analysis

#### 3. Out of Scope (Critical for Load Reduction)

#### Purpose
Explicitly state what reviewers should NOT examine

#### Structure
```markdown
## Out of Scope
- Database schema changes - No migrations in this PR, existing auth tables sufficient
- Frontend login UI - Current forms support new flow, visual updates deferred to #124  
- Legacy authentication - Existing single-factor flow unchanged for backward compatibility
- Performance optimization - MFA implementation prioritizes security over speed
```

#### Benefits
- Reviewers can safely ignore listed components
- Prevents scope creep during review
- Reduces cognitive overhead
- Clarifies intentional decisions

#### 4. Scope (Precise Boundaries)

#### Target - What is Modified
```markdown
### Target
- Authentication middleware for MFA token validation
- User model extension for MFA preferences
- API endpoints: `/auth/mfa/setup`, `/auth/mfa/verify`
- Configuration system for MFA providers
```

#### Dependencies - Integration Points
```markdown
### Dependencies
- Existing session management (extended, not replaced)
- Current user database schema (new optional columns)
- Email service for token delivery (existing infrastructure)
```

#### Boundaries - Where Changes End
```markdown
### Boundaries
- Changes limited to authentication layer
- No modifications to authorization logic
- Frontend integration points defined but implementation separate
- Third-party MFA providers configured but not integrated
```

#### 5. Review Guidance (Optional but Helpful)

#### Human Attention Areas
```markdown
## Review Guidance
### Focus Areas
- Security token generation and validation logic
- Database migration safety and rollback procedures
- API contract compatibility with existing clients

```

### Template Structure

```markdown
## Summary
Brief one-sentence description of change and motivation.

## Motivation
[Issue reference with summary OR development context extraction]

## Out of Scope
- **Component X**: Specific reason why unchanged
- **Feature Y**: Justification for deferral
- **System Z**: Explanation of intentional non-modification

## Scope
### Target
- Specific changes made
- Components modified

### Dependencies  
- Integration points affected
- Existing systems extended

### Boundaries
- Clear limits of PR responsibility
- Where changes end

## Review Guidance (Optional)
### Focus Areas
- Areas requiring human judgment
- Security or business logic considerations

```

## Integration with CodeRabbit

### Complementary Responsibilities

#### Human Review Focus
- Business logic correctness
- Architecture decision appropriateness
- Security design review
- Integration strategy validation
- User experience implications

> [!NOTE]
> Code style, formatting, type safety, and import organization are automatically enforced by git hooks and GitHub Actions. These items do not require manual review.

### Strategic Notes Section

When CodeRabbit analysis might miss context:

```markdown
## CodeRabbit Notes
- **Performance tradeoff**: O(n²) algorithm intentional for dataset size <100 items
- **Security pattern**: Token validation duplicated for defense-in-depth strategy  
- **Architecture decision**: Monolithic approach chosen over microservices for deployment simplicity
```

## Motivation Documentation Strategies

### Issue-Based Documentation (Preferred)

#### When GitHub Issue Exists
```markdown
## Motivation
Resolves #123 - User authentication system needs multi-factor support

#### Key Requirements from Issue
- Enterprise customer security compliance
- Backward compatibility with existing flows
- Configurable MFA provider support
```

#### Benefits
- Leverages existing problem documentation
- Avoids duplication of requirements analysis
- Links review context to broader project goals
- Provides traceability for future reference

### Context Extraction (Fallback)

#### When No Issue Exists
Extract motivation from development conversations, focusing on:

#### Decision Points
- Technical approach selection rationale
- Constraint-based choices
- Performance vs. feature tradeoffs
- Architecture pattern adoption reasons

#### Example
```markdown
## Motivation
Development analysis revealed authentication bottleneck during peak usage. Profiling showed session validation consuming 40% CPU during login storms. Implemented caching layer with 5-minute TTL balances security refresh needs with performance requirements.

#### Technical Constraints
- Memory usage cannot exceed 100MB for cache
- Session security requires periodic re-validation
- Existing authentication flow must remain unchanged
```

## Text Styling Compliance

> [!NOTE]
> Text styling (emoji usage, @ symbol safety, bold minimization) is verified through LLM context-based checking. Human manual verification is not required during review.

### GitHub Alert Notation
Use GitHub alerts for important review information:

```markdown
> [!IMPORTANT]
> Critical information requiring reviewer attention

> [!WARNING]
> Important warnings about potential issues

> [!NOTE]
> Reference information and supplementary details

> [!TIP]
> Performance hints and optimization suggestions
```

## Quality Verification

### Quality Assurance Overview
> [!NOTE]
> The following items are automatically verified and do not require manual review:
> - Code formatting and style consistency (git hooks)
> - Type safety and compilation errors (GitHub Actions)
> - Import organization and dependency management (automated tools)
> - Test execution and coverage requirements (GitHub Actions)
> - Text styling compliance (LLM context-based checking)

### Motivation Section Checklist
- [ ] Issue reference with clear summary provided (if applicable)?
- [ ] Development context extracted with decision rationale (if no issue)?
- [ ] Human judgment factors explicitly documented?
- [ ] Technical or business constraints clearly stated?
- [ ] Alternative approaches mentioned if considered?

### Out-of-Scope Section Checklist
- [ ] Explicit list of unchanged components provided?
- [ ] Justification for each out-of-scope item included?
- [ ] Areas reviewers can safely ignore clearly marked?
- [ ] Intentional deferrals distinguished from oversights?

### Scope Section Checklist
- [ ] Target changes specifically enumerated?
- [ ] Integration dependencies clearly identified?
- [ ] Boundary conditions explicitly stated?
- [ ] Responsibility limits well-defined?

### Overall Review Load Reduction Checklist
- [ ] Title provides motivation rather than just description?
- [ ] Out-of-scope section reduces reviewer examination surface?
- [ ] Motivation explains human decisions not inferable by automation?
- [ ] Scope boundaries prevent review scope creep?
- [ ] Review guidance optimizes human attention allocation?
- [ ] Professional appearance maintained throughout?

## Examples

### Complete PR Example

#### Title
`feat(auth): enable multi-factor authentication for enterprise compliance`

#### Message
```markdown
## Summary
Implements multi-factor authentication system to meet enterprise security requirements while maintaining backward compatibility with existing single-factor flows.

## Motivation
Resolves #156 - Enterprise customers require MFA for security compliance

#### Key Requirements
- SOC 2 compliance for enterprise tier
- Backward compatibility with existing authentication
- Support for TOTP and SMS verification methods

## Out of Scope
- **Frontend MFA setup UI** - Existing forms adequate, visual redesign deferred to #157
- **Legacy password policies** - Current validation rules unchanged for compatibility
- **Mobile app integration** - API contracts defined but native implementation separate
- **Advanced MFA methods** - Hardware tokens and biometrics excluded from initial implementation

## Scope
### Target
- Authentication middleware for token validation
- User model extension with MFA preferences
- API endpoints: `/auth/mfa/setup`, `/auth/mfa/verify`, `/auth/mfa/disable`
- Configuration system for TOTP and SMS providers

### Dependencies
- Existing session management system (extended with MFA state)
- User database schema (new optional mfa_enabled, mfa_secret columns)
- SMS service for token delivery (existing infrastructure)
- Email service for backup codes (existing infrastructure)

### Boundaries
- Changes limited to authentication layer only
- No modifications to authorization or role-based access
- Frontend integration points defined but implementation deferred
- Third-party MFA providers configured but integration pending

## Review Guidance
### Focus Areas
- Security token generation and validation logic
- Database migration safety and backward compatibility
- API contract design for future frontend integration
- Error handling for MFA failures

```

This example demonstrates optimal reviewer load reduction through explicit out-of-scope documentation while providing essential context for human decision validation.

## Integration with Existing Guidelines

### Relationship to JSDoc Guidelines
These PR guidelines extend the JSDoc motivation and scope approach to Pull Request documentation:
- Motivation Documentation: Same emphasis on decision rationale and constraint context
- Scope Boundaries: Applied to PR changes rather than function responsibilities  
- LLM-First Approach: Consistent focus on preserving human decision context
- Quality Verification: Similar checklist-based validation approach

### Alignment with Text Styling Guidelines
- Professional Standards: Maintains consistent documentation quality across platforms
- Alert Notation: GitHub alerts provide structured emphasis for review guidance
- Platform Optimization: Optimized for GitHub's markdown rendering and review interface

> [!NOTE]
> Text styling compliance (emoji usage, @ symbol safety, bold minimization) is verified through LLM context-based checking and does not require manual verification during review.

This comprehensive approach ensures Pull Request documentation effectively reduces reviewer cognitive load while preserving essential context for LLM-collaborative development workflows.