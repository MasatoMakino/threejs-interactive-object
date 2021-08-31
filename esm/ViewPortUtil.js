import { Vector2 } from "three";
/**
 * ViewPort矩形に関する処理を受け持つユーティリティクラス
 */
export class ViewPortUtil {
    /**
     * canvasの高さを取得する。
     *
     * three.jsのWebGLRendererは、devicePixelRatioにあわせてcanvas.heightを変更する。
     * ブラウザの拡大縮小を行うと、devicePixelRatioが変更されるためcanvas.heightを取得できない。
     * そのためまずstyleから高さを取得し、styleがない場合はdevicePixelRatioを加味した高さを取得する。
     *
     * @param canvas
     * @private
     */
    static getCanvasHeight(canvas) {
        const style = canvas.style;
        if (style.width && style.height) {
            return parseInt(style.height);
        }
        else if (window.devicePixelRatio != null) {
            return canvas.height / window.devicePixelRatio;
        }
        return canvas.height;
    }
    /**
     * ViewportをCanvas内のRectangleに変換する
     * @param canvas
     * @param viewport
     */
    static convertToRectangle(canvas, viewport) {
        const height = this.getCanvasHeight(canvas);
        return {
            x1: viewport.x,
            x2: viewport.x + viewport.width,
            y1: height - (viewport.y + viewport.height),
            y2: height - viewport.y,
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
     * @param viewport
     * @param mouse オプション 指定された場合、結果をこのVector2に上書きする
     */
    static convertToMousePosition(canvas, event, viewport, mouse) {
        const { x, y } = this.getMousePosition(canvas, event, viewport);
        if (mouse) {
            mouse.set(x, y);
            return mouse;
        }
        return new Vector2(x, y);
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
