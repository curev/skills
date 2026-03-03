---
title: tslx in TSX (cls, each)
impact: MEDIUM
impactDescription: tslx utilities keep class names and iteration consistent and readable in JSX without string concatenation or manual .map key handling.
type: efficiency
tags: [vue3, jsx, tsx, tslx, cls, each, best-practice]
---
# tslx in TSX

When the project has **tslx**, prefer **`cls`** for class names and **`each`** for iteration in JSX. Both are used only inside the render function (or helpers called from it); they are plain functions, not reactive.

## cls

Use **`cls`** to build `class` strings from static classes, conditional classes, and props. Avoid manual string concatenation or long ternary chains.

**Signature (conceptually):** `cls(...args)` where each argument can be a string, an object (key = class name, value = boolean), or undefined. Falsy values are skipped.

**Examples:**

```tsx
import { cls } from "tslx";

// Static + prop-driven class
<div class={cls("flex items-center p-4", props.headerClass)} />

// Conditional classes
<div
  class={cls(
    "absolute inset-0 flex justify-center items-center",
    props.mask ? "bg-white/80" : "",
    { "pointer-events-none": props.disabled }
  )}
/>

// With ref value (in render function)
<div
  class={cls(
    "transition-all duration-300",
    isCollapsed.value ? "w-12" : "w-52",
    { "opacity-50": loading.value }
  )}
/>
```

- Use in **`class={cls(...)}`** in JSX; do not create reactive state for the result—call `cls` during render.
- Keeps conditional and utility classes (e.g. Tailwind/UnoCSS) readable and avoids `["base", condition ? "a" : "b"].join(" ")` boilerplate.

## each

Use **`each`** to iterate over a collection and return an array of VNodes (or other values). Compared to `.map()`, **`each`** accepts richer types and is safe for nullable data.

**Supported input types:**

- **`null` / `undefined`**: ignored; returns an empty array (no need to guard before calling).
- **Iterables** (array, Set, or any `Symbol.iterator`): behaves like `Array.from(collection).map(callback)`.
- **Plain object**: behaves like `Object.entries(collection).map(callback)`; callback receives `(entry, index)` where `entry` is `[key, value]`.
- **Number `n`**: loops from **1 to n** (inclusive), like `range(1, n)`; callback receives `(value, index)` where `value` is 1..n and `index` is 0-based. Useful for placeholder rows or repeated elements.

**Signature (conceptually):** `each(collection, (item, index?) => VNode | VNode[])`. Typically used so each item maps to one root element with a stable `key`.

**Examples:**

```tsx
import { each } from "tslx";

// Simple list
return () => (
  <ul>
    {each(items.value, (item) => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
);

// With index when key is index-based (prefer item.id when available)
{each(menus.value, (item, index) => (
  <Item key={index} title={item.title} />
))}

// Inline callback
{each(agents.value, (agent) => (
  <Card
    key={agent.id}
    name={agent.name}
    onClick={() => open(agent.id)}
  />
))}
```

- Use **inside the render function**; the first argument can be a ref value (e.g. `items.value`) or a plain array.
- Ensure each root element in the callback has a **stable `key`** (e.g. `item.id`); avoid keys that change with array order unless the list is static.

## When to use

- **cls**: Whenever you combine multiple classes or conditional classes in JSX; prefer over manual concatenation or long ternary expressions.
- **each**: When the project already uses `each` for lists; use for consistency. If the codebase uses `.map()` everywhere, that is also fine—the important part is consistent keys and pure render.
