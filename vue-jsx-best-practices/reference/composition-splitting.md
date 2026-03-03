---
title: Composition Splitting (extract render helpers)
impact: LOW
impactDescription: Splitting complex render logic into plain functions improves readability and keeps the main render function simple.
type: efficiency
tags: [vue3, jsx, tsx, render-function, composition, best-practice]
---
# Composition Splitting Reference

## Composition splitting example

```tsx
function renderHeader() {
  const content = props.header ?? renderSlot(slots, "header", {}, () => [<div />]);
  if (content === false) return undefined;
  return <div class="header">{content}</div>;
}

return () => (
  <div>
    {renderHeader()}
    <div class="body">{renderSlot(slots, "default")}</div>
  </div>
);
```
