import { RAFTicker, RAFTickerEventType } from "raf-ticker";
import { Raycaster, Vector2 } from "three";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
import { ViewPortUtil } from "./ViewPortUtil";
export class MouseEventManager {
  /**
   *
   * @param scene
   * @param camera
   * @param canvas
   * @param option
   */
  constructor(scene, camera, canvas, option) {
    var _a, _b, _c;
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.hasThrottled = false;
    this.throttlingDelta = 0;
    this.onTick = (e) => {
      this.throttlingDelta += e.delta;
      if (this.throttlingDelta < this.throttlingTime_ms) {
        return;
      }
      this.hasThrottled = false;
      this.throttlingDelta %= this.throttlingTime_ms;
    };
    this.onDocumentMouseMove = (event) => {
      if (this.hasThrottled) return;
      this.hasThrottled = true;
      event.preventDefault();
      const intersects = this.getIntersects(event);
      if (intersects.length === 0) {
        this.clearOver();
        return;
      }
      const beforeOver = this.currentOver;
      this.currentOver = [];
      for (let intersect of intersects) {
        const checked = this.checkTarget(
          intersect.object,
          ThreeMouseEventType.OVER
        );
        if (checked) break;
      }
      beforeOver === null || beforeOver === void 0
        ? void 0
        : beforeOver.forEach((btn) => {
            if (!this.currentOver.includes(btn)) {
              MouseEventManager.onButtonHandler(btn, ThreeMouseEventType.OUT);
            }
          });
    };
    /**
     * カンバス上でマウスダウンかマウスアップが行われた際のイベントハンドラー
     * マウス座標から対象となるObject3Dを探し出して操作を行う。
     * @param {MouseEvent} event
     */
    this.onDocumentMouseUpDown = (event) => {
      let eventType = ThreeMouseEventType.DOWN;
      switch (event.type) {
        case "mousedown":
          eventType = ThreeMouseEventType.DOWN;
          break;
        case "mouseup":
          eventType = ThreeMouseEventType.UP;
          break;
      }
      if (
        !ViewPortUtil.isContain(this.canvas, this.viewport, event) &&
        eventType === ThreeMouseEventType.DOWN
      ) {
        return;
      }
      event.preventDefault();
      const intersects = this.getIntersects(event);
      this.checkIntersects(intersects, eventType);
    };
    this.camera = camera;
    this.scene = scene;
    this.throttlingTime_ms =
      (_a =
        option === null || option === void 0
          ? void 0
          : option.throttlingTime_ms) !== null && _a !== void 0
        ? _a
        : 33;
    this.viewport =
      option === null || option === void 0 ? void 0 : option.viewport;
    this.recursive =
      (_b =
        option === null || option === void 0 ? void 0 : option.recursive) !==
        null && _b !== void 0
        ? _b
        : true;
    this.targets =
      (_c = option === null || option === void 0 ? void 0 : option.targets) !==
        null && _c !== void 0
        ? _c
        : this.scene.children;
    this.canvas = canvas;
    canvas.addEventListener("mousemove", this.onDocumentMouseMove, false);
    canvas.addEventListener("mousedown", this.onDocumentMouseUpDown, false);
    canvas.addEventListener("mouseup", this.onDocumentMouseUpDown, false);
    RAFTicker.on(RAFTickerEventType.tick, this.onTick);
  }
  /**
   * 現在マウスオーバーしている対象をなしにする。
   * もし、すでにマウスオーバー対象が存在するなら、マウスアウトハンドラーを呼び出した後にクリアする。
   */
  clearOver() {
    var _a;
    (_a = this.currentOver) === null || _a === void 0
      ? void 0
      : _a.forEach((over) => {
          MouseEventManager.onButtonHandler(over, ThreeMouseEventType.OUT);
        });
    this.currentOver = null;
  }
  /**
   * マウスの座標にかかっているオブジェクト一覧から、操作対象を検索し
   * 指定されたタイプのハンドラー関数を実行させる。
   * 重なり合ったオブジェクトがある場合、最前面から検索を開始する。
   * 操作対象が見つかった時点で処理は中断され、背面オブジェクトは操作対象にならない。
   *
   * @param {Intersection[]} intersects
   * @param {ThreeMouseEventType} type
   */
  checkIntersects(intersects, type) {
    const n = intersects.length;
    if (n === 0) return;
    for (let i = 0; i < n; i++) {
      const checked = this.checkTarget(intersects[i].object, type);
      if (checked) {
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
        if (!btn.model.isOver) {
          btn.model.onMouseOverHandler(new ThreeMouseEvent(type, btn));
        }
        return;
      case ThreeMouseEventType.OUT:
        if (btn.model.isOver) {
          btn.model.onMouseOutHandler(new ThreeMouseEvent(type, btn));
        }
        return;
    }
  }
  /**
   * IClickableObject3Dインターフェースを実装しているか否かを判定する。
   * ユーザー定義Type Guard
   * @param arg
   * @private
   */
  static implementsIClickableObject3D(arg) {
    return (
      arg !== null &&
      typeof arg === "object" &&
      arg.model !== null &&
      typeof arg.model === "object" &&
      arg.model.mouseEnabled !== null &&
      typeof arg.model.mouseEnabled === "boolean"
    );
  }
  /**
   * 指定されたtargetオブジェクトから親方向に、クリッカブルインターフェースを継承しているオブジェクトを検索する。
   * オブジェクトを発見した場合はtrueを、発見できない場合はfalseを返す。
   *
   * @param target
   * @param type
   * @param hasTarget
   * @protected
   */
  checkTarget(target, type, hasTarget = false) {
    //クリッカブルインターフェースを継承しているなら判定OK
    if (
      MouseEventManager.implementsIClickableObject3D(target) &&
      target.model.mouseEnabled === true
    ) {
      if (type === ThreeMouseEventType.OVER) {
        this.currentOver.push(target);
      }
      MouseEventManager.onButtonHandler(target, type);
      return this.checkTarget(target.parent, type, true);
    }
    //継承していないならその親を探索継続。
    //ターゲットから上昇して探す。
    if (target.parent != null && target.parent.type !== "Scene") {
      return this.checkTarget(target.parent, type, hasTarget);
    }
    //親がシーンの場合は探索終了。
    return hasTarget;
  }
  getIntersects(event) {
    ViewPortUtil.convertToMousePosition(
      this.canvas,
      event,
      this.viewport,
      this.mouse
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.targets,
      this.recursive
    );
    return intersects;
  }
}
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
