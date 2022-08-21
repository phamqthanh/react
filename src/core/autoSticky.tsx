export enum ScrollType {
  UP,
  DOWN,
}

export interface Options {
  offsetTop?: number;
  offsetBottom?: number;
  scroll?: HTMLElement;
}
export default function autoSticky(target: HTMLElement, options?: Options) {
  let lastOffsetTop = 0;
  let type = ScrollType.UP;

  const offsetTop = options?.offsetTop || 0;

  const scroll = options?.scroll ?? window;
  const block = document.createElement("div");
  block.id = "__sticky-block";
  target?.before(block);

  function setBlockHeight(height: number) {
    block.style.height = `${Math.max(0, height)}px`;
  }

  /**
   * @deprecated not fixed yet
   */
  function onScrollDown(el: HTMLElement) {
    if (!target || lastOffsetTop > el.scrollTop) return;
    const { top } = block.getBoundingClientRect();
    const blockOffsetTop = top + window.scrollY;

    const targetStickPosition = target.scrollHeight + blockOffsetTop - window.innerHeight;
    // Check if block offsetTop is lower than scroller top
    // If so, set block height to anchor height
    setBlockHeight(target.offsetTop - block.offsetHeight);
    target.style.top = `-${targetStickPosition}px`;
    target.style.bottom = "";
    type = ScrollType.DOWN;
  }

  function onScrollDownWindow() {
    if (!target || lastOffsetTop > window.scrollY) return;
    // const { top } = block.getBoundingClientRect();

    // Calculate block height base on relative parent or window;
    const blockHeight = target.offsetTop - block.offsetTop;

    // Check if block offsetTop is lower than scroller top
    // If so, set block height to anchor height
    const targetStickPosition = target.scrollHeight - window.innerHeight;
    setBlockHeight(blockHeight);

    target.style.top = `-${targetStickPosition}px`; // this value won't change
    target.style.bottom = "initial";
    type = ScrollType.DOWN;
  }

  /**
   * @deprecated not fixed yet
   */
  function onScrollUp(el: HTMLElement) {
    if (!target || lastOffsetTop <= el.scrollTop) return;

    setBlockHeight(target.offsetTop - block.offsetHeight);
    target.style.bottom = el.clientHeight - target.scrollHeight - offsetTop + "px";
    target.style.top = "intital";
    type = ScrollType.UP;
  }

  function onScrollUpWindow() {
    if (!target || lastOffsetTop <= window.scrollY) return;

    setBlockHeight(target.offsetTop - block.offsetTop);
    target.style.bottom = window.innerHeight - target.scrollHeight - offsetTop + "px";
    target.style.top = "initial";
    type = ScrollType.UP;
  }

  function handleScroll(this: HTMLElement | Window) {
    if (!target) return;
    if (this instanceof Window) {
      if (target.scrollHeight <= this.innerHeight) {
        window.removeEventListener("scroll", handleScroll);
        return (target.style.top = offsetTop + "px");
      }
      switch (type) {
        case ScrollType.UP:
          onScrollDownWindow();
          break;
        case ScrollType.DOWN:
          onScrollUpWindow();
          break;
        default:
          break;
      }
      lastOffsetTop = this.scrollY;
    } else {
      if (target.scrollHeight <= this.clientHeight) {
        window.removeEventListener("scroll", handleScroll);
        return (target.style.top = offsetTop + "px");
      }

      switch (type) {
        case ScrollType.UP:
          onScrollDown(this);
          break;
        case ScrollType.DOWN:
          onScrollUp(this);
          break;
        default:
          break;
      }
      lastOffsetTop = this.scrollTop;
    }
  }
  scroll.addEventListener("scroll", handleScroll, false);
  if (target) handleScroll.bind(scroll)();
  return () => {
    scroll.removeEventListener("scroll", handleScroll);
    block.remove();
  };
}
