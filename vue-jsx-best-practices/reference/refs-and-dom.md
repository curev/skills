---
title: Refs and DOM (shallowRef, function refs)
impact: MEDIUM
impactDescription: Prefer shallowRef for DOM/component refs and function refs for dynamic lists to avoid unnecessary reactivity and ref leaks.
type: efficiency
tags: [vue3, jsx, tsx, ref, shallowRef, dom, best-practice]
---
# Refs and DOM Reference

## Refs and DOM in detail

- When holding a DOM element or component instance, prefer `shallowRef` over `ref`, for example:

```tsx
const elRef = shallowRef<HTMLElement | null>(null);

onMounted(() => {
  if (!elRef.value) return;
  // initialize DOM-dependent third-party library here
});
```

- For multiple refs or dynamic refs, use the function form:

```tsx
const itemRefs = shallowRef<HTMLElement[]>([]);

return () => (
  <ul>
    {items.value.map((item, index) => (
      <li
        key={item.id}
        ref={(el) => {
          if (el) {
            itemRefs.value[index] = el;
          }
        }}
      >
        {item.label}
      </li>
    ))}
  </ul>
);
```
