"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickableGroup = void 0;
const three_1 = require("three");
const ClickableObject_1 = require("./ClickableObject");
class ClickableGroup extends three_1.Group {
    constructor() {
        super();
        this.model = new ClickableObject_1.ClickableObject({
            view: this,
        });
    }
}
exports.ClickableGroup = ClickableGroup;
