import type {
  ButtonInteractionHandler,
  ButtonInteractionHandlerParameters,
} from "../index.js";

/**
 * Constructor interface for interaction handler classes.
 *
 * @description
 * This interface defines the constructor signature for interaction handler classes
 * that extend ButtonInteractionHandler. It ensures type safety when passing
 * handler constructors to interactive view objects (mesh, sprite, group).
 *
 * @template InteractionHandler - The specific interaction handler type
 * @template Value - Type of arbitrary data associated with the interactive object
 *
 * @public
 */
export interface InteractionHandlerConstructor<
  InteractionHandler extends ButtonInteractionHandler<Value>,
  Value,
> {
  new (param: ButtonInteractionHandlerParameters<Value>): InteractionHandler;
}
