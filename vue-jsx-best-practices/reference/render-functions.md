---
title: Render Functions and Template Equivalents
impact: HIGH
impactDescription: Pure render functions (no reactive state or assignments inside) and correct ref.value usage prevent bugs and infinite update loops.
type: efficiency
tags: [vue3, jsx, tsx, render-function, ref, reactivity, v-model, slots, best-practice]
---
# Render Functions and Template Equivalents

The render function must be pure (see SKILL.md). **Pitfalls to avoid:**

- Do not create reactive state inside the render function; create it at the top of `setup`.
- Do not perform assignments inside the render function.
- Refs in JSX require `.value` (no auto-unwrap).
- Use `v-show={visible.value}` for visibility; ensure runtime supports it.
- Do not reuse the same vnode in multiple places; produce fresh nodes per return.
- Event modifiers (e.g. `.prevent`) are not available; use `e.preventDefault()` etc. explicitly.

## Bad / Good examples

### Do not create reactive state inside the render function

**Bad** — `ref()` inside the returned function runs on every render:

```tsx
setup(props) {
  return () => {
    const count = ref(0);  // new ref every time
    return <div>{count.value}</div>;
  };
}
```

**Good** — create refs at the top of `setup`:

```tsx
setup(props) {
  const count = ref(0);
  return () => <div>{count.value}</div>;
}
```

### Do not assign in the render function scope

**Bad** — assignment during render (side effect, can cause infinite loops):

```tsx
return () => {
  let n = 0;
  items.value.forEach(() => n++);
  return <div>{n}</div>;
};
```

**Good** — derive or compute in `setup` (e.g. `computed`) and only read in render:

```tsx
const total = computed(() => items.value.length);
return () => <div>{total.value}</div>;
```

### Refs in JSX require `.value`

**Bad** — ref not unwrapped in JSX (renders `[object Object]` or wrong value):

```tsx
return () => <div>{titleRef}</div>;
```

**Good** — use `.value` in the render function:

```tsx
return () => <div>{titleRef.value}</div>;
```

### Event handlers: pass a function, not a call result

**Bad** — handler is the return value of `doSomething()` (runs immediately):

```tsx
<button onClick={doSomething()}>Click</button>
```

**Good** — pass the function so it runs on click:

```tsx
<button onClick={doSomething}>Click</button>
// or
<button onClick={() => doSomething()}>Click</button>
```

## Mapping from Vue template to render functions

- Template `v-if` → JSX `condition && <Node />` or a ternary.
- Template `v-for` → JSX `list.map(item => <Item key={item.id} ... />)`.
- Template `v-model` → JSX `v-model={modelValue.value}` or `v-model:prop={propRef.value}`.
- Template `<slot />` → JSX `slots.default?.()` or `renderSlot(slots, "default")`.
- Template `ref="xxx"` → JSX `ref={xxxRef}`.
