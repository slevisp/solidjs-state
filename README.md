# solidjs-state

A tiny SolidJS state helper that chooses `createSignal` or `createStore` from the
initial value and gives both branches the same read shape: `state()`.

## Install

```sh
pnpm add solidjs-state
```

`solid-js` is a peer dependency. This package does not add any runtime
dependencies beyond Solid itself.

## Usage

```ts
import { createState } from "solidjs-state";

const [count, setCount] = createState(0);

count(); // 0
setCount(1);
count(); // 1
```

Plain objects and arrays use Solid stores internally, but are still read through
`state()`:

```ts
const [state, setState] = createState({
  user: { name: "Peng" },
  todos: [{ title: "Write docs", done: false }]
});

state().user.name;
state((current) => current.user.name);
state((current) => current.todos.filter((todo) => !todo.done));
state((current) => ({
  name: current.user.name,
  todoCount: current.todos.length
}));

setState("user", "name", "Solid");
```

Selectors are for expressive reads, filtering, and composing derived values.
They do not add memoization by themselves. For expensive derived values, compose
with Solid's `createMemo`:

```ts
import { createMemo } from "solid-js";

const visibleTodos = createMemo(() =>
  state((current) => current.todos.filter((todo) => !todo.done))
);
```

## State Selection

`createState` uses `createSignal` for primitive values and common whole-value
objects:

- `string`
- `number`
- `boolean`
- `bigint`
- `symbol`
- `null`
- `undefined`
- `Date`
- `Map`
- `Set`
- known non-plain objects such as `RegExp`, `URL`, `Error`, `Promise`,
  `WeakMap`, and `WeakSet`

It uses `createStore` for:

- arrays
- plain objects
- class instances and other object values not listed above

Function initial values are intentionally not part of the public TypeScript API.
If a function is passed by bypassing TypeScript, it is stored as a value and is
not executed.

## API

```ts
function createState<T extends SupportedSignalState>(
  initialValue: T
): [state: () => T, setState: Setter<T>];

function createState<T extends object>(
  initialValue: T
): [
  state: {
    (): T;
    <R>(selector: (state: T) => R): R;
  },
  setState: SetStoreFunction<T>
];
```
