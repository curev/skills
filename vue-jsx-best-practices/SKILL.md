---
name: vue-jsx-best-practices
description: Exclusive style guide for writing Vue 3 JSX using SFC with <script lang="tsx">, defineComponent, and render functions. Use when working with Vue 3 JSX/TSX components.
---

# Vue JSX Best Practices

Guidelines for Vue 3 components written with Composition API + `<script lang="tsx">` + render functions, focused on a consistent JSX/TSX style.

## Scope

- This skill applies when **writing Vue 3 JSX/TSX components**. It assumes the use of SFC with `<script lang="tsx">` and `defineComponent` render functions as the standard style.

## Why JSX instead of templates + `<script setup>`

- Templates with `<script setup>` introduce many “magic” features (compile-time macros, implicit exports, automatic ref unwrapping, etc.) that are **not intuitive** and require memorizing Vue-specific rules.
- JSX is just a TS/JS expression tree. As long as you understand **`{}` interpolation and expressions**, you can handle conditionals, loops, and slots; most of the time you are just writing normal TypeScript code.
- JSX works very well with the TypeScript type system: component props, slot functions, event callbacks, etc. all get **full type inference and checking**.
- The syntax is **highly aligned with plain JS/TS** (e.g. `if`/`for`/`map`, object/array spread, destructuring), which reduces mental overhead when switching between frameworks or stacks.

## Always use JSX, never templates or `<script setup>`

- Prefer **`<script lang="tsx">` + `defineComponent` + render functions** to implement components.
- Do **not** use Vue templates (`<template>`) or the `<script setup>` sugar; all view logic is expressed in JSX.

## Why SFC (`.vue`) + TSX instead of plain `.tsx`

- Using a **single-file component (`.vue`)** with `<script lang="tsx">` allows you to colocate **`<style>`** in the same file, keeping **styles, logic, and structure** together per component.
- Plain `.tsx` files have no built-in style blocks, so styles tend to live in separate `.css`/`.less` files or CSS-in-JS. SFCs with `<style scoped>` keep styling 1:1 with the component and are easier to maintain.

## Disallowed features

- **`<script setup>` is forbidden**. Always use `defineComponent` with the options `props` / `emits` / `setup`.
- The following **compile-time macros are forbidden** (they are limited to `<script setup>` and rely on the compiler; this skill does not use `<script setup>` at all):
  - `defineProps`
  - `defineModel`
  - `defineExpose`
  - `defineOptions`
  - `defineSlots`
- **`useSlots` and `useAttrs` are forbidden**. Slots should be taken from the `slots` argument of `setup(props, { slots })`. If you really need fallthrough attributes, use the `attrs` argument from `setup` (but prefer explicit props over attrs).

## Component shape

- Use **`<script lang="tsx">`** (never `<script setup>`), and **`defineComponent`** with options **`props`**, **`emits`**, and **`setup`**. `setup` must return a **render function** (no `<template>`).
- Always set a **`name`** for each component (PascalCase).
- Access slots and `expose` via the second argument of `setup(props, { emit, slots, expose })`.
- All reactive state (`ref` / `reactive` / `computed`, etc.) and composables (VueUse, **custom composables**, Pinia stores, Router, i18n, etc.) **must be called once at the top level of `setup`**. Do not create them inside render functions or nested callbacks. See [Composables in TSX](reference/composables-in-tsx.md) for custom composable examples.

```tsx
export default defineComponent({
  name: "MyComponent",
  props: { /* ... */ },
  emits: ["update:value"],
  setup(props, { emit, slots, expose }) {
    return () => (
      <div class="wrapper">
        {/* ... */}
      </div>
    );
  },
});
```

## Props and types

- Props must be declared via the options **`props`** object; use **`PropType<>`** for complex types.
- Prefer **type inference** over explicit type annotations. When props are reused or have non-trivial structure, define an **interface** and type `props` in `setup(props: YourProps)` only when it adds value.
- See [Props and types](reference/props-and-types.md) for a complete example.

## Emits

- Declare events via the options **`emits`** array.
- Event names should stay consistent with Vue conventions: kebab-case in templates, camelCase/onXxx in JSX/TS.

## Render functions

- Render function must be **pure**: do not create reactive state (`ref` / `reactive` / `computed`) or perform assignments inside it; all reactive state and composables belong at the top of `setup` (see Component shape). In JSX, refs require `.value`.
- When render logic is complex, extract sub-parts into plain functions that return VNodes; avoid heavy work or large object creation in the render path (use composables or virtual lists when needed).
- See [Render functions](reference/render-functions.md) for pitfalls and bad/good examples; [Composition splitting](reference/composition-splitting.md) for render splitting example.

- **Show/hide:** use `v-show`; do not use conditionals (`&&`, ternary) for simple visibility.
- **Non-boolean conditions:** use `!!condition` so values like `0` or `""` are not rendered.
- **Complex logic:** extract to a plain function (e.g. `shouldShowXxx()`) and keep JSX simple.
- See [Conditional rendering](reference/conditional-rendering.md) for bad/good examples.

## Classes and styles

- Prefer **atomic CSS** utilities (e.g. Tailwind CSS / UnoCSS) to build styles, designing styles as reusable utility classes instead of large per-component custom CSS blocks.
- When combining multiple class names, use **`cls()`** or array/object forms to merge classes instead of string concatenation.
- When custom styles are needed, prefer **`<style scoped>` with plain CSS** inside the SFC, rather than SCSS/Sass/Less/Stylus. In most cases, simple selectors and limited nesting are sufficient.
- Use `scoped` for style isolation and avoid heavy inline styles; when dynamic styles are required, use style objects instead of string concatenation.
- When overriding third-party component styles, use the **`:deep()`** selector and avoid global styles that can leak into other components.

## Events and `v-model`

- Events use **`onXxx`** handlers (`onClick`, `onChange`, etc.) bound to functions; do not pass the result of calling a function (unless the function itself returns a handler).
- For `v-model` in JSX, prefer **`v-model={modelValue.value}`**. The Vue JSX plugin will compile this into a getter-based binding, with the default pair `modelValue` / `update:modelValue`.
- To bind to a different prop, use **`v-model:propName={propRef.value}`** (e.g. `v-model:visible={visible.value}`).
- For custom components, use `useVModel(props, "modelValue", emit)` (or an equivalent pattern) and `emit("update:modelValue", value)` to implement the `v-model` contract.

```tsx
<MyDialog v-model:visible={visible.value} />
<MyInput v-model={modelValue.value} />
```

## Refs and DOM

- Prefer `shallowRef` for DOM or component instances; bind in JSX with `ref={someRef}`. See [Refs and DOM](reference/refs-and-dom.md) for single/multiple refs and third-party DOM integration.

## Slots

- Get slots from `setup(props, { slots })`. Prefer passing slot object as **children** (`{{ header(){...}, default(){...} }}`). See [Slots](reference/slots.md) for examples.

## Composition and utilities

- **Composition in TSX**: Use composables (VueUse and custom `useXxx`) to encapsulate stateful logic; call them once in `setup` and use returned refs in the render function with `.value`. See [Composables in TSX](reference/composables-in-tsx.md) for patterns and examples.
- Prefer using **VueUse** helpers when available, especially:
  - `useVModel` for implementing `v-model` bindings on custom components.
  - `computedAsync` (and similar) for async-derived state instead of hand-rolled patterns.
- Prefer using **tslx** utilities when available, especially:
  - `cls` for building className strings instead of manual concatenation.
  - `each` for simple, readable iteration in JSX when it fits the existing project style.

## References

- [VueUse in TSX](reference/vueuse-in-tsx.md) — useVModel, computedAsync, until
- [tslx in TSX](reference/tslx-in-tsx.md) — cls and each helpers
- [Composables in TSX](reference/composables-in-tsx.md) — custom composable patterns and examples
- [Vue vs React JSX](reference/vue-vs-react-jsx.md) — attribute and event differences
- [Props and types](reference/props-and-types.md) — props typing patterns and examples
- [Render functions](reference/render-functions.md) — render function guidelines and examples
- [Composition splitting](reference/composition-splitting.md) — splitting complex render logic
- [Conditional rendering](reference/conditional-rendering.md) — conditional rendering patterns
- [Refs and DOM](reference/refs-and-dom.md) — refs and DOM integration
- [Slots](reference/slots.md) — slot usage in JSX
