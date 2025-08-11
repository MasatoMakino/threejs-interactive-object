import { BoxGeometry } from "three";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { RadioButtonMesh } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";

describe("RadioButtonInteractionHandler", () => {
  let _warnSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    // Spy for console.warn to avoid affecting other tests
    _warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  beforeEach(() => {
    _warnSpy.mockClear();
  });

  afterAll(() => {
    _warnSpy.mockRestore();
  });

  const createTestSetup = () => {
    const matSet = getMeshMaterialSet();
    const radioButton = new RadioButtonMesh({
      geo: new BoxGeometry(3, 3, 3),
      material: matSet,
    });
    radioButton.interactionHandler.value = "test radio button";
    const handler = radioButton.interactionHandler;
    return { radioButton, handler, matSet };
  };

  describe("Internal Override API for RadioButtonManager", () => {
    it("should force selection despite disable state", () => {
      const { handler } = createTestSetup();

      // Disable radio button
      handler.disable();
      expect(handler.selection).toBe(false);

      // Internal API should force selection change
      handler._setSelectionOverride(true);
      expect(handler.selection).toBe(true);

      // But handler is still disabled, so public API is still blocked
      handler.selection = false;
      expect(handler.selection).toBe(true); // Unchanged due to disable state
    });

    it("should force selection despite exclusive selection state", () => {
      const { handler } = createTestSetup();

      // Mark as exclusively selected and select
      handler.isExclusivelySelected = true;
      handler._setSelectionOverride(true);
      expect(handler.selection).toBe(true);

      // Internal API should force deselection
      handler._setSelectionOverride(false);
      expect(handler.selection).toBe(false);
    });

    it("should work with both disable and exclusive selection states", () => {
      const { handler } = createTestSetup();

      // Disable and mark as exclusively selected
      handler.disable();
      handler.isExclusivelySelected = true;

      // Internal API should still work
      handler._setSelectionOverride(true);
      expect(handler.selection).toBe(true);

      handler._setSelectionOverride(false);
      expect(handler.selection).toBe(false);
    });
  });

  describe("Complex State Management for Radio Groups", () => {
    it("should handle complex state transition sequences", () => {
      const { handler } = createTestSetup();

      // Step 1: Normal selection
      handler.selection = true;
      expect(handler.selection).toBe(true);

      // Step 2: Mark as exclusively selected (selection state maintained)
      handler.isExclusivelySelected = true;
      expect(handler.selection).toBe(true);

      // Step 3: Public API deselection attempt (ignored)
      handler.selection = false;
      expect(handler.selection).toBe(true);

      // Step 4: Internal API deselection (succeeds)
      handler._setSelectionOverride(false);
      expect(handler.selection).toBe(false);

      // Step 5: Remove exclusive selection and verify public API works
      handler.isExclusivelySelected = false;
      handler.selection = true;
      expect(handler.selection).toBe(true);
    });
  });

  describe("RadioButtonManager Integration", () => {
    it("should simulate RadioButtonManager exclusive selection behavior", () => {
      const { handler } = createTestSetup();

      // Simulate RadioButtonManager selection (using internal API)
      handler.isExclusivelySelected = true;
      handler._setSelectionOverride(true);

      expect(handler.selection).toBe(true);
      expect(handler.isExclusivelySelected).toBe(true);

      // Public API should respect exclusive selection state
      handler.selection = false;
      expect(handler.selection).toBe(true); // Should remain selected

      // Internal API should still work
      handler._setSelectionOverride(false);
      expect(handler.selection).toBe(false);
    });

    it("should force normalSelect material when selecting in hover state", () => {
      const { handler, radioButton, matSet } = createTestSetup();

      // Simulate hover state before selection
      handler.onMouseOverHandler({
        type: "over",
        interactionHandler: handler,
      });

      expect(handler.isOver).toBe(true);
      expect(radioButton.material).toBe(matSet.over.material);

      // Internal API selection should force normalSelect material
      handler._setSelectionOverride(true);

      expect(handler.selection).toBe(true);
      expect(handler.isOver).toBe(true); // Hover state preserved internally
      expect(radioButton.material).toBe(matSet.normalSelect.material); // Forces normal state
    });

    it("should preserve interaction state when deselecting", () => {
      const { handler, radioButton, matSet } = createTestSetup();

      // Start with selection
      handler._setSelectionOverride(true);
      expect(radioButton.material).toBe(matSet.normalSelect.material);

      // Simulate hover state
      handler.onMouseOverHandler({
        type: "over",
        interactionHandler: handler,
      });

      // Deselect - should preserve hover state
      handler._setSelectionOverride(false);

      expect(handler.selection).toBe(false);
      expect(handler.isOver).toBe(true);
      expect(radioButton.material).toBe(matSet.over.material); // Preserves hover state
    });
  });
});
