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
exports.RadioButtonMesh = void 0;
var three_1 = require("three");
var RadioButtonObject_1 = require("./RadioButtonObject");
var RadioButtonMesh = /** @class */ (function (_super) {
  __extends(RadioButtonMesh, _super);
  /**
   * コンストラクタ
   */
  function RadioButtonMesh(parameters) {
    var _this = _super.call(this, parameters.geo) || this;
    _this.model = new RadioButtonObject_1.RadioButtonObject({
      view: _this,
      material: parameters.material,
    });
    return _this;
  }
  return RadioButtonMesh;
})(three_1.Mesh);
exports.RadioButtonMesh = RadioButtonMesh;
