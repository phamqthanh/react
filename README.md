# REACT STICKY

Sticky element with sensible behaviour if the content is bigger than the viewport.

## USE A HOOKS

Sticky element with window

```tsx
import useAutoSticky from "@pqthanh/sticky";

const Page = () => {
  const [stickyRef] = useStickyBox<HTMLDivElement>({ offsetTop: 20, offsetBottom: 20 });

  return (
    <div className="row">
      <div ref={stickyRef} offsetTop={20} offsetBottom={20}>
        <div>Sidebar</div>
      </div>
      <div>Content</div>
    </div>
  );
};
```

Sticky to parent elemnt

```tsx
import React from "react";
import useAutoSticky from "@pqthanh/sticky";

const Page = () => {
  const parentScroll = React.useRef<HTMLDivElement>();
  const [stickyRef] = useStickyBox<HTMLDivElement>({
    offsetTop: 20,
    offsetBottom: 20,
    scroll: parentScroll.current,
  });

  return (
    <div ref={parentScroll} className="row">
      <div ref={stickyRef} offsetTop={20} offsetBottom={20}>
        <div>Sidebar</div>
      </div>
      <div>Content</div>
    </div>
  );
};
```
