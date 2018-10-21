import { IClickable3DObject, ClickableState } from "./MouseEventManager";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
import { Sprite, SpriteMaterial } from "three";
import { StateMaterialSet } from "./StateMaterial";

/**
 * Created by makinomasato on 2016/05/02.
 * クリック可能なSpriteです。
 * ビルボードボタンとして使用することを想定しています。
 */

export class ClickableSprite extends Sprite implements IClickable3DObject {
  public isPress: boolean = false;
  protected isOver: boolean = false;
  protected _enableMouse: boolean = true;

  public state: ClickableState = ClickableState.NORMAL;
  public materialSet!: StateMaterialSet;
  private _alpha: number = 1.0;

  constructor(material: StateMaterialSet) {
    super();
    this.materialSet = material;
    this.updateMaterial();
  }

  public onMouseDownHandler(event: ThreeMouseEvent): void {
    if (!this.checkActivity()) return;
    this.isPress = true;
    this.updateState(ClickableState.DOWN);
    this.dispatchEvent(event);
  }

  public onMouseUpHandler(event: ThreeMouseEvent): void {
    if (!this.checkActivity()) return;

    let currentPress: boolean = this.isPress;
    this.isPress = false;
    const nextState = this.isOver ? ClickableState.OVER : ClickableState.NORMAL;
    this.updateState(nextState);
    this.dispatchEvent(event);

    if (this.isPress != currentPress && !this.isPress) {
      let e = new ThreeMouseEvent(ThreeMouseEventType.CLICK, this);
      this.dispatchEvent(e);
    }
  }

  public onMouseOverHandler(event: ThreeMouseEvent): void {
    if (!this.checkActivity()) return;
    this.isOver = true;
    this.updateState(ClickableState.OVER);
    this.dispatchEvent(event);
  }

  public onMouseOutHandler(event: ThreeMouseEvent): void {
    if (!this.checkActivity()) return;
    this.isOver = false;
    this.updateState(ClickableState.NORMAL);
    this.dispatchEvent(event);
  }

  set alpha(value: number) {
    this._alpha = value;
    this.updateMaterial();
  }

  protected updateState(state: ClickableState): void {
    this.state = state;
    this.updateMaterial();
  }

  /**
   * 現在のボタンの有効、無効状態を取得する
   * @return    ボタンが有効か否か
   */
  protected checkActivity(): Boolean {
    return this._enableMouse;
  }

  public enable(): void {
    this._enableMouse = true;
    this.state = ClickableState.NORMAL;
    this.updateMaterial();
  }

  public disable(): void {
    this._enableMouse = false;
    this.state = ClickableState.DISABLE;
    this.updateMaterial();
  }

  protected updateMaterial(): void {
    this.materialSet.setOpacity(this._alpha);
    const stateMat = this.materialSet.getMaterial(
      this.state,
      this._enableMouse
    );
    this.material = stateMat.material as SpriteMaterial;
  }

  public switchEnable(bool: boolean): void {
    if (bool) {
      this.enable();
    } else {
      this.disable();
    }
  }

  public getEnable(): boolean {
    return this._enableMouse;
  }
}