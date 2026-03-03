---
title: VueUse in TSX (useVModel, computedAsync, until)
impact: MEDIUM
impactDescription: VueUse composables keep v-model and async state consistent and reduce boilerplate in SFC + TSX components.
type: efficiency
tags: [vue3, jsx, tsx, vueuse, useVModel, computedAsync, until, best-practice]
---
# VueUse in TSX

When the project has **VueUse** (`@vueuse/core`), prefer its helpers in `setup` for common patterns. All calls must stay at the top level of `setup` (see SKILL.md). For **custom composables** in TSX, see `reference/composables-in-tsx.md`.

## useVModel

Use **`useVModel`** to implement `v-model` (or `v-model:propName`) on custom components. It returns a ref that stays in sync with the prop and emits `update:modelValue` (or `update:propName`) on change.

**Recommendation:** Prefer **`passive: true`** so the component behaves as **uncontrolled** when the parent does not pass the prop: it still works using the prop default (e.g. `default: ""`), and when the parent does bind `v-model`, it syncs both ways without re-emitting unnecessarily.

**Example — default `modelValue`:**

```tsx
import { useVModel } from "@vueuse/core";
import { defineComponent, shallowRef, watch, onMounted, onUnmounted } from "vue";

export default defineComponent({
  name: "MyEditor",
  props: {
    modelValue: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const modelValue = useVModel(props, "modelValue", emit, { passive: true });
    const elRef = shallowRef<HTMLDivElement | null>(null);

    onMounted(() => {
      if (elRef.value) {
        // init editor, call modelValue.value = x in callbacks
      }
    });
    onUnmounted(() => { /* destroy */ });

    return () => (
      <div>
        <div ref={elRef} />
      </div>
    );
  },
});
```

**Example — named model (e.g. `visible`):**

```tsx
const visible = useVModel(props, "visible", emit, { passive: true });

// In JSX, parent binds with v-model:visible={visibleRef.value}
```

- **Prefer `passive: true`**: makes the component work as uncontrolled when the prop is not passed (relies on prop default); when the parent does bind `v-model`, it still syncs and reacts to external changes without redundant emit.
- Read/write **`modelValue.value`** (or `visible.value`) in `setup`; in the render function only read `.value` for JSX bindings.

## computedAsync

Use **`computedAsync`** for derived state that depends on async work (e.g. fetching when an id changes). It returns a ref that updates when the async function resolves and re-runs when its dependencies change.

**Example:**

```tsx
import { computedAsync } from "@vueuse/core";
import { defineComponent, ref, computed } from "vue";

export default defineComponent({
  name: "ToolList",
  setup() {
    const selectedId = ref("");
    const serverTools = computedAsync(
      async () => {
        if (!selectedId.value) return [];
        const { data } = await api.getTools(selectedId.value);
        return data.tools ?? [];
      },
      [] // initial value
    );

    return () => (
      <div>
        {each(serverTools.value, (tool) => (
          <div key={tool.id}>{tool.name}</div>
        ))}
      </div>
    );
  },
});
```

- Call **at the top of `setup`**; do not call inside the render function.
- Use the returned ref (e.g. `serverTools.value`) in the render function for display; loading/error can be handled with a separate ref or by the composable’s options if available.

## until

Use **`until`** when you need to **wait for a ref** (or computed) to match a value before continuing async logic. It returns a promise that resolves when the condition is met (e.g. after mount, or when async state is ready).

**Example — wait for component mount before measuring DOM:**

```tsx
import { until, useMounted } from "@vueuse/core";
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MyAside",
  setup() {
    const isMounted = useMounted();
    const listRef = ref<HTMLElement[]>([]);

    const updateActiveStyle = async () => {
      await until(isMounted).toBe(true);
      const el = listRef.value[0];
      if (el) {
        // use el.offsetTop, el.clientHeight, etc.
      }
    };

    return () => <div ref={listRef}>...</div>;
  },
});
```

**Example — wait for async state (e.g. in store or after fetch):**

```tsx
const isReadyOrError = computed(() => isReady.value || !!error.value);

const checkReady = async () => {
  await until(isReadyOrError).toBe(true);
  return !!data.value;
};
```

- The **source** (ref/computed) is created at the top of `setup`; **`until(source).toBe(value)`** is awaited inside async functions (callbacks, methods), not at setup top level.
- Use **`.toBe(value)`** for equality; VueUse also provides **`.toBeTruthy()`**, **`.toBeNull()`**, and **`.changed()`** for other conditions.

## Other VueUse helpers

- **`useAsyncState`**: one-off async call with loading/error state; use when you need explicit trigger (e.g. submit) or non-derived async state.
- **`syncRef`**: keep two refs in sync (e.g. local ref and `useVModel` result) when integrating with external APIs that expect a ref.
- **`useMounted`**, **`useResizeObserver`**, etc.**: use from the top level of `setup` as needed; they are safe and consistent with the "reactive and composables only in setup" rule.

All of these are used the same way in TSX as in template-based SFCs; only the render function returns JSX instead of a template.
