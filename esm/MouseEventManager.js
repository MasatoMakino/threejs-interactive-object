import { Raycaster, Vector2 } from "three";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
import { RAFTicker, RAFTickerEventType } from "raf-ticker";

export class MouseEventManager {
  static init(scene, camera, renderer, option) {
    var _a;
    MouseEventManager.isInit = true;
    MouseEventManager.camera = camera;
    MouseEventManager.renderer = renderer;
    MouseEventManager.scene = scene;
    MouseEventManager.throttlingTime_ms =
      (_a =
        option === null || option === void 0
          ? void 0
          : option.throttlingTime_ms) !== null && _a !== void 0
        ? _a
        : 33;
    const canvas = renderer.domElement;
    MouseEventManager.canvas = canvas;
    canvas.addEventListener(
      "mousemove",
      MouseEventManager.onDocumentMouseMove,
      false
    );
    canvas.addEventListener(
      "mousedown",
      MouseEventManager.onDocumentMouseUpDown,
      false
    );
    canvas.addEventListener(
      "mouseup",
      MouseEventManager.onDocumentMouseUpDown,
      false
    );
    RAFTicker.on(RAFTickerEventType.tick, (e) => {
      MouseEventManager.throttlingDelta += e.delta;
      if (
        MouseEventManager.throttlingDelta < MouseEventManager.throttlingTime_ms
      ) {
        return;
      }
      MouseEventManager.hasThrottled = false;
      MouseEventManager.throttlingDelta %= MouseEventManager.throttlingTime_ms;
    });
  }
  /**
   * 現在マウスオーバーしている対象をなしにする。
   * もし、すでにマウスオーバー対象が存在するなら、マウスアウトハンドラーを呼び出した後にクリアする。
   */
  static clearCurrentOver() {
    if (MouseEventManager.currentOver) {
      MouseEventManager.onButtonHandler(
        MouseEventManager.currentOver,
        ThreeMouseEventType.OUT
      );
    }
    MouseEventManager.currentOver = null;
  }
  /**
   * マウスの座標にかかっているオブジェクト一覧から、操作対象を検索し
   * 指定されたタイプのハンドラー関数を実行させる。
   * @param {Intersection[]} intersects
   * @param {ThreeMouseEventType} type
   */
  static checkIntersects(intersects, type) {
    const n = intersects.length;
    if (n === 0) return;
    for (let i = 0; i < n; i++) {
      const checked = MouseEventManager.checkTarget(intersects[i].object);
      if (checked) {
        MouseEventManager.onButtonHandler(checked, type);
        break;
      }
    }
  }
  /**
   * ボタンの各種イベントハンドラーメソッドを、typeにしたがって実行する。
   * @param {IClickableObject3D} btn
   * @param {ThreeMouseEventType} type
   */
  static onButtonHandler(btn, type) {
    switch (type) {
      case ThreeMouseEventType.DOWN:
        btn.model.onMouseDownHandler(new ThreeMouseEvent(type, btn));
        return;
      case ThreeMouseEventType.UP:
        btn.model.onMouseUpHandler(new ThreeMouseEvent(type, btn));
        return;
      case ThreeMouseEventType.OVER:
        btn.model.onMouseOverHandler(new ThreeMouseEvent(type, btn));
        return;
      case ThreeMouseEventType.OUT:
        btn.model.onMouseOutHandler(new ThreeMouseEvent(type, btn));
        return;
    }
  }
  static checkTarget(target) {
    // ユーザ定義タイプガード
    function implementsIClickableObject3D(arg) {
      return (
        arg !== null &&
        typeof arg === "object" &&
        arg.model !== null &&
        typeof arg.model === "object" &&
        arg.model.getEnable !== null &&
        typeof arg.model.getEnable === "function"
      );
    }
    //EdgeHelper / WireframeHelperは無視。
    if (target.type === "LineSegments") {
      return null;
    }
    //クリッカブルインターフェースを継承しているなら判定OK
    const targetAny = target;
    if (
      implementsIClickableObject3D(targetAny) &&
      targetAny.model.getEnable() === true
    ) {
      return target;
    }
    //継承していないならその親を探索継続。
    //ターゲットから上昇して探す。
    if (target.parent != null && target.parent.type !== "Scene") {
      return MouseEventManager.checkTarget(target.parent);
    }
    //親がシーンの場合は探索終了。nullを返す。
    return null;
  }
  static updateMouse(event, mouse) {
    mouse.x = (event.offsetX / MouseEventManager.canvas.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / MouseEventManager.canvas.clientHeight) * 2 + 1;
    return mouse;
  }
  static getIntersects(event) {
    MouseEventManager.mouse = MouseEventManager.updateMouse(
      event,
      MouseEventManager.mouse
    );
    MouseEventManager.raycaster.setFromCamera(
      MouseEventManager.mouse,
      MouseEventManager.camera
    );
    const intersects = MouseEventManager.raycaster.intersectObjects(
      MouseEventManager.scene.children,
      true
    );
    return intersects;
  }
}
MouseEventManager.raycaster = new Raycaster();
MouseEventManager.mouse = new Vector2();
MouseEventManager.isInit = false;
MouseEventManager.hasThrottled = false;
MouseEventManager.throttlingDelta = 0;
MouseEventManager.onDocumentMouseMove = (event) => {
  if (MouseEventManager.hasThrottled) return;
  MouseEventManager.hasThrottled = true;
  if (event.type === "mousemove") {
    event.preventDefault();
  }
  const intersects = MouseEventManager.getIntersects(event);
  const n = intersects.length;
  if (n == 0) {
    MouseEventManager.clearCurrentOver();
    return;
  }
  for (let i = 0; i < n; i++) {
    let checked = MouseEventManager.checkTarget(intersects[i].object);
    if (checked) {
      if (checked != MouseEventManager.currentOver) {
        MouseEventManager.clearCurrentOver();
        MouseEventManager.currentOver = checked;
        MouseEventManager.onButtonHandler(checked, ThreeMouseEventType.OVER);
      }
      return;
    }
  }
  MouseEventManager.clearCurrentOver();
  return;
};
/**
 * カンバス上でマウスダウンかマウスアップが行われた際のイベントハンドラー
 * マウス座標から対象となるObject3Dを探し出して操作を行う。
 * @param {MouseEvent} event
 */
MouseEventManager.onDocumentMouseUpDown = (event) => {
  let eventType = ThreeMouseEventType.DOWN;
  switch (event.type) {
    case "mousedown":
      eventType = ThreeMouseEventType.DOWN;
      break;
    case "mouseup":
      eventType = ThreeMouseEventType.UP;
      break;
  }
  event.preventDefault();
  let intersects = MouseEventManager.getIntersects(event);
  MouseEventManager.checkIntersects(intersects, eventType);
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
