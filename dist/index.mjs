import { useRef, useEffect } from 'react';

var ScrollType;
(function (ScrollType) {
    ScrollType[ScrollType["UP"] = 0] = "UP";
    ScrollType[ScrollType["DOWN"] = 1] = "DOWN";
})(ScrollType || (ScrollType = {}));
const AutoSticky = () => {
    const ref = useRef(null);
    useEffect(() => {
        let lastOffsetTop = 0;
        let type = ScrollType.UP;
        const options = {
            offsetTop: 100,
            offsetBottom: 0,
        };
        const target = ref.current;
        const body = window.document.querySelector("body");
        const block = document.createElement("div");
        target?.before(block);
        function setBlockHeight(height) {
            block.style.height = `${height}px`;
        }
        function onScrollDown(el) {
            if (!target || lastOffsetTop >= el.scrollTop)
                return;
            const { top } = block.getBoundingClientRect();
            if (top > 0)
                setBlockHeight(0);
            else if (top + target.scrollHeight >= el.clientHeight) {
                setBlockHeight(Math.abs(block.getBoundingClientRect().top) + options.offsetTop);
            }
            target.style.top = `${el.clientHeight - target.scrollHeight}px`;
            target.style.bottom = "";
            type = ScrollType.DOWN;
        }
        function onScrollUp(el) {
            if (!target || lastOffsetTop <= el.scrollTop)
                return;
            setBlockHeight(target.offsetTop);
            target.style.bottom =
                el.clientHeight - target.scrollHeight - options.offsetTop + "px";
            target.style.top = "";
            type = ScrollType.UP;
        }
        function handleScroll() {
            if (!target)
                return;
            if (target.scrollHeight <= this.clientHeight) {
                body?.removeEventListener("scroll", handleScroll);
                return (target.style.top = options.offsetTop + "px");
            }
            switch (type) {
                case ScrollType.UP:
                    onScrollDown(this);
                    break;
                case ScrollType.DOWN:
                    onScrollUp(this);
                    break;
            }
            lastOffsetTop = this.scrollTop;
        }
        body?.addEventListener("scroll", handleScroll, false);
        if (target && body)
            onScrollDown(body);
        return () => {
            body?.removeEventListener("scroll", handleScroll);
            block.remove();
        };
    }, []);
    useEffect(() => {
        const target = ref.current;
        if (target) {
            const block = document.createElement("div");
            target.before(block);
            return () => {
                block.remove();
            };
        }
    }, []);
    return { ref };
};

export { AutoSticky, ScrollType };
//# sourceMappingURL=index.mjs.map
