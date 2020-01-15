// Gallery components logic is inspired from bootstrap carousel logic

const DATA_KEY = "aa.gallery";
const EVENT_KEY = `.${DATA_KEY}`;

const Event = {
  SLIDE: `slide${EVENT_KEY}`,
};

const ClassName = {
  GALLERY: "gallery",
  ACTIVE: "active",
  RIGHT: "gallery__item--right",
  LEFT: "gallery__item--left",
  NEXT: "gallery__item--next",
  PREV: "gallery__item--prev",
  ITEM: "gallery__item",
  M_LEFT: "gallery__item--m-left", // M for Middle
  M_RIGHT: "gallery__item--m-right",
};

const Selector = {
  ACTIVE_ITEM: ".active.gallery__item",
  NEXT_CONTROL: ".gallery__control[data-to=next]",
  PREV_CONTROL: ".gallery__control[data-to=prev]",
};

const Direction = {
  NEXT: "next",
  PREV: "prev",
  LEFT: "left",
  RIGHT: "right",
};

class Gallery {
  constructor(elm) {
    this.elm = elm;
    this.items = Array.from(elm.getElementsByClassName(ClassName.ITEM));
    this.nextControl = elm.querySelector(Selector.NEXT_CONTROL);
    this.prevControl = elm.querySelector(Selector.PREV_CONTROL);

    // event listeners
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.mediaQuery = this.mediaQuery.bind(this);
    this.addEventListener();
  }

  get activeElements() {
    return this.elm.getElementsByClassName(
      `${ClassName.ITEM} ${ClassName.ACTIVE}`
    );
  }

  getItemIndex(element) {
    return this.items.indexOf(element);
  }

  triggerSlideEvent(relatedTargetIndex, eventDirectionName = null) {
    const slideEvent = new CustomEvent(Event.SLIDE, {
      detail: {
        direction: eventDirectionName,
        to: relatedTargetIndex,
        from: this.activeElements[0],
      },
    });
    this.elm.dispatchEvent(slideEvent);
    return slideEvent;
  }

  slide(direction) {
    const activeElements = this.activeElements;
    let baseActive,
      delta,
      deltaM,
      directionalClassName,
      middleDirectoin,
      orderClassName,
      eventDirectionName;
    if (direction === Direction.PREV) {
      baseActive = activeElements[activeElements.length - 1];
      delta = -activeElements.length;
      deltaM = -activeElements.length / 2;

      directionalClassName = ClassName.RIGHT;
      middleDirectoin = ClassName.M_RIGHT;
      orderClassName = ClassName.PREV;
      eventDirectionName = Direction.PREV;
    } else {
      baseActive = activeElements[0];
      delta = activeElements.length;
      deltaM = activeElements.length / 2;

      directionalClassName = ClassName.LEFT;
      middleDirectoin = ClassName.M_LEFT;
      orderClassName = ClassName.NEXT;
      eventDirectionName = Direction.NEXT;
    }
    const baseIndex = this.getItemIndex(baseActive);
    const nextElement = this.items[baseIndex + delta];
    const nextIndex = this.getItemIndex(nextElement);
    // if there're only one active element, then middleElement will be undefined, so set it to null
    const middleElement = this.items[baseIndex + deltaM] || null;

    const slideEvent = this.triggerSlideEvent(nextIndex, eventDirectionName);
    if (slideEvent.defaultPrevented) {
      return;
    }
    this.isSliding = true;
    nextElement.classList.add(orderClassName);
    nextElement.offsetHeight; // reflow
    nextElement.classList.add(directionalClassName);
    if (middleElement) {
      middleElement.classList.add(middleDirectoin);
      middleElement.offsetHeight; // reflow
      middleElement.classList.remove(middleDirectoin);
    }
    baseActive.classList.add(directionalClassName);

    const eventListerner = () => {
      nextElement.className = `${ClassName.ITEM} ${ClassName.ACTIVE}`;
      if (middleElement)
        middleElement.className = `${ClassName.ITEM} ${ClassName.ACTIVE}`;
      baseActive.className = ClassName.ITEM;
      this.isSliding = false;
      baseActive.removeEventListener("transitionend", eventListerner);
    }
    baseActive.addEventListener("transitionend", eventListerner);
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

  handleNextClick(evt) {
    evt.preventDefault();
    this.next();
  }

  handlePrevClick(evt) {
    evt.preventDefault();
    this.prev();
  }

  mediaQuery() {
    const md = window.matchMedia("screen and (max-width: 768px)").matches;
    const activeElements = this.activeElements;
    const firstActive = activeElements[0];
    const firstIndex = this.getItemIndex(firstActive);
    if (md && activeElements.length > 1) {
      const secondActive = this.activeElements[1];
      secondActive.classList.remove(ClassName.ACTIVE);
      // for activating & disabling buttons
      this.triggerSlideEvent(firstIndex);
    } else if (!md && activeElements.length === 1) {
      const delta = firstIndex === this.items.length - 1 ? -1 : 1;
      const secondActive = this.items[firstIndex + delta];
      secondActive.classList.add(ClassName.ACTIVE);
      // for activating & disabling buttons
      const to =
        firstIndex === this.items.length - 1 || firstIndex === 0
          ? firstIndex
          : this.getItemIndex(secondActive);
      this.triggerSlideEvent(to);
    }
  }

  addEventListener() {
    this.nextControl.addEventListener("click", this.next);
    this.prevControl.addEventListener("click", this.prev);

    window.addEventListener("load", this.mediaQuery);
    window.addEventListener("resize", this.mediaQuery);

    this.elm.addEventListener(Event.SLIDE, evt => {
      const indexLength = this.items.length - 1;

      if (evt.detail.to !== 0 && this.prevControl.hasAttribute("disabled")) {
        this.prevControl.removeAttribute("disabled");
      } else if (
        evt.detail.to !== indexLength &&
        this.nextControl.hasAttribute("disabled")
      ) {
        this.nextControl.removeAttribute("disabled");
      }

      if (evt.detail.to === 0) {
        this.prevControl.setAttribute("disabled", "");
      } else if (evt.detail.to === indexLength) {
        this.nextControl.setAttribute("disabled", "");
      }
    });
  }
}

const gallery = document.getElementsByClassName(ClassName.GALLERY)[0];
if (gallery) gallery.logic = new Gallery(gallery);
