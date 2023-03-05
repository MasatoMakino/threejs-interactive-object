import {
  ClickableGroup,
  ClickableMesh,
  ClickableSprite,
  ClickableState,
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventUtil,
} from "./";

/**
 * クリックに反応する表示オブジェクトの型エイリアス
 * ClickableObjectはこれらの表示オブジェクトを状態にあわせて操作する。
 */
export type ClickableView = ClickableMesh | ClickableSprite | ClickableGroup;

export interface ClickableObjectParameters {
  view: ClickableView;
  material?: StateMaterialSet;
}

/**
 * クリックに反応するObject
 * これ自体は表示オブジェクトではない。
 */
export class ClickableObject {
  get materialSet(): StateMaterialSet {
    return this._materialSet;
  }

  set materialSet(value: StateMaterialSet) {
    const isSame = value === this._materialSet;
    this._materialSet = value;
    if (!isSame) {
      this.updateMaterial();
    }
  }

  get isOver(): boolean {
    return this._isOver;
  }

  get isPress(): boolean {
    return this._isPress;
  }

  public view: ClickableView;
  protected _isPress: boolean = false;
  protected _isOver: boolean = false;
  protected _enable: boolean = true;
  public mouseEnabled: boolean = true;
  public frozen: boolean = false;

  public state: ClickableState = ClickableState.NORMAL;
  protected _materialSet!: StateMaterialSet;
  protected _alpha: number = 1.0;

  /**
   * コンストラクタ
   */
  constructor(parameters: ClickableObjectParameters) {
    this.view = parameters.view;

    this._materialSet ??= parameters.material;
    this.updateMaterial();
  }

  public onMouseDownHandler(event: ThreeMouseEvent): void {
    if (!this.checkActivity()) return;
    this._isPress = true;
    this.updateState(ClickableState.DOWN);
    this.view.dispatchEvent(event);
  }

  public onMouseUpHandler(event: ThreeMouseEvent): void {
    if (!this.checkActivity()) return;

    const currentPress: boolean = this._isPress;
    this._isPress = false;

    const nextState = this._isOver
      ? ClickableState.OVER
      : ClickableState.NORMAL;
    this.updateState(nextState);
    this.view.dispatchEvent(event);

    if (this._isPress != currentPress) {
      this.onMouseClick();

      const e = ThreeMouseEventUtil.generate("click", this);
      this.view.dispatchEvent(e);
    }
  }

  public onMouseClick(): void {}

  public onMouseOverHandler(event: ThreeMouseEvent): void {
    this.onMouseOverOutHandler(event);
  }

  public onMouseOutHandler(event: ThreeMouseEvent): void {
    this.onMouseOverOutHandler(event);
  }

  private onMouseOverOutHandler(event: ThreeMouseEvent): void {
    if (!this.checkActivity()) return;

    this._isOver = event.type === "over";
    this.updateState(
      this._isOver ? ClickableState.OVER : ClickableState.NORMAL
    );
    this.view.dispatchEvent(event);
  }

  public set alpha(number: number) {
    this._alpha = number;
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
    return this._enable && !this.frozen;
  }

  public enable(): void {
    this.switchEnable(true);
  }

  public disable(): void {
    this.switchEnable(false);
  }

  protected updateMaterial(): void {
    this._materialSet?.setOpacity(this._alpha);
    const stateMat = this._materialSet?.getMaterial(this.state, this._enable);
    if (!stateMat) return;

    switch (this.view.type) {
      case "Mesh":
      case "Sprite":
        this.view.material = stateMat.material;
        break;
      case "Group":
      default:
        break;
    }
  }

  public switchEnable(bool: boolean): void {
    this._enable = bool;
    this.state = bool ? ClickableState.NORMAL : ClickableState.DISABLE;
    this.updateMaterial();
  }
}
