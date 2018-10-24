import { IRadioButtonObject3D } from "./MouseEventManager";
import { CheckBoxMesh } from "./CheckBoxMesh";
export declare class RadioButtonMesh extends CheckBoxMesh implements IRadioButtonObject3D {
    protected _isFrozen: boolean;
    /**
     * 現在のボタンの有効、無効状態を取得する
     * ラジオボタンは選択中は自身の状態を変更できない。
     * @return    ボタンが有効か否か
     */
    protected checkActivity(): Boolean;
    isFrozen: boolean;
}
//# sourceMappingURL=RadioButtonMesh.d.ts.map