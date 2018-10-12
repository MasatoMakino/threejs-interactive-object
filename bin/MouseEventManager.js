import { Raycaster, Vector2 } from "three";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
export class MouseEventManager {
    static init(scene, camera, renderer) {
        MouseEventManager.camera = camera;
        MouseEventManager.renderer = renderer;
        MouseEventManager.scene = scene;
        const canvas = renderer.domElement;
        MouseEventManager.canvas = canvas;
        canvas.addEventListener("mousemove", MouseEventManager.onDocumentMouseMove, false);
        canvas.addEventListener("mousedown", MouseEventManager.onDocumentMouseDown, false);
        canvas.addEventListener("mouseup", MouseEventManager.onDocumentMouseUp, false);
    }
    static checkTarget(target) {
        //EdgeHelper / WireframeHelperは無視。
        if (target.type === "LineSegments") {
            return null;
        }
        //クリッカブルインターフェースを継承しているなら判定
        if (typeof target.onMouseDownHandler !== "undefined" &&
            target.getEnable() === true) {
            return target;
        }
        else {
            //継承していないならその親を探索。
            //ターゲットから上昇して探す。
            if (target.parent !== undefined &&
                target.parent !== null &&
                target.parent.type !== "Scene") {
                return MouseEventManager.checkTarget(target.parent /*, event, functionKey*/);
            }
        }
        return null;
    }
    static updateMouse(event, mouse) {
        mouse.x = (event.layerX / MouseEventManager.canvas.clientWidth) * 2 - 1;
        mouse.y = -(event.layerY / MouseEventManager.canvas.clientHeight) * 2 + 1;
        return mouse;
    }
    static getIntersects(event) {
        MouseEventManager.mouse = MouseEventManager.updateMouse(event, MouseEventManager.mouse);
        MouseEventManager.raycaster.setFromCamera(MouseEventManager.mouse, MouseEventManager.camera);
        let intersects = MouseEventManager.raycaster.intersectObjects(MouseEventManager.scene.children, true);
        return intersects;
    }
}
MouseEventManager.raycaster = new Raycaster();
MouseEventManager.mouse = new Vector2();
MouseEventManager.onDocumentMouseMove = (event) => {
    if (event.type === "mousemove") {
        event.preventDefault();
    }
    let intersects = MouseEventManager.getIntersects(event);
    let nonTargetFunction = () => {
        if (MouseEventManager.currentOver) {
            MouseEventManager.currentOver.onMouseOutHandler(new ThreeMouseEvent(ThreeMouseEventType.OUT, MouseEventManager.currentOver));
        }
        MouseEventManager.currentOver = null;
    };
    let n = intersects.length;
    if (n == 0) {
        nonTargetFunction();
        return;
    }
    for (let i = 0; i < n; i++) {
        let checked = MouseEventManager.checkTarget(intersects[i].object);
        if (checked) {
            if (checked != MouseEventManager.currentOver) {
                if (MouseEventManager.currentOver) {
                    MouseEventManager.currentOver.onMouseOutHandler(new ThreeMouseEvent(ThreeMouseEventType.OUT, MouseEventManager.currentOver));
                }
                MouseEventManager.currentOver = checked;
                checked.onMouseOverHandler(new ThreeMouseEvent(ThreeMouseEventType.OVER, checked));
            }
            return;
        }
    }
    nonTargetFunction();
    return;
};
MouseEventManager.onDocumentMouseDown = (event) => {
    event.preventDefault();
    const intersects = MouseEventManager.getIntersects(event);
    const n = intersects.length;
    if (n == 0)
        return;
    for (let i = 0; i < n; i++) {
        let checked = MouseEventManager.checkTarget(intersects[i].object);
        if (checked) {
            checked.onMouseDownHandler(new ThreeMouseEvent(ThreeMouseEventType.DOWN, checked));
            break;
        }
    }
};
MouseEventManager.onDocumentMouseUp = (event) => {
    event.preventDefault();
    let intersects = MouseEventManager.getIntersects(event);
    let n = intersects.length;
    if (n == 0)
        return;
    for (let i = 0; i < n; i++) {
        let checked = MouseEventManager.checkTarget(intersects[i].object);
        if (checked) {
            checked.onMouseUpHandler(new ThreeMouseEvent(ThreeMouseEventType.UP, checked));
            break;
        }
    }
};
/**
 * IClickable3DObjectの現在状態を表す定数セット。
 * これとselectフラグを掛け合わせることで状態を判定する。
 */
export var ClickableState;
(function (ClickableState) {
    //ボタンの状態を表す定数
    ClickableState["NORMAL"] = "normal";
    ClickableState["OVER"] = "normal_over";
    ClickableState["DOWN"] = "normal_down";
    ClickableState["DISABLE"] = "disable";
})(ClickableState || (ClickableState = {}));
