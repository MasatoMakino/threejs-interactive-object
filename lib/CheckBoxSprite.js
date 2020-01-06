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
var three_1 = require("three");
var CheckBoxObject_1 = require("./CheckBoxObject");
var CheckBoxSprite = /** @class */ (function(_super) {
  __extends(CheckBoxSprite, _super);
  function CheckBoxSprite(material) {
    var _this = _super.call(this) || this;
    _this.model = new CheckBoxObject_1.CheckBoxObject({
      view: _this,
      material: material
    });
    return _this;
  }
  return CheckBoxSprite;
})(three_1.Sprite);
exports.CheckBoxSprite = CheckBoxSprite;
