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
exports.RadioButtonSprite = exports.CheckBoxSprite = exports.ClickableSprite = void 0;
var three_1 = require("three");
var CheckBoxObject_1 = require("./CheckBoxObject");
var ClickableObject_1 = require("./ClickableObject");
var RadioButtonObject_1 = require("./RadioButtonObject");
var InteractiveSprite = /** @class */ (function (_super) {
  __extends(InteractiveSprite, _super);
  function InteractiveSprite(material, ctor) {
    var _this = _super.call(this) || this;
    _this.model = new ctor({ view: _this, material: material });
    return _this;
  }
  return InteractiveSprite;
})(three_1.Sprite);
var ClickableSprite = /** @class */ (function (_super) {
  __extends(ClickableSprite, _super);
  function ClickableSprite(material) {
    return (
      _super.call(this, material, ClickableObject_1.ClickableObject) || this
    );
  }
  return ClickableSprite;
})(InteractiveSprite);
exports.ClickableSprite = ClickableSprite;
var CheckBoxSprite = /** @class */ (function (_super) {
  __extends(CheckBoxSprite, _super);
  function CheckBoxSprite(material) {
    return _super.call(this, material, CheckBoxObject_1.CheckBoxObject) || this;
  }
  return CheckBoxSprite;
})(InteractiveSprite);
exports.CheckBoxSprite = CheckBoxSprite;
var RadioButtonSprite = /** @class */ (function (_super) {
  __extends(RadioButtonSprite, _super);
  function RadioButtonSprite(material) {
    return (
      _super.call(this, material, RadioButtonObject_1.RadioButtonObject) || this
    );
  }
  return RadioButtonSprite;
})(InteractiveSprite);
exports.RadioButtonSprite = RadioButtonSprite;
