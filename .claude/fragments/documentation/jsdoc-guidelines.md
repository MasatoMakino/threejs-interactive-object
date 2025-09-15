# LLM-First JSDoc Documentation Guidelines

This document establishes JSDoc best practices centered on **decision motivation** and **responsibility boundaries** to enable LLM agents to effectively understand and modify code. Designed as universal guidelines independent of specific projects or technology stacks, these practices are applicable to any JavaScript/TypeScript project.

## Documentation Purpose

- Traditional documentation: Focuses on API specifications and usage instructions
- LLM-focused documentation: Emphasizes the background and intent behind design choices

While LLMs can understand syntax and patterns, they cannot infer human thought processes or decision-making context. These guidelines make this "invisible information" explicit, enabling LLMs to perform more appropriate code understanding and generation.

## Approach Benefits and Drawbacks

### Benefits

#### Specification Proximity
- Specifications are documented in the same file as code, making them easily accessible in LLM context
- Simultaneous visibility of code and specifications during changes reduces update oversight
- Avoids precision issues when searching for distributed specification documents

#### Synchronization Reliability
- Physical proximity of code and specifications enables easy synchronization of changes
- Significantly reduces risk of inconsistency with external specification documents
- Enables unified review of code and specifications during Pull Requests

#### LLM Processing Efficiency
- Specifications and code exist within the same context, eliminating search requirements
- No need to infer relationships between files
- Single read operation provides understanding of both design intent and code

### Drawbacks

#### Code Bloat
- JSDoc comments significantly increase file size
- Reduced visibility of implementation code
- Increased scrolling makes overall comprehension difficult

#### Increased Maintenance Burden
- Documentation update costs accumulate
- More detailed descriptions mean more modification points during changes
- Documentation updates become mandatory when implementation changes

#### Degraded Readability
- Code flow becomes harder to follow for humans
- Non-essential information occupies screen space
- Increased learning costs for new team members

### Overcoming Drawbacks Through LLM Processing Capabilities

Prerequisites:

#### LLM Processing Capability Assumptions
- Capable of high-speed processing of large amounts of text
- Can distinguish and understand code versus comments
- Can extract essential information even from bloated files

#### Solving Traditional Problems
```
Traditional: Specification separation → Reduced search precision, synchronization difficulties
New approach: JSDoc aggregation → Bloat, readability issues → Overcome with LLM
```

#### Tradeoff Choices
- Human readability < LLM efficiency + Specification synchronization reliability
- Short-term development efficiency < Long-term maintainability
- File size < Context consistency

### Application Decision Criteria

#### When This Approach Is Effective
- All developers in the team use LLM agents
- Frequent API specification changes
- Significant amount of decision-making that doesn't appear in code

#### When Traditional Methods Are Suitable
- Development teams that do not use LLM agents
- Stable specifications
- Minimal implicit decision-making

## Core Principles

### LLM Agent-Aware Documentation

Information to record:

1. Decision motivation - Why that implementation was chosen
2. Responsibility boundaries - What is processed and what is not
3. Design constraints - Technical and perceptual limiting factors
4. Architectural intent - Considerations for future changes
5. Tradeoffs - What was sacrificed and what was prioritized
6. Prerequisites - Environment and conditions the implementation depends on

### Principles for Helping LLM Understanding

#### Importance of Explicit Description
- Always explicitly document implicit assumptions
- "Common sense" and "obvious" information are documentation targets
- Prioritize information that is obvious to humans but unclear to LLMs

#### Context Preservation
- Record implementation circumstances and constraints
- Leave traces of alternative option considerations
- Include information that will serve as future decision-making material

## JSDoc Structure Optimization

### Importance of Summary Line (First Line)

#### Purpose
Concise functional description optimized for display in IDE popup windows

#### Information Volume Guidelines
- More information than function name provides
- Within the scope of a single sentence

#### Description Principles
- Supplement "what" and "how" that function names cannot convey
- Briefly mention specialized processing methods or constraints if present
- Explain detailed contracts and design intent in @description or other tags

### Good Summary Line Examples

#### Appropriate Function Name Supplementation
```typescript
/**
 * Returns a filtered array containing only valid items
 */
function filterItems(items: Item[]): Item[] {}

/**
 * Manages exclusive selection behavior among radio buttons
 */
class RadioButtonManager<T> {}

/**
 * Asynchronously loads a file from the specified path
 */
async function loadFile(path: string): Promise<Buffer> {}
```

#### Examples with Inappropriate Information Volume
```typescript
// ❌ Same information volume as function name (insufficient)
/**
 * Filters items
 */
function filterItems(items: Item[]): Item[] {}

// ❌ Detailed information exceeding one sentence (excessive)
/**
 * Receives an item array, validates each element's validity, generates and returns a new array containing only elements that match conditions. The original array is not modified.
 */
function filterItems(items: Item[]): Item[] {}

// ✅ Appropriate information volume
/**
 * Returns a filtered array containing only valid items
 */
function filterItems(items: Item[]): Item[] {}
```

### Comparative Expression Prohibition Principle

#### Basic Rule
Comparative expressions without clear comparison targets are prohibited

#### Prohibited Expression Examples
- more efficient, faster, better (compared to what?)
- improved, enhanced, optimized (improvement from what?)
- advanced, superior, simplified (relative to what?)
- completely, totally, fully (without evidence or measurable criteria)

#### ❌ Bad Examples
```typescript
/**
 * Implements a faster sorting algorithm
 */
function quickSort(items: Item[]): Item[] {}

/**
 * Improved filtering process with better performance
 */
function filterItems(items: Item[]): Item[] {}

/**
 * Provides more efficient cache functionality than conventional approaches
 */
class CacheManager {}
```

#### ✅ Good Examples
```typescript
/**
 * Sorts items with O(n log n) computational complexity
 */
function quickSort(items: Item[]): Item[] {}

/**
 * Caches filtering results through memoization
 */
function filterItems(items: Item[]): Item[] {}

/**
 * Provides cache functionality based on LRU strategy
 */
class CacheManager {}
```

#### Exceptionally Permitted Cases

#### Test Code Threshold Comparisons
```typescript
/**
 * Verifies that execution time is less than 1 second
 */
function testPerformance() {
  // Clear comparison criterion (1 second) exists
}

/**
 * Confirms that result is greater than expected value
 */
function testThreshold(result: number, expected: number) {
  // Comparison target (expected) is clear
}
```

#### When Comparison Target Is Explicitly Stated in Code
```typescript
/**
 * Executes sorting faster than bubbleSort
 * 
 * @param items Array to sort
 * @motivation Achieves O(n log n) improvement over bubbleSort(O(n²))
 */
function quickSort(items: Item[]): Item[] {}
```

### Summary Line Quality Checklist

- [ ] Contains information not derivable from function name alone?
- [ ] Completes within a single sentence?
- [ ] Readable length for IDE popups?
- [ ] Concisely expresses core functionality or characteristics?
- [ ] When using comparative expressions, is the comparison target clearly identifiable?

## Custom Tag System

### @motivation Tag

#### Usage
Record design decisions and implementation choice motivations

#### Target Scope
- Judgments based on technical constraints
- Decisions based on UX and perceptual considerations
- Application of empirical rules and best practices
- Performance optimization choices
- Architectural pattern adoption reasons

#### Description Examples

```typescript
/**
 * Central event dispatcher for UI interactions.
 * 
 * @motivation Inheritance constraints make direct base class inheritance difficult,
 *             so handler pattern achieves common logic across multiple components.
 *             Also, 33ms throttling feels natural for user operations and
 *             was empirically chosen as optimal balance point with system load.
 */
class EventManager {
  // ...
}
```

```typescript
/**
 * @motivation UUID filtering solves the problem of the same entity being
 *             detected multiple times in composite objects. Framework-specific
 *             phenomenon deemed essential based on implementation experience.
 */
private filterDuplicatesByUUID(items: ProcessableItem[]): ProcessableItem[] {
  // ...
}
```

### @scope Tag

#### Usage
Clarify processing targets and responsibility boundaries of classes and functions

#### Description Elements
- Target: What is processed
- Out of scope: What is intentionally not processed
- Boundary: Conditions where processing range ends
- Dependencies: Responsibility sharing with other modules

#### Description Examples

```typescript
/**
 * Manages exclusive selection behavior for option group components.
 * 
 * @scope 
 * - Target: Exclusive control of SelectableItem implementation objects
 * - Out of scope: State management of individual selection components, non-selection objects
 * - Boundary: Only among objects registered to the same SelectionManager
 * - Dependencies: Individual item states delegated to ItemHandler
 */
class SelectionManager<Value> {
  // ...
}
```

```typescript
/**
 * @scope
 * - Target: Upward traversal of object hierarchy
 * - Out of scope: Child object search, objects outside root
 * - Boundary: Search ends when parent === null
 * - Dependencies: IInteractable determination depends on each object's implementation
 */
private findTargetInHierarchy(obj: HierarchyNode): InteractionHandler<unknown> | null {
  // ...
}
```

## Contract-Focused @description Approach

### Basic Principle: Describe Contracts, Not Implementation

#### Purpose of @description
Specify promises and contracts to external parties, not internal code behavior

#### Content to Describe
- Return value guarantees: What is returned and in what state
- Side effect specification: What is modified/not modified
- Error conditions: When exceptions occur and what types
- Boundary conditions: Handling of special inputs (null, empty arrays, etc.)
- Ignore conditions: What is not processed, when to skip

### Good vs Bad Examples

#### ❌ Bad Example (Implementation Explanation)
```typescript
/**
 * @description Traverses items with for loop, calls validate method to
 *              check conditions, pushes to new array and returns it.
 */
function filterItems(items: Item[]): Item[] {
  // Implementation is self-evident from reading
}
```

#### ✅ Good Example (External Contract)
```typescript
/**
 * @description Returns a new array containing only valid items.
 *              Returns empty array when empty array is passed.
 *              Invalid items are excluded without warning.
 *              Original array is not modified.
 */
function filterItems(items: Item[]): Item[] {
  // Implementation details
}
```

#### ✅ State Management Contract Example
```typescript
/**
 * @description Sets the specified item to selected state.
 *              Does nothing if already selected.
 *              Returns false if invalid item is specified.
 *              Fires change event when selection state changes.
 */
function selectItem(item: Item): boolean {
  // Implementation details
}
```

#### ✅ Asynchronous Processing Contract Example
```typescript
/**
 * @description Asynchronously fetches data and returns Promise.
 *              Executes 3 retries on network errors.
 *              Throws NetworkError after 3 failures.
 *              Resolves immediately when cache is valid.
 */
async function fetchData(id: string): Promise<Data> {
  // Implementation details
}
```

### Contract Description Checklist

#### About Return Values
- [ ] Is what is returned under normal conditions clearly stated?
- [ ] Are return values for special cases (empty, null, etc.) explained?
- [ ] Is the state/format of return values clear?

#### About Side Effects
- [ ] Is what is modified/not modified clearly stated?
- [ ] Are impacts on external systems described?
- [ ] Are event firing conditions clear?

#### About Error Handling
- [ ] Are conditions under which exceptions occur described?
- [ ] Are exception types clearly stated?
- [ ] Is the state during errors explained?

## Enhanced Existing Tag Patterns

### @internal Usage Criteria

#### Base Classes and Private API Usage

```typescript
/**
 * Generic base class for interactive mesh objects.
 * 
 * @internal 
 * @motivation Not for direct use, but provides common functionality
 *             as base for ClickableMesh/CheckBoxMesh/RadioButtonMesh.
 *             Non-exported to ensure type safety.
 */
class InteractiveMesh<Value, Handler extends ButtonInteractionHandler<Value>> {
  // ...
}
```

### Strategic @example Placement

#### Complex Concepts and Edge Case Examples

```typescript
/**
 * @example
 * ```typescript
 * // Basic usage
 * const manager = new EventManager(container, options);
 * 
 * // Multi-viewport support
 * const viewport = { x: 0, y: 0, width: 512, height: 512 };
 * const manager = new EventManager(container, { viewport });
 * 
 * // Performance tuning
 * const manager = new EventManager(container, { 
 *   throttlingTime_ms: 16  // 60FPS support
 * });
 * ```
 */
```

## Project-Specific Guidelines

### Three.js-Specific Patterns

#### EventEmitter Inheritance Constraints
```typescript
/**
 * @motivation EventEmitter3 type constraints (primus/eventemitter3#243) make
 *             direct inheritance from Three.js objects difficult. Avoided with handler pattern.
 */
```

#### Hierarchy Traversal
```typescript
/**
 * @motivation Accommodates UI design where interactive objects are placed as
 *             child objects in Three.js parent-child relationships. Searches up to Scene.
 */
```

#### Multi-face Issues
```typescript
/**
 * @motivation Solves problem where same object hits multiple times with multi-face
 *             geometries like BoxGeometry using UUID. Three.js-specific phenomenon.
 */
```

### Performance Decision Recording

#### Throttling Values
```typescript
/**
 * @motivation 33ms (approximately 30FPS) is balance point between mouse tracking
 *             naturalness and CPU load. 16ms (60FPS) is excessive, 66ms (15FPS) harms user experience.
 */
```

#### Memory Optimization
```typescript
/**
 * @motivation Array management of currentOver achieves reliable state clearing on mouse out.
 *             Explicit cleanup in dispose() necessary to prevent memory leaks.
 */
```

## Implementation Quality Standards

### @motivation Description Quality

#### Good Examples
- Specify concrete constraints and factors
- Show traces of alternative option consideration
- Attempt logical explanation even for perceptual judgments

#### Examples to Avoid
- "For performance" (lacks specificity)
- "Three.js constraints" (details unclear)
- "Best practices" (no basis given)

### @scope Description Quality

#### Good Examples
- Clearly separate target, out-of-scope, and boundaries
- Specify responsibility sharing with other modules
- Include edge case handling policies

#### Examples to Avoid
- "Processes mouse events" (vague)
- "For Three.js objects" (scope unclear)
- "UI interactions" (abstract)

## Document Quality Verification

### Checklist

#### @motivation Verification
- [ ] Are implementation choice reasons explicitly stated rather than inferred?
- [ ] Do perceptual judgments have logical explanations to the extent possible?
- [ ] Is information included that will be useful for future changes?

#### @scope Verification
- [ ] Are processing targets and out-of-scope items specifically described?
- [ ] Are responsibility boundaries clear in relation to other modules?
- [ ] Are edge case and exception handling policies included?

#### Integrated Verification
- [ ] Does this provide sufficient guidance for LLMs writing similar code?
- [ ] Can human developers understand this when reading 6 months later?
- [ ] Will design intent be preserved during future refactoring?