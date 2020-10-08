import { ClickableObject } from "./ClickableObject";
import { ClickableState } from "./MouseEventManager";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
export class CheckBoxObject extends ClickableObject {
  constructor() {
    super(...arguments);
    this._isSelect = false;
  }
  /**
   * クリックイベント時の処理
   * "click"イベントはマウスイベント類の必ず最後に発生するので
   * ここでisSelect状態を一括管理する。
   */
  onMouseClick() {
    this._isSelect = !this._isSelect;
    const e = new ThreeMouseEvent(ThreeMouseEventType.SELECT, this);
    this.view.dispatchEvent(e);
    this.updateMaterial();
  }
  get selection() {
    return this._isSelect;
  }
  set selection(bool) {
    this._isSelect = bool;
    this.updateState(ClickableState.NORMAL);
  }
  updateMaterial() {
    this.materialSet.setOpacity(this._alpha);
    const stateMat = this.materialSet.getMaterial(
      this.state,
      this._enable,
      this._isSelect
    );
    this.view.material = stateMat.material;
  }
}
