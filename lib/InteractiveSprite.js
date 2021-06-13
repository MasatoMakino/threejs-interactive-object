"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadioButtonSprite = exports.CheckBoxSprite = exports.ClickableSprite = void 0;
const three_1 = require("three");
const CheckBoxObject_1 = require("./CheckBoxObject");
const ClickableObject_1 = require("./ClickableObject");
const RadioButtonObject_1 = require("./RadioButtonObject");
class InteractiveSprite extends three_1.Sprite {
    constructor(material, ctor) {
        super();
        this.model = new ctor({ view: this, material: material });
    }
}
class ClickableSprite extends InteractiveSprite {
    constructor(material) {
        super(material, ClickableObject_1.ClickableObject);
    }
}
exports.ClickableSprite = ClickableSprite;
class CheckBoxSprite extends InteractiveSprite {
    constructor(material) {
        super(material, CheckBoxObject_1.CheckBoxObject);
    }
}
exports.CheckBoxSprite = CheckBoxSprite;
class RadioButtonSprite extends InteractiveSprite {
    constructor(material) {
        super(material, RadioButtonObject_1.RadioButtonObject);
    }
}
exports.RadioButtonSprite = RadioButtonSprite;
