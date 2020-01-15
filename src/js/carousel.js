const DATA_KEY = "aa.carousel";
const EVENT_KEY = `.${DATA_KEY}`;

const Event = {
  SLIDE: `slide${EVENT_KEY}`,
  SLID: `slid${EVENT_KEY}`,
};

const ClassName = {
  CAROUSEL: "carousel",
  RUNNING: "is-running",
  ACTIVE: "active",
  BOTTOM: "carousel__item--bottom",
  TOP: "carousel__item--top",
  NEXT: "carousel__item--next",
  PREV: "carousel__item--prev",
  ITEM: "carousel__item",
  NAV: "carousel__nav",
  NAV_ITEM: "carousel__nav__item",
  MAIN_HEADING: "main-heading",
  MAIN_HEADING_EP: "main-heading--end-point",
  MAIN_HEADING_TRS: "main-heading--transition",
  SCROLLBAR_MEASURER: "modal-scrollbar-measure",
};

const Selector = {
  ACTIVE: ".active",
  ACTIVE_ITEM: ".active.carousel__item",
  ITEM: ".carousel__item",
  NAV: ".carousel__nav",
  NAV_ITEM: ".carousel__nav__item",
  MAIN_HEADING: ".main-heading",
};

const Direction = {
  NEXT: "next",
  PREV: "prev",
  TOP: "top",
  BOTTOM: "right",
};

class Carousel {
  constructor(elm) {
    this.elm = elm;
    this.isBodyOverflowing = false;
    this.tempData = {};
    this.items = Array.from(elm.getElementsByClassName(ClassName.ITEM));
    this.nav = document.querySelector(Selector.NAV);
    this.navItems = Array.from(
      this.nav.getElementsByClassName(ClassName.NAV_ITEM)
    );
    // event listeners
    this.addEventListeners();
  }

  get activeElement() {
    return this.elm.querySelector(Selector.ACTIVE_ITEM);
  }

  getItemIndex(element) {
    return this.items.indexOf(element);
  }

  getMainHeading(element) {
    return element.querySelector(Selector.MAIN_HEADING);
  }

  triggerSlideEvent(relatedTarget, eventDirectionName) {
    const targetIndex = this.getItemIndex(relatedTarget);
    const fromIndex = this.getItemIndex(this.activeElement);
    const slideEvent = new CustomEvent(Event.SLIDE, {
      detail: {
        relatedTarget,
        direction: eventDirectionName,
        from: fromIndex,
        to: targetIndex,
      },
    });
    this.elm.dispatchEvent(slideEvent);
    return slideEvent;
  }

  slide(direction, element) {
    const activeElement = this.activeElement;
    const activeElementIndex = this.getItemIndex(activeElement);

    const delta = direction === Direction.PREV ? -1 : 1;
    const nextElement =
      element || (activeElement && this.items[activeElementIndex + delta]);
    const nextElementIndex = this.getItemIndex(nextElement);

    // headings
    const activeHeading = this.getMainHeading(activeElement);
    const nextHeading = this.getMainHeading(nextElement);

    let directionalClassName;
    let orderClassName;
    let eventDirectionName;

    if (direction === Direction.NEXT) {
      directionalClassName = ClassName.TOP;
      orderClassName = ClassName.NEXT;
      eventDirectionName = Direction.TOP;
    } else {
      directionalClassName = ClassName.BOTTOM;
      orderClassName = ClassName.PREV;
      eventDirectionName = Direction.BOTTOM;
    }

    const slideEvent = this.triggerSlideEvent(nextElement, eventDirectionName);
    if (slideEvent.defaultPrevented) {
      return;
    }
    this.isSliding = true;

    const slidEvent = new CustomEvent(Event.SLID, {
      detail: {
        relatedTarget: nextElement,
        direction: eventDirectionName,
        from: activeElementIndex,
        to: nextElementIndex,
      },
    });

    this.checkScrollbar();
    this.setScrollbarWidth();
    // scrollTop in all cases
    document.documentElement.scrollTop = 0;

    this.navItems[nextElementIndex].setAttribute("data-active", "");
    this.navItems[activeElementIndex].removeAttribute("data-active");
    nextElement.classList.add(orderClassName);
    nextElement.offsetHeight; // reflow

    activeElement.classList.add(directionalClassName);
    nextElement.classList.add(directionalClassName);
    nextHeading.classList.add(ClassName.MAIN_HEADING_EP); // triger heading transition

    const eventListener = () => {
      this.resetSrollbarWidth();

      this.elm.focus();
      nextElement.className = `${ClassName.ITEM} ${ClassName.ACTIVE}`;
      activeElement.className = ClassName.ITEM;
      activeHeading.className = ClassName.MAIN_HEADING + ' ' + ClassName.MAIN_HEADING_TRS; // reset main heading

      this.isSliding = false;

      window.setTimeout(() => {
        this.elm.dispatchEvent(slidEvent);
      }, 0);

      activeElement.removeEventListener("transitionend", eventListener);
    };

    activeElement.addEventListener("transitionend", eventListener);
  }

  next() {
    if (!this.isSliding) {
      this.slide(Direction.NEXT);
    }
  }

  prev() {
    if (!this.isSliding) {
      this.slide(Direction.PREV);
    }
  }

  to(index) {
    const activeIndex = this.getItemIndex(this.activeElement);
    if (index > this.items.length - 1 || index < 0) {
      return;
    }

    if (this.isSliding) {
      const eventListener = () => {
        this.to(index);
        this.elm.removeEventListener(Event.SLID, eventListener); // call it only once
      };

      this.elm.addEventListener(Event.SLID, eventListener);

      return;
    }

    // the condition below should be set here to not collapse with the above conditions
    if (activeIndex === index) {
      return;
    }

    const direction = index > activeIndex ? Direction.NEXT : Direction.PREV;
    this.slide(direction, this.items[index]);
  }

  checkScrollbar() {
    const rect = document.body.getBoundingClientRect();
    this.isBodyOverflowing = rect.left + rect.right < window.innerWidth;
    this.scrollbarWidth = this.getScrollbarWidth();
  }

  getScrollbarWidth() {
    // thx d.walsh
    const scrollDiv = document.createElement("div");
    scrollDiv.className = ClassName.SCROLLBAR_MEASURER;
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  }

  setScrollbarWidth() {
    if (this.isBodyOverflowing) {
      // Adjust body padding
      const pR = getComputedStyle(document.body).paddingRight;
      this.tempData.bodyPaddingRight = !pR || pR === "0px" ? "" : pR;
      document.body.style.paddingRight = this.scrollbarWidth + "px";
      document.body.classList.add(ClassName.RUNNING);
    }
  }

  resetSrollbarWidth() {
    // Restore body padding
    if (this.isBodyOverflowing) {
      // document.documentElement.scrollTop = this.tempData.scrollTop;
      document.body.style.paddingRight = this.tempData.bodyPaddingRight;
      document.body.classList.remove(ClassName.RUNNING);
    }
  }

  addEventListeners() {
    for (let i = 0; i < this.navItems.length; i++) {
      this.navItems[i].addEventListener("click", () => {
        this.to(i);
      });
    }
  }
}

const carousel = document.getElementsByClassName(ClassName.CAROUSEL)[0];
if (carousel)
  new Carousel(carousel);
