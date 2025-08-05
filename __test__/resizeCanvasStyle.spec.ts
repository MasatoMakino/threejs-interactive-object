import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { resizeCanvasStyle } from "../src/index.js";

describe("resizeCanvasStyle", () => {
  let container: HTMLElement;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    // Create fresh DOM elements for each test
    container = document.createElement("div");
    canvas = document.createElement("canvas");

    // Set default canvas pixel dimensions
    canvas.width = 800;
    canvas.height = 600;

    // Reset container and canvas styles
    container.style.setProperty("margin", "0");
    container.style.setProperty("padding", "0");
    container.style.setProperty("border", "none");
    canvas.style.setProperty("margin", "0");
    canvas.style.setProperty("padding", "0");
    canvas.style.setProperty("border", "none");

    // Add to DOM for clientWidth/clientHeight calculation
    document.body.appendChild(container);
    container.appendChild(canvas);
  });

  afterEach(() => {
    // Clean up DOM
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe("Aspect ratio preservation", () => {
    test("should preserve 16:9 aspect ratio when container is wider", () => {
      // Container wider than canvas aspect ratio (letterboxing)
      container.style.width = "1600px";
      container.style.height = "800px";

      resizeCanvasStyle(container, canvas, 1920, 1080);

      // Should fit height and letterbox horizontally
      const actualWidth = parseFloat(canvas.style.width);
      const expectedWidth = 800 * (1920 / 1080); // ≈ 1422.22
      expect(actualWidth).toBeCloseTo(expectedWidth, 2);
      expect(canvas.style.height).toBe("800px");
    });

    test("should preserve 16:9 aspect ratio when container is taller", () => {
      // Container taller than canvas aspect ratio (pillarboxing)
      container.style.width = "800px";
      container.style.height = "600px";

      resizeCanvasStyle(container, canvas, 1920, 1080);

      // Should fit width and pillarbox vertically
      expect(canvas.style.width).toBe("800px");
      const actualHeight = parseFloat(canvas.style.height);
      const expectedHeight = 800 / (1920 / 1080); // = 450
      expect(actualHeight).toBeCloseTo(expectedHeight, 2);
    });

    test("should handle square aspect ratio (1:1)", () => {
      container.style.width = "400px";
      container.style.height = "600px";

      resizeCanvasStyle(container, canvas, 512, 512);

      // Should fit to container width (smaller dimension)
      expect(canvas.style.width).toBe("400px");
      expect(canvas.style.height).toBe("400px");
    });

    test("should handle portrait aspect ratio (3:4)", () => {
      container.style.width = "800px";
      container.style.height = "600px";

      resizeCanvasStyle(container, canvas, 600, 800);

      // Should fit to container height
      const actualWidth = parseFloat(canvas.style.width);
      const expectedWidth = 600 * (600 / 800); // = 450
      expect(actualWidth).toBeCloseTo(expectedWidth, 2);
      expect(canvas.style.height).toBe("600px");
    });
  });

  describe("Core functionality", () => {
    test("should not modify canvas pixel dimensions", () => {
      const originalWidth = canvas.width;
      const originalHeight = canvas.height;

      container.style.width = "1200px";
      container.style.height = "900px";

      resizeCanvasStyle(container, canvas, 800, 600);

      // Canvas pixel dimensions should remain unchanged - only CSS styling
      expect(canvas.width).toBe(originalWidth);
      expect(canvas.height).toBe(originalHeight);
    });
  });

  describe("Edge cases and error conditions", () => {
    test("should handle zero container dimensions", () => {
      container.style.width = "0px";
      container.style.height = "0px";

      resizeCanvasStyle(container, canvas, 800, 600);

      // Should set canvas to zero dimensions
      expect(canvas.style.width).toBe("0px");
      expect(canvas.style.height).toBe("0px");
    });

    test("should handle zero canvas dimensions", () => {
      container.style.width = "400px";
      container.style.height = "300px";

      // Zero canvas width should not cause division by zero
      expect(() => {
        resizeCanvasStyle(container, canvas, 0, 600);
      }).not.toThrow();

      // Zero canvas height should not cause division by zero
      expect(() => {
        resizeCanvasStyle(container, canvas, 800, 0);
      }).not.toThrow();
    });

    test("should handle extreme aspect ratios", () => {
      container.style.width = "1000px";
      container.style.height = "100px";

      // Very wide canvas (10:1 aspect ratio)
      resizeCanvasStyle(container, canvas, 1000, 100);

      expect(canvas.style.width).toBe("1000px");
      expect(canvas.style.height).toBe("100px");

      // Very tall canvas (1:10 aspect ratio)
      resizeCanvasStyle(container, canvas, 100, 1000);

      const actualWidth = parseFloat(canvas.style.width);
      const expectedWidth = 100 * (100 / 1000); // = 10
      expect(actualWidth).toBeCloseTo(expectedWidth, 2);
      expect(canvas.style.height).toBe("100px");
    });

    test("should handle extreme container dimensions", () => {
      // Very small dimensions
      container.style.width = "1px";
      container.style.height = "1px";
      resizeCanvasStyle(container, canvas, 800, 600);
      expect(canvas.style.width).toBe("1px");

      // Very large dimensions
      container.style.width = "4000px";
      container.style.height = "3000px";
      resizeCanvasStyle(container, canvas, 1920, 1080);
      expect(canvas.style.width).toBe("4000px");
    });
  });

  describe("Device independence", () => {
    test("should produce consistent results regardless of devicePixelRatio", () => {
      container.style.width = "800px";
      container.style.height = "600px";

      // Store original devicePixelRatio
      const originalRatio = window.devicePixelRatio;

      const setDevicePixelRatio = (ratio: number) => {
        Object.defineProperty(window, "devicePixelRatio", {
          writable: true,
          configurable: true,
          value: ratio,
        });
      };

      try {
        // Test with standard ratio (1.0)
        setDevicePixelRatio(1.0);
        resizeCanvasStyle(container, canvas, 1920, 1080);
        const width1 = canvas.style.width;
        const height1 = canvas.style.height;

        // Test with high-DPI ratio (2.0)
        setDevicePixelRatio(2.0);
        resizeCanvasStyle(container, canvas, 1920, 1080);
        const width2 = canvas.style.width;
        const height2 = canvas.style.height;

        // Test with very high-DPI ratio (3.0)
        setDevicePixelRatio(3.0);
        resizeCanvasStyle(container, canvas, 1920, 1080);
        const width3 = canvas.style.width;
        const height3 = canvas.style.height;

        // Test with browser zoom out (0.5 - common when zoomed out to 50%)
        setDevicePixelRatio(0.5);
        resizeCanvasStyle(container, canvas, 1920, 1080);
        const width4 = canvas.style.width;
        const height4 = canvas.style.height;

        // Test with extreme fractional ratio (1.25 - common on some Windows displays)
        setDevicePixelRatio(1.25);
        resizeCanvasStyle(container, canvas, 1920, 1080);
        const width5 = canvas.style.width;
        const height5 = canvas.style.height;

        // All results should be identical because function uses CSS logical pixels
        expect(width2).toBe(width1);
        expect(height2).toBe(height1);
        expect(width3).toBe(width1);
        expect(height3).toBe(height1);
        expect(width4).toBe(width1);
        expect(height4).toBe(height1);
        expect(width5).toBe(width1);
        expect(height5).toBe(height1);
      } finally {
        // Restore original devicePixelRatio
        setDevicePixelRatio(originalRatio);
      }
    });
  });
});
