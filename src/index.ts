import { createSignal, type Accessor, type Setter } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

export type PrimitiveState =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

export type SignalObjectState =
  | Date
  | Map<unknown, unknown>
  | Set<unknown>
  | WeakMap<object, unknown>
  | WeakSet<object>
  | RegExp
  | URL
  | Error
  | Promise<unknown>;

export type SupportedSignalState = PrimitiveState | SignalObjectState;

export type PlainObjectState = object;

export type StoreInitialState = PlainObjectState | readonly unknown[];

export type WidenSignalState<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends bigint
        ? bigint
        : T extends symbol
          ? symbol
          : T;

export type StoreAccessor<T extends object> = {
  (): T;
  <R>(selector: (state: T) => R): Accessor<R>;
};

export type SignalState<T> = [state: Accessor<T>, setState: Setter<T>];

export type StoreState<T extends object> = [
  state: StoreAccessor<T>,
  setState: SetStoreFunction<T>
];

export function createState<T extends SupportedSignalState>(
  initialValue: T
): SignalState<WidenSignalState<T>>;
export function createState<T extends StoreInitialState>(
  initialValue: T extends SupportedSignalState | Function ? never : T
): StoreState<T>;
export function createState<T>(initialValue: T): SignalState<T> | StoreState<T & object> {
  if (shouldUseStore(initialValue)) {
    const [store, setStore] = createStore(initialValue);

    const accessor = (<R>(selector?: (state: typeof initialValue) => R) => {
      if (typeof selector === "function") {
        return () => selector(store as typeof initialValue);
      }

      return store;
    }) as StoreAccessor<typeof initialValue>;

    return [accessor, setStore] as StoreState<typeof initialValue>;
  }

  return createSignal(initialValue);
}

function shouldUseStore<T>(value: T): value is T & object {
  return value !== null && typeof value === "object" && !isSignalObject(value);
}

function isSignalObject(value: object): value is SignalObjectState {
  return (
    value instanceof Date ||
    value instanceof Map ||
    value instanceof Set ||
    value instanceof WeakMap ||
    value instanceof WeakSet ||
    value instanceof RegExp ||
    value instanceof URL ||
    value instanceof Error ||
    value instanceof Promise
  );
}
