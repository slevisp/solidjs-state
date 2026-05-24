import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
import { createState } from "../src";

describe("createState", () => {
  it("uses signal-style access for primitive values", () => {
    const [state, setState] = createState(0);

    expect(state()).toBe(0);

    setState(1);

    expect(state()).toBe(1);
  });

  it("wraps plain objects with a store accessor", () => {
    const [state, setState] = createState({
      count: 0,
      user: { name: "Peng" }
    });

    expect(state().count).toBe(0);
    expect(state((current) => current.user.name)()).toBe("Peng");
    expect(state((current) => ({ count: current.count }))()).toEqual({ count: 0 });

    setState("count", 1);

    expect(state().count).toBe(1);
    expect(state((current) => current.count)()).toBe(1);
  });

  it("wraps arrays with a store accessor", () => {
    const [state, setState] = createState([
      { title: "Write doc", visible: true },
      { title: "Ship package", visible: false }
    ]);

    expect(state()[0]?.title).toBe("Write doc");
    expect(state((items) => items.filter((item) => item.visible))()).toEqual([
      { title: "Write doc", visible: true }
    ]);

    setState(1, "visible", true);

    expect(state((items) => items.filter((item) => item.visible))()).toEqual([
      { title: "Write doc", visible: true },
      { title: "Ship package", visible: true }
    ]);
  });

  it("returns reactive selector accessors", () => {
    createRoot((dispose) => {
      const [user, setUser] = createState({ name: "Peng" });
      const name = user((state) => state.name);

      expect(name()).toBe("Peng");

      setUser("name", "Solid");

      expect(name()).toBe("Solid");

      dispose();
    });
  });

  it("treats Date, Map, and Set as signal values", () => {
    const date = new Date("2026-05-24T00:00:00.000Z");
    const map = new Map([["count", 1]]);
    const set = new Set([1]);

    const [dateState] = createState(date);
    const [mapState] = createState(map);
    const [setState] = createState(set);

    expect(dateState()).toBe(date);
    expect(mapState()).toBe(map);
    expect(setState()).toBe(set);
  });

  it("wraps class instances with a store accessor", () => {
    class Counter {
      count = 0;
    }

    const instance = new Counter();

    const [state, setState] = createState(instance);

    expect(state()).toBe(instance);
    expect(state((current) => current.count)()).toBe(0);

    setState("count", 1);

    expect(state((current) => current.count)()).toBe(1);
  });

  it("does not execute function values when users bypass TypeScript", () => {
    const fn = () => ({ count: 0 });
    const [state] = createState(fn as unknown as Date);

    expect(state()).toBe(fn);
  });
});
