import { ClickableObject } from "./ClickableObject";
import { CheckBoxMesh } from "./InteractiveMesh";
import { CheckBoxSprite } from "./InteractiveSprite";
import { ClickableState } from "./MouseEventManager";
import { ThreeMouseEvent, ThreeMouseEventUtil } from "./ThreeMouseEvent";

export class CheckBoxObject<T = any> extends ClickableObject<T> {
  public view: CheckBoxMesh | CheckBoxSprite;
  protected _isSelect: boolean = false;

  /**
   * クリックイベント時の処理
   * "click"イベントはマウスイベント類の必ず最後に発生するので
   * ここでisSelect状態を一括管理する。
   */
  public onMouseClick(): void {
    this._isSelect = !this._isSelect;

    const e: ThreeMouseEvent = ThreeMouseEventUtil.generate("select", this);
    this.view.dispatchEvent(e);
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
      this._enable,
      this._isSelect
    );
    this.view.material = stateMat.material;
  }
}
