---
title: Slots (slot object as children)
impact: MEDIUM
impactDescription: Passing slot functions as children keeps JSX consistent and avoids v-slots; consume slots from setup context.
type: efficiency
tags: [vue3, jsx, tsx, slots, setup, best-practice]
---
# Slots Reference

## Examples

**Bad** — `v-slots` prop (this skill uses slot object as children):

```tsx
<MyDialog
  v-slots={{
    header: () => <div class="header">Title</div>,
    default: () => <div class="body">Content</div>,
  }}
/>
```

**Good** — slot object as **children** (each slot is a function):

```tsx
<MyDialog>
  {{
    header() {
      return <div class="header">Title</div>;
    },
    default() {
      return <div class="body">Content</div>;
    },
  }}
</MyDialog>
```
Use the object form above if the component expects `header` and `default` slots.

**Consuming slots inside the component:**

```tsx
setup(props, { slots }) {
  return () => (
    <div>
      <header>
        {slots.header?.() ?? <span>Default title</span>}
      </header>
      <main>
        {slots.default?.()}
      </main>
    </div>
  );
}
```
