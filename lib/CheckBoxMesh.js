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
exports.CheckBoxMesh = void 0;
var three_1 = require("three");
var CheckBoxObject_1 = require("./CheckBoxObject");
var CheckBoxMesh = /** @class */ (function (_super) {
  __extends(CheckBoxMesh, _super);
  /**
   * コンストラクタ
   */
  function CheckBoxMesh(parameters) {
    var _this = _super.call(this, parameters.geo) || this;
    _this.model = new CheckBoxObject_1.CheckBoxObject({
      view: _this,
      material: parameters.material,
    });
    return _this;
  }
  return CheckBoxMesh;
})(three_1.Mesh);
exports.CheckBoxMesh = CheckBoxMesh;
