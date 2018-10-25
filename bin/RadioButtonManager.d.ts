import { EventDispatcher } from "three";
import { IRadioButtonObject3D } from "./MouseEventManager";
export declare class RadioButtonManager extends EventDispatcher {
    /**
     * このマネージャーの管理下のボタン
     * @type {any[]}
     * @private
     */
    protected _buttons: IRadioButtonObject3D[];
    /**
     * 現状選択されているボタン。
     */
    protected _selected: IRadioButtonObject3D;
    /**
     * コンストラクタ
     */
    constructor();
    /**
     * このマネージャーの管理下にボタンを追加する
     * @param {IRadioButtonObject3D} button
     */
    addButton(button: IRadioButtonObject3D): void;
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
    removeButton(button: IRadioButtonObject3D): IRadioButtonObject3D;
    /**
     * 特定のボタンを選択する
     * @param {IRadioButtonObject3D} button
     */
    select(button: IRadioButtonObject3D): void;
    readonly selected: IRadioButtonObject3D;
    readonly buttons: IRadioButtonObject3D[];
}
//# sourceMappingURL=RadioButtonManager.d.ts.map