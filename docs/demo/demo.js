/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./demoSrc/demo.js":
/*!*************************!*\
  !*** ./demoSrc/demo.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! .. */ \"./esm/index.js\");\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\n\nconst W = 1280;\nconst H = 900;\nlet renderer;\nlet scene;\nlet camera;\n\nconst onDomContentsLoaded = () => {\n  // シーンを作成\n  scene = new three__WEBPACK_IMPORTED_MODULE_1__.Scene();\n  camera = new three__WEBPACK_IMPORTED_MODULE_1__.PerspectiveCamera(45, W / H, 1, 400);\n  camera.position.set(0, 0, 100);\n  scene.add(camera);\n  const renderOption = {\n    canvas: document.getElementById(\"webgl-canvas\"),\n    antialias: true\n  };\n  renderer = new three__WEBPACK_IMPORTED_MODULE_1__.WebGLRenderer(renderOption);\n  renderer.setClearColor(new three__WEBPACK_IMPORTED_MODULE_1__.Color(0x000000));\n  renderer.setSize(W, H);\n  renderer.setPixelRatio(window.devicePixelRatio); //平行光源オブジェクト(light)の設定\n\n  const ambientLight = new three__WEBPACK_IMPORTED_MODULE_1__.AmbientLight(0xffffff, 1.0);\n  scene.add(ambientLight); //マウスイベントの取得開始\n\n  ___WEBPACK_IMPORTED_MODULE_0__.MouseEventManager.init(scene, camera, renderer);\n  testButton();\n  testCheckbox();\n  testSprite();\n  testSelectableSprite();\n  testRadio();\n  render();\n};\n/**\n * Mesh用のマテリアルセットを新規に取得する。\n * @returns {StateMaterialSet}\n */\n\n\nconst getMaterialSet = () => {\n  return new ___WEBPACK_IMPORTED_MODULE_0__.StateMaterialSet({\n    normal: getMeshMaterial(0.6),\n    over: getMeshMaterial(0.8),\n    down: getMeshMaterial(1.0),\n    normalSelect: getMeshMaterial(0.6, 0xffff00),\n    overSelect: getMeshMaterial(0.8, 0xffff00),\n    downSelect: getMeshMaterial(1.0, 0xffff00)\n  });\n};\n\nconst getMeshMaterial = (opacity, color) => {\n  if (color == null) color = 0xffffff;\n  return new three__WEBPACK_IMPORTED_MODULE_1__.MeshBasicMaterial({\n    color: color,\n    opacity: opacity,\n    transparent: true\n  });\n};\n/**\n * スプライト用のマテリアルセットを新規に生成する。\n */\n\n\nconst getSpriteMaterialSet = () => {\n  return new ___WEBPACK_IMPORTED_MODULE_0__.StateMaterialSet({\n    normal: getSpriteMaterial(\"./btn045_01.png\", 1.0),\n    over: getSpriteMaterial(\"./btn045_02.png\", 1.0),\n    down: getSpriteMaterial(\"./btn045_03.png\", 1.0),\n    normalSelect: getSpriteMaterial(\"./btn045_01.png\", 0.5),\n    overSelect: getSpriteMaterial(\"./btn045_02.png\", 0.5),\n    downSelect: getSpriteMaterial(\"./btn045_03.png\", 0.5)\n  });\n};\n/**\n * スプライト用マテリアルを生成する\n * @param img マップ画像URL\n * @param opacity 透過度\n * @param color カラー\n * @returns {SpriteMaterial}\n */\n\n\nconst getSpriteMaterial = (img, opacity, color) => {\n  if (color == null) color = 0xffffff;\n  return new three__WEBPACK_IMPORTED_MODULE_1__.SpriteMaterial({\n    map: new three__WEBPACK_IMPORTED_MODULE_1__.TextureLoader().load(img),\n    color: color,\n    opacity: opacity,\n    transparent: true\n  });\n};\n\nconst testButton = () => {\n  const geometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxBufferGeometry(3, 3, 3);\n  const clickable = new ___WEBPACK_IMPORTED_MODULE_0__.ClickableMesh({\n    geo: geometry,\n    material: getMaterialSet()\n  });\n  clickable.position.set(-10, 20, 0);\n  scene.add(clickable);\n};\n\nconst testCheckbox = () => {\n  const geometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxBufferGeometry(3, 3, 3);\n  const clickable = new ___WEBPACK_IMPORTED_MODULE_0__.CheckBoxMesh({\n    geo: geometry,\n    material: getMaterialSet()\n  });\n  clickable.position.set(0, 20, 0);\n  scene.add(clickable);\n};\n\nconst testSprite = () => {\n  const clickable = new ___WEBPACK_IMPORTED_MODULE_0__.ClickableSprite(getSpriteMaterialSet());\n  alignSprite(clickable, 10);\n};\n\nconst testSelectableSprite = () => {\n  const selectable = new ___WEBPACK_IMPORTED_MODULE_0__.CheckBoxSprite(getSpriteMaterialSet());\n  alignSprite(selectable, 20);\n};\n\nconst alignSprite = (sprite, x) => {\n  sprite.position.set(x, 20, 0);\n  const scale = 4.0;\n  sprite.scale.set(scale, scale, scale);\n  scene.add(sprite);\n};\n\nconst testRadio = () => {\n  const geometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxBufferGeometry(3, 3, 3);\n\n  const initButton = (x, buttonValue) => {\n    const button = new ___WEBPACK_IMPORTED_MODULE_0__.RadioButtonMesh({\n      geo: geometry,\n      material: getMaterialSet()\n    });\n    button.position.set(x, -10, 0);\n    button.model.value = buttonValue;\n    scene.add(button);\n    return button;\n  };\n\n  const manager = new ___WEBPACK_IMPORTED_MODULE_0__.RadioButtonManager();\n  manager.addButton(initButton(-10, \"button01\"), initButton(0, Math.PI), initButton(10, {\n    value01: 1,\n    value02: 2\n  }));\n  manager.addButton(initButton(20, undefined));\n  manager.addEventListener(___WEBPACK_IMPORTED_MODULE_0__.ThreeMouseEventType.SELECT, e => {\n    console.log(e.model.value);\n  });\n};\n\nconst render = () => {\n  renderer.render(scene, camera);\n  requestAnimationFrame(render);\n};\n/**\n * DOMContentLoaded以降に初期化処理を実行する\n */\n\n\nwindow.onload = onDomContentsLoaded;\n\n//# sourceURL=webpack://threejs-interactive-object/./demoSrc/demo.js?");

/***/ }),

/***/ "./esm/CheckBoxObject.js":
/*!*******************************!*\
  !*** ./esm/CheckBoxObject.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"CheckBoxObject\": () => (/* binding */ CheckBoxObject)\n/* harmony export */ });\n/* harmony import */ var _ClickableObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ClickableObject */ \"./esm/ClickableObject.js\");\n/* harmony import */ var _MouseEventManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MouseEventManager */ \"./esm/MouseEventManager.js\");\n/* harmony import */ var _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ThreeMouseEvent */ \"./esm/ThreeMouseEvent.js\");\n\n\n\nclass CheckBoxObject extends _ClickableObject__WEBPACK_IMPORTED_MODULE_0__.ClickableObject {\n  constructor() {\n    super(...arguments);\n    this._isSelect = false;\n  }\n  /**\n   * クリックイベント時の処理\n   * \"click\"イベントはマウスイベント類の必ず最後に発生するので\n   * ここでisSelect状態を一括管理する。\n   */\n\n\n  onMouseClick() {\n    this._isSelect = !this._isSelect;\n    const e = new _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_2__.ThreeMouseEvent(_ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_2__.ThreeMouseEventType.SELECT, this);\n    this.view.dispatchEvent(e);\n    this.updateMaterial();\n  }\n\n  get selection() {\n    return this._isSelect;\n  }\n\n  set selection(bool) {\n    this._isSelect = bool;\n    this.updateState(_MouseEventManager__WEBPACK_IMPORTED_MODULE_1__.ClickableState.NORMAL);\n  }\n\n  updateMaterial() {\n    this.materialSet.setOpacity(this._alpha);\n    const stateMat = this.materialSet.getMaterial(this.state, this._enable, this._isSelect);\n    this.view.material = stateMat.material;\n  }\n\n}\n\n//# sourceURL=webpack://threejs-interactive-object/./esm/CheckBoxObject.js?");

/***/ }),

/***/ "./esm/ClickableGroup.js":
/*!*******************************!*\
  !*** ./esm/ClickableGroup.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ClickableGroup\": () => (/* binding */ ClickableGroup)\n/* harmony export */ });\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _ClickableObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ClickableObject */ \"./esm/ClickableObject.js\");\n\n\nclass ClickableGroup extends three__WEBPACK_IMPORTED_MODULE_1__.Group {\n  constructor() {\n    super();\n    this.model = new _ClickableObject__WEBPACK_IMPORTED_MODULE_0__.ClickableObject({\n      view: this\n    });\n  }\n\n}\n\n//# sourceURL=webpack://threejs-interactive-object/./esm/ClickableGroup.js?");

/***/ }),

/***/ "./esm/ClickableObject.js":
/*!********************************!*\
  !*** ./esm/ClickableObject.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ClickableObject\": () => (/* binding */ ClickableObject)\n/* harmony export */ });\n/* harmony import */ var _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MouseEventManager */ \"./esm/MouseEventManager.js\");\n/* harmony import */ var _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ThreeMouseEvent */ \"./esm/ThreeMouseEvent.js\");\n\n\n/**\n * クリックに反応するObject。\n */\n\nclass ClickableObject {\n  /**\n   * コンストラクタ\n   */\n  constructor(parameters) {\n    var _a;\n\n    this._isPress = false;\n    this._isOver = false;\n    this._enable = true;\n    this.mouseEnabled = true;\n    this.frozen = false;\n    this.state = _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.ClickableState.NORMAL;\n    this._alpha = 1.0;\n    this.view = parameters.view;\n\n    if (!_MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.MouseEventManager.isInit) {\n      console.warn(\"MouseEventManager の初期化前にインタラクティブメッシュを生成しています。MouseEventManager.initをインタラクティブオブジェクトの生成前に実行してください。\");\n    }\n\n    (_a = this._materialSet) !== null && _a !== void 0 ? _a : this._materialSet = parameters.material;\n    this.updateMaterial();\n  }\n\n  get materialSet() {\n    return this._materialSet;\n  }\n\n  set materialSet(value) {\n    const isSame = value === this._materialSet;\n    this._materialSet = value;\n\n    if (!isSame) {\n      this.updateMaterial();\n    }\n  }\n\n  get isOver() {\n    return this._isOver;\n  }\n\n  get isPress() {\n    return this._isPress;\n  }\n\n  onMouseDownHandler(event) {\n    if (!this.checkActivity()) return;\n    this._isPress = true;\n    this.updateState(_MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.ClickableState.DOWN);\n    this.view.dispatchEvent(event);\n  }\n\n  onMouseUpHandler(event) {\n    if (!this.checkActivity()) return;\n    const currentPress = this._isPress;\n    this._isPress = false;\n    const nextState = this._isOver ? _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.ClickableState.OVER : _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.ClickableState.NORMAL;\n    this.updateState(nextState);\n    this.view.dispatchEvent(event);\n\n    if (this._isPress != currentPress) {\n      this.onMouseClick();\n      let e = new _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEvent(_ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.CLICK, this);\n      this.view.dispatchEvent(e);\n    }\n  }\n\n  onMouseClick() {}\n\n  onMouseOverHandler(event) {\n    this.onMouseOverOutHandler(event);\n  }\n\n  onMouseOutHandler(event) {\n    this.onMouseOverOutHandler(event);\n  }\n\n  onMouseOverOutHandler(event) {\n    if (!this.checkActivity()) return;\n    this._isOver = event.type === _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.OVER;\n    this.updateState(this._isOver ? _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.ClickableState.OVER : _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.ClickableState.NORMAL);\n    this.view.dispatchEvent(event);\n  }\n\n  set alpha(number) {\n    this._alpha = number;\n    this.updateMaterial();\n  }\n\n  updateState(state) {\n    this.state = state;\n    this.updateMaterial();\n  }\n  /**\n   * 現在のボタンの有効、無効状態を取得する\n   * @return    ボタンが有効か否か\n   */\n\n\n  checkActivity() {\n    return this._enable && !this.frozen;\n  }\n\n  enable() {\n    this.switchEnable(true);\n  }\n\n  disable() {\n    this.switchEnable(false);\n  }\n\n  updateMaterial() {\n    var _a, _b;\n\n    (_a = this._materialSet) === null || _a === void 0 ? void 0 : _a.setOpacity(this._alpha);\n    const stateMat = (_b = this._materialSet) === null || _b === void 0 ? void 0 : _b.getMaterial(this.state, this._enable);\n    if (!stateMat) return;\n\n    switch (this.view.type) {\n      //TODO PR Mesh.d.ts\n      case \"Mesh\":\n      case \"Sprite\":\n        this.view.material = stateMat.material;\n        break;\n\n      case \"Group\":\n      default:\n        break;\n    }\n  }\n\n  switchEnable(bool) {\n    this._enable = bool;\n    this.state = bool ? _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.ClickableState.NORMAL : _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.ClickableState.DISABLE;\n    this.updateMaterial();\n  }\n\n}\n\n//# sourceURL=webpack://threejs-interactive-object/./esm/ClickableObject.js?");

/***/ }),

/***/ "./esm/InteractiveMesh.js":
/*!********************************!*\
  !*** ./esm/InteractiveMesh.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ClickableMesh\": () => (/* binding */ ClickableMesh),\n/* harmony export */   \"CheckBoxMesh\": () => (/* binding */ CheckBoxMesh),\n/* harmony export */   \"RadioButtonMesh\": () => (/* binding */ RadioButtonMesh)\n/* harmony export */ });\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _CheckBoxObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CheckBoxObject */ \"./esm/CheckBoxObject.js\");\n/* harmony import */ var _ClickableObject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ClickableObject */ \"./esm/ClickableObject.js\");\n/* harmony import */ var _RadioButtonObject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./RadioButtonObject */ \"./esm/RadioButtonObject.js\");\n\n\n\n\n\nclass InteractiveMesh extends three__WEBPACK_IMPORTED_MODULE_3__.Mesh {\n  constructor(parameters, ctor) {\n    super(parameters.geo);\n    this.model = new ctor({\n      view: this,\n      material: parameters.material\n    });\n  }\n\n}\n\nclass ClickableMesh extends InteractiveMesh {\n  constructor(parameters) {\n    super(parameters, _ClickableObject__WEBPACK_IMPORTED_MODULE_1__.ClickableObject);\n  }\n\n}\nclass CheckBoxMesh extends InteractiveMesh {\n  constructor(parameters) {\n    super(parameters, _CheckBoxObject__WEBPACK_IMPORTED_MODULE_0__.CheckBoxObject);\n  }\n\n}\nclass RadioButtonMesh extends InteractiveMesh {\n  constructor(parameters) {\n    super(parameters, _RadioButtonObject__WEBPACK_IMPORTED_MODULE_2__.RadioButtonObject);\n  }\n\n}\n\n//# sourceURL=webpack://threejs-interactive-object/./esm/InteractiveMesh.js?");

/***/ }),

/***/ "./esm/InteractiveSprite.js":
/*!**********************************!*\
  !*** ./esm/InteractiveSprite.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ClickableSprite\": () => (/* binding */ ClickableSprite),\n/* harmony export */   \"CheckBoxSprite\": () => (/* binding */ CheckBoxSprite),\n/* harmony export */   \"RadioButtonSprite\": () => (/* binding */ RadioButtonSprite)\n/* harmony export */ });\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _CheckBoxObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CheckBoxObject */ \"./esm/CheckBoxObject.js\");\n/* harmony import */ var _ClickableObject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ClickableObject */ \"./esm/ClickableObject.js\");\n/* harmony import */ var _RadioButtonObject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./RadioButtonObject */ \"./esm/RadioButtonObject.js\");\n\n\n\n\n\nclass InteractiveSprite extends three__WEBPACK_IMPORTED_MODULE_3__.Sprite {\n  constructor(material, ctor) {\n    super();\n    this.model = new ctor({\n      view: this,\n      material: material\n    });\n  }\n\n}\n\nclass ClickableSprite extends InteractiveSprite {\n  constructor(material) {\n    super(material, _ClickableObject__WEBPACK_IMPORTED_MODULE_1__.ClickableObject);\n  }\n\n}\nclass CheckBoxSprite extends InteractiveSprite {\n  constructor(material) {\n    super(material, _CheckBoxObject__WEBPACK_IMPORTED_MODULE_0__.CheckBoxObject);\n  }\n\n}\nclass RadioButtonSprite extends InteractiveSprite {\n  constructor(material) {\n    super(material, _RadioButtonObject__WEBPACK_IMPORTED_MODULE_2__.RadioButtonObject);\n  }\n\n}\n\n//# sourceURL=webpack://threejs-interactive-object/./esm/InteractiveSprite.js?");

/***/ }),

/***/ "./esm/MouseEventManager.js":
/*!**********************************!*\
  !*** ./esm/MouseEventManager.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"MouseEventManager\": () => (/* binding */ MouseEventManager),\n/* harmony export */   \"ClickableState\": () => (/* binding */ ClickableState)\n/* harmony export */ });\n/* harmony import */ var raf_ticker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! raf-ticker */ \"./node_modules/raf-ticker/esm/index.js\");\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ThreeMouseEvent */ \"./esm/ThreeMouseEvent.js\");\n\n\n\nclass MouseEventManager {\n  static init(scene, camera, renderer, option) {\n    var _a;\n\n    MouseEventManager.isInit = true;\n    MouseEventManager.camera = camera;\n    MouseEventManager.renderer = renderer;\n    MouseEventManager.scene = scene;\n    MouseEventManager.throttlingTime_ms = (_a = option === null || option === void 0 ? void 0 : option.throttlingTime_ms) !== null && _a !== void 0 ? _a : 33;\n    const canvas = renderer.domElement;\n    MouseEventManager.canvas = canvas;\n    canvas.addEventListener(\"mousemove\", MouseEventManager.onDocumentMouseMove, false);\n    canvas.addEventListener(\"mousedown\", MouseEventManager.onDocumentMouseUpDown, false);\n    canvas.addEventListener(\"mouseup\", MouseEventManager.onDocumentMouseUpDown, false);\n    raf_ticker__WEBPACK_IMPORTED_MODULE_0__.RAFTicker.on(raf_ticker__WEBPACK_IMPORTED_MODULE_0__.RAFTickerEventType.tick, this.onTick);\n  }\n  /**\n   * 現在マウスオーバーしている対象をなしにする。\n   * もし、すでにマウスオーバー対象が存在するなら、マウスアウトハンドラーを呼び出した後にクリアする。\n   */\n\n\n  static clearOver() {\n    var _a;\n\n    (_a = MouseEventManager.currentOver) === null || _a === void 0 ? void 0 : _a.forEach(over => {\n      this.onButtonHandler(over, _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.OUT);\n    });\n    MouseEventManager.currentOver = null;\n  }\n  /**\n   * マウスの座標にかかっているオブジェクト一覧から、操作対象を検索し\n   * 指定されたタイプのハンドラー関数を実行させる。\n   * @param {Intersection[]} intersects\n   * @param {ThreeMouseEventType} type\n   */\n\n\n  static checkIntersects(intersects, type) {\n    const n = intersects.length;\n    if (n === 0) return;\n\n    for (let i = 0; i < n; i++) {\n      const checked = MouseEventManager.checkTarget(intersects[i].object, type);\n\n      if (checked) {\n        break;\n      }\n    }\n  }\n  /**\n   * ボタンの各種イベントハンドラーメソッドを、typeにしたがって実行する。\n   * @param {IClickableObject3D} btn\n   * @param {ThreeMouseEventType} type\n   */\n\n\n  static onButtonHandler(btn, type) {\n    switch (type) {\n      case _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.DOWN:\n        btn.model.onMouseDownHandler(new _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEvent(type, btn));\n        return;\n\n      case _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.UP:\n        btn.model.onMouseUpHandler(new _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEvent(type, btn));\n        return;\n\n      case _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.OVER:\n        if (!btn.model.isOver) {\n          btn.model.onMouseOverHandler(new _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEvent(type, btn));\n        }\n\n        return;\n\n      case _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.OUT:\n        if (btn.model.isOver) {\n          btn.model.onMouseOutHandler(new _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEvent(type, btn));\n        }\n\n        return;\n    }\n  }\n  /**\n   * IClickableObject3Dインターフェースを実装しているか否かを判定する。\n   * ユーザー定義Type Guard\n   * @param arg\n   * @private\n   */\n\n\n  static implementsIClickableObject3D(arg) {\n    return arg !== null && typeof arg === \"object\" && arg.model !== null && typeof arg.model === \"object\" && arg.model.mouseEnabled !== null && typeof arg.model.mouseEnabled === \"boolean\";\n  }\n\n  static checkTarget(target, type, hasTarget = false) {\n    //クリッカブルインターフェースを継承しているなら判定OK\n    if (this.implementsIClickableObject3D(target) && target.model.mouseEnabled === true) {\n      if (type === _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.OVER) {\n        MouseEventManager.currentOver.push(target);\n      }\n\n      this.onButtonHandler(target, type);\n      return this.checkTarget(target.parent, type, true);\n    } //継承していないならその親を探索継続。\n    //ターゲットから上昇して探す。\n\n\n    if (target.parent != null && target.parent.type !== \"Scene\") {\n      return MouseEventManager.checkTarget(target.parent, type, hasTarget);\n    } //親がシーンの場合は探索終了。\n\n\n    return hasTarget;\n  }\n\n  static updateMouse(event, mouse) {\n    mouse.x = event.offsetX / MouseEventManager.canvas.clientWidth * 2 - 1;\n    mouse.y = -(event.offsetY / MouseEventManager.canvas.clientHeight) * 2 + 1;\n    return mouse;\n  }\n\n  static getIntersects(event) {\n    MouseEventManager.mouse = MouseEventManager.updateMouse(event, MouseEventManager.mouse);\n    MouseEventManager.raycaster.setFromCamera(MouseEventManager.mouse, MouseEventManager.camera);\n    const intersects = MouseEventManager.raycaster.intersectObjects(MouseEventManager.scene.children, true);\n    return intersects;\n  }\n\n}\nMouseEventManager.raycaster = new three__WEBPACK_IMPORTED_MODULE_2__.Raycaster();\nMouseEventManager.mouse = new three__WEBPACK_IMPORTED_MODULE_2__.Vector2();\nMouseEventManager.isInit = false;\nMouseEventManager.hasThrottled = false;\nMouseEventManager.throttlingDelta = 0;\n\nMouseEventManager.onTick = e => {\n  MouseEventManager.throttlingDelta += e.delta;\n\n  if (MouseEventManager.throttlingDelta < MouseEventManager.throttlingTime_ms) {\n    return;\n  }\n\n  MouseEventManager.hasThrottled = false;\n  MouseEventManager.throttlingDelta %= MouseEventManager.throttlingTime_ms;\n};\n\nMouseEventManager.onDocumentMouseMove = event => {\n  if (MouseEventManager.hasThrottled) return;\n  MouseEventManager.hasThrottled = true;\n\n  if (event.type === \"mousemove\") {\n    event.preventDefault();\n  }\n\n  const intersects = MouseEventManager.getIntersects(event);\n  const n = intersects.length;\n\n  if (n === 0) {\n    MouseEventManager.clearOver();\n    return;\n  }\n\n  const beforeOver = MouseEventManager.currentOver;\n  MouseEventManager.currentOver = [];\n\n  for (let intersect of intersects) {\n    const checked = MouseEventManager.checkTarget(intersect.object, _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.OVER);\n    if (checked) break;\n  }\n\n  beforeOver === null || beforeOver === void 0 ? void 0 : beforeOver.forEach(btn => {\n    if (!MouseEventManager.currentOver.includes(btn)) {\n      MouseEventManager.onButtonHandler(btn, _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.OUT);\n    }\n  });\n};\n/**\n * カンバス上でマウスダウンかマウスアップが行われた際のイベントハンドラー\n * マウス座標から対象となるObject3Dを探し出して操作を行う。\n * @param {MouseEvent} event\n */\n\n\nMouseEventManager.onDocumentMouseUpDown = event => {\n  let eventType = _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.DOWN;\n\n  switch (event.type) {\n    case \"mousedown\":\n      eventType = _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.DOWN;\n      break;\n\n    case \"mouseup\":\n      eventType = _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_1__.ThreeMouseEventType.UP;\n      break;\n  }\n\n  event.preventDefault();\n  let intersects = MouseEventManager.getIntersects(event);\n  MouseEventManager.checkIntersects(intersects, eventType);\n};\n/**\n * IClickable3DObjectの現在状態を表す定数セット。\n * これとselectフラグを掛け合わせることで状態を判定する。\n */\n\n\nvar ClickableState;\n\n(function (ClickableState) {\n  //ボタンの状態を表す定数\n  ClickableState[\"NORMAL\"] = \"normal\";\n  ClickableState[\"OVER\"] = \"normal_over\";\n  ClickableState[\"DOWN\"] = \"normal_down\";\n  ClickableState[\"DISABLE\"] = \"disable\";\n})(ClickableState || (ClickableState = {}));\n\n//# sourceURL=webpack://threejs-interactive-object/./esm/MouseEventManager.js?");

/***/ }),

/***/ "./esm/RadioButtonManager.js":
/*!***********************************!*\
  !*** ./esm/RadioButtonManager.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"RadioButtonManager\": () => (/* binding */ RadioButtonManager)\n/* harmony export */ });\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ThreeMouseEvent */ \"./esm/ThreeMouseEvent.js\");\n\n\nclass RadioButtonManager extends three__WEBPACK_IMPORTED_MODULE_1__.EventDispatcher {\n  /**\n   * コンストラクタ\n   */\n  constructor() {\n    super();\n    /**\n     * このマネージャーの管理下のボタン\n     * @type {any[]}\n     * @private\n     */\n\n    this._models = [];\n    /**\n     * 管理下のボタンが選択された場合の処理\n     * @param {Event} e\n     */\n\n    this.onSelectedButton = e => {\n      const evt = e;\n\n      if (evt.isSelected) {\n        this.select(evt.model);\n      }\n    };\n  }\n  /**\n   * このマネージャーの管理下にボタンを追加する\n   * @param {IRadioButtonObject3D[]} buttons\n   */\n\n\n  addButton(...buttons) {\n    buttons.forEach(btn => {\n      this.addModel(btn.model);\n    });\n  }\n\n  addModel(model) {\n    this._models.push(model);\n\n    model.view.addEventListener(_ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_0__.ThreeMouseEventType.SELECT, this.onSelectedButton);\n  }\n  /**\n   * ボタンを管理下から外す。\n   * ボタン自体の削除は行わない。\n   * @param {IRadioButtonObject3D} button\n   */\n\n\n  removeButton(button) {\n    this.removeModel(button.model);\n  }\n\n  removeModel(model) {\n    const index = this._models.indexOf(model);\n\n    if (index > -1) {\n      this._models.splice(index, 1);\n\n      model.view.removeEventListener(_ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_0__.ThreeMouseEventType.SELECT, this.onSelectedButton);\n    }\n\n    return model;\n  }\n  /**\n   * 特定のボタンを選択する\n   * @param {RadioButtonObject} model\n   */\n\n\n  select(model) {\n    const index = this._models.indexOf(model);\n\n    if (index === -1) {\n      console.warn(\"管理下でないボタンが選択処理されました。\");\n      return;\n    } //選択済みのボタンを再度渡されても反応しない。\n\n\n    if (model === this._selected && model.isFrozen) {\n      return;\n    }\n\n    this._selected = model;\n\n    for (let mdl of this._models) {\n      mdl.selection = mdl.isFrozen = mdl === model;\n    }\n\n    const evt = new _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_0__.ThreeMouseEvent(_ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_0__.ThreeMouseEventType.SELECT, model);\n    this.dispatchEvent(evt);\n  }\n\n  get selected() {\n    return this._selected;\n  }\n\n  get models() {\n    return this._models;\n  }\n\n}\n\n//# sourceURL=webpack://threejs-interactive-object/./esm/RadioButtonManager.js?");

/***/ }),

/***/ "./esm/RadioButtonObject.js":
/*!**********************************!*\
  !*** ./esm/RadioButtonObject.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"RadioButtonObject\": () => (/* binding */ RadioButtonObject)\n/* harmony export */ });\n/* harmony import */ var _CheckBoxObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CheckBoxObject */ \"./esm/CheckBoxObject.js\");\n\nclass RadioButtonObject extends _CheckBoxObject__WEBPACK_IMPORTED_MODULE_0__.CheckBoxObject {\n  constructor() {\n    super(...arguments);\n    this._isFrozen = false;\n  }\n  /**\n   * 現在のボタンの有効、無効状態を取得する\n   * ラジオボタンは選択中は自身の状態を変更できない。\n   * @return    ボタンが有効か否か\n   */\n\n\n  checkActivity() {\n    return this._enable && !this._isFrozen;\n  }\n\n  get isFrozen() {\n    return this._isFrozen;\n  }\n\n  set isFrozen(bool) {\n    this._isFrozen = bool;\n  }\n\n}\n\n//# sourceURL=webpack://threejs-interactive-object/./esm/RadioButtonObject.js?");

/***/ }),

/***/ "./esm/StateMaterial.js":
/*!******************************!*\
  !*** ./esm/StateMaterial.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"StateMaterial\": () => (/* binding */ StateMaterial),\n/* harmony export */   \"StateMaterialSet\": () => (/* binding */ StateMaterialSet)\n/* harmony export */ });\n/* harmony import */ var _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MouseEventManager */ \"./esm/MouseEventManager.js\");\n\nclass StateMaterial {\n  constructor(material) {\n    this.alpha = 1.0;\n    this.material = material;\n  }\n\n  updateAlpha() {\n    if (this._material instanceof Array) {\n      this.alphaArray = this.getAlphaArray();\n    } else {\n      this.alpha = this._material.opacity;\n    }\n  }\n\n  getAlphaArray() {\n    const matArray = this._material;\n    const n = matArray.length;\n    const array = [];\n\n    for (let i = 0; i < n; i++) {\n      array.push(matArray[i].opacity);\n    }\n\n    return array;\n  }\n\n  set material(value) {\n    this._material = value;\n    this.updateAlpha();\n  }\n\n  get material() {\n    return this._material;\n  }\n\n  setOpacity(opacity) {\n    if (this._material instanceof Array) {\n      const n = this._material.length;\n\n      for (let i = 0; i < n; i++) {\n        const material = this._material[i];\n        material.opacity = opacity * this.alphaArray[i];\n      }\n    } else {\n      this._material.opacity = opacity * this.alpha;\n    }\n  }\n\n}\nclass StateMaterialSet {\n  constructor(param) {\n    this.normal = new StateMaterial(param.normal);\n    this.over = StateMaterialSet.initMaterial(param.over, this.normal);\n    this.down = StateMaterialSet.initMaterial(param.down, this.normal);\n    this.disable = StateMaterialSet.initMaterial(param.disable, this.normal);\n    this.normalSelect = StateMaterialSet.initMaterial(param.normalSelect, this.normal);\n    this.overSelect = StateMaterialSet.initMaterial(param.overSelect, this.normal);\n    this.downSelect = StateMaterialSet.initMaterial(param.downSelect, this.normal);\n    this.init();\n  }\n\n  static initMaterial(value, defaultMaterial) {\n    if (value == null) return defaultMaterial;\n    return new StateMaterial(value);\n  }\n\n  init() {\n    if (this.normal == null) {\n      throw new Error(\"通常状態のマテリアルが指定されていません。\");\n    }\n\n    this.materials = [this.normal, this.normalSelect, this.over, this.overSelect, this.down, this.downSelect, this.disable];\n  }\n\n  getMaterial(state, mouseEnabled, isSelected = false) {\n    //無効状態はstateよりも優先\n    if (!mouseEnabled) {\n      return this.disable;\n    }\n\n    switch (state) {\n      case _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.ClickableState.NORMAL:\n        return isSelected ? this.normalSelect : this.normal;\n\n      case _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.ClickableState.DOWN:\n        return isSelected ? this.downSelect : this.down;\n\n      case _MouseEventManager__WEBPACK_IMPORTED_MODULE_0__.ClickableState.OVER:\n        return isSelected ? this.overSelect : this.over;\n    }\n\n    return this.normal;\n  }\n\n  setOpacity(opacity) {\n    this.materials.forEach(mat => {\n      mat.setOpacity(opacity);\n    });\n  }\n\n}\n\n//# sourceURL=webpack://threejs-interactive-object/./esm/StateMaterial.js?");

/***/ }),

/***/ "./esm/ThreeMouseEvent.js":
/*!********************************!*\
  !*** ./esm/ThreeMouseEvent.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ThreeMouseEvent\": () => (/* binding */ ThreeMouseEvent),\n/* harmony export */   \"ThreeMouseEventType\": () => (/* binding */ ThreeMouseEventType)\n/* harmony export */ });\nclass ThreeMouseEvent {\n  constructor(type, modelOrView) {\n    const model = ThreeMouseEvent.getModel(modelOrView);\n    this.type = type;\n    this.model = model;\n\n    if (type === ThreeMouseEventType.SELECT) {\n      this.isSelected = ThreeMouseEvent.getSelection(model);\n    }\n  }\n\n  static getModel(modelOrView) {\n    if (\"model\" in modelOrView) {\n      return modelOrView.model;\n    }\n\n    return modelOrView;\n  }\n  /**\n   * SELECTイベントの場合は、対象ボタンの選択状態を取得\n   * @param model\n   */\n\n\n  static getSelection(model) {\n    if (\"selection\" in model) {\n      return model[\"selection\"];\n    } else {\n      throw new Error(\"選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。\");\n    }\n  }\n\n  clone() {\n    return new ThreeMouseEvent(this.type, this.model);\n  }\n\n}\nvar ThreeMouseEventType;\n\n(function (ThreeMouseEventType) {\n  ThreeMouseEventType[\"CLICK\"] = \"THREE_MOUSE_EVENT_CLICK\";\n  ThreeMouseEventType[\"OVER\"] = \"THREE_MOUSE_EVENT_OVER\";\n  ThreeMouseEventType[\"OUT\"] = \"THREE_MOUSE_EVENT_OUT\";\n  ThreeMouseEventType[\"DOWN\"] = \"THREE_MOUSE_EVENT_DOWN\";\n  ThreeMouseEventType[\"UP\"] = \"THREE_MOUSE_EVENT_UP\";\n  ThreeMouseEventType[\"SELECT\"] = \"THREE_MOUSE_EVENT_SELECT\";\n})(ThreeMouseEventType || (ThreeMouseEventType = {}));\n\n//# sourceURL=webpack://threejs-interactive-object/./esm/ThreeMouseEvent.js?");

/***/ }),

/***/ "./esm/index.js":
/*!**********************!*\
  !*** ./esm/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"CheckBoxSprite\": () => (/* reexport safe */ _InteractiveSprite__WEBPACK_IMPORTED_MODULE_0__.CheckBoxSprite),\n/* harmony export */   \"ClickableSprite\": () => (/* reexport safe */ _InteractiveSprite__WEBPACK_IMPORTED_MODULE_0__.ClickableSprite),\n/* harmony export */   \"RadioButtonSprite\": () => (/* reexport safe */ _InteractiveSprite__WEBPACK_IMPORTED_MODULE_0__.RadioButtonSprite),\n/* harmony export */   \"CheckBoxMesh\": () => (/* reexport safe */ _InteractiveMesh__WEBPACK_IMPORTED_MODULE_1__.CheckBoxMesh),\n/* harmony export */   \"ClickableMesh\": () => (/* reexport safe */ _InteractiveMesh__WEBPACK_IMPORTED_MODULE_1__.ClickableMesh),\n/* harmony export */   \"RadioButtonMesh\": () => (/* reexport safe */ _InteractiveMesh__WEBPACK_IMPORTED_MODULE_1__.RadioButtonMesh),\n/* harmony export */   \"ClickableObject\": () => (/* reexport safe */ _ClickableObject__WEBPACK_IMPORTED_MODULE_2__.ClickableObject),\n/* harmony export */   \"ClickableGroup\": () => (/* reexport safe */ _ClickableGroup__WEBPACK_IMPORTED_MODULE_3__.ClickableGroup),\n/* harmony export */   \"CheckBoxObject\": () => (/* reexport safe */ _CheckBoxObject__WEBPACK_IMPORTED_MODULE_4__.CheckBoxObject),\n/* harmony export */   \"RadioButtonObject\": () => (/* reexport safe */ _RadioButtonObject__WEBPACK_IMPORTED_MODULE_5__.RadioButtonObject),\n/* harmony export */   \"RadioButtonManager\": () => (/* reexport safe */ _RadioButtonManager__WEBPACK_IMPORTED_MODULE_6__.RadioButtonManager),\n/* harmony export */   \"StateMaterial\": () => (/* reexport safe */ _StateMaterial__WEBPACK_IMPORTED_MODULE_7__.StateMaterial),\n/* harmony export */   \"StateMaterialSet\": () => (/* reexport safe */ _StateMaterial__WEBPACK_IMPORTED_MODULE_7__.StateMaterialSet),\n/* harmony export */   \"ClickableState\": () => (/* reexport safe */ _MouseEventManager__WEBPACK_IMPORTED_MODULE_8__.ClickableState),\n/* harmony export */   \"MouseEventManager\": () => (/* reexport safe */ _MouseEventManager__WEBPACK_IMPORTED_MODULE_8__.MouseEventManager),\n/* harmony export */   \"ThreeMouseEvent\": () => (/* reexport safe */ _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_9__.ThreeMouseEvent),\n/* harmony export */   \"ThreeMouseEventType\": () => (/* reexport safe */ _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_9__.ThreeMouseEventType)\n/* harmony export */ });\n/* harmony import */ var _InteractiveSprite__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./InteractiveSprite */ \"./esm/InteractiveSprite.js\");\n/* harmony import */ var _InteractiveMesh__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./InteractiveMesh */ \"./esm/InteractiveMesh.js\");\n/* harmony import */ var _ClickableObject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ClickableObject */ \"./esm/ClickableObject.js\");\n/* harmony import */ var _ClickableGroup__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ClickableGroup */ \"./esm/ClickableGroup.js\");\n/* harmony import */ var _CheckBoxObject__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CheckBoxObject */ \"./esm/CheckBoxObject.js\");\n/* harmony import */ var _RadioButtonObject__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./RadioButtonObject */ \"./esm/RadioButtonObject.js\");\n/* harmony import */ var _RadioButtonManager__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./RadioButtonManager */ \"./esm/RadioButtonManager.js\");\n/* harmony import */ var _StateMaterial__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./StateMaterial */ \"./esm/StateMaterial.js\");\n/* harmony import */ var _MouseEventManager__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./MouseEventManager */ \"./esm/MouseEventManager.js\");\n/* harmony import */ var _ThreeMouseEvent__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ThreeMouseEvent */ \"./esm/ThreeMouseEvent.js\");\n\n\n\n\n\n\n\n\n\n\n\n//# sourceURL=webpack://threejs-interactive-object/./esm/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	// It's empty as some runtime module handles the default behavior
/******/ 	__webpack_require__.x = x => {};
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// Promise = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"demo": 0
/******/ 		};
/******/ 		
/******/ 		var deferredModules = [
/******/ 			["./demoSrc/demo.js","vendor"]
/******/ 		];
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		var checkDeferredModules = x => {};
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime, executeModules] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0, resolves = [];
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					resolves.push(installedChunks[chunkId][0]);
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			for(moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			while(resolves.length) {
/******/ 				resolves.shift()();
/******/ 			}
/******/ 		
/******/ 			// add entry modules from loaded chunk to deferred list
/******/ 			if(executeModules) deferredModules.push.apply(deferredModules, executeModules);
/******/ 		
/******/ 			// run deferred modules when all chunks ready
/******/ 			return checkDeferredModules();
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkthreejs_interactive_object"] = self["webpackChunkthreejs_interactive_object"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 		
/******/ 		function checkDeferredModulesImpl() {
/******/ 			var result;
/******/ 			for(var i = 0; i < deferredModules.length; i++) {
/******/ 				var deferredModule = deferredModules[i];
/******/ 				var fulfilled = true;
/******/ 				for(var j = 1; j < deferredModule.length; j++) {
/******/ 					var depId = deferredModule[j];
/******/ 					if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferredModules.splice(i--, 1);
/******/ 					result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 				}
/******/ 			}
/******/ 			if(deferredModules.length === 0) {
/******/ 				__webpack_require__.x();
/******/ 				__webpack_require__.x = x => {};
/******/ 			}
/******/ 			return result;
/******/ 		}
/******/ 		var startup = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			// reset startup function so it can be called again when more startup code is added
/******/ 			__webpack_require__.x = startup || (x => {});
/******/ 			return (checkDeferredModules = checkDeferredModulesImpl)();
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;