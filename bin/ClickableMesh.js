import { Mesh } from "three";
import { ClickableObject } from "./ClickableObject";
/**
 * クリックに反応するMesh。
 */
export class ClickableMesh extends Mesh {
    /**
     * コンストラクタ
     */
    constructor(parameters) {
        super(parameters.geo);
        this.model = new ClickableObject({
            view: this,
            material: parameters.material
        });
    }
}
