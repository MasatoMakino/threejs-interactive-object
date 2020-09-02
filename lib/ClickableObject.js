"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickableObject = void 0;
var MouseEventManager_1 = require("./MouseEventManager");
var ThreeMouseEvent_1 = require("./ThreeMouseEvent");
/**
 * クリックに反応するObject。
 */
var ClickableObject = /** @class */ (function () {
  /**
   * コンストラクタ
   */
  function ClickableObject(parameters) {
    var _a;
    this._isPress = false;
    this._isOver = false;
    this._enable = true;
    this.mouseEnabled = true;
    this.frozen = false;
    this.state = MouseEventManager_1.ClickableState.NORMAL;
    this._alpha = 1.0;
    this.view = parameters.view;
    if (!MouseEventManager_1.MouseEventManager.isInit) {
      console.warn(
        "MouseEventManager の初期化前にインタラクティブメッシュを生成しています。MouseEventManager.initをインタラクティブオブジェクトの生成前に実行してください。"
      );
    }
    (_a = this._materialSet) !== null && _a !== void 0
      ? _a
      : (this._materialSet = parameters.material);
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
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(ClickableObject.prototype, "isOver", {
    get: function () {
      return this._isOver;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(ClickableObject.prototype, "isPress", {
    get: function () {
      return this._isPress;
    },
    enumerable: false,
    configurable: true,
  });
  ClickableObject.prototype.onMouseDownHandler = function (event) {
    if (!this.checkActivity()) return;
    this._isPress = true;
    this.updateState(MouseEventManager_1.ClickableState.DOWN);
    this.view.dispatchEvent(event);
  };
  ClickableObject.prototype.onMouseUpHandler = function (event) {
    if (!this.checkActivity()) return;
    var currentPress = this._isPress;
    this._isPress = false;
    var nextState = this._isOver
      ? MouseEventManager_1.ClickableState.OVER
      : MouseEventManager_1.ClickableState.NORMAL;
    this.updateState(nextState);
    this.view.dispatchEvent(event);
    if (this._isPress != currentPress) {
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
    this._isOver = event.type === ThreeMouseEvent_1.ThreeMouseEventType.OVER;
    this.updateState(
      this._isOver
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
    enumerable: false,
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
    return this._enable && !this.frozen;
  };
  ClickableObject.prototype.enable = function () {
    this.switchEnable(true);
  };
  ClickableObject.prototype.disable = function () {
    this.switchEnable(false);
  };
  ClickableObject.prototype.updateMaterial = function () {
    var _a, _b;
    (_a = this._materialSet) === null || _a === void 0
      ? void 0
      : _a.setOpacity(this._alpha);
    var stateMat =
      (_b = this._materialSet) === null || _b === void 0
        ? void 0
        : _b.getMaterial(this.state, this._enable);
    if (!stateMat) return;
    switch (this.view.type) {
      //TODO PR Mesh.d.ts
      case "Mesh":
      case "Sprite":
        this.view.material = stateMat.material;
        break;
      case "Group":
      default:
        break;
    }
  };
  ClickableObject.prototype.switchEnable = function (bool) {
    this._enable = bool;
    this.state = bool
      ? MouseEventManager_1.ClickableState.NORMAL
      : MouseEventManager_1.ClickableState.DISABLE;
    this.updateMaterial();
  };
  return ClickableObject;
})();
exports.ClickableObject = ClickableObject;
