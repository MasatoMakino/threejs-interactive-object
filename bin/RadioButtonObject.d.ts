import { CheckBoxObject } from "./CheckBoxObject";
import { RadioButtonMesh } from "./RadioButtonMesh";
import { RadioButtonSprite } from "./RadioButtonSprite";
export declare class RadioButtonObject extends CheckBoxObject {
    view: RadioButtonMesh | RadioButtonSprite;
    protected _isFrozen: boolean;
    /**
     * 現在のボタンの有効、無効状態を取得する
     * ラジオボタンは選択中は自身の状態を変更できない。
     * @return    ボタンが有効か否か
     */
    protected checkActivity(): Boolean;
    isFrozen: boolean;
}
//# sourceMappingURL=RadioButtonObject.d.ts.map