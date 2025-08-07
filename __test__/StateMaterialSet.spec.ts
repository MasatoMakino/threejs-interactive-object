import { type Material, MeshBasicMaterial } from "three";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { StateMaterial, StateMaterialSet } from "../src/index.js";

const _spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

describe("StateMaterial", () => {
  let mat: StateMaterial;
  let matArray: Material[];

  test("should initialize with material array and preserve original opacity values", () => {
    matArray = [
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true,
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true,
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.4,
        transparent: true,
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.3,
        transparent: true,
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.2,
        transparent: true,
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.1,
        transparent: true,
      }),
    ];
    mat = new StateMaterial(matArray);

    expect((mat.material as Material[])[0].opacity).toBe(0.6);
  });

  test("should apply proportional opacity scaling to material array", () => {
    mat.setOpacity(0.5);
    const array = mat.material as Material[];
    expect(array[0].opacity).toBe(0.3);
    expect(array[1].opacity).toBe(0.25);
    expect(array[2].opacity).toBe(0.2);
    expect(array[3].opacity).toBe(0.15);
    expect(array[4].opacity).toBe(0.1);
    expect(array[5].opacity).toBe(0.05);
  });

  describe("Single material handling", () => {
    test("should initialize with single material and preserve original opacity", () => {
      const singleMat = new MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0.75,
        transparent: true,
      });
      const stateMat = new StateMaterial(singleMat);

      expect(stateMat.material).toBe(singleMat);
      expect((stateMat.material as Material).opacity).toBe(0.75);
    });

    test("should apply proportional opacity to single material", () => {
      const singleMat = new MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0.8,
        transparent: true,
      });
      const stateMat = new StateMaterial(singleMat);

      stateMat.setOpacity(0.25);

      expect((stateMat.material as Material).opacity).toBeCloseTo(0.2, 2); // 0.8 * 0.25
    });

    test("should handle material assignment after construction", () => {
      const initialMat = new MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0.6,
      });
      const stateMat = new StateMaterial(initialMat);

      // Change to different material
      const newMat = new MeshBasicMaterial({ color: 0x00ff00, opacity: 0.9 });
      stateMat.material = newMat;

      expect(stateMat.material).toBe(newMat);

      // Apply opacity to new material
      stateMat.setOpacity(0.5);
      expect((stateMat.material as Material).opacity).toBeCloseTo(0.45, 2); // 0.9 * 0.5
    });
  });
});

describe("StateMaterialSet", () => {
  const getMatSet = () => {
    return new StateMaterialSet({
      normal: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true,
      }),
    });
  };
  test("should initialize with only normal material and auto-fallback to normal for unspecified states", () => {
    const matSet = getMatSet();
    expect(matSet.down).toBe(matSet.normal);
  });

  test("should return appropriate material based on state, selection, and enablement conditions", () => {
    const matSet = getMatSet();
    matSet.overSelect = new StateMaterial(
      new MeshBasicMaterial({
        color: 0xff66ff,
        opacity: 0.6,
        transparent: true,
      }),
    );

    const mat = matSet.getMaterial("over", true, true);

    expect(mat).toBe(matSet.overSelect);
    expect(mat).not.toBe(matSet.over);
    expect(mat).not.toBe(matSet.normal);
  });

  describe("getMaterial state management", () => {
    let fullMatSet: StateMaterialSet;

    beforeEach(() => {
      fullMatSet = new StateMaterialSet({
        normal: new MeshBasicMaterial({ color: 0x888888, opacity: 0.8 }),
        over: new MeshBasicMaterial({ color: 0xaaaaaa, opacity: 0.9 }),
        down: new MeshBasicMaterial({ color: 0x666666, opacity: 0.7 }),
        disable: new MeshBasicMaterial({ color: 0x444444, opacity: 0.5 }),
        normalSelect: new MeshBasicMaterial({ color: 0x0088ff, opacity: 0.8 }),
        overSelect: new MeshBasicMaterial({ color: 0x00aaff, opacity: 0.9 }),
        downSelect: new MeshBasicMaterial({ color: 0x0066cc, opacity: 0.7 }),
      });
    });

    test("should return disable material when mouse is disabled regardless of state or selection", () => {
      expect(fullMatSet.getMaterial("normal", false, false)).toBe(
        fullMatSet.disable,
      );
      expect(fullMatSet.getMaterial("over", false, false)).toBe(
        fullMatSet.disable,
      );
      expect(fullMatSet.getMaterial("down", false, false)).toBe(
        fullMatSet.disable,
      );
      expect(fullMatSet.getMaterial("normal", false, true)).toBe(
        fullMatSet.disable,
      );
      expect(fullMatSet.getMaterial("over", false, true)).toBe(
        fullMatSet.disable,
      );
      expect(fullMatSet.getMaterial("down", false, true)).toBe(
        fullMatSet.disable,
      );
    });

    test("should return normal materials when enabled and not selected", () => {
      expect(fullMatSet.getMaterial("normal", true, false)).toBe(
        fullMatSet.normal,
      );
      expect(fullMatSet.getMaterial("over", true, false)).toBe(fullMatSet.over);
      expect(fullMatSet.getMaterial("down", true, false)).toBe(fullMatSet.down);
    });

    test("should return selected materials when enabled and selected", () => {
      expect(fullMatSet.getMaterial("normal", true, true)).toBe(
        fullMatSet.normalSelect,
      );
      expect(fullMatSet.getMaterial("over", true, true)).toBe(
        fullMatSet.overSelect,
      );
      expect(fullMatSet.getMaterial("down", true, true)).toBe(
        fullMatSet.downSelect,
      );
    });

    test("should handle default parameter for isSelected (default: false)", () => {
      expect(fullMatSet.getMaterial("normal", true)).toBe(fullMatSet.normal);
      expect(fullMatSet.getMaterial("over", true)).toBe(fullMatSet.over);
      expect(fullMatSet.getMaterial("down", true)).toBe(fullMatSet.down);
    });

    test("should return normal material for invalid state parameter (fallback)", () => {
      // @ts-expect-error Testing fallback case with invalid state
      expect(fullMatSet.getMaterial("invalid", true, false)).toBe(
        fullMatSet.normal,
      );
      // @ts-expect-error Testing fallback case with invalid state
      expect(fullMatSet.getMaterial("unknown", true, true)).toBe(
        fullMatSet.normal,
      );
    });
  });

  describe("setOpacity synchronized management", () => {
    let matSet: StateMaterialSet;

    beforeEach(() => {
      matSet = new StateMaterialSet({
        normal: new MeshBasicMaterial({ color: 0x888888, opacity: 0.8 }),
        over: new MeshBasicMaterial({ color: 0xaaaaaa, opacity: 0.9 }),
        down: new MeshBasicMaterial({ color: 0x666666, opacity: 0.6 }),
        normalSelect: new MeshBasicMaterial({ color: 0x0088ff, opacity: 0.7 }),
      });
    });

    test("should apply opacity to all managed materials simultaneously", () => {
      matSet.setOpacity(0.5);

      const normalMat = matSet.normal.material as Material;
      const overMat = matSet.over.material as Material;
      const downMat = matSet.down.material as Material;
      const selectMat = matSet.normalSelect.material as Material;

      expect(normalMat.opacity).toBeCloseTo(0.4, 2); // 0.8 * 0.5
      expect(overMat.opacity).toBeCloseTo(0.45, 2); // 0.9 * 0.5
      expect(downMat.opacity).toBeCloseTo(0.3, 2); // 0.6 * 0.5
      expect(selectMat.opacity).toBeCloseTo(0.35, 2); // 0.7 * 0.5
    });

    test("should preserve original opacity ratios when changing global opacity", () => {
      // Initial state check
      const normalInitial = (matSet.normal.material as Material).opacity;
      const overInitial = (matSet.over.material as Material).opacity;

      // Apply 30% opacity
      matSet.setOpacity(0.3);

      const normalAfter = (matSet.normal.material as Material).opacity;
      const overAfter = (matSet.over.material as Material).opacity;

      // Check proportional relationship maintained
      const initialRatio = overInitial / normalInitial; // 0.9 / 0.8 = 1.125
      const afterRatio = overAfter / normalAfter; // Should still be 1.125

      expect(afterRatio).toBeCloseTo(initialRatio, 3);
    });

    test("should handle complete transparency (opacity = 0)", () => {
      matSet.setOpacity(0);

      const materials = [
        matSet.normal.material as Material,
        matSet.over.material as Material,
        matSet.down.material as Material,
        matSet.normalSelect.material as Material,
      ];

      materials.forEach((mat) => {
        expect(mat.opacity).toBe(0);
      });
    });

    test("should restore original opacity when set to 1.0", () => {
      // Change opacity first
      matSet.setOpacity(0.3);

      // Restore to original
      matSet.setOpacity(1.0);

      expect((matSet.normal.material as Material).opacity).toBeCloseTo(0.8, 2);
      expect((matSet.over.material as Material).opacity).toBeCloseTo(0.9, 2);
      expect((matSet.down.material as Material).opacity).toBeCloseTo(0.6, 2);
      expect((matSet.normalSelect.material as Material).opacity).toBeCloseTo(
        0.7,
        2,
      );
    });
  });
});
