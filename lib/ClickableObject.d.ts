import { ClickableMesh } from "./ClickableMesh";
import { ClickableSprite } from "./ClickableSptire";
import { ClickableState } from "./MouseEventManager";
import { StateMaterialSet } from "./StateMaterial";
import { ThreeMouseEvent } from "./ThreeMouseEvent";

/**
 * クリックに反応するMesh。
 */
export declare class ClickableObject {
  get materialSet(): StateMaterialSet;
  set materialSet(value: StateMaterialSet);
  view: ClickableMesh | ClickableSprite;
  isPress: boolean;
  protected isOver: boolean;
  protected _enable: boolean;
  mouseEnabled: boolean;
  frozen: boolean;
  state: ClickableState;
  protected _materialSet: StateMaterialSet;
  protected _alpha: number;
  /**
   * コンストラクタ
   */
  constructor(parameters: {
    view: ClickableMesh | ClickableSprite;
    material: StateMaterialSet;
  });
  onMouseDownHandler(event: ThreeMouseEvent): void;
  onMouseUpHandler(event: ThreeMouseEvent): void;
  onMouseClick(): void;
  onMouseOverHandler(event: ThreeMouseEvent): void;
  onMouseOutHandler(event: ThreeMouseEvent): void;
  private onMouseOverOutHandler;
  set alpha(number: number);
  protected updateState(state: ClickableState): void;
  /**
   * 現在のボタンの有効、無効状態を取得する
   * @return    ボタンが有効か否か
   */
  protected checkActivity(): Boolean;
  enable(): void;
  disable(): void;
  protected updateMaterial(): void;
  switchEnable(bool: boolean): void;
}
//# sourceMappingURL=ClickableObject.d.ts.map
