"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewPortUtil = void 0;
const three_1 = require("three");
/**
 * ViewPort矩形に関する処理を受け持つユーティリティクラス
 */
class ViewPortUtil {
    /**
     * ViewportをCanvas内のRectangleに変換する
     * @param canvas
     * @param viewport
     */
    static convertToRectangle(canvas, viewport) {
        return {
            x1: viewport.x,
            x2: viewport.x + viewport.width,
            y1: canvas.height - (viewport.y + viewport.height),
            y2: canvas.height - viewport.y,
        };
    }
    /**
     * マウスポインターが指定されたviewport内に収まっているかを判定する。
     * @param canvas
     * @param viewport
     * @param event
     */
    static isContain(canvas, viewport, event) {
        if (viewport == null) {
            return true;
        }
        const rect = this.convertToRectangle(canvas, viewport);
        return (event.offsetX >= rect.x1 &&
            event.offsetX <= rect.x2 &&
            event.offsetY >= rect.y1 &&
            event.offsetY <= rect.y2);
    }
    /**
     * マウスイベントをWebGL座標系に変換する
     * @param canvas
     * @param event
     * @param mouse オプション 指定された場合、結果をこのVector2に上書きする
     */
    static convertToMousePosition(canvas, event, viewport, mouse) {
        const { x, y } = this.getMousePosition(canvas, event, viewport);
        if (mouse) {
            mouse.set(x, y);
            return mouse;
        }
        return new three_1.Vector2(x, y);
    }
    static getMousePosition(canvas, event, viewport) {
        if (viewport) {
            return this.getViewportMousePosition(canvas, event, viewport);
        }
        return this.getCanvasMousePosition(canvas, event);
    }
    static getCanvasMousePosition(canvas, event) {
        const x = (event.offsetX / canvas.clientWidth) * 2 - 1;
        const y = -(event.offsetY / canvas.clientHeight) * 2 + 1;
        return { x, y };
    }
    static getViewportMousePosition(canvas, event, viewport) {
        const rect = this.convertToRectangle(canvas, viewport);
        const mouseX = event.offsetX - rect.x1;
        const mouseY = event.offsetY - rect.y1;
        const width = rect.x2 - rect.x1;
        const height = rect.y2 - rect.y1;
        const x = (mouseX / width) * 2 - 1;
        const y = -(mouseY / height) * 2 + 1;
        return { x, y };
    }
}
exports.ViewPortUtil = ViewPortUtil;
