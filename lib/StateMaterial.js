"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MouseEventManager_1 = require("./MouseEventManager");
var StateMaterial = /** @class */ (function() {
  function StateMaterial(material) {
    this.alpha = 1.0;
    this.material = material;
  }
  StateMaterial.prototype.updateAlpha = function() {
    if (this._material instanceof Array) {
      this.alphaArray = this.getAlphaArray();
    } else {
      this.alpha = this._material.opacity;
    }
  };
  StateMaterial.prototype.getAlphaArray = function() {
    var matArray = this._material;
    var n = matArray.length;
    var array = [];
    for (var i = 0; i < n; i++) {
      array.push(matArray[i].opacity);
    }
    return array;
  };
  Object.defineProperty(StateMaterial.prototype, "material", {
    get: function() {
      return this._material;
    },
    set: function(value) {
      this._material = value;
      this.updateAlpha();
    },
    enumerable: true,
    configurable: true
  });
  StateMaterial.prototype.setOpacity = function(opacity) {
    if (this._material instanceof Array) {
      var n = this._material.length;
      for (var i = 0; i < n; i++) {
        var material = this._material[i];
        material.opacity = opacity * this.alphaArray[i];
      }
    } else {
      this._material.opacity = opacity * this.alpha;
    }
  };
  return StateMaterial;
})();
exports.StateMaterial = StateMaterial;
var StateMaterialSet = /** @class */ (function() {
  function StateMaterialSet(param) {
    this.normal = new StateMaterial(param.normal);
    this.over = StateMaterialSet.initMaterial(param.over, this.normal);
    this.down = StateMaterialSet.initMaterial(param.down, this.normal);
    this.disable = StateMaterialSet.initMaterial(param.disable, this.normal);
    this.normalSelect = StateMaterialSet.initMaterial(
      param.normalSelect,
      this.normal
    );
    this.overSelect = StateMaterialSet.initMaterial(
      param.overSelect,
      this.normal
    );
    this.downSelect = StateMaterialSet.initMaterial(
      param.downSelect,
      this.normal
    );
    this.init();
  }
  StateMaterialSet.initMaterial = function(value, defaultMaterial) {
    if (value == null) return defaultMaterial;
    return new StateMaterial(value);
  };
  StateMaterialSet.prototype.init = function() {
    if (this.normal == null) {
      throw new Error("通常状態のマテリアルが指定されていません。");
    }
    this.materials = [
      this.normal,
      this.normalSelect,
      this.over,
      this.overSelect,
      this.down,
      this.downSelect,
      this.disable
    ];
  };
  StateMaterialSet.prototype.getMaterial = function(
    state,
    mouseEnabled,
    isSelected
  ) {
    if (isSelected === void 0) {
      isSelected = false;
    }
    //無効状態はstateよりも優先
    if (!mouseEnabled) {
      return this.disable;
    }
    switch (state) {
      case MouseEventManager_1.ClickableState.NORMAL:
        return isSelected ? this.normalSelect : this.normal;
      case MouseEventManager_1.ClickableState.DOWN:
        return isSelected ? this.downSelect : this.down;
      case MouseEventManager_1.ClickableState.OVER:
        return isSelected ? this.overSelect : this.over;
    }
    return this.normal;
  };
  StateMaterialSet.prototype.setOpacity = function(opacity) {
    this.materials.forEach(function(mat) {
      mat.setOpacity(opacity);
    });
  };
  return StateMaterialSet;
})();
exports.StateMaterialSet = StateMaterialSet;
