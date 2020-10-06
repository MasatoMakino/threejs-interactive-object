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
exports.RadioButtonMesh = exports.CheckBoxMesh = exports.ClickableMesh = void 0;
var three_1 = require("three");
var CheckBoxObject_1 = require("./CheckBoxObject");
var ClickableObject_1 = require("./ClickableObject");
var RadioButtonObject_1 = require("./RadioButtonObject");
var InteractiveMesh = /** @class */ (function (_super) {
  __extends(InteractiveMesh, _super);
  function InteractiveMesh(parameters, ctor) {
    var _this = _super.call(this, parameters.geo) || this;
    _this.model = new ctor({ view: _this, material: parameters.material });
    return _this;
  }
  return InteractiveMesh;
})(three_1.Mesh);
var ClickableMesh = /** @class */ (function (_super) {
  __extends(ClickableMesh, _super);
  function ClickableMesh(parameters) {
    return (
      _super.call(this, parameters, ClickableObject_1.ClickableObject) || this
    );
  }
  return ClickableMesh;
})(InteractiveMesh);
exports.ClickableMesh = ClickableMesh;
var CheckBoxMesh = /** @class */ (function (_super) {
  __extends(CheckBoxMesh, _super);
  function CheckBoxMesh(parameters) {
    return (
      _super.call(this, parameters, CheckBoxObject_1.CheckBoxObject) || this
    );
  }
  return CheckBoxMesh;
})(InteractiveMesh);
exports.CheckBoxMesh = CheckBoxMesh;
var RadioButtonMesh = /** @class */ (function (_super) {
  __extends(RadioButtonMesh, _super);
  function RadioButtonMesh(parameters) {
    return (
      _super.call(this, parameters, RadioButtonObject_1.RadioButtonObject) ||
      this
    );
  }
  return RadioButtonMesh;
})(InteractiveMesh);
exports.RadioButtonMesh = RadioButtonMesh;