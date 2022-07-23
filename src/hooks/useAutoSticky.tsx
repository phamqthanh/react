import React, { useEffect, useLayoutEffect, useRef } from "react";
import autoSticky, { Options } from "../core/autoSticky";

export function useAutoSticky<T extends Element>(options?: Options): [React.RefObject<T>] {
  const element = useRef<T>(null);
  useEffect(() => {
    if (element.current instanceof HTMLElement) return autoSticky(element.current, options);
  }, [options]);

  return [element];
}

export default useAutoSticky;
