const ESCAPE_KEYCODE = 27;
const TAB_KEYCODE = 9;

const ClassName = {
  BACKDROP: "modal__backdrop",
  OPEN: "modal--open",
  FADE: "fade",
  SHOW: "show",
  SCROLLBAR_MEASURER: "modal-scrollbar-measure",
};

const Selector = {
  DIALOG: ".modal__dialog",
  MODAL_BG: ".modal__bg",
  DATA_TOGGLE: '[data-toggle="modal"]',
  DATA_DISMISS: '[data-dismiss="modal"]',
};

class Modal {
  constructor(elm) {
    this.elm = elm;
    this.isShown = false;
    this.tempData = {};
    this.bg = elm.querySelector(Selector.MODAL_BG);
    this.dialog = elm.querySelector(Selector.DIALOG);
    this.dismissBtns = elm.querySelectorAll(Selector.DATA_DISMISS);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.addEventListeners();
  }
  show() {
    if (this.isShown) {
      return;
    }
    this.activeElement = document.activeElement; // saving active element before activating the modal
    this.checkScrollbar();
    this.setScrollbarWidth();
    this.isShown = true;

    this.elm.style.display = "block";
    this.elm.scrollTop = 0;
    const dialogHeight = this.dialog.offsetHeight + this.dialog.offsetTop * 2; // reflow
    this.bg.style.height =
      dialogHeight > window.innerHeight ? dialogHeight + "px" : ""; // setting bg height if dialog is scrolling
    this.elm.classList.add(ClassName.SHOW);
    this.elm.focus();
  }
  hide() {
    if (!this.isShown) {
      return;
    }
    const eventlistener = () => {
      this.isShown = false;
      this.elm.style.display = "none";
      this.resetSrollbarWidth();
      this.activeElement.focus();
      this.bg.removeEventListener("transitionend", eventlistener);
    };

    this.elm.classList.remove(ClassName.SHOW);
    // did it on bg because there are another transtions in the modal itself ( in buttons for example )
    this.bg.addEventListener("transitionend", eventlistener);
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
      // saving html scrollPosition
      this.tempData.scrollTop = document.documentElement.scrollTop;
      // Adjust body padding
      const pR = getComputedStyle(document.body).paddingRight;
      this.tempData.bodyPaddingRight = !pR || pR === "0px" ? "" : pR;
      document.body.style.paddingRight = this.scrollbarWidth + "px";
      document.body.classList.add(ClassName.OPEN);
    }
  }

  resetSrollbarWidth() {
    // Restore body padding
    if (this.isBodyOverflowing) {
      document.documentElement.scrollTop = this.tempData.scrollTop;
      document.body.style.paddingRight = this.tempData.bodyPaddingRight;
      document.body.classList.remove(ClassName.OPEN);
    }
  }

  handleKeydown(evt) {
    if (evt.keyCode === ESCAPE_KEYCODE) {
      this.hide();

    } else if (evt.keyCode === TAB_KEYCODE) {
      // tabKey trap inside the modal
      const focusableElementsString =
        'a[href], area[href], input:not([disable]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
      let focusableElements = this.elm.querySelectorAll(
        focusableElementsString
      );
      const firstTabStop = focusableElements[0];
      const lastTabStop = focusableElements[focusableElements.length - 1];

      // shift tab
      if (evt.shiftKey) {
        if (document.activeElement === firstTabStop) {
          evt.preventDefault();
          lastTabStop.focus();
        } else if (document.activeElement === this.elm) {
          evt.preventDefault(); // force it to go inside the trap
        }

      } else {
        if (document.activeElement === lastTabStop) {
          evt.preventDefault();
          firstTabStop.focus();
        }
      }
    }
  }

  addEventListeners() {
    if (this.dismissBtns && this.dismissBtns.length > 0) {
      for (const dismissBtn of this.dismissBtns) {
        dismissBtn.addEventListener("click", this.hide);
      }
    }
    this.bg.addEventListener("click", () => {
      this.hide();
    });
    this.elm.addEventListener("keydown", this.handleKeydown);
  }
}

const modals = document.getElementsByClassName("modal");
if (modals && modals.length > 0) {
  for (const modal of modals) {
    modal.logic = new Modal(modal);
  }
}

const toggles = document.querySelectorAll(Selector.DATA_TOGGLE);
if (toggles && toggles.length > 0) {
  for (const toggleBtn of toggles) {
    const targetElm = document.getElementById(
      toggleBtn.getAttribute("data-target")
    );
    targetElm.logic.checkScrollbar();
    if (targetElm) {
      toggleBtn.addEventListener("click", evt => {
        if (evt.target.nodeName === "A") {
          evt.preventDefault();
        }
        targetElm.logic.show();
      });
    }
  }
}
