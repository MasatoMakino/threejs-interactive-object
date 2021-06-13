"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadioButtonMesh = exports.CheckBoxMesh = exports.ClickableMesh = void 0;
const three_1 = require("three");
const CheckBoxObject_1 = require("./CheckBoxObject");
const ClickableObject_1 = require("./ClickableObject");
const RadioButtonObject_1 = require("./RadioButtonObject");
class InteractiveMesh extends three_1.Mesh {
    constructor(parameters, ctor) {
        super(parameters.geo);
        this.model = new ctor({ view: this, material: parameters.material });
    }
}
class ClickableMesh extends InteractiveMesh {
    constructor(parameters) {
        super(parameters, ClickableObject_1.ClickableObject);
    }
}
exports.ClickableMesh = ClickableMesh;
class CheckBoxMesh extends InteractiveMesh {
    constructor(parameters) {
        super(parameters, CheckBoxObject_1.CheckBoxObject);
    }
}
exports.CheckBoxMesh = CheckBoxMesh;
class RadioButtonMesh extends InteractiveMesh {
    constructor(parameters) {
        super(parameters, RadioButtonObject_1.RadioButtonObject);
    }
}
exports.RadioButtonMesh = RadioButtonMesh;
