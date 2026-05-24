# solidjs-state

A tiny SolidJS state helper that chooses `createSignal` or `createStore` from the
initial value and gives both branches the same read shape: `state()`.

## Install

```sh
npm install solidjs-state
```

```sh
yarn add solidjs-state
```

```sh
pnpm add solidjs-state
```

```sh
bun add solidjs-state
```

`solid-js` is a peer dependency. This package does not add any runtime
dependencies beyond Solid itself.

## Usage

```ts
import { createState } from 'solidjs-state';

const [count, setCount] = createState(0);

count(); // 0
setCount(1);
count(); // 1
```

Plain objects and arrays use Solid stores internally, but are still read through
`state()`:

```ts
const [state, setState] = createState({
  user: { name: 'Suuu' },
  todos: [{ title: 'Write docs', done: false }],
});

state().user.name; // "Suuu"
const s = state();
s.user.name; // "Suuu"

const userName = state((current) => current.user.name);
const openTodos = state((current) =>
  current.todos.filter((todo) => !todo.done)
);
const summary = state((current) => ({
  name: current.user.name,
  todoCount: current.todos.length,
}));

userName(); // "Suuu"
openTodos(); // [{ title: "Write docs", done: false }]
summary(); // { name: "Suuu", todoCount: 1 }

setState('user', 'name', 'Solid');
userName(); // "Solid"
```

Selectors are for expressive reads, filtering, and composing derived values.
They return Solid accessors, so values stay reactive after store updates:

```ts
const visibleTodos = state((current) =>
  current.todos.filter((todo) => !todo.done)
);

visibleTodos();
```

Selector accessors do not cache by themselves. For expensive derived values,
wrap the accessor with Solid's `createMemo`.

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
    <R>(selector: (state: T) => R): Accessor<R>;
  },
  setState: SetStoreFunction<T>
];
```
