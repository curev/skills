---
title: Conditional Rendering (v-show, !!condition, complex conditions)
impact: MEDIUM
impactDescription: Prefer v-show for visibility and !!condition for non-boolean checks to avoid unnecessary unmounts and accidental rendering of 0 or "".
type: efficiency
tags: [vue3, jsx, tsx, v-show, conditional-rendering, best-practice]
---
# Conditional Rendering Reference

**Rule of thumb:** For simple show/hide, use **`v-show`**; do not use conditionals (`&&`, ternary, or multiple returns). Use conditionals only when choosing between different UI branches (e.g. different components or structure).

## v-show for visibility; conditionals only for different UI

**Bad** — ternary for simple show/hide (unnecessary unmount/remount, more noise):

```tsx
return () => (
  <div>
    {isOpen.value ? <div class="panel">Content</div> : null}
  </div>
);
```

**Good** — `v-show` for visibility (element stays in DOM, only display toggles):

```tsx
return () => (
  <div>
    <div class="panel" v-show={isOpen.value}>Content</div>
  </div>
);
```

**Good** — ternary when the two branches are genuinely different UI:

```tsx
return () => (
  <div>
    {mode.value === "edit" ? <EditForm /> : <Preview />}
  </div>
);
```

---

## Non-boolean conditions: use `!!condition`

In JSX, `{condition && <Node />}` can render the value of `condition` when it is falsy but not `false`/`null`/`undefined` (e.g. `0` or `""`). Always coerce to boolean with **`!!condition`** when the condition is not already a boolean.

**Bad** — `count` is a number; when `count` is 0, `0` is rendered:

```tsx
return () => (
  <div>
    {count.value && <Badge>{count.value}</Badge>}
  </div>
);
```

**Good** — coerce to boolean so nothing is rendered when count is 0:

```tsx
return () => (
  <div>
    {!!count.value && <Badge>{count.value}</Badge>}
  </div>
);
```

**Bad** — same issue with optional string:

```tsx
{message.value && <span>{message.value}</span>}
// Renders "" when message is ""
```

**Good**:

```tsx
{!!message.value && <span>{message.value}</span>}
```

---

## Complex conditions: extract to a function

Keep JSX readable by moving complex conditionals into a plain function that returns a boolean or VNode.

**Bad** — long inline condition in JSX:

```tsx
return () => (
  <div>
    {user.value?.role === "admin" && settings.value?.showPanel && !loading.value && (
      <AdminPanel />
    )}
  </div>
);
```

**Good** — logic in a function, simple call in JSX:

```tsx
function shouldShowAdminPanel() {
  if (user.value?.role !== "admin") return false;
  if (!settings.value?.showPanel) return false;
  if (loading.value) return false;
  return true;
}

return () => (
  <div>
    {!!shouldShowAdminPanel() && <AdminPanel />}
  </div>
);
```

Or return the VNode from the helper:

```tsx
function renderAdminPanel() {
  if (user.value?.role !== "admin" || !settings.value?.showPanel || loading.value) {
    return null;
  }
  return <AdminPanel />;
}

return () => (
  <div>
    {renderAdminPanel()}
  </div>
);
```
