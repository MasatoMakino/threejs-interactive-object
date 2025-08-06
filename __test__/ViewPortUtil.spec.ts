import { getPointerEvent } from "@masatomakino/fake-mouse-event";
import { Vector2, Vector4 } from "three";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { ViewPortUtil } from "../src/index.js";

describe("ViewPortUtil", () => {
  let canvas: HTMLCanvasElement;
  let viewport: Vector4;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    canvas.style.width = "640px";
    canvas.style.height = "480px";
    canvas.style.setProperty("margin", "0");
    canvas.style.setProperty("padding", "0");
    document.body.appendChild(canvas);

    viewport = new Vector4(10, 6, 128, 64);
  });

  afterEach(() => {
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });

  test("converts viewport to rectangle with correct coordinate transformation", () => {
    const rect = ViewPortUtil.convertToRectangle(canvas, viewport);
    expect(rect).toStrictEqual({
      x1: 10,
      x2: 138,
      y1: 410,
      y2: 474,
    });
  });

  test("returns true for isContain when viewport is undefined", () => {
    const e = getPointerEvent("pointermove", {
      offsetX: 16,
      offsetY: 420,
    }) as unknown as PointerEvent;
    expect(ViewPortUtil.isContain(canvas, undefined, e)).toBe(true);
  });

  test("correctly validates point containment within defined viewport", () => {
    const e = getPointerEvent("pointermove", {
      offsetX: 16,
      offsetY: 420,
    }) as unknown as PointerEvent;
    expect(ViewPortUtil.isContain(canvas, viewport, e)).toBe(true);
  });

  test("converts pointer coordinates to NDC for full-canvas viewport", () => {
    testPoint(0, 0, -1, 1, canvas, undefined);
    testPoint(16, 420, -0.95, -0.75, canvas, undefined);
    testPoint(640, 480, 1, -1, canvas, undefined);
  });

  test("converts pointer coordinates to NDC relative to specific viewport", () => {
    testPoint(10, 410, -1, 1, canvas, viewport);
    testPoint(16, 420, -0.90625, 0.6875, canvas, viewport);
    testPoint(138, 474, 1, -1, canvas, viewport);
  });

  describe("Boundary conditions and error handling", () => {
    describe("convertToRectangle edge cases", () => {
      test("handles zero-sized viewport dimensions correctly", () => {
        const zeroViewport = new Vector4(50, 50, 0, 0);
        const rect = ViewPortUtil.convertToRectangle(canvas, zeroViewport);

        const expectedY1 =
          canvas.height - (zeroViewport.y + zeroViewport.height); // 480 - (50 + 0) = 430
        const expectedY2 = canvas.height - zeroViewport.y; // 480 - 50 = 430

        expect(rect).toStrictEqual({
          x1: 50,
          x2: 50,
          y1: expectedY1,
          y2: expectedY2,
        });
      });

      test("handles negative viewport dimensions without errors", () => {
        const negativeViewport = new Vector4(100, 100, -50, -30);
        const rect = ViewPortUtil.convertToRectangle(canvas, negativeViewport);

        const expectedX2 = negativeViewport.x + negativeViewport.width; // 100 + (-50) = 50
        const expectedY1 =
          canvas.height - (negativeViewport.y + negativeViewport.height); // 480 - (100 + (-30)) = 410
        const expectedY2 = canvas.height - negativeViewport.y; // 480 - 100 = 380

        expect(rect).toStrictEqual({
          x1: 100,
          x2: expectedX2,
          y1: expectedY1,
          y2: expectedY2,
        });
      });

      test("handles viewport exceeding canvas boundaries", () => {
        const largeViewport = new Vector4(0, 0, 1000, 800);
        const rect = ViewPortUtil.convertToRectangle(canvas, largeViewport);

        const expectedY1 =
          canvas.height - (largeViewport.y + largeViewport.height); // 480 - (0 + 800) = -320
        const expectedY2 = canvas.height - largeViewport.y; // 480 - 0 = 480

        expect(rect).toStrictEqual({
          x1: 0,
          x2: 1000,
          y1: expectedY1,
          y2: expectedY2,
        });
      });

      test("handles fractional viewport coordinates with precision", () => {
        const fractionalViewport = new Vector4(10.5, 20.3, 100.7, 50.9);
        const rect = ViewPortUtil.convertToRectangle(
          canvas,
          fractionalViewport,
        );

        const expectedX2 = fractionalViewport.x + fractionalViewport.width; // 10.5 + 100.7 = 111.2
        const expectedY1 =
          canvas.height - (fractionalViewport.y + fractionalViewport.height); // 480 - (20.3 + 50.9) = 408.8
        const expectedY2 = canvas.height - fractionalViewport.y; // 480 - 20.3 = 459.7

        expect(rect.x1).toBeCloseTo(10.5, 2);
        expect(rect.x2).toBeCloseTo(expectedX2, 2);
        expect(rect.y1).toBeCloseTo(expectedY1, 2);
        expect(rect.y2).toBeCloseTo(expectedY2, 2);
      });
    });

    describe("Viewport containment validation", () => {
      test("validates precise viewport boundary containment", () => {
        // Test exact viewport boundaries
        const testBoundaries = [
          { x: 10, y: 410, expected: true }, // Top-left corner
          { x: 138, y: 410, expected: true }, // Top-right corner
          { x: 10, y: 474, expected: true }, // Bottom-left corner
          { x: 138, y: 474, expected: true }, // Bottom-right corner
          { x: 9, y: 410, expected: false }, // Just outside left
          { x: 139, y: 410, expected: false }, // Just outside right
          { x: 10, y: 409, expected: false }, // Just outside top
          { x: 10, y: 475, expected: false }, // Just outside bottom
        ];

        testBoundaries.forEach(({ x, y, expected }) => {
          const e = getPointerEvent("pointermove", {
            offsetX: x,
            offsetY: y,
          }) as unknown as PointerEvent;
          expect(ViewPortUtil.isContain(canvas, viewport, e)).toBe(expected);
        });
      });

      test("returns true for undefined viewport parameter", () => {
        const e = getPointerEvent("pointermove", {
          offsetX: 100,
          offsetY: 200,
        }) as unknown as PointerEvent;

        expect(ViewPortUtil.isContain(canvas, undefined, e)).toBe(true);
      });
    });
  });

  describe("Coordinate transformation accuracy", () => {
    describe("Numerical precision", () => {
      test("maintains precision for fractional input coordinates", () => {
        const fractionalCoords = [
          { x: 15.5, y: 420.3 },
          { x: 100.123, y: 200.987 },
          { x: 0.1, y: 479.9 },
        ];

        fractionalCoords.forEach(({ x, y }) => {
          const e = getPointerEvent("pointermove", {
            offsetX: x,
            offsetY: y,
          }) as unknown as PointerEvent;

          const pos = ViewPortUtil.convertToMousePosition(canvas, e, undefined);

          // Verify NDC range is maintained
          expect(pos.x).toBeGreaterThanOrEqual(-1);
          expect(pos.x).toBeLessThanOrEqual(1);
          expect(pos.y).toBeGreaterThanOrEqual(-1);
          expect(pos.y).toBeLessThanOrEqual(1);

          // Verify precision is maintained in calculations
          const expectedX = (x / 640) * 2 - 1;
          const expectedY = -(y / 480) * 2 + 1;
          expect(pos.x).toBeCloseTo(expectedX, 10);
          expect(pos.y).toBeCloseTo(expectedY, 10);
        });
      });
    });

    describe("NDC range validation", () => {
      test("should always produce coordinates within NDC range for canvas boundaries", () => {
        const boundaryPoints = [
          { x: 0, y: 0 },
          { x: 640, y: 0 },
          { x: 0, y: 480 },
          { x: 640, y: 480 },
          { x: 320, y: 240 }, // Center
        ];

        boundaryPoints.forEach(({ x, y }) => {
          const e = getPointerEvent("pointermove", {
            offsetX: x,
            offsetY: y,
          }) as unknown as PointerEvent;

          const pos = ViewPortUtil.convertToMousePosition(canvas, e, undefined);

          expect(pos.x).toBeGreaterThanOrEqual(-1);
          expect(pos.x).toBeLessThanOrEqual(1);
          expect(pos.y).toBeGreaterThanOrEqual(-1);
          expect(pos.y).toBeLessThanOrEqual(1);
        });
      });

      test("should produce exact NDC boundary values for viewport corners", () => {
        // Test viewport corners produce exact -1 or 1 values
        const cornerTests = [
          { x: 10, y: 410, expectedX: -1, expectedY: 1 }, // Top-left
          { x: 138, y: 410, expectedX: 1, expectedY: 1 }, // Top-right
          { x: 10, y: 474, expectedX: -1, expectedY: -1 }, // Bottom-left
          { x: 138, y: 474, expectedX: 1, expectedY: -1 }, // Bottom-right
        ];

        cornerTests.forEach(({ x, y, expectedX, expectedY }) => {
          const e = getPointerEvent("pointermove", {
            offsetX: x,
            offsetY: y,
          }) as unknown as PointerEvent;

          const pos = ViewPortUtil.convertToMousePosition(canvas, e, viewport);
          expect(pos.x).toBeCloseTo(expectedX, 2);
          expect(pos.y).toBeCloseTo(expectedY, 2);
        });
      });

      test("should handle viewport center correctly", () => {
        // Viewport center should produce (0, 0) in NDC
        const centerX = viewport.x + viewport.width / 2; // 10 + 128/2 = 74
        const _centerY = viewport.y + viewport.height / 2; // 6 + 64/2 = 38
        const canvasCenterY =
          canvas.height - (viewport.y + viewport.height / 2); // 480 - (6 + 32) = 442

        const e = getPointerEvent("pointermove", {
          offsetX: centerX,
          offsetY: canvasCenterY,
        }) as unknown as PointerEvent;

        const pos = ViewPortUtil.convertToMousePosition(canvas, e, viewport);
        expect(pos.x).toBeCloseTo(0, 2);
        expect(pos.y).toBeCloseTo(0, 2);
      });
    });
  });

  describe("Performance and optimization", () => {
    describe("Vector reuse optimization", () => {
      test("should reuse provided Vector2 instance", () => {
        const reusableVector = new Vector2(999, 999); // Set initial values to detect reuse
        const e = getPointerEvent("pointermove", {
          offsetX: 74, // Center of viewport (10 + 128/2 = 74)
          offsetY: 442, // Center of viewport (410 + 64/2 = 442)
        }) as unknown as PointerEvent;

        const result = ViewPortUtil.convertToMousePosition(
          canvas,
          e,
          viewport,
          reusableVector,
        );

        // Should return the same instance
        expect(result).toBe(reusableVector);

        // Should have updated values, not initial ones
        expect(result.x).not.toBe(999);
        expect(result.y).not.toBe(999);

        // Viewport center should produce (0, 0) in NDC
        expect(result.x).toBeCloseTo(0, 2);
        expect(result.y).toBeCloseTo(0, 2);
      });

      test("should create new Vector2 when none provided", () => {
        const e = getPointerEvent("pointermove", {
          offsetX: 74, // Center of viewport
          offsetY: 442, // Center of viewport
        }) as unknown as PointerEvent;

        const result = ViewPortUtil.convertToMousePosition(canvas, e, viewport);

        expect(result).toBeInstanceOf(Vector2);
        expect(result.x).toBeCloseTo(0, 2);
        expect(result.y).toBeCloseTo(0, 2);
      });
    });

    describe("Function routing efficiency", () => {
      test("should route to appropriate coordinate function based on viewport presence", () => {
        const testCoords = { offsetX: 74, offsetY: 442 }; // Center coordinates

        // Test without viewport - should use canvas-wide conversion
        const e1 = getPointerEvent(
          "pointermove",
          testCoords,
        ) as unknown as PointerEvent;
        const resultWithoutViewport = ViewPortUtil.convertToMousePosition(
          canvas,
          e1,
          undefined,
        );

        // Test with viewport - should use viewport-specific conversion
        const e2 = getPointerEvent(
          "pointermove",
          testCoords,
        ) as unknown as PointerEvent;
        const resultWithViewport = ViewPortUtil.convertToMousePosition(
          canvas,
          e2,
          viewport,
        );

        // Results should be different, confirming different code paths
        expect(resultWithoutViewport.x).not.toBeCloseTo(
          resultWithViewport.x,
          2,
        );
        expect(resultWithoutViewport.y).not.toBeCloseTo(
          resultWithViewport.y,
          2,
        );

        // Both should be valid NDC coordinates
        [resultWithoutViewport, resultWithViewport].forEach((result) => {
          expect(result.x).toBeGreaterThanOrEqual(-1);
          expect(result.x).toBeLessThanOrEqual(1);
          expect(result.y).toBeGreaterThanOrEqual(-1);
          expect(result.y).toBeLessThanOrEqual(1);
        });
      });

      test("should handle high-frequency coordinate conversions efficiently", () => {
        const startTime = performance.now();
        const iterations = 1000;
        const testCoords = { offsetX: 100, offsetY: 200 };

        // Perform many coordinate conversions
        for (let i = 0; i < iterations; i++) {
          const e = getPointerEvent(
            "pointermove",
            testCoords,
          ) as unknown as PointerEvent;
          ViewPortUtil.convertToMousePosition(canvas, e, viewport);
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTimePerCall = totalTime / iterations;

        // Should complete reasonably quickly (less than 1ms per call on average)
        expect(avgTimePerCall).toBeLessThan(1.0);

        // Total time should be reasonable (less than 100ms for 1000 calls)
        expect(totalTime).toBeLessThan(100);
      });
    });
  });

  describe("Multi-viewport and practical scenarios", () => {
    describe("Multiple viewport configurations", () => {
      test("should handle adjacent non-overlapping viewports", () => {
        const leftViewport = new Vector4(0, 0, 320, 240);
        const rightViewport = new Vector4(320, 0, 320, 240);

        // Test point in left viewport
        const leftCenterX = leftViewport.width / 2; // 320 / 2 = 160
        const leftCenterY =
          canvas.height - (leftViewport.y + leftViewport.height / 2); // 480 - (0 + 120) = 360

        const leftPoint = getPointerEvent("pointermove", {
          offsetX: leftCenterX,
          offsetY: leftCenterY,
        }) as unknown as PointerEvent;

        const leftResult = ViewPortUtil.convertToMousePosition(
          canvas,
          leftPoint,
          leftViewport,
        );
        expect(leftResult.x).toBeCloseTo(0, 2); // Center
        expect(leftResult.y).toBeCloseTo(0, 2); // Center

        // Test point in right viewport
        const rightCenterX = rightViewport.x + rightViewport.width / 2; // 320 + 160 = 480
        const rightCenterY =
          canvas.height - (rightViewport.y + rightViewport.height / 2); // 480 - (0 + 120) = 360

        const rightPoint = getPointerEvent("pointermove", {
          offsetX: rightCenterX,
          offsetY: rightCenterY,
        }) as unknown as PointerEvent;

        const rightResult = ViewPortUtil.convertToMousePosition(
          canvas,
          rightPoint,
          rightViewport,
        );
        expect(rightResult.x).toBeCloseTo(0, 2); // Center
        expect(rightResult.y).toBeCloseTo(0, 2); // Center
      });

      test("should handle overlapping viewport scenarios", () => {
        const mainViewport = new Vector4(0, 0, 400, 300);
        const overlayViewport = new Vector4(100, 50, 200, 150);

        // Use a point that's within both viewports
        const mainCanvasTopY = canvas.height - mainViewport.height; // 480 - 300 = 180
        const overlayCanvasTopY =
          canvas.height - (overlayViewport.y + overlayViewport.height); // 480 - (50 + 150) = 280
        // Choose a point in overlapping region: x=150, y between overlayCanvasTopY(280) and mainCanvasTopY+120(300)
        const testPoint = { offsetX: 150, offsetY: 300 };

        const e1 = getPointerEvent(
          "pointermove",
          testPoint,
        ) as unknown as PointerEvent;
        const mainResult = ViewPortUtil.convertToMousePosition(
          canvas,
          e1,
          mainViewport,
        );

        const e2 = getPointerEvent(
          "pointermove",
          testPoint,
        ) as unknown as PointerEvent;
        const overlayResult = ViewPortUtil.convertToMousePosition(
          canvas,
          e2,
          overlayViewport,
        );

        // Different viewports should produce different NDC coordinates for same point
        expect(Math.abs(mainResult.x - overlayResult.x)).toBeGreaterThan(0.1);

        // For mainViewport: x=(150/400)*2-1=-0.25, y=-(300-180)/300*2+1=0.2
        const expectedMainX = (testPoint.offsetX / mainViewport.width) * 2 - 1; // (150/400)*2-1 = -0.25
        const expectedMainY =
          -((testPoint.offsetY - mainCanvasTopY) / mainViewport.height) * 2 + 1; // -(300-180)/300*2+1 = 0.2
        expect(mainResult.x).toBeCloseTo(expectedMainX, 2);
        expect(mainResult.y).toBeCloseTo(expectedMainY, 2);

        // For overlayViewport: x=(150-100)/200*2-1=-0.5, y=-(300-280)/150*2+1=0.733
        const expectedOverlayX =
          ((testPoint.offsetX - overlayViewport.x) / overlayViewport.width) *
            2 -
          1; // (150-100)/200*2-1 = -0.5
        const expectedOverlayY =
          -((testPoint.offsetY - overlayCanvasTopY) / overlayViewport.height) *
            2 +
          1; // -(300-280)/150*2+1 = 0.733
        expect(overlayResult.x).toBeCloseTo(expectedOverlayX, 2);
        expect(overlayResult.y).toBeCloseTo(expectedOverlayY, 2);
      });

      test("should handle various aspect ratio viewports", () => {
        const testCases = [
          { name: "Square", viewport: new Vector4(0, 0, 200, 200) },
          { name: "Wide", viewport: new Vector4(0, 200, 400, 100) },
          { name: "Tall", viewport: new Vector4(400, 0, 100, 400) },
          { name: "Ultra-wide", viewport: new Vector4(0, 400, 600, 80) },
        ];

        testCases.forEach(({ viewport: vp }) => {
          // Test center point of each viewport
          const centerX = vp.x + vp.width / 2;
          const centerY = 480 - (vp.y + vp.height / 2);

          const e = getPointerEvent("pointermove", {
            offsetX: centerX,
            offsetY: centerY,
          }) as unknown as PointerEvent;

          const result = ViewPortUtil.convertToMousePosition(canvas, e, vp);

          // Center should always map to (0, 0) regardless of aspect ratio
          expect(result.x).toBeCloseTo(0, 2);
          expect(result.y).toBeCloseTo(0, 2);
        });
      });
    });

    describe("Demo viewport scenario emulation", () => {
      test("should emulate demo_viewport.js dual-scene setup", () => {
        // Recreate the exact viewport setup from demo_viewport.js
        const scene1Viewport = new Vector4(20, 20, 480, 360);
        const scene2Viewport = new Vector4(480, 360, 520, 480);

        // Test scene1 center point
        const scene1CenterX = scene1Viewport.x + scene1Viewport.width / 2; // 20 + 240 = 260
        const scene1CenterY =
          canvas.height - (scene1Viewport.y + scene1Viewport.height / 2); // 480 - (20 + 180) = 280

        const scene1Event = getPointerEvent("pointermove", {
          offsetX: scene1CenterX,
          offsetY: scene1CenterY,
        }) as unknown as PointerEvent;

        const scene1Result = ViewPortUtil.convertToMousePosition(
          canvas,
          scene1Event,
          scene1Viewport,
        );
        expect(scene1Result.x).toBeCloseTo(0, 2);
        expect(scene1Result.y).toBeCloseTo(0, 2);

        // Test scene2 center point
        const scene2CenterX = scene2Viewport.x + scene2Viewport.width / 2; // 480 + 260 = 740
        const scene2CenterY =
          canvas.height - (scene2Viewport.y + scene2Viewport.height / 2); // 480 - (360 + 240) = -120

        const scene2Event = getPointerEvent("pointermove", {
          offsetX: scene2CenterX,
          offsetY: scene2CenterY,
        }) as unknown as PointerEvent;

        const scene2Result = ViewPortUtil.convertToMousePosition(
          canvas,
          scene2Event,
          scene2Viewport,
        );
        expect(scene2Result.x).toBeCloseTo(0, 2);
        expect(scene2Result.y).toBeCloseTo(0, 2);

        // Test containment for both viewports
        expect(
          ViewPortUtil.isContain(canvas, scene1Viewport, scene1Event),
        ).toBe(true);
        expect(
          ViewPortUtil.isContain(canvas, scene2Viewport, scene2Event),
        ).toBe(true);

        // Cross-containment should be false
        expect(
          ViewPortUtil.isContain(canvas, scene1Viewport, scene2Event),
        ).toBe(false);
        expect(
          ViewPortUtil.isContain(canvas, scene2Viewport, scene1Event),
        ).toBe(false);
      });
    });

    describe("Real-world usage patterns", () => {
      test("should handle rapid viewport switching", () => {
        const viewports = [
          new Vector4(0, 0, 160, 120),
          new Vector4(160, 0, 160, 120),
          new Vector4(320, 0, 160, 120),
          new Vector4(480, 0, 160, 120),
        ];

        const firstViewportCenterX = viewports[0].width / 2; // 160 / 2 = 80
        const firstViewportCenterY =
          canvas.height - (viewports[0].y + viewports[0].height / 2); // 480 - (0 + 60) = 420
        const testPoint = {
          offsetX: firstViewportCenterX,
          offsetY: firstViewportCenterY,
        };

        viewports.forEach((vp, index) => {
          const e = getPointerEvent(
            "pointermove",
            testPoint,
          ) as unknown as PointerEvent;

          // Only first viewport should contain the point
          const contained = ViewPortUtil.isContain(canvas, vp, e);
          expect(contained).toBe(index === 0);

          if (index === 0) {
            const result = ViewPortUtil.convertToMousePosition(canvas, e, vp);
            expect(result.x).toBeCloseTo(0, 2); // Center of viewport
            expect(result.y).toBeCloseTo(0, 2);
          }
        });
      });

      test("should maintain consistency across canvas size changes", () => {
        // Test with different canvas sizes but same relative viewport
        const testSizes = [
          { width: 320, height: 240 },
          { width: 800, height: 600 },
          { width: 1920, height: 1080 },
        ];

        testSizes.forEach(({ width, height }) => {
          // Create temporary canvas with different size
          const testCanvas = document.createElement("canvas");
          testCanvas.width = width;
          testCanvas.height = height;
          testCanvas.style.width = `${width}px`;
          testCanvas.style.height = `${height}px`;
          document.body.appendChild(testCanvas);

          try {
            // Create viewport that's 25% of canvas size, centered
            const vpWidth = width * 0.25;
            const vpHeight = height * 0.25;
            const vpX = (width - vpWidth) / 2;
            const vpY = (height - vpHeight) / 2;
            const testViewport = new Vector4(vpX, vpY, vpWidth, vpHeight);

            // Test center point
            const centerX = vpX + vpWidth / 2;
            const centerY = height - (vpY + vpHeight / 2);

            const e = getPointerEvent("pointermove", {
              offsetX: centerX,
              offsetY: centerY,
            }) as unknown as PointerEvent;

            const result = ViewPortUtil.convertToMousePosition(
              testCanvas,
              e,
              testViewport,
            );

            // Center should always be (0, 0) regardless of canvas size
            expect(result.x).toBeCloseTo(0, 1);
            expect(result.y).toBeCloseTo(0, 1);
          } finally {
            document.body.removeChild(testCanvas);
          }
        });
      });
    });
  });

  describe("Cross-browser and device compatibility", () => {
    describe("Canvas styling variations", () => {
      test("should handle canvas with margins and padding", () => {
        const styledCanvas = document.createElement("canvas");
        styledCanvas.width = 400;
        styledCanvas.height = 300;
        styledCanvas.style.width = "400px";
        styledCanvas.style.height = "300px";
        styledCanvas.style.setProperty("margin", "20px");
        styledCanvas.style.setProperty("padding", "10px");
        styledCanvas.style.setProperty("border", "5px solid red");
        document.body.appendChild(styledCanvas);

        try {
          // Test that function doesn't throw with styled canvas
          const vp = new Vector4(0, 0, 400, 300);

          const testEvent = getPointerEvent("pointermove", {
            offsetX: 100,
            offsetY: 150,
          }) as unknown as PointerEvent;

          const result = ViewPortUtil.convertToMousePosition(
            styledCanvas,
            testEvent,
            vp,
          );

          // Should produce valid NDC coordinates regardless of styling
          expect(result.x).toBeGreaterThanOrEqual(-1);
          expect(result.x).toBeLessThanOrEqual(1);
          expect(result.y).toBeGreaterThanOrEqual(-1);
          expect(result.y).toBeLessThanOrEqual(1);

          // Should also work with containment check
          expect(() => {
            ViewPortUtil.isContain(styledCanvas, vp, testEvent);
          }).not.toThrow();
        } finally {
          document.body.removeChild(styledCanvas);
        }
      });

      test("should handle canvas with CSS transforms", () => {
        const transformedCanvas = document.createElement("canvas");
        transformedCanvas.width = 400;
        transformedCanvas.height = 300;
        transformedCanvas.style.width = "400px";
        transformedCanvas.style.height = "300px";
        transformedCanvas.style.setProperty("transform", "scale(1.5)");
        transformedCanvas.style.setProperty("transform-origin", "0 0");
        document.body.appendChild(transformedCanvas);

        try {
          const vp = new Vector4(0, 0, 400, 300);

          // Test with scaled coordinates (offsetX/Y are still in original canvas space)
          const centerEvent = getPointerEvent("pointermove", {
            offsetX: 200, // Canvas center
            offsetY: 150,
          }) as unknown as PointerEvent;

          const result = ViewPortUtil.convertToMousePosition(
            transformedCanvas,
            centerEvent,
            vp,
          );

          // Center should still map to (0, 0)
          expect(result.x).toBeCloseTo(0, 2);
          expect(result.y).toBeCloseTo(0, 2);
        } finally {
          document.body.removeChild(transformedCanvas);
        }
      });

      test("should handle canvas size mismatch (CSS vs canvas dimensions)", () => {
        const mismatchCanvas = document.createElement("canvas");
        mismatchCanvas.width = 800; // Canvas pixel dimensions
        mismatchCanvas.height = 600;
        mismatchCanvas.style.width = "400px"; // CSS display dimensions (different!)
        mismatchCanvas.style.height = "300px";
        document.body.appendChild(mismatchCanvas);

        try {
          // Viewport coordinates should work with CSS dimensions, not canvas pixel dimensions
          const vp = new Vector4(0, 0, 200, 150); // Half of CSS dimensions

          const vpCenterX = vp.width / 2; // 200 / 2 = 100
          const vpCenterY = 300 - (vp.y + vp.height / 2); // 300 - (0 + 75) = 225

          const centerEvent = getPointerEvent("pointermove", {
            offsetX: vpCenterX,
            offsetY: vpCenterY,
          }) as unknown as PointerEvent;

          const result = ViewPortUtil.convertToMousePosition(
            mismatchCanvas,
            centerEvent,
            vp,
          );

          // Should work correctly with CSS dimensions
          expect(result.x).toBeCloseTo(0, 2);
          expect(result.y).toBeCloseTo(0, 2);
        } finally {
          document.body.removeChild(mismatchCanvas);
        }
      });
    });

    describe("High-DPI and device scaling", () => {
      test("should maintain coordinate accuracy across different DPI settings", () => {
        const originalRatio = window.devicePixelRatio;
        const testCoords = { offsetX: 74, offsetY: 442 };

        const setDevicePixelRatio = (ratio: number) => {
          Object.defineProperty(window, "devicePixelRatio", {
            writable: true,
            configurable: true,
            value: ratio,
          });
        };

        try {
          const dpiScenarios = [
            { dpi: 1.0, name: "Standard DPI" },
            { dpi: 1.25, name: "Windows 125% scaling" },
            { dpi: 1.5, name: "Windows 150% scaling" },
            { dpi: 2.0, name: "Retina/HiDPI 200%" },
            { dpi: 2.5, name: "Ultra-high DPI" },
            { dpi: 3.0, name: "Mobile high DPI" },
          ];

          const results: Array<{ name: string; result: Vector2 }> = [];

          dpiScenarios.forEach(({ dpi, name }) => {
            setDevicePixelRatio(dpi);
            const e = getPointerEvent(
              "pointermove",
              testCoords,
            ) as unknown as PointerEvent;
            const result = ViewPortUtil.convertToMousePosition(
              canvas,
              e,
              viewport,
            );
            results.push({ name, result: result.clone() });
          });

          // All results should be identical regardless of DPI
          const baseResult = results[0].result;
          results.slice(1).forEach(({ result }) => {
            expect(result.x).toBeCloseTo(baseResult.x, 10);
            expect(result.y).toBeCloseTo(baseResult.y, 10);
          });
        } finally {
          setDevicePixelRatio(originalRatio);
        }
      });

      test("should handle fractional pixel ratios correctly", () => {
        const originalRatio = window.devicePixelRatio;
        const fractionalRatios = [0.75, 1.25, 1.33, 1.67, 2.25];

        const setDevicePixelRatio = (ratio: number) => {
          Object.defineProperty(window, "devicePixelRatio", {
            writable: true,
            configurable: true,
            value: ratio,
          });
        };

        try {
          const testPoint = { offsetX: 74, offsetY: 442 }; // Use viewport center coordinates
          let previousResult: Vector2 | null = null;

          fractionalRatios.forEach((ratio) => {
            setDevicePixelRatio(ratio);
            const e = getPointerEvent(
              "pointermove",
              testPoint,
            ) as unknown as PointerEvent;
            const result = ViewPortUtil.convertToMousePosition(
              canvas,
              e,
              viewport,
            );

            // Result should be valid NDC coordinates
            expect(result.x).toBeGreaterThanOrEqual(-1);
            expect(result.x).toBeLessThanOrEqual(1);
            expect(result.y).toBeGreaterThanOrEqual(-1);
            expect(result.y).toBeLessThanOrEqual(1);

            // Results should be consistent regardless of fractional DPI
            if (previousResult) {
              expect(result.x).toBeCloseTo(previousResult.x, 8);
              expect(result.y).toBeCloseTo(previousResult.y, 8);
            }
            previousResult = result.clone();
          });
        } finally {
          setDevicePixelRatio(originalRatio);
        }
      });
    });

    describe("Touch and pointer device compatibility", () => {
      test("should handle touch events with same coordinate logic", () => {
        // Test that touch events (which are also PointerEvents) work the same way
        const touchEvent = {
          offsetX: 74,
          offsetY: 442,
          pointerId: 1,
          pointerType: "touch",
        } as PointerEvent;

        const touchResult = ViewPortUtil.convertToMousePosition(
          canvas,
          touchEvent,
          viewport,
        );

        // Should produce same result as mouse events
        const mouseEvent = getPointerEvent("pointermove", {
          offsetX: 74,
          offsetY: 442,
        }) as unknown as PointerEvent;
        const mouseResult = ViewPortUtil.convertToMousePosition(
          canvas,
          mouseEvent,
          viewport,
        );

        expect(touchResult.x).toBeCloseTo(mouseResult.x, 10);
        expect(touchResult.y).toBeCloseTo(mouseResult.y, 10);
      });

      test("should handle pen/stylus events correctly", () => {
        // Test pen events with pressure and tilt (should not affect coordinate calculation)
        const penEvent = {
          offsetX: 74, // Use viewport center coordinates
          offsetY: 442,
          pointerId: 2,
          pointerType: "pen",
          pressure: 0.7,
          tiltX: 15,
          tiltY: -10,
        } as PointerEvent;

        const penResult = ViewPortUtil.convertToMousePosition(
          canvas,
          penEvent,
          viewport,
        );

        // Should be valid coordinates regardless of pen properties
        expect(penResult.x).toBeGreaterThanOrEqual(-1);
        expect(penResult.x).toBeLessThanOrEqual(1);
        expect(penResult.y).toBeGreaterThanOrEqual(-1);
        expect(penResult.y).toBeLessThanOrEqual(1);

        // Should match mouse event with same coordinates
        const mouseEvent = getPointerEvent("pointermove", {
          offsetX: 74,
          offsetY: 442,
        }) as unknown as PointerEvent;
        const mouseResult = ViewPortUtil.convertToMousePosition(
          canvas,
          mouseEvent,
          viewport,
        );

        expect(penResult.x).toBeCloseTo(mouseResult.x, 2);
        expect(penResult.y).toBeCloseTo(mouseResult.y, 2);
      });

      test("should work consistently across different pointer types", () => {
        const testCoords = { offsetX: 120, offsetY: 400 };
        const pointerTypes = [
          { type: "mouse", pointerId: 1 },
          { type: "touch", pointerId: 2 },
          { type: "pen", pointerId: 3 },
        ];

        const results: Vector2[] = [];

        pointerTypes.forEach(({ type, pointerId }) => {
          const pointerEvent = {
            ...testCoords,
            pointerId,
            pointerType: type,
          } as PointerEvent;

          const result = ViewPortUtil.convertToMousePosition(
            canvas,
            pointerEvent,
            viewport,
          );
          results.push(result.clone());
        });

        // All pointer types should produce identical results
        const baseResult = results[0];
        results.slice(1).forEach((result) => {
          expect(result.x).toBeCloseTo(baseResult.x, 10);
          expect(result.y).toBeCloseTo(baseResult.y, 10);
        });
      });
    });
  });
});

function testPoint(
  offsetX: number,
  offsetY: number,
  resultX: number,
  resultY: number,
  canvas: HTMLCanvasElement,
  viewport?: Vector4,
): void {
  const e = getPointerEvent("pointermove", {
    offsetX,
    offsetY,
  }) as unknown as PointerEvent;
  const pos = ViewPortUtil.convertToMousePosition(
    canvas,
    e,
    viewport,
    undefined,
  );
  expect(pos).toEqual(new Vector2(resultX, resultY));
}
