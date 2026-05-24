# Tech Design: createState

## Background

SolidJS exposes both `createSignal` and `createStore`. They are both useful, but
their read shapes are different:

```ts
const [count] = createSignal(0);
count();

const [state] = createStore({ count: 0 });
state.count;
```

`createState` provides one entry point and one read shape for both branches.

## Goals

- Export a single `createState(initialValue)` API.
- Always read through `state()`.
- Use `createSignal` for primitive values, `Date`, `Map`, and `Set`.
- Use `createStore` for arrays, plain objects, class instances, and other object
  values not listed in the signal branch.
- Use `createSignal` for known non-plain objects such as `RegExp`, `URL`,
  `Error`, `Promise`, `WeakMap`, and `WeakSet` so public types match runtime
  behavior for common built-ins.
- Add `state(selector)` for store-backed state so users can filter and compose
  derived reactive reads with typed field hints.
- Add no runtime dependencies beyond SolidJS.

## Non-goals

- No lazy initializer support.
- No `{ mode: "signal" | "store" }` override.
- No exposed internal mode flag.
- No selector memoization in v1.
- No public function initial values.

## API

Signal-backed values:

```ts
type SignalState<T> = [state: () => T, setState: Setter<T>];
```

Store-backed values:

```ts
type StoreAccessor<T extends object> = {
  (): T;
  <R>(selector: (state: T) => R): Accessor<R>;
};

type StoreState<T extends object> = [
  state: StoreAccessor<T>,
  setState: SetStoreFunction<T>
];
```

The selector parameter keeps the initial value type:

```ts
const [state] = createState({
  user: { name: "Peng" },
  todos: [{ title: "Write doc", done: false }]
});

const name = state((current) => current.user.name);
const openTodos = state((current) => current.todos.filter((todo) => !todo.done));

name();
openTodos();
```

## Selection Rules

`createStore` is used for arrays, plain objects, class instances, and other
object values not listed in the signal branch:

```ts
function shouldUseStore(value: unknown): value is object {
  return value !== null && typeof value === "object" && !isSignalObject(value);
}
```

`Date`, `Map`, `Set`, `RegExp`, `URL`, `Error`, `Promise`, `WeakMap`,
`WeakSet`, and functions do not enter the store branch at runtime.

TypeScript cannot reliably distinguish arbitrary class instances from plain
object interfaces structurally. The runtime therefore follows the same public
API shape: known non-plain built-ins are signal-backed, and other
object/interface values are store-backed.

## Function Initial Values

`createState(() => ({ count: 0 }))` is rejected by the public TypeScript API.

If a user bypasses TypeScript, the function is treated as a signal value:

```ts
const fn = () => ({ count: 0 });
const [state] = createState(fn as never);

state() === fn;
```

The library never implicitly executes a function initial value.

## Selector Semantics

`state(selector)` creates a lightweight accessor and returns that accessor. It
is an ergonomic read helper for filtering, picking fields, and composing
objects:

```ts
const name = state((current) => current.user.name);

name();
```

Calling the returned accessor re-runs the selector against the current store.
When the accessor is called inside JSX, an effect, or a memo, Solid tracks the
store properties read inside the selector. The selector accessor does not cache
its result by itself; users can still wrap it with Solid's `createMemo` for
expensive derived values.
