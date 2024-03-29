import EventEmitter from "eventemitter3";
import {
  ClickableGroup,
  ClickableMesh,
  ClickableSprite,
  ClickableState,
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventMap,
  ThreeMouseEventUtil,
} from "./index.js";

/**
 * クリックに反応する表示オブジェクトの型エイリアス
 * ClickableObjectはこれらの表示オブジェクトを状態にあわせて操作する。
 */
export type ClickableView<Value> =
  | ClickableMesh<Value>
  | ClickableSprite<Value>
  | ClickableGroup<Value>;

export interface ClickableObjectParameters<Value> {
  view: ClickableView<Value>;
  material?: StateMaterialSet;
}

/**
 * クリックに反応するObject
 * これ自体は表示オブジェクトではない。
 */
export class ClickableObject<Value> extends EventEmitter<
  ThreeMouseEventMap<Value>
> {
  public value: Value | undefined;
  get materialSet(): StateMaterialSet | undefined {
    return this._materialSet;
  }

  set materialSet(value: StateMaterialSet | undefined) {
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

  readonly view: ClickableView<Value>;
  protected _isPress: boolean = false;
  protected _isOver: boolean = false;
  protected _enable: boolean = true;
  public mouseEnabled: boolean = true;
  public frozen: boolean = false;

  public state: ClickableState = "normal";
  protected _materialSet?: StateMaterialSet;
  protected _alpha: number = 1.0;

  /**
   * コンストラクタ
   */
  constructor(parameters: ClickableObjectParameters<Value>) {
    super();
    this.view = parameters.view;
    this._materialSet ??= parameters.material;
    this.updateMaterial();
  }

  public onMouseDownHandler(event: ThreeMouseEvent<Value>): void {
    if (!this.checkActivity()) return;
    this._isPress = true;
    this.updateState("down");
    this.emit(event.type, event);
  }

  public onMouseUpHandler(event: ThreeMouseEvent<Value>): void {
    if (!this.checkActivity()) return;

    const currentPress: boolean = this._isPress;
    this._isPress = false;

    const nextState: ClickableState = this._isOver ? "over" : "normal";
    this.updateState(nextState);
    this.emit(event.type, event);

    if (this._isPress != currentPress) {
      this.onMouseClick();

      const e = ThreeMouseEventUtil.generate("click", this);
      this.emit(e.type, event);
    }
  }

  public onMouseClick(): void {}

  public onMouseOverHandler(event: ThreeMouseEvent<Value>): void {
    this.onMouseOverOutHandler(event);
  }

  public onMouseOutHandler(event: ThreeMouseEvent<Value>): void {
    this.onMouseOverOutHandler(event);
  }

  private onMouseOverOutHandler(event: ThreeMouseEvent<Value>): void {
    this._isOver = event.type === "over"; //マウスオーバーの判定はdisable状態でも行う。
    if (!this.checkActivity()) return;

    this.updateState(this._isOver ? "over" : "normal");
    this.emit(event.type, event);
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
        (this.view as ClickableMesh<Value> | ClickableSprite<Value>).material =
          stateMat.material;
        break;
      case "Group":
      default:
        break;
    }
  }

  public switchEnable(bool: boolean): void {
    this._enable = bool;
    this.state = bool ? "normal" : "disable";
    this.updateMaterial();
  }
}
