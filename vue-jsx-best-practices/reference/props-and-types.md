---
title: Props and Types Reference
impact: MEDIUM
impactDescription: Options-based props with PropType and optional interfaces keep component contracts clear and type-safe.
type: efficiency
tags: [vue3, jsx, tsx, props, typescript, PropType, defineComponent, best-practice]
---
# Props and Types Reference

## Props and types example

```tsx
import type { PropType } from "vue";

interface MyProps {
  title: string;
  onConfirm?: (id: string) => void;
}

export default defineComponent({
  name: "ConfirmCard",
  props: {
    title: {
      type: String as PropType<string>,
    },
    onConfirm: {
      type: Function as PropType<(id: string) => void>,
    },
    // use a factory for default to avoid shared references
    defaultExpanded: {
      type: Boolean,
      default: () => true,
    },
  },
  setup(props) {
    return () => (
      <div class="confirm-card">
        {props.title}
      </div>
    );
  },
});
```

## Type annotation tips

- **Props:** Use an interface plus the options `props` and `PropType<>`, or type `props` in `setup(props: YourProps)` when it adds value.
- **Emits:** Declare with the options `emits: ["eventName"]`; for type-safe usage, wrap or assert `emit` at the call site.
- **Slot scope:** Define an interface for slot props and pass it to `slots.xxx?.({ ... })` or renderSlot args for type checking.
