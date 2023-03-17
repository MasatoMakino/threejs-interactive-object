import {
  CheckBoxMesh,
  CheckBoxSprite,
  ClickableObject,
  ThreeMouseEventUtil,
} from "./";

export class CheckBoxObject<Value> extends ClickableObject<Value> {
  declare readonly view: CheckBoxMesh<Value> | CheckBoxSprite<Value>;
  protected _isSelect: boolean = false;

  /**
   * クリックイベント時の処理
   * "click"イベントはマウスイベント類の必ず最後に発生するので
   * ここでisSelect状態を一括管理する。
   */
  public onMouseClick(): void {
    this._isSelect = !this._isSelect;

    const e = ThreeMouseEventUtil.generate("select", this);
    this.view.dispatchEvent(e);
    this.updateMaterial();
  }

  public get selection(): boolean {
    return this._isSelect;
  }

  public set selection(bool: boolean) {
    this._isSelect = bool;
    this.updateState("normal");
  }

  protected updateMaterial(): void {
    this.materialSet?.setOpacity(this._alpha);
    const stateMat = this.materialSet?.getMaterial(
      this.state,
      this._enable,
      this._isSelect
    );
    if (stateMat?.material != null) {
      this.view.material = stateMat.material;
    }
  }
}
