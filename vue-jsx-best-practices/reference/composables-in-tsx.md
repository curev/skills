---
title: Composition in TSX (custom composables)
impact: MEDIUM
impactDescription: Custom composables keep logic reusable and testable; in TSX they follow the same rules as VueUse—call at top level of setup, use returned refs in render via .value.
type: efficiency
tags: [vue3, jsx, tsx, composition, composable, useToggle, best-practice]
---
# Composition in TSX

Composition in TSX means **all reactive state and composables** (VueUse, Pinia, Router, or custom `useXxx`) are **called once at the top level of `setup`**. The render function is pure: it only reads refs (e.g. `count.value`) and calls plain helpers. See SKILL.md for the core rule; see `reference/vueuse-in-tsx.md` for VueUse helpers. This page focuses on **custom composables** and how to use them in TSX.

## Rules

- **Call composables only at the top level of `setup`**—never inside the render function, loops, or conditional branches. This preserves reactivity and lifecycle consistency.
- **In the render function**: use returned refs with **`.value`** (e.g. `open.value`, `loading.value`). Refs are not auto-unwrapped in JSX.
- **Return** from composables: prefer **refs** and **plain functions**; avoid returning reactive objects that are hard to destructure and keep reactive. Optionally return a single reactive object when the composable is a cohesive “store” (e.g. pagination state + methods).

## Example: useToggle

A simple composable that holds a boolean and provides a toggle function. Use it in TSX for collapsed state, modal visibility, etc.

**Composable (e.g. in `composables/useToggle.ts`):**

```ts
import { ref } from "vue";

export function useToggle(initial = false) {
  const value = ref(initial);
  const toggle = () => {
    value.value = !value.value;
  };
  const set = (v: boolean) => {
    value.value = v;
  };
  return { value, toggle, set };
}
```

**Usage in a TSX component:**

```tsx
import { useToggle } from "@/composables/useToggle";
import { defineComponent } from "vue";
import { cls } from "tslx";

export default defineComponent({
  name: "SidePanel",
  setup() {
    const { value: isOpen, toggle } = useToggle(true);

    return () => (
      <div class={cls("transition-all", isOpen.value ? "w-52" : "w-12")}>
        <button onClick={toggle}>Toggle</button>
      </div>
    );
  },
});
```

- `useToggle` is called once at the top of `setup`. The render function reads `isOpen.value` and passes `toggle` to `onClick`.

## Example: useDebounceRef

A ref that debounces writes. Useful for search inputs or filters that trigger requests.

**Composable (e.g. in `composables/useDebounceRef.ts`):**

```ts
import { ref, watch } from "vue";
import type { Ref } from "vue";

export function useDebounceRef<T>(initial: T, delayMs: number) {
  const value = ref(initial) as Ref<T>;
  const debounced = ref(initial) as Ref<T>;

  watch(value, (v) => {
    const id = setTimeout(() => {
      debounced.value = v;
    }, delayMs);
    return () => clearTimeout(id);
  });

  return { value, debounced };
}
```

**Usage in TSX:**

```tsx
const { value: keyword, debounced } = useDebounceRef("", 300);

// In render: bind keyword to input; use debounced.value for API calls (e.g. in a watch or computedAsync)
return () => (
  <input v-model={keyword.value} placeholder="Search" />
);
```

- The composable is called at the top of `setup`. The input binds to `keyword`; side effects (e.g. fetch) should depend on `debounced.value` (e.g. via `watch` or `computedAsync`), also set up at the top of `setup`.

## Example: consuming a rich composable (e.g. usePagination)

Composables that return multiple refs and methods are used the same way: call once in `setup`, then use refs and methods in the render function.

```tsx
import { usePagination } from "@/composables/pagination";
import { defineComponent } from "vue";
import { each } from "tslx";

export default defineComponent({
  name: "UserList",
  setup() {
    const { state, isLoading, pagination, onCurrentChange, onSizeChange } = usePagination(
      (params) => userService.getList(params),
      { immediate: true }
    );

    return () => (
      <div>
        {isLoading.value ? (
          <div>Loading...</div>
        ) : (
          <ul>
            {each(state.value, (user) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        )}
        <Pagination
          {...pagination.value}
          onCurrentChange={onCurrentChange}
          onSizeChange={onSizeChange}
        />
      </div>
    );
  },
});
```

- `usePagination` is called once at the top of `setup`. The render function uses `state.value`, `isLoading.value`, `pagination.value`, and passes the methods to the pagination UI. All reactive state stays in setup; render stays pure.

## Summary

- **Custom composables** in TSX: define them to return refs (and optionally plain functions or a reactive object). Call them **only at the top level of `setup`**; use returned refs in the render function with **`.value`**.
- For VueUse helpers (`useVModel`, `computedAsync`, `until`, etc.), see `reference/vueuse-in-tsx.md`.
- For splitting only render structure (plain functions that return VNodes), see `reference/composition-splitting.md`.
