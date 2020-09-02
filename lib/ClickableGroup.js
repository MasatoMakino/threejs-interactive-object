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
exports.ClickableGroup = void 0;
var three_1 = require("three");
var ClickableObject_1 = require("./ClickableObject");
var ClickableGroup = /** @class */ (function (_super) {
  __extends(ClickableGroup, _super);
  function ClickableGroup() {
    var _this = _super.call(this) || this;
    _this.model = new ClickableObject_1.ClickableObject({
      view: _this,
    });
    return _this;
  }
  return ClickableGroup;
})(three_1.Group);
exports.ClickableGroup = ClickableGroup;
