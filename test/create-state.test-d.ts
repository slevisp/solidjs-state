import { expectTypeOf, test } from "vitest";
import type { Setter } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { createState } from "../src";

test("primitive state uses a signal accessor", () => {
  const [state, setState] = createState(0);

  expectTypeOf(state).toEqualTypeOf<() => number>();
  expectTypeOf(setState).toMatchTypeOf<Setter<number>>();
});

test("object state keeps field hints in state and selectors", () => {
  const [state, setState] = createState({
    count: 0,
    user: { name: "Peng" }
  });

  expectTypeOf(state()).toEqualTypeOf<{
    count: number;
    user: {
      name: string;
    };
  }>();

  expectTypeOf(state((current) => current.user.name)).toEqualTypeOf<string>();
  expectTypeOf(state((current) => ({ count: current.count }))).toEqualTypeOf<{
    count: number;
  }>();
  expectTypeOf(setState).toEqualTypeOf<
    SetStoreFunction<{
      count: number;
      user: {
        name: string;
      };
    }>
  >();
});

test("typed plain object state keeps store selectors and setters", () => {
  interface State {
    count: number;
    user: {
      name: string;
    };
  }

  const initial: State = {
    count: 0,
    user: { name: "Peng" }
  };

  const [state, setState] = createState(initial);

  expectTypeOf(state((current) => current.user.name)).toEqualTypeOf<string>();
  expectTypeOf(setState).toEqualTypeOf<SetStoreFunction<State>>();
});

test("array state keeps item hints in selectors", () => {
  const [state, setState] = createState([
    { title: "Write doc", visible: true },
    { title: "Ship package", visible: false }
  ]);

  expectTypeOf(state()[0]).toEqualTypeOf<
    | {
        title: string;
        visible: boolean;
      }
    | undefined
  >();

  expectTypeOf(
    state((items) => items.filter((item) => item.visible))
  ).toEqualTypeOf<
    {
      title: string;
      visible: boolean;
    }[]
  >();

  expectTypeOf(setState).toEqualTypeOf<
    SetStoreFunction<
      {
        title: string;
        visible: boolean;
      }[]
    >
  >();
});

test("Date, Map, and Set use signal accessors", () => {
  expectTypeOf(createState(new Date())[0]).toEqualTypeOf<() => Date>();
  expectTypeOf(createState(new Map<string, number>())[0]).toEqualTypeOf<
    () => Map<string, number>
  >();
  expectTypeOf(createState(new Set<number>())[0]).toEqualTypeOf<
    () => Set<number>
  >();
});

test("known non-plain objects use signal accessors", () => {
  const [regexpState] = createState(/solid/);
  const [urlState] = createState(new URL("https://example.com"));
  const [errorState] = createState(new Error("nope"));

  expectTypeOf(regexpState).toEqualTypeOf<() => RegExp>();
  expectTypeOf(urlState).toEqualTypeOf<() => URL>();
  expectTypeOf(errorState).toEqualTypeOf<() => Error>();

  // @ts-expect-error signal-backed non-plain objects do not support selectors
  regexpState((value) => value.source);
});

test("class instances use store accessors", () => {
  class Counter {
    count = 0;
  }

  const [state, setState] = createState(new Counter());

  expectTypeOf(state((current) => current.count)).toEqualTypeOf<number>();
  expectTypeOf(setState).toEqualTypeOf<SetStoreFunction<Counter>>();
});

test("function initial values are rejected by the public TypeScript API", () => {
  // @ts-expect-error functions are not supported as public initial values
  createState(() => ({ count: 0 }));

  const fn: Function = () => ({ count: 0 });

  // @ts-expect-error Function-typed values are not supported initial values
  createState(fn);
});
