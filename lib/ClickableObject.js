"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MouseEventManager_1 = require("./MouseEventManager");
var ThreeMouseEvent_1 = require("./ThreeMouseEvent");
/**
 * クリックに反応するMesh。
 */
var ClickableObject = /** @class */ (function () {
  /**
   * コンストラクタ
   */
  function ClickableObject(parameters) {
    this.isPress = false;
    this.isOver = false;
    this._enableMouse = true;
    this.frozen = false;
    this.state = MouseEventManager_1.ClickableState.NORMAL;
    this._alpha = 1.0;
    this.view = parameters.view;
    if (!MouseEventManager_1.MouseEventManager.isInit) {
      console.warn(
        "MouseEventManager の初期化前にインタラクティブメッシュを生成しています。MouseEventManager.initをインタラクティブオブジェクトの生成前に実行してください。"
      );
    }
    this._materialSet = parameters.material;
    this.updateMaterial();
  }
  Object.defineProperty(ClickableObject.prototype, "materialSet", {
    get: function () {
      return this._materialSet;
    },
    set: function (value) {
      var isSame = value === this._materialSet;
      this._materialSet = value;
      if (!isSame) {
        this.updateMaterial();
      }
    },
    enumerable: true,
    configurable: true,
  });
  ClickableObject.prototype.onMouseDownHandler = function (event) {
    if (!this.checkActivity()) return;
    this.isPress = true;
    this.updateState(MouseEventManager_1.ClickableState.DOWN);
    this.view.dispatchEvent(event);
  };
  ClickableObject.prototype.onMouseUpHandler = function (event) {
    if (!this.checkActivity()) return;
    var currentPress = this.isPress;
    this.isPress = false;
    var nextState = this.isOver
      ? MouseEventManager_1.ClickableState.OVER
      : MouseEventManager_1.ClickableState.NORMAL;
    this.updateState(nextState);
    this.view.dispatchEvent(event);
    if (this.isPress != currentPress) {
      this.onMouseClick();
      var e = new ThreeMouseEvent_1.ThreeMouseEvent(
        ThreeMouseEvent_1.ThreeMouseEventType.CLICK,
        this
      );
      this.view.dispatchEvent(e);
    }
  };
  ClickableObject.prototype.onMouseClick = function () {};
  ClickableObject.prototype.onMouseOverHandler = function (event) {
    this.onMouseOverOutHandler(event);
  };
  ClickableObject.prototype.onMouseOutHandler = function (event) {
    this.onMouseOverOutHandler(event);
  };
  ClickableObject.prototype.onMouseOverOutHandler = function (event) {
    if (!this.checkActivity()) return;
    this.isOver = event.type === ThreeMouseEvent_1.ThreeMouseEventType.OVER;
    this.updateState(
      this.isOver
        ? MouseEventManager_1.ClickableState.OVER
        : MouseEventManager_1.ClickableState.NORMAL
    );
    this.view.dispatchEvent(event);
  };
  Object.defineProperty(ClickableObject.prototype, "alpha", {
    set: function (number) {
      this._alpha = number;
      this.updateMaterial();
    },
    enumerable: true,
    configurable: true,
  });
  ClickableObject.prototype.updateState = function (state) {
    this.state = state;
    this.updateMaterial();
  };
  /**
   * 現在のボタンの有効、無効状態を取得する
   * @return    ボタンが有効か否か
   */
  ClickableObject.prototype.checkActivity = function () {
    return this._enableMouse && !this.frozen;
  };
  ClickableObject.prototype.enable = function () {
    this.switchEnable(true);
  };
  ClickableObject.prototype.disable = function () {
    this.switchEnable(false);
  };
  ClickableObject.prototype.updateMaterial = function () {
    this._materialSet.setOpacity(this._alpha);
    var stateMat = this._materialSet.getMaterial(this.state, this._enableMouse);
    this.view.material = stateMat.material;
  };
  ClickableObject.prototype.switchEnable = function (bool) {
    this._enableMouse = bool;
    this.state = bool
      ? MouseEventManager_1.ClickableState.NORMAL
      : MouseEventManager_1.ClickableState.DISABLE;
    this.updateMaterial();
  };
  ClickableObject.prototype.getEnable = function () {
    return this._enableMouse;
  };
  return ClickableObject;
})();
exports.ClickableObject = ClickableObject;
