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
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
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
var three_1 = require("three");
var ClickableObject_1 = require("./ClickableObject");
/**
 * クリックに反応するMesh。
 */
var ClickableMesh = /** @class */ (function (_super) {
  __extends(ClickableMesh, _super);
  /**
   * コンストラクタ
   */
  function ClickableMesh(parameters) {
    var _this = _super.call(this, parameters.geo) || this;
    _this.model = new ClickableObject_1.ClickableObject({
      view: _this,
      material: parameters.material,
    });
    return _this;
  }
  return ClickableMesh;
})(three_1.Mesh);
exports.ClickableMesh = ClickableMesh;
