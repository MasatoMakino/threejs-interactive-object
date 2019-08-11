import { ClickableState } from "./MouseEventManager";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
import { ClickableObject } from "./ClickableObject";

export class CheckBoxObject extends ClickableObject {
  protected _isSelect: boolean = false;
  public value: any;

  /**
   * クリックイベント時の処理
   * "click"イベントはマウスイベント類の必ず最後に発生するので
   * ここでisSelect状態を一括管理する。
   */
  public onMouseClick(): void {
    this._isSelect = !this._isSelect;

    const e: ThreeMouseEvent = new ThreeMouseEvent(
      ThreeMouseEventType.SELECT,
      this
    );
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
      this._enableMouse,
      this._isSelect
    );
    this.view.material = stateMat.material;
  }
}
