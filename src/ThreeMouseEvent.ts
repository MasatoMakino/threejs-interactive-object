import type { ButtonInteractionHandler } from "./index.js";

export interface ThreeMouseEventMap<T = unknown> {
  click: (e: ThreeMouseEvent<T>) => void;
  over: (e: ThreeMouseEvent<T>) => void;
  out: (e: ThreeMouseEvent<T>) => void;
  down: (e: ThreeMouseEvent<T>) => void;
  up: (e: ThreeMouseEvent<T>) => void;
  select: (e: ThreeMouseEvent<T>) => void;
}
export interface ThreeMouseEvent<Value> {
  readonly type: keyof ThreeMouseEventMap<Value>;
  readonly interactionHandler?: ButtonInteractionHandler<Value>;
  readonly isSelected?: boolean;
}
