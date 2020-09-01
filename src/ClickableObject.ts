import { ClickableMesh } from "./ClickableMesh";
import { ClickableSprite } from "./ClickableSptire";
import { ClickableState, MouseEventManager } from "./MouseEventManager";
import { StateMaterialSet } from "./StateMaterial";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";

/**
 * クリックに反応するMesh。
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

  public view: ClickableMesh | ClickableSprite;
  public isPress: boolean = false;
  protected isOver: boolean = false;
  protected _enable: boolean = true;
  public mouseEnabled: boolean = true;
  public frozen: boolean = false;

  public state: ClickableState = ClickableState.NORMAL;
  protected _materialSet!: StateMaterialSet;
  protected _alpha: number = 1.0;

  /**
   * コンストラクタ
   */
  constructor(parameters: {
    view: ClickableMesh | ClickableSprite;
    material: StateMaterialSet;
  }) {
    this.view = parameters.view;

    if (!MouseEventManager.isInit) {
      console.warn(
        "MouseEventManager の初期化前にインタラクティブメッシュを生成しています。MouseEventManager.initをインタラクティブオブジェクトの生成前に実行してください。"
      );
    }

    this._materialSet = parameters.material;
    this.updateMaterial();
  }

  public onMouseDownHandler(event: ThreeMouseEvent): void {
    if (!this.checkActivity()) return;
    this.isPress = true;
    this.updateState(ClickableState.DOWN);
    this.view.dispatchEvent(event);
  }

  public onMouseUpHandler(event: ThreeMouseEvent): void {
    if (!this.checkActivity()) return;

    const currentPress: boolean = this.isPress;
    this.isPress = false;

    const nextState = this.isOver ? ClickableState.OVER : ClickableState.NORMAL;
    this.updateState(nextState);
    this.view.dispatchEvent(event);

    if (this.isPress != currentPress) {
      this.onMouseClick();

      let e = new ThreeMouseEvent(ThreeMouseEventType.CLICK, this);
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

    this.isOver = event.type === ThreeMouseEventType.OVER;
    this.updateState(this.isOver ? ClickableState.OVER : ClickableState.NORMAL);
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
    this._materialSet.setOpacity(this._alpha);
    const stateMat = this._materialSet.getMaterial(this.state, this._enable);
    this.view.material = stateMat.material;
  }

  public switchEnable(bool: boolean): void {
    this._enable = bool;
    this.state = bool ? ClickableState.NORMAL : ClickableState.DISABLE;
    this.updateMaterial();
  }

  public getEnable(): boolean {
    return this.mouseEnabled;
  }
}
