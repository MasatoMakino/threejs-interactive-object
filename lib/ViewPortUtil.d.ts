import { Vector2, Vector4 } from "three";
export interface Rectangle {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}
/**
 * ViewPort矩形に関する処理を受け持つユーティリティクラス
 */
export declare class ViewPortUtil {
    /**
     * ViewportをCanvas内のRectangleに変換する
     * @param canvas
     * @param viewport
     */
    static convertToRectangle(canvas: HTMLCanvasElement, viewport: Vector4): Rectangle;
    /**
     * マウスポインターが指定されたviewport内に収まっているかを判定する。
     * @param canvas
     * @param viewport
     * @param event
     */
    static isContain(canvas: HTMLCanvasElement, viewport: Vector4, event: MouseEvent): boolean;
    /**
     * マウスイベントをWebGL座標系に変換する
     * @param canvas
     * @param event
     * @param mouse オプション 指定された場合、結果をこのVector2に上書きする
     */
    static convertToMousePosition(canvas: HTMLCanvasElement, event: MouseEvent, viewport: Vector4, mouse?: Vector2): Vector2;
    private static getMousePosition;
    private static getCanvasMousePosition;
    private static getViewportMousePosition;
}
//# sourceMappingURL=ViewPortUtil.d.ts.map