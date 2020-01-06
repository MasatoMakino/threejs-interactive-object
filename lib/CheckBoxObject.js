"use strict";
var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics = function(d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function(d, b) {
            d.__proto__ = b;
          }) ||
        function(d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
var MouseEventManager_1 = require("./MouseEventManager");
var ThreeMouseEvent_1 = require("./ThreeMouseEvent");
var ClickableObject_1 = require("./ClickableObject");
var CheckBoxObject = /** @class */ (function(_super) {
  __extends(CheckBoxObject, _super);
  function CheckBoxObject() {
    var _this = (_super !== null && _super.apply(this, arguments)) || this;
    _this._isSelect = false;
    return _this;
  }
  /**
   * クリックイベント時の処理
   * "click"イベントはマウスイベント類の必ず最後に発生するので
   * ここでisSelect状態を一括管理する。
   */
  CheckBoxObject.prototype.onMouseClick = function() {
    this._isSelect = !this._isSelect;
    var e = new ThreeMouseEvent_1.ThreeMouseEvent(
      ThreeMouseEvent_1.ThreeMouseEventType.SELECT,
      this
    );
    this.view.dispatchEvent(e);
    this.updateMaterial();
  };
  Object.defineProperty(CheckBoxObject.prototype, "selection", {
    get: function() {
      return this._isSelect;
    },
    set: function(bool) {
      this._isSelect = bool;
      this.updateState(MouseEventManager_1.ClickableState.NORMAL);
    },
    enumerable: true,
    configurable: true
  });
  CheckBoxObject.prototype.updateMaterial = function() {
    this.materialSet.setOpacity(this._alpha);
    var stateMat = this.materialSet.getMaterial(
      this.state,
      this._enableMouse,
      this._isSelect
    );
    this.view.material = stateMat.material;
  };
  return CheckBoxObject;
})(ClickableObject_1.ClickableObject);
exports.CheckBoxObject = CheckBoxObject;
