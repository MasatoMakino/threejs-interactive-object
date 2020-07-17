/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"demo": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./demoSrc/demo.js","vendor"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./demoSrc/demo.js":
/*!*************************!*\
  !*** ./demoSrc/demo.js ***!
  \*************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib */ \"./lib/index.js\");\n/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_lib__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\n\nconst W = 1280;\nconst H = 900;\nlet renderer;\nlet scene;\nlet camera;\n\nconst onDomContentsLoaded = () => {\n  // シーンを作成\n  scene = new three__WEBPACK_IMPORTED_MODULE_1__[\"Scene\"]();\n  camera = new three__WEBPACK_IMPORTED_MODULE_1__[\"PerspectiveCamera\"](45, W / H, 1, 400);\n  camera.position.set(0, 0, 100);\n  scene.add(camera);\n  const renderOption = {\n    canvas: document.getElementById(\"webgl-canvas\"),\n    antialias: true\n  };\n  renderer = new three__WEBPACK_IMPORTED_MODULE_1__[\"WebGLRenderer\"](renderOption);\n  renderer.setClearColor(new three__WEBPACK_IMPORTED_MODULE_1__[\"Color\"](0x000000));\n  renderer.setSize(W, H);\n  renderer.setPixelRatio(window.devicePixelRatio); //平行光源オブジェクト(light)の設定\n\n  const ambientLight = new three__WEBPACK_IMPORTED_MODULE_1__[\"AmbientLight\"](0xffffff, 1.0);\n  scene.add(ambientLight); //マウスイベントの取得開始\n\n  _lib__WEBPACK_IMPORTED_MODULE_0__[\"MouseEventManager\"].init(scene, camera, renderer);\n  testButton();\n  testCheckbox();\n  testSprite();\n  testSelectableSprite();\n  testRadio();\n  render();\n};\n/**\n * Mesh用のマテリアルセットを新規に取得する。\n * @returns {StateMaterialSet}\n */\n\n\nconst getMaterialSet = () => {\n  return new _lib__WEBPACK_IMPORTED_MODULE_0__[\"StateMaterialSet\"]({\n    normal: getMeshMaterial(0.6),\n    over: getMeshMaterial(0.8),\n    down: getMeshMaterial(1.0),\n    normalSelect: getMeshMaterial(0.6, 0xffff00),\n    overSelect: getMeshMaterial(0.8, 0xffff00),\n    downSelect: getMeshMaterial(1.0, 0xffff00)\n  });\n};\n\nconst getMeshMaterial = (opacity, color) => {\n  if (color == null) color = 0xffffff;\n  return new three__WEBPACK_IMPORTED_MODULE_1__[\"MeshBasicMaterial\"]({\n    color: color,\n    opacity: opacity,\n    transparent: true\n  });\n};\n/**\n * スプライト用のマテリアルセットを新規に生成する。\n */\n\n\nconst getSpriteMaterialSet = () => {\n  return new _lib__WEBPACK_IMPORTED_MODULE_0__[\"StateMaterialSet\"]({\n    normal: getSpriteMaterial(\"./btn045_01.png\", 1.0),\n    over: getSpriteMaterial(\"./btn045_02.png\", 1.0),\n    down: getSpriteMaterial(\"./btn045_03.png\", 1.0),\n    normalSelect: getSpriteMaterial(\"./btn045_01.png\", 0.5),\n    overSelect: getSpriteMaterial(\"./btn045_02.png\", 0.5),\n    downSelect: getSpriteMaterial(\"./btn045_03.png\", 0.5)\n  });\n};\n/**\n * スプライト用マテリアルを生成する\n * @param img マップ画像URL\n * @param opacity 透過度\n * @param color カラー\n * @returns {SpriteMaterial}\n */\n\n\nconst getSpriteMaterial = (img, opacity, color) => {\n  if (color == null) color = 0xffffff;\n  return new three__WEBPACK_IMPORTED_MODULE_1__[\"SpriteMaterial\"]({\n    map: new three__WEBPACK_IMPORTED_MODULE_1__[\"TextureLoader\"]().load(img),\n    color: color,\n    opacity: opacity,\n    transparent: true\n  });\n};\n\nconst testButton = () => {\n  const geometry = new three__WEBPACK_IMPORTED_MODULE_1__[\"BoxBufferGeometry\"](3, 3, 3);\n  const clickable = new _lib__WEBPACK_IMPORTED_MODULE_0__[\"ClickableMesh\"]({\n    geo: geometry,\n    material: getMaterialSet()\n  });\n  clickable.position.set(-10, 20, 0);\n  scene.add(clickable);\n};\n\nconst testCheckbox = () => {\n  const geometry = new three__WEBPACK_IMPORTED_MODULE_1__[\"BoxBufferGeometry\"](3, 3, 3);\n  const clickable = new _lib__WEBPACK_IMPORTED_MODULE_0__[\"CheckBoxMesh\"]({\n    geo: geometry,\n    material: getMaterialSet()\n  });\n  clickable.position.set(0, 20, 0);\n  scene.add(clickable);\n};\n\nconst testSprite = () => {\n  const clickable = new _lib__WEBPACK_IMPORTED_MODULE_0__[\"ClickableSprite\"](getSpriteMaterialSet());\n  alignSprite(clickable, 10);\n};\n\nconst testSelectableSprite = () => {\n  const selectable = new _lib__WEBPACK_IMPORTED_MODULE_0__[\"CheckBoxSprite\"](getSpriteMaterialSet());\n  alignSprite(selectable, 20);\n};\n\nconst alignSprite = (sprite, x) => {\n  sprite.position.set(x, 20, 0);\n  const scale = 4.0;\n  sprite.scale.set(scale, scale, scale);\n  scene.add(sprite);\n};\n\nconst testRadio = () => {\n  const geometry = new three__WEBPACK_IMPORTED_MODULE_1__[\"BoxBufferGeometry\"](3, 3, 3);\n\n  const initButton = (x, buttonValue) => {\n    const button = new _lib__WEBPACK_IMPORTED_MODULE_0__[\"RadioButtonMesh\"]({\n      geo: geometry,\n      material: getMaterialSet()\n    });\n    button.position.set(x, -10, 0);\n    button.model.value = buttonValue;\n    scene.add(button);\n    return button;\n  };\n\n  const manager = new _lib__WEBPACK_IMPORTED_MODULE_0__[\"RadioButtonManager\"]();\n  manager.addButton(initButton(-10, \"button01\"), initButton(0, Math.PI), initButton(10, {\n    value01: 1,\n    value02: 2\n  }));\n  manager.addButton(initButton(20, undefined));\n  manager.addEventListener(_lib__WEBPACK_IMPORTED_MODULE_0__[\"ThreeMouseEventType\"].SELECT, e => {\n    console.log(e.model.value);\n  });\n};\n\nconst render = () => {\n  renderer.render(scene, camera);\n  requestAnimationFrame(render);\n};\n/**\n * DOMContentLoaded以降に初期化処理を実行する\n */\n\n\nwindow.onload = onDomContentsLoaded;\n\n//# sourceURL=webpack:///./demoSrc/demo.js?");

/***/ }),

/***/ "./lib/CheckBoxMesh.js":
/*!*****************************!*\
  !*** ./lib/CheckBoxMesh.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = this && this.__extends || function () {\n  var extendStatics = function (d, b) {\n    extendStatics = Object.setPrototypeOf || {\n      __proto__: []\n    } instanceof Array && function (d, b) {\n      d.__proto__ = b;\n    } || function (d, b) {\n      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    };\n\n    return extendStatics(d, b);\n  };\n\n  return function (d, b) {\n    extendStatics(d, b);\n\n    function __() {\n      this.constructor = d;\n    }\n\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n  };\n}();\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.CheckBoxMesh = void 0;\n\nvar CheckBoxObject_1 = __webpack_require__(/*! ./CheckBoxObject */ \"./lib/CheckBoxObject.js\");\n\nvar three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\nvar CheckBoxMesh =\n/** @class */\nfunction (_super) {\n  __extends(CheckBoxMesh, _super);\n  /**\n   * コンストラクタ\n   */\n\n\n  function CheckBoxMesh(parameters) {\n    var _this = _super.call(this, parameters.geo) || this;\n\n    _this.model = new CheckBoxObject_1.CheckBoxObject({\n      view: _this,\n      material: parameters.material\n    });\n    return _this;\n  }\n\n  return CheckBoxMesh;\n}(three_1.Mesh);\n\nexports.CheckBoxMesh = CheckBoxMesh;\n\n//# sourceURL=webpack:///./lib/CheckBoxMesh.js?");

/***/ }),

/***/ "./lib/CheckBoxObject.js":
/*!*******************************!*\
  !*** ./lib/CheckBoxObject.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = this && this.__extends || function () {\n  var extendStatics = function (d, b) {\n    extendStatics = Object.setPrototypeOf || {\n      __proto__: []\n    } instanceof Array && function (d, b) {\n      d.__proto__ = b;\n    } || function (d, b) {\n      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    };\n\n    return extendStatics(d, b);\n  };\n\n  return function (d, b) {\n    extendStatics(d, b);\n\n    function __() {\n      this.constructor = d;\n    }\n\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n  };\n}();\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.CheckBoxObject = void 0;\n\nvar MouseEventManager_1 = __webpack_require__(/*! ./MouseEventManager */ \"./lib/MouseEventManager.js\");\n\nvar ThreeMouseEvent_1 = __webpack_require__(/*! ./ThreeMouseEvent */ \"./lib/ThreeMouseEvent.js\");\n\nvar ClickableObject_1 = __webpack_require__(/*! ./ClickableObject */ \"./lib/ClickableObject.js\");\n\nvar CheckBoxObject =\n/** @class */\nfunction (_super) {\n  __extends(CheckBoxObject, _super);\n\n  function CheckBoxObject() {\n    var _this = _super !== null && _super.apply(this, arguments) || this;\n\n    _this._isSelect = false;\n    return _this;\n  }\n  /**\n   * クリックイベント時の処理\n   * \"click\"イベントはマウスイベント類の必ず最後に発生するので\n   * ここでisSelect状態を一括管理する。\n   */\n\n\n  CheckBoxObject.prototype.onMouseClick = function () {\n    this._isSelect = !this._isSelect;\n    var e = new ThreeMouseEvent_1.ThreeMouseEvent(ThreeMouseEvent_1.ThreeMouseEventType.SELECT, this);\n    this.view.dispatchEvent(e);\n    this.updateMaterial();\n  };\n\n  Object.defineProperty(CheckBoxObject.prototype, \"selection\", {\n    get: function () {\n      return this._isSelect;\n    },\n    set: function (bool) {\n      this._isSelect = bool;\n      this.updateState(MouseEventManager_1.ClickableState.NORMAL);\n    },\n    enumerable: false,\n    configurable: true\n  });\n\n  CheckBoxObject.prototype.updateMaterial = function () {\n    this.materialSet.setOpacity(this._alpha);\n    var stateMat = this.materialSet.getMaterial(this.state, this._enableMouse, this._isSelect);\n    this.view.material = stateMat.material;\n  };\n\n  return CheckBoxObject;\n}(ClickableObject_1.ClickableObject);\n\nexports.CheckBoxObject = CheckBoxObject;\n\n//# sourceURL=webpack:///./lib/CheckBoxObject.js?");

/***/ }),

/***/ "./lib/CheckBoxSprite.js":
/*!*******************************!*\
  !*** ./lib/CheckBoxSprite.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = this && this.__extends || function () {\n  var extendStatics = function (d, b) {\n    extendStatics = Object.setPrototypeOf || {\n      __proto__: []\n    } instanceof Array && function (d, b) {\n      d.__proto__ = b;\n    } || function (d, b) {\n      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    };\n\n    return extendStatics(d, b);\n  };\n\n  return function (d, b) {\n    extendStatics(d, b);\n\n    function __() {\n      this.constructor = d;\n    }\n\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n  };\n}();\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.CheckBoxSprite = void 0;\n\nvar three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\nvar CheckBoxObject_1 = __webpack_require__(/*! ./CheckBoxObject */ \"./lib/CheckBoxObject.js\");\n\nvar CheckBoxSprite =\n/** @class */\nfunction (_super) {\n  __extends(CheckBoxSprite, _super);\n\n  function CheckBoxSprite(material) {\n    var _this = _super.call(this) || this;\n\n    _this.model = new CheckBoxObject_1.CheckBoxObject({\n      view: _this,\n      material: material\n    });\n    return _this;\n  }\n\n  return CheckBoxSprite;\n}(three_1.Sprite);\n\nexports.CheckBoxSprite = CheckBoxSprite;\n\n//# sourceURL=webpack:///./lib/CheckBoxSprite.js?");

/***/ }),

/***/ "./lib/ClickableMesh.js":
/*!******************************!*\
  !*** ./lib/ClickableMesh.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = this && this.__extends || function () {\n  var extendStatics = function (d, b) {\n    extendStatics = Object.setPrototypeOf || {\n      __proto__: []\n    } instanceof Array && function (d, b) {\n      d.__proto__ = b;\n    } || function (d, b) {\n      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    };\n\n    return extendStatics(d, b);\n  };\n\n  return function (d, b) {\n    extendStatics(d, b);\n\n    function __() {\n      this.constructor = d;\n    }\n\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n  };\n}();\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.ClickableMesh = void 0;\n\nvar three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\nvar ClickableObject_1 = __webpack_require__(/*! ./ClickableObject */ \"./lib/ClickableObject.js\");\n/**\n * クリックに反応するMesh。\n */\n\n\nvar ClickableMesh =\n/** @class */\nfunction (_super) {\n  __extends(ClickableMesh, _super);\n  /**\n   * コンストラクタ\n   */\n\n\n  function ClickableMesh(parameters) {\n    var _this = _super.call(this, parameters.geo) || this;\n\n    _this.model = new ClickableObject_1.ClickableObject({\n      view: _this,\n      material: parameters.material\n    });\n    return _this;\n  }\n\n  return ClickableMesh;\n}(three_1.Mesh);\n\nexports.ClickableMesh = ClickableMesh;\n\n//# sourceURL=webpack:///./lib/ClickableMesh.js?");

/***/ }),

/***/ "./lib/ClickableObject.js":
/*!********************************!*\
  !*** ./lib/ClickableObject.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.ClickableObject = void 0;\n\nvar MouseEventManager_1 = __webpack_require__(/*! ./MouseEventManager */ \"./lib/MouseEventManager.js\");\n\nvar ThreeMouseEvent_1 = __webpack_require__(/*! ./ThreeMouseEvent */ \"./lib/ThreeMouseEvent.js\");\n/**\n * クリックに反応するMesh。\n */\n\n\nvar ClickableObject =\n/** @class */\nfunction () {\n  /**\n   * コンストラクタ\n   */\n  function ClickableObject(parameters) {\n    this.isPress = false;\n    this.isOver = false;\n    this._enableMouse = true;\n    this.frozen = false;\n    this.state = MouseEventManager_1.ClickableState.NORMAL;\n    this._alpha = 1.0;\n    this.view = parameters.view;\n\n    if (!MouseEventManager_1.MouseEventManager.isInit) {\n      console.warn(\"MouseEventManager の初期化前にインタラクティブメッシュを生成しています。MouseEventManager.initをインタラクティブオブジェクトの生成前に実行してください。\");\n    }\n\n    this._materialSet = parameters.material;\n    this.updateMaterial();\n  }\n\n  Object.defineProperty(ClickableObject.prototype, \"materialSet\", {\n    get: function () {\n      return this._materialSet;\n    },\n    set: function (value) {\n      var isSame = value === this._materialSet;\n      this._materialSet = value;\n\n      if (!isSame) {\n        this.updateMaterial();\n      }\n    },\n    enumerable: false,\n    configurable: true\n  });\n\n  ClickableObject.prototype.onMouseDownHandler = function (event) {\n    if (!this.checkActivity()) return;\n    this.isPress = true;\n    this.updateState(MouseEventManager_1.ClickableState.DOWN);\n    this.view.dispatchEvent(event);\n  };\n\n  ClickableObject.prototype.onMouseUpHandler = function (event) {\n    if (!this.checkActivity()) return;\n    var currentPress = this.isPress;\n    this.isPress = false;\n    var nextState = this.isOver ? MouseEventManager_1.ClickableState.OVER : MouseEventManager_1.ClickableState.NORMAL;\n    this.updateState(nextState);\n    this.view.dispatchEvent(event);\n\n    if (this.isPress != currentPress) {\n      this.onMouseClick();\n      var e = new ThreeMouseEvent_1.ThreeMouseEvent(ThreeMouseEvent_1.ThreeMouseEventType.CLICK, this);\n      this.view.dispatchEvent(e);\n    }\n  };\n\n  ClickableObject.prototype.onMouseClick = function () {};\n\n  ClickableObject.prototype.onMouseOverHandler = function (event) {\n    this.onMouseOverOutHandler(event);\n  };\n\n  ClickableObject.prototype.onMouseOutHandler = function (event) {\n    this.onMouseOverOutHandler(event);\n  };\n\n  ClickableObject.prototype.onMouseOverOutHandler = function (event) {\n    if (!this.checkActivity()) return;\n    this.isOver = event.type === ThreeMouseEvent_1.ThreeMouseEventType.OVER;\n    this.updateState(this.isOver ? MouseEventManager_1.ClickableState.OVER : MouseEventManager_1.ClickableState.NORMAL);\n    this.view.dispatchEvent(event);\n  };\n\n  Object.defineProperty(ClickableObject.prototype, \"alpha\", {\n    set: function (number) {\n      this._alpha = number;\n      this.updateMaterial();\n    },\n    enumerable: false,\n    configurable: true\n  });\n\n  ClickableObject.prototype.updateState = function (state) {\n    this.state = state;\n    this.updateMaterial();\n  };\n  /**\n   * 現在のボタンの有効、無効状態を取得する\n   * @return    ボタンが有効か否か\n   */\n\n\n  ClickableObject.prototype.checkActivity = function () {\n    return this._enableMouse && !this.frozen;\n  };\n\n  ClickableObject.prototype.enable = function () {\n    this.switchEnable(true);\n  };\n\n  ClickableObject.prototype.disable = function () {\n    this.switchEnable(false);\n  };\n\n  ClickableObject.prototype.updateMaterial = function () {\n    this._materialSet.setOpacity(this._alpha);\n\n    var stateMat = this._materialSet.getMaterial(this.state, this._enableMouse);\n\n    this.view.material = stateMat.material;\n  };\n\n  ClickableObject.prototype.switchEnable = function (bool) {\n    this._enableMouse = bool;\n    this.state = bool ? MouseEventManager_1.ClickableState.NORMAL : MouseEventManager_1.ClickableState.DISABLE;\n    this.updateMaterial();\n  };\n\n  ClickableObject.prototype.getEnable = function () {\n    return this._enableMouse;\n  };\n\n  return ClickableObject;\n}();\n\nexports.ClickableObject = ClickableObject;\n\n//# sourceURL=webpack:///./lib/ClickableObject.js?");

/***/ }),

/***/ "./lib/ClickableSptire.js":
/*!********************************!*\
  !*** ./lib/ClickableSptire.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = this && this.__extends || function () {\n  var extendStatics = function (d, b) {\n    extendStatics = Object.setPrototypeOf || {\n      __proto__: []\n    } instanceof Array && function (d, b) {\n      d.__proto__ = b;\n    } || function (d, b) {\n      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    };\n\n    return extendStatics(d, b);\n  };\n\n  return function (d, b) {\n    extendStatics(d, b);\n\n    function __() {\n      this.constructor = d;\n    }\n\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n  };\n}();\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.ClickableSprite = void 0;\n\nvar three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\nvar ClickableObject_1 = __webpack_require__(/*! ./ClickableObject */ \"./lib/ClickableObject.js\");\n/**\n * クリックに反応するSprite。\n */\n\n\nvar ClickableSprite =\n/** @class */\nfunction (_super) {\n  __extends(ClickableSprite, _super);\n\n  function ClickableSprite(material) {\n    var _this = _super.call(this) || this;\n\n    _this.model = new ClickableObject_1.ClickableObject({\n      view: _this,\n      material: material\n    });\n    return _this;\n  }\n\n  return ClickableSprite;\n}(three_1.Sprite);\n\nexports.ClickableSprite = ClickableSprite;\n\n//# sourceURL=webpack:///./lib/ClickableSptire.js?");

/***/ }),

/***/ "./lib/MouseEventManager.js":
/*!**********************************!*\
  !*** ./lib/MouseEventManager.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.ClickableState = exports.MouseEventManager = void 0;\n\nvar three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\nvar ThreeMouseEvent_1 = __webpack_require__(/*! ./ThreeMouseEvent */ \"./lib/ThreeMouseEvent.js\");\n\nvar raf_ticker_1 = __webpack_require__(/*! raf-ticker */ \"./node_modules/raf-ticker/esm/index.js\");\n\nvar MouseEventManager =\n/** @class */\nfunction () {\n  function MouseEventManager() {}\n\n  MouseEventManager.init = function (scene, camera, renderer, option) {\n    var _a;\n\n    MouseEventManager.isInit = true;\n    MouseEventManager.camera = camera;\n    MouseEventManager.renderer = renderer;\n    MouseEventManager.scene = scene;\n    MouseEventManager.throttlingTime_ms = (_a = option === null || option === void 0 ? void 0 : option.throttlingTime_ms) !== null && _a !== void 0 ? _a : 33;\n    var canvas = renderer.domElement;\n    MouseEventManager.canvas = canvas;\n    canvas.addEventListener(\"mousemove\", MouseEventManager.onDocumentMouseMove, false);\n    canvas.addEventListener(\"mousedown\", MouseEventManager.onDocumentMouseUpDown, false);\n    canvas.addEventListener(\"mouseup\", MouseEventManager.onDocumentMouseUpDown, false);\n    raf_ticker_1.RAFTicker.addEventListener(raf_ticker_1.RAFTickerEventType.tick, function (e) {\n      MouseEventManager.throttlingDelta += e.delta;\n\n      if (MouseEventManager.throttlingDelta < MouseEventManager.throttlingTime_ms) {\n        return;\n      }\n\n      MouseEventManager.hasThrottled = false;\n      MouseEventManager.throttlingDelta %= MouseEventManager.throttlingTime_ms;\n    });\n  };\n  /**\n   * 現在マウスオーバーしている対象をなしにする。\n   * もし、すでにマウスオーバー対象が存在するなら、マウスアウトハンドラーを呼び出した後にクリアする。\n   */\n\n\n  MouseEventManager.clearCurrentOver = function () {\n    if (MouseEventManager.currentOver) {\n      MouseEventManager.onButtonHandler(MouseEventManager.currentOver, ThreeMouseEvent_1.ThreeMouseEventType.OUT);\n    }\n\n    MouseEventManager.currentOver = null;\n  };\n  /**\n   * マウスの座標にかかっているオブジェクト一覧から、操作対象を検索し\n   * 指定されたタイプのハンドラー関数を実行させる。\n   * @param {Intersection[]} intersects\n   * @param {ThreeMouseEventType} type\n   */\n\n\n  MouseEventManager.checkIntersects = function (intersects, type) {\n    var n = intersects.length;\n    if (n === 0) return;\n\n    for (var i = 0; i < n; i++) {\n      var checked = MouseEventManager.checkTarget(intersects[i].object);\n\n      if (checked) {\n        MouseEventManager.onButtonHandler(checked, type);\n        break;\n      }\n    }\n  };\n  /**\n   * ボタンの各種イベントハンドラーメソッドを、typeにしたがって実行する。\n   * @param {IClickableObject3D} btn\n   * @param {ThreeMouseEventType} type\n   */\n\n\n  MouseEventManager.onButtonHandler = function (btn, type) {\n    switch (type) {\n      case ThreeMouseEvent_1.ThreeMouseEventType.DOWN:\n        btn.model.onMouseDownHandler(new ThreeMouseEvent_1.ThreeMouseEvent(type, btn));\n        return;\n\n      case ThreeMouseEvent_1.ThreeMouseEventType.UP:\n        btn.model.onMouseUpHandler(new ThreeMouseEvent_1.ThreeMouseEvent(type, btn));\n        return;\n\n      case ThreeMouseEvent_1.ThreeMouseEventType.OVER:\n        btn.model.onMouseOverHandler(new ThreeMouseEvent_1.ThreeMouseEvent(type, btn));\n        return;\n\n      case ThreeMouseEvent_1.ThreeMouseEventType.OUT:\n        btn.model.onMouseOutHandler(new ThreeMouseEvent_1.ThreeMouseEvent(type, btn));\n        return;\n    }\n  };\n\n  MouseEventManager.checkTarget = function (target) {\n    // ユーザ定義タイプガード\n    function implementsIClickableObject3D(arg) {\n      return arg !== null && typeof arg === \"object\" && arg.model !== null && typeof arg.model === \"object\" && arg.model.getEnable !== null && typeof arg.model.getEnable === \"function\";\n    } //EdgeHelper / WireframeHelperは無視。\n\n\n    if (target.type === \"LineSegments\") {\n      return null;\n    } //クリッカブルインターフェースを継承しているなら判定OK\n\n\n    var targetAny = target;\n\n    if (implementsIClickableObject3D(targetAny) && targetAny.model.getEnable() === true) {\n      return target;\n    } //継承していないならその親を探索継続。\n    //ターゲットから上昇して探す。\n\n\n    if (target.parent != null && target.parent.type !== \"Scene\") {\n      return MouseEventManager.checkTarget(target.parent);\n    } //親がシーンの場合は探索終了。nullを返す。\n\n\n    return null;\n  };\n\n  MouseEventManager.updateMouse = function (event, mouse) {\n    mouse.x = event.offsetX / MouseEventManager.canvas.clientWidth * 2 - 1;\n    mouse.y = -(event.offsetY / MouseEventManager.canvas.clientHeight) * 2 + 1;\n    return mouse;\n  };\n\n  MouseEventManager.getIntersects = function (event) {\n    MouseEventManager.mouse = MouseEventManager.updateMouse(event, MouseEventManager.mouse);\n    MouseEventManager.raycaster.setFromCamera(MouseEventManager.mouse, MouseEventManager.camera);\n    var intersects = MouseEventManager.raycaster.intersectObjects(MouseEventManager.scene.children, true);\n    return intersects;\n  };\n\n  MouseEventManager.raycaster = new three_1.Raycaster();\n  MouseEventManager.mouse = new three_1.Vector2();\n  MouseEventManager.isInit = false;\n  MouseEventManager.hasThrottled = false;\n  MouseEventManager.throttlingDelta = 0;\n\n  MouseEventManager.onDocumentMouseMove = function (event) {\n    if (MouseEventManager.hasThrottled) return;\n    MouseEventManager.hasThrottled = true;\n\n    if (event.type === \"mousemove\") {\n      event.preventDefault();\n    }\n\n    var intersects = MouseEventManager.getIntersects(event);\n    var n = intersects.length;\n\n    if (n == 0) {\n      MouseEventManager.clearCurrentOver();\n      return;\n    }\n\n    for (var i = 0; i < n; i++) {\n      var checked = MouseEventManager.checkTarget(intersects[i].object);\n\n      if (checked) {\n        if (checked != MouseEventManager.currentOver) {\n          MouseEventManager.clearCurrentOver();\n          MouseEventManager.currentOver = checked;\n          MouseEventManager.onButtonHandler(checked, ThreeMouseEvent_1.ThreeMouseEventType.OVER);\n        }\n\n        return;\n      }\n    }\n\n    MouseEventManager.clearCurrentOver();\n    return;\n  };\n  /**\n   * カンバス上でマウスダウンかマウスアップが行われた際のイベントハンドラー\n   * マウス座標から対象となるObject3Dを探し出して操作を行う。\n   * @param {MouseEvent} event\n   */\n\n\n  MouseEventManager.onDocumentMouseUpDown = function (event) {\n    var eventType = ThreeMouseEvent_1.ThreeMouseEventType.DOWN;\n\n    switch (event.type) {\n      case \"mousedown\":\n        eventType = ThreeMouseEvent_1.ThreeMouseEventType.DOWN;\n        break;\n\n      case \"mouseup\":\n        eventType = ThreeMouseEvent_1.ThreeMouseEventType.UP;\n        break;\n    }\n\n    event.preventDefault();\n    var intersects = MouseEventManager.getIntersects(event);\n    MouseEventManager.checkIntersects(intersects, eventType);\n  };\n\n  return MouseEventManager;\n}();\n\nexports.MouseEventManager = MouseEventManager;\n/**\n * IClickable3DObjectの現在状態を表す定数セット。\n * これとselectフラグを掛け合わせることで状態を判定する。\n */\n\nvar ClickableState;\n\n(function (ClickableState) {\n  //ボタンの状態を表す定数\n  ClickableState[\"NORMAL\"] = \"normal\";\n  ClickableState[\"OVER\"] = \"normal_over\";\n  ClickableState[\"DOWN\"] = \"normal_down\";\n  ClickableState[\"DISABLE\"] = \"disable\";\n})(ClickableState = exports.ClickableState || (exports.ClickableState = {}));\n\n//# sourceURL=webpack:///./lib/MouseEventManager.js?");

/***/ }),

/***/ "./lib/RadioButtonManager.js":
/*!***********************************!*\
  !*** ./lib/RadioButtonManager.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = this && this.__extends || function () {\n  var extendStatics = function (d, b) {\n    extendStatics = Object.setPrototypeOf || {\n      __proto__: []\n    } instanceof Array && function (d, b) {\n      d.__proto__ = b;\n    } || function (d, b) {\n      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    };\n\n    return extendStatics(d, b);\n  };\n\n  return function (d, b) {\n    extendStatics(d, b);\n\n    function __() {\n      this.constructor = d;\n    }\n\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n  };\n}();\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.RadioButtonManager = void 0;\n\nvar three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\nvar ThreeMouseEvent_1 = __webpack_require__(/*! ./ThreeMouseEvent */ \"./lib/ThreeMouseEvent.js\");\n\nvar RadioButtonManager =\n/** @class */\nfunction (_super) {\n  __extends(RadioButtonManager, _super);\n  /**\n   * コンストラクタ\n   */\n\n\n  function RadioButtonManager() {\n    var _this = _super.call(this) || this;\n    /**\n     * このマネージャーの管理下のボタン\n     * @type {any[]}\n     * @private\n     */\n\n\n    _this._models = [];\n    /**\n     * 管理下のボタンが選択された場合の処理\n     * @param {Event} e\n     */\n\n    _this.onSelectedButton = function (e) {\n      var evt = e;\n\n      if (evt.isSelected) {\n        _this.select(evt.model);\n      }\n    };\n\n    return _this;\n  }\n  /**\n   * このマネージャーの管理下にボタンを追加する\n   * @param {IRadioButtonObject3D[]} buttons\n   */\n\n\n  RadioButtonManager.prototype.addButton = function () {\n    var _this = this;\n\n    var buttons = [];\n\n    for (var _i = 0; _i < arguments.length; _i++) {\n      buttons[_i] = arguments[_i];\n    }\n\n    buttons.forEach(function (btn) {\n      _this.addModel(btn.model);\n    });\n  };\n\n  RadioButtonManager.prototype.addModel = function (model) {\n    this._models.push(model);\n\n    model.view.addEventListener(ThreeMouseEvent_1.ThreeMouseEventType.SELECT, this.onSelectedButton);\n  };\n  /**\n   * ボタンを管理下から外す。\n   * ボタン自体の削除は行わない。\n   * @param {IRadioButtonObject3D} button\n   */\n\n\n  RadioButtonManager.prototype.removeButton = function (button) {\n    this.removeModel(button.model);\n  };\n\n  RadioButtonManager.prototype.removeModel = function (model) {\n    var index = this._models.indexOf(model);\n\n    if (index > -1) {\n      this._models.splice(index, 1);\n\n      model.view.removeEventListener(ThreeMouseEvent_1.ThreeMouseEventType.SELECT, this.onSelectedButton);\n    }\n\n    return model;\n  };\n  /**\n   * 特定のボタンを選択する\n   * @param {RadioButtonObject} model\n   */\n\n\n  RadioButtonManager.prototype.select = function (model) {\n    var index = this._models.indexOf(model);\n\n    if (index === -1) {\n      console.warn(\"管理下でないボタンが選択処理されました。\");\n      return;\n    } //選択済みのボタンを再度渡されても反応しない。\n\n\n    if (model === this._selected && model.isFrozen) {\n      return;\n    }\n\n    this._selected = model;\n\n    for (var _i = 0, _a = this._models; _i < _a.length; _i++) {\n      var mdl = _a[_i];\n      mdl.selection = mdl.isFrozen = mdl === model;\n    }\n\n    var evt = new ThreeMouseEvent_1.ThreeMouseEvent(ThreeMouseEvent_1.ThreeMouseEventType.SELECT, model);\n    this.dispatchEvent(evt);\n  };\n\n  Object.defineProperty(RadioButtonManager.prototype, \"selected\", {\n    get: function () {\n      return this._selected;\n    },\n    enumerable: false,\n    configurable: true\n  });\n  Object.defineProperty(RadioButtonManager.prototype, \"models\", {\n    get: function () {\n      return this._models;\n    },\n    enumerable: false,\n    configurable: true\n  });\n  return RadioButtonManager;\n}(three_1.EventDispatcher);\n\nexports.RadioButtonManager = RadioButtonManager;\n\n//# sourceURL=webpack:///./lib/RadioButtonManager.js?");

/***/ }),

/***/ "./lib/RadioButtonMesh.js":
/*!********************************!*\
  !*** ./lib/RadioButtonMesh.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = this && this.__extends || function () {\n  var extendStatics = function (d, b) {\n    extendStatics = Object.setPrototypeOf || {\n      __proto__: []\n    } instanceof Array && function (d, b) {\n      d.__proto__ = b;\n    } || function (d, b) {\n      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    };\n\n    return extendStatics(d, b);\n  };\n\n  return function (d, b) {\n    extendStatics(d, b);\n\n    function __() {\n      this.constructor = d;\n    }\n\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n  };\n}();\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.RadioButtonMesh = void 0;\n\nvar RadioButtonObject_1 = __webpack_require__(/*! ./RadioButtonObject */ \"./lib/RadioButtonObject.js\");\n\nvar three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\nvar RadioButtonMesh =\n/** @class */\nfunction (_super) {\n  __extends(RadioButtonMesh, _super);\n  /**\n   * コンストラクタ\n   */\n\n\n  function RadioButtonMesh(parameters) {\n    var _this = _super.call(this, parameters.geo) || this;\n\n    _this.model = new RadioButtonObject_1.RadioButtonObject({\n      view: _this,\n      material: parameters.material\n    });\n    return _this;\n  }\n\n  return RadioButtonMesh;\n}(three_1.Mesh);\n\nexports.RadioButtonMesh = RadioButtonMesh;\n\n//# sourceURL=webpack:///./lib/RadioButtonMesh.js?");

/***/ }),

/***/ "./lib/RadioButtonObject.js":
/*!**********************************!*\
  !*** ./lib/RadioButtonObject.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = this && this.__extends || function () {\n  var extendStatics = function (d, b) {\n    extendStatics = Object.setPrototypeOf || {\n      __proto__: []\n    } instanceof Array && function (d, b) {\n      d.__proto__ = b;\n    } || function (d, b) {\n      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    };\n\n    return extendStatics(d, b);\n  };\n\n  return function (d, b) {\n    extendStatics(d, b);\n\n    function __() {\n      this.constructor = d;\n    }\n\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n  };\n}();\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.RadioButtonObject = void 0;\n\nvar CheckBoxObject_1 = __webpack_require__(/*! ./CheckBoxObject */ \"./lib/CheckBoxObject.js\");\n\nvar RadioButtonObject =\n/** @class */\nfunction (_super) {\n  __extends(RadioButtonObject, _super);\n\n  function RadioButtonObject() {\n    var _this = _super !== null && _super.apply(this, arguments) || this;\n\n    _this._isFrozen = false;\n    return _this;\n  }\n  /**\n   * 現在のボタンの有効、無効状態を取得する\n   * ラジオボタンは選択中は自身の状態を変更できない。\n   * @return    ボタンが有効か否か\n   */\n\n\n  RadioButtonObject.prototype.checkActivity = function () {\n    return this._enableMouse && !this._isFrozen;\n  };\n\n  Object.defineProperty(RadioButtonObject.prototype, \"isFrozen\", {\n    get: function () {\n      return this._isFrozen;\n    },\n    set: function (bool) {\n      this._isFrozen = bool;\n    },\n    enumerable: false,\n    configurable: true\n  });\n  return RadioButtonObject;\n}(CheckBoxObject_1.CheckBoxObject);\n\nexports.RadioButtonObject = RadioButtonObject;\n\n//# sourceURL=webpack:///./lib/RadioButtonObject.js?");

/***/ }),

/***/ "./lib/RadioButtonSprite.js":
/*!**********************************!*\
  !*** ./lib/RadioButtonSprite.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = this && this.__extends || function () {\n  var extendStatics = function (d, b) {\n    extendStatics = Object.setPrototypeOf || {\n      __proto__: []\n    } instanceof Array && function (d, b) {\n      d.__proto__ = b;\n    } || function (d, b) {\n      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    };\n\n    return extendStatics(d, b);\n  };\n\n  return function (d, b) {\n    extendStatics(d, b);\n\n    function __() {\n      this.constructor = d;\n    }\n\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n  };\n}();\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.RadioButtonSprite = void 0;\n\nvar RadioButtonObject_1 = __webpack_require__(/*! ./RadioButtonObject */ \"./lib/RadioButtonObject.js\");\n\nvar three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\nvar RadioButtonSprite =\n/** @class */\nfunction (_super) {\n  __extends(RadioButtonSprite, _super);\n\n  function RadioButtonSprite(material) {\n    var _this = _super.call(this) || this;\n\n    _this.model = new RadioButtonObject_1.RadioButtonObject({\n      view: _this,\n      material: material\n    });\n    return _this;\n  }\n\n  return RadioButtonSprite;\n}(three_1.Sprite);\n\nexports.RadioButtonSprite = RadioButtonSprite;\n\n//# sourceURL=webpack:///./lib/RadioButtonSprite.js?");

/***/ }),

/***/ "./lib/StateMaterial.js":
/*!******************************!*\
  !*** ./lib/StateMaterial.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.StateMaterialSet = exports.StateMaterial = void 0;\n\nvar MouseEventManager_1 = __webpack_require__(/*! ./MouseEventManager */ \"./lib/MouseEventManager.js\");\n\nvar StateMaterial =\n/** @class */\nfunction () {\n  function StateMaterial(material) {\n    this.alpha = 1.0;\n    this.material = material;\n  }\n\n  StateMaterial.prototype.updateAlpha = function () {\n    if (this._material instanceof Array) {\n      this.alphaArray = this.getAlphaArray();\n    } else {\n      this.alpha = this._material.opacity;\n    }\n  };\n\n  StateMaterial.prototype.getAlphaArray = function () {\n    var matArray = this._material;\n    var n = matArray.length;\n    var array = [];\n\n    for (var i = 0; i < n; i++) {\n      array.push(matArray[i].opacity);\n    }\n\n    return array;\n  };\n\n  Object.defineProperty(StateMaterial.prototype, \"material\", {\n    get: function () {\n      return this._material;\n    },\n    set: function (value) {\n      this._material = value;\n      this.updateAlpha();\n    },\n    enumerable: false,\n    configurable: true\n  });\n\n  StateMaterial.prototype.setOpacity = function (opacity) {\n    if (this._material instanceof Array) {\n      var n = this._material.length;\n\n      for (var i = 0; i < n; i++) {\n        var material = this._material[i];\n        material.opacity = opacity * this.alphaArray[i];\n      }\n    } else {\n      this._material.opacity = opacity * this.alpha;\n    }\n  };\n\n  return StateMaterial;\n}();\n\nexports.StateMaterial = StateMaterial;\n\nvar StateMaterialSet =\n/** @class */\nfunction () {\n  function StateMaterialSet(param) {\n    this.normal = new StateMaterial(param.normal);\n    this.over = StateMaterialSet.initMaterial(param.over, this.normal);\n    this.down = StateMaterialSet.initMaterial(param.down, this.normal);\n    this.disable = StateMaterialSet.initMaterial(param.disable, this.normal);\n    this.normalSelect = StateMaterialSet.initMaterial(param.normalSelect, this.normal);\n    this.overSelect = StateMaterialSet.initMaterial(param.overSelect, this.normal);\n    this.downSelect = StateMaterialSet.initMaterial(param.downSelect, this.normal);\n    this.init();\n  }\n\n  StateMaterialSet.initMaterial = function (value, defaultMaterial) {\n    if (value == null) return defaultMaterial;\n    return new StateMaterial(value);\n  };\n\n  StateMaterialSet.prototype.init = function () {\n    if (this.normal == null) {\n      throw new Error(\"通常状態のマテリアルが指定されていません。\");\n    }\n\n    this.materials = [this.normal, this.normalSelect, this.over, this.overSelect, this.down, this.downSelect, this.disable];\n  };\n\n  StateMaterialSet.prototype.getMaterial = function (state, mouseEnabled, isSelected) {\n    if (isSelected === void 0) {\n      isSelected = false;\n    } //無効状態はstateよりも優先\n\n\n    if (!mouseEnabled) {\n      return this.disable;\n    }\n\n    switch (state) {\n      case MouseEventManager_1.ClickableState.NORMAL:\n        return isSelected ? this.normalSelect : this.normal;\n\n      case MouseEventManager_1.ClickableState.DOWN:\n        return isSelected ? this.downSelect : this.down;\n\n      case MouseEventManager_1.ClickableState.OVER:\n        return isSelected ? this.overSelect : this.over;\n    }\n\n    return this.normal;\n  };\n\n  StateMaterialSet.prototype.setOpacity = function (opacity) {\n    this.materials.forEach(function (mat) {\n      mat.setOpacity(opacity);\n    });\n  };\n\n  return StateMaterialSet;\n}();\n\nexports.StateMaterialSet = StateMaterialSet;\n\n//# sourceURL=webpack:///./lib/StateMaterial.js?");

/***/ }),

/***/ "./lib/ThreeMouseEvent.js":
/*!********************************!*\
  !*** ./lib/ThreeMouseEvent.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.ThreeMouseEventType = exports.ThreeMouseEvent = void 0;\n\nvar ThreeMouseEvent =\n/** @class */\nfunction () {\n  function ThreeMouseEvent(type, modelOrView) {\n    var model = ThreeMouseEvent.getModel(modelOrView);\n    this.type = type;\n    this.model = model;\n\n    if (type === ThreeMouseEventType.SELECT) {\n      this.isSelected = ThreeMouseEvent.getSelection(model);\n    }\n  }\n\n  ThreeMouseEvent.getModel = function (modelOrView) {\n    if (\"model\" in modelOrView) {\n      return modelOrView.model;\n    }\n\n    return modelOrView;\n  };\n  /**\n   * SELECTイベントの場合は、対象ボタンの選択状態を取得\n   * @param model\n   */\n\n\n  ThreeMouseEvent.getSelection = function (model) {\n    if (\"selection\" in model) {\n      return model[\"selection\"];\n    } else {\n      throw new Error(\"選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。\");\n    }\n  };\n\n  ThreeMouseEvent.prototype.clone = function () {\n    return new ThreeMouseEvent(this.type, this.model);\n  };\n\n  return ThreeMouseEvent;\n}();\n\nexports.ThreeMouseEvent = ThreeMouseEvent;\nvar ThreeMouseEventType;\n\n(function (ThreeMouseEventType) {\n  ThreeMouseEventType[\"CLICK\"] = \"THREE_MOUSE_EVENT_CLICK\";\n  ThreeMouseEventType[\"OVER\"] = \"THREE_MOUSE_EVENT_OVER\";\n  ThreeMouseEventType[\"OUT\"] = \"THREE_MOUSE_EVENT_OUT\";\n  ThreeMouseEventType[\"DOWN\"] = \"THREE_MOUSE_EVENT_DOWN\";\n  ThreeMouseEventType[\"UP\"] = \"THREE_MOUSE_EVENT_UP\";\n  ThreeMouseEventType[\"SELECT\"] = \"THREE_MOUSE_EVENT_SELECT\";\n})(ThreeMouseEventType = exports.ThreeMouseEventType || (exports.ThreeMouseEventType = {}));\n\n//# sourceURL=webpack:///./lib/ThreeMouseEvent.js?");

/***/ }),

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {\n  if (k2 === undefined) k2 = k;\n  Object.defineProperty(o, k2, {\n    enumerable: true,\n    get: function () {\n      return m[k];\n    }\n  });\n} : function (o, m, k, k2) {\n  if (k2 === undefined) k2 = k;\n  o[k2] = m[k];\n});\n\nvar __exportStar = this && this.__exportStar || function (m, exports) {\n  for (var p in m) if (p !== \"default\" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);\n};\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\n__exportStar(__webpack_require__(/*! ./ClickableMesh */ \"./lib/ClickableMesh.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./ClickableSptire */ \"./lib/ClickableSptire.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./ClickableObject */ \"./lib/ClickableObject.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./CheckBoxMesh */ \"./lib/CheckBoxMesh.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./CheckBoxSprite */ \"./lib/CheckBoxSprite.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./CheckBoxObject */ \"./lib/CheckBoxObject.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./RadioButtonMesh */ \"./lib/RadioButtonMesh.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./RadioButtonSprite */ \"./lib/RadioButtonSprite.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./RadioButtonObject */ \"./lib/RadioButtonObject.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./RadioButtonManager */ \"./lib/RadioButtonManager.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./StateMaterial */ \"./lib/StateMaterial.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./MouseEventManager */ \"./lib/MouseEventManager.js\"), exports);\n\n__exportStar(__webpack_require__(/*! ./ThreeMouseEvent */ \"./lib/ThreeMouseEvent.js\"), exports);\n\n//# sourceURL=webpack:///./lib/index.js?");

/***/ })

/******/ });