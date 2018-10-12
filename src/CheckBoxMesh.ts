import { ClickableState } from "./MouseEventManager";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
import { ClickableMesh } from "./ClickableMesh";
import { MeshMaterialType } from "three";
import { MeshStateMaterial, MeshStateMaterialSet } from "MeshStateMaterial";

/**
 * Created by makinomasato on 2016/10/12.
 */

export class CheckBoxMesh extends ClickableMesh {
  protected _isSelect: boolean = false;
  public value: any;

  /**
   * クリックイベント時の処理
   * "click"イベントはマウスイベント類の必ず最後に発生するので
   * ここでisSelect状態を一括管理する。
   * @param event
   */
  protected onMouseClick(): void {
    this._isSelect = !this._isSelect;

    const e: ThreeMouseEvent = new ThreeMouseEvent(
      ThreeMouseEventType.SELECT,
      this
    );
    e.isSelected = this._isSelect;
    this.dispatchEvent(e);
    this.updateMaterial();
  }

  public getSelection(): boolean {
    return this._isSelect;
  }

  public setSelection(bool: boolean): void {
    this._isSelect = bool;
    this.updateState(ClickableState.NORMAL);
  }

  protected updateMaterial(): void {
    MeshStateMaterialSet.setOpacity(this.materialSet, this._alpha);
    const stateMat = MeshStateMaterialSet.get(
      this.materialSet,
      this.state,
      this._enableMouse,
      this._isSelect
    );
    this.material = stateMat.material as MeshMaterialType | MeshMaterialType[];
  }
}
