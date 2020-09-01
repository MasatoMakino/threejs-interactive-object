"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
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
exports.RadioButtonObject = void 0;
var CheckBoxObject_1 = require("./CheckBoxObject");
var RadioButtonObject = /** @class */ (function (_super) {
  __extends(RadioButtonObject, _super);
  function RadioButtonObject() {
    var _this = (_super !== null && _super.apply(this, arguments)) || this;
    _this._isFrozen = false;
    return _this;
  }
  /**
   * 現在のボタンの有効、無効状態を取得する
   * ラジオボタンは選択中は自身の状態を変更できない。
   * @return    ボタンが有効か否か
   */
  RadioButtonObject.prototype.checkActivity = function () {
    return this._enable && !this._isFrozen;
  };
  Object.defineProperty(RadioButtonObject.prototype, "isFrozen", {
    get: function () {
      return this._isFrozen;
    },
    set: function (bool) {
      this._isFrozen = bool;
    },
    enumerable: false,
    configurable: true,
  });
  return RadioButtonObject;
})(CheckBoxObject_1.CheckBoxObject);
exports.RadioButtonObject = RadioButtonObject;
