import { EventDispatcher } from "three";
import { RadioButtonObject } from "./RadioButtonObject";
import { IRadioButtonObject3D } from "./MouseEventManager";
export declare class RadioButtonManager extends EventDispatcher {
    /**
     * このマネージャーの管理下のボタン
     * @type {any[]}
     * @private
     */
    protected _models: RadioButtonObject[];
    /**
     * 現状選択されているボタン。
     */
    protected _selected: RadioButtonObject;
    /**
     * コンストラクタ
     */
    constructor();
    /**
     * このマネージャーの管理下にボタンを追加する
     * @param {IRadioButtonObject3D[]} buttons
     */
    addButton(...buttons: IRadioButtonObject3D[]): void;
    addModel(model: RadioButtonObject): void;
    /**
     * 管理下のボタンが選択された場合の処理
     * @param {Event} e
     */
    private onSelectedButton;
    /**
     * ボタンを管理下から外す。
     * ボタン自体の削除は行わない。
     * @param {IRadioButtonObject3D} button
     */
    removeButton(button: IRadioButtonObject3D): void;
    removeModel(model: RadioButtonObject): RadioButtonObject;
    /**
     * 特定のボタンを選択する
     * @param {RadioButtonObject} model
     */
    select(model: RadioButtonObject): void;
    get selected(): RadioButtonObject;
    get models(): RadioButtonObject[];
}
//# sourceMappingURL=RadioButtonManager.d.ts.map