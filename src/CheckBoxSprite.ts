import { ISelectableObject3D, ClickableState } from "./MouseEventManager";
import { ClickableSprite } from "./ClickableSptire";
import { SpriteMaterial } from "three";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";

export class CheckBoxSprite extends ClickableSprite
  implements ISelectableObject3D {
  protected _isSelect: boolean = false;
  public value: any;

  /**
   * クリックイベント時の処理
   * "click"イベントはマウスイベント類の必ず最後に発生するので
   * ここでisSelect状態を一括管理する。
   * @param event
   */
  public onMouseClick(): void {
    this._isSelect = !this._isSelect;

    const e: ThreeMouseEvent = new ThreeMouseEvent(
      ThreeMouseEventType.SELECT,
      this
    );
    e.isSelected = this._isSelect;
    this.dispatchEvent(e);
    this.updateMaterial();
  }

  public get selection(): boolean {
    return this._isSelect;
  }

  public set selection(bool: boolean) {
    this._isSelect = bool;
    this.updateState(ClickableState.NORMAL);
  }

  protected updateMaterial(): void {
    this.materialSet.setOpacity(this._alpha);
    const stateMat = this.materialSet.getMaterial(
      this.state,
      this._enableMouse,
      this._isSelect
    );
    console.log(stateMat);
    this.material = stateMat.material as SpriteMaterial;
  }
}
