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

  describe("CSS properties setting", () => {
    test("should set CSS width and height properties correctly", () => {
      container.style.width = "1000px";
      container.style.height = "500px";

      resizeCanvasStyle(container, canvas, 800, 400);

      // Verify CSS properties are set
      expect(canvas.style.width).toBe("1000px");
      expect(canvas.style.height).toBe("500px");
      expect(canvas.style.getPropertyValue("width")).toBe("1000px");
      expect(canvas.style.getPropertyValue("height")).toBe("500px");
    });

    test("should not modify canvas pixel dimensions", () => {
      const originalWidth = canvas.width;
      const originalHeight = canvas.height;

      container.style.width = "1200px";
      container.style.height = "900px";

      resizeCanvasStyle(container, canvas, 800, 600);

      // Canvas pixel dimensions should remain unchanged
      expect(canvas.width).toBe(originalWidth);
      expect(canvas.height).toBe(originalHeight);
    });

    test("should handle decimal pixel values correctly", () => {
      container.style.width = "333px";
      container.style.height = "250px";

      resizeCanvasStyle(container, canvas, 1920, 1080);

      // Should handle fractional pixels
      expect(canvas.style.width).toBe("333px");
      const actualHeight = parseFloat(canvas.style.height);
      const expectedHeight = 333 / (1920 / 1080); // ≈ 187.3125
      expect(actualHeight).toBeCloseTo(expectedHeight, 3);
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

    test("should handle very small dimensions", () => {
      container.style.width = "1px";
      container.style.height = "1px";

      resizeCanvasStyle(container, canvas, 800, 600);

      // Should handle minimal container size
      expect(canvas.style.width).toBe("1px");
      const actualHeight = parseFloat(canvas.style.height);
      const expectedHeight = 1 / (800 / 600); // = 0.75
      expect(actualHeight).toBeCloseTo(expectedHeight, 2);
    });

    test("should handle large dimensions", () => {
      container.style.width = "4000px";
      container.style.height = "3000px";

      resizeCanvasStyle(container, canvas, 1920, 1080);

      // Should handle large container dimensions
      expect(canvas.style.width).toBe("4000px");
      const actualHeight = parseFloat(canvas.style.height);
      const expectedHeight = 4000 / (1920 / 1080); // = 2250
      expect(actualHeight).toBeCloseTo(expectedHeight, 2);
    });
  });

  describe("Real-world usage scenarios", () => {
    test("should handle JSDoc example: 16:9 container with 16:9 canvas", () => {
      // Simulate the JSDoc example scenario
      container.style.width = "1920px";
      container.style.height = "1080px";

      resizeCanvasStyle(container, canvas, 1920, 1080);

      // Perfect aspect ratio match - should fill container exactly
      expect(canvas.style.width).toBe("1920px");
      expect(canvas.style.height).toBe("1080px");
    });

    test("should handle JSDoc example: sidebar layout", () => {
      // Simulate sidebar layout from JSDoc example
      container.style.width = "400px";
      container.style.height = "300px";

      resizeCanvasStyle(container, canvas, 800, 600);

      // 4:3 aspect ratio should fit perfectly
      expect(canvas.style.width).toBe("400px");
      expect(canvas.style.height).toBe("300px");
    });

    test("should handle responsive design scenario", () => {
      // Test responsive behavior with changing container size
      container.style.width = "800px";
      container.style.height = "600px";

      resizeCanvasStyle(container, canvas, 1920, 1080);

      const firstWidth = canvas.style.width;
      const firstHeight = canvas.style.height;

      // Simulate window resize
      container.style.width = "1200px";
      container.style.height = "900px";

      resizeCanvasStyle(container, canvas, 1920, 1080);

      // Canvas should adapt to new container size
      expect(canvas.style.width).not.toBe(firstWidth);
      expect(canvas.style.height).not.toBe(firstHeight);
      expect(canvas.style.width).toBe("1200px");
      const actualHeight = parseFloat(canvas.style.height);
      const expectedHeight = 1200 / (1920 / 1080); // = 675
      expect(actualHeight).toBeCloseTo(expectedHeight, 2);
    });

    test("should work with different HTML container elements", () => {
      // Test with different container element types
      const divContainer = document.createElement("div");
      const sectionContainer = document.createElement("section");
      const mainContainer = document.createElement("main");

      divContainer.style.width = "600px";
      divContainer.style.height = "400px";
      sectionContainer.style.width = "600px";
      sectionContainer.style.height = "400px";
      mainContainer.style.width = "600px";
      mainContainer.style.height = "400px";

      document.body.appendChild(divContainer);
      document.body.appendChild(sectionContainer);
      document.body.appendChild(mainContainer);

      try {
        // Should work with any HTMLElement (600x400 container with 800x600 canvas = fit width)
        resizeCanvasStyle(divContainer, canvas, 800, 600);
        const actualWidth1 = parseFloat(canvas.style.width);
        const expectedWidth1 = 400 * (800 / 600); // Container height * aspect ratio = 533.33
        expect(actualWidth1).toBeCloseTo(expectedWidth1, 2);

        resizeCanvasStyle(sectionContainer, canvas, 800, 600);
        const actualWidth2 = parseFloat(canvas.style.width);
        expect(actualWidth2).toBeCloseTo(expectedWidth1, 2);

        resizeCanvasStyle(mainContainer, canvas, 800, 600);
        const actualWidth3 = parseFloat(canvas.style.width);
        expect(actualWidth3).toBeCloseTo(expectedWidth1, 2);
      } finally {
        // Cleanup
        document.body.removeChild(divContainer);
        document.body.removeChild(sectionContainer);
        document.body.removeChild(mainContainer);
      }
    });
  });

  describe("Device independence", () => {
    test("should produce consistent results regardless of devicePixelRatio", () => {
      container.style.width = "800px";
      container.style.height = "600px";

      // Store original devicePixelRatio
      const originalRatio = window.devicePixelRatio;

      try {
        // Test with standard ratio (1.0)
        Object.defineProperty(window, "devicePixelRatio", {
          writable: true,
          configurable: true,
          value: 1.0,
        });

        resizeCanvasStyle(container, canvas, 1920, 1080);
        const width1 = canvas.style.width;
        const height1 = canvas.style.height;

        // Test with high-DPI ratio (2.0)
        Object.defineProperty(window, "devicePixelRatio", {
          writable: true,
          configurable: true,
          value: 2.0,
        });

        resizeCanvasStyle(container, canvas, 1920, 1080);
        const width2 = canvas.style.width;
        const height2 = canvas.style.height;

        // Test with very high-DPI ratio (3.0)
        Object.defineProperty(window, "devicePixelRatio", {
          writable: true,
          configurable: true,
          value: 3.0,
        });

        resizeCanvasStyle(container, canvas, 1920, 1080);
        const width3 = canvas.style.width;
        const height3 = canvas.style.height;

        // Test with browser zoom out (0.5 - common when zoomed out to 50%)
        Object.defineProperty(window, "devicePixelRatio", {
          writable: true,
          configurable: true,
          value: 0.5,
        });

        resizeCanvasStyle(container, canvas, 1920, 1080);
        const width4 = canvas.style.width;
        const height4 = canvas.style.height;

        // Test with extreme fractional ratio (1.25 - common on some Windows displays)
        Object.defineProperty(window, "devicePixelRatio", {
          writable: true,
          configurable: true,
          value: 1.25,
        });

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
        Object.defineProperty(window, "devicePixelRatio", {
          writable: true,
          configurable: true,
          value: originalRatio,
        });
      }
    });
  });

  describe("Performance and rendering consistency", () => {
    test("should maintain canvas pixel dimensions after multiple calls", () => {
      const originalWidth = canvas.width;
      const originalHeight = canvas.height;

      // Multiple resize operations
      for (let i = 0; i < 10; i++) {
        container.style.width = `${400 + i * 100}px`;
        container.style.height = `${300 + i * 75}px`;
        resizeCanvasStyle(container, canvas, 1920, 1080);
      }

      // Canvas pixel dimensions should never change
      expect(canvas.width).toBe(originalWidth);
      expect(canvas.height).toBe(originalHeight);
    });

    test("should produce consistent results with identical inputs", () => {
      container.style.width = "1000px";
      container.style.height = "750px";

      resizeCanvasStyle(container, canvas, 1600, 900);
      const firstWidth = canvas.style.width;
      const firstHeight = canvas.style.height;

      // Call again with same parameters
      resizeCanvasStyle(container, canvas, 1600, 900);

      // Results should be identical
      expect(canvas.style.width).toBe(firstWidth);
      expect(canvas.style.height).toBe(firstHeight);
    });
  });
});
