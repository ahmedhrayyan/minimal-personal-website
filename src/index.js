// style
import "./style/main.scss";

// polyfill
import "custom-event-polyfill";

// components
import "./js/gallery.js";
import "./js/icons.js";
import "./js/form-validation.js";
import "./js/carousel.js";
import "./js/modal.js";

// enable focus indicator when pressing tab
document.addEventListener("keydown", evt => {
  if (evt.keyCode === 9 && document.body.hasAttribute("data-no-tab")) {
    document.body.removeAttribute("data-no-tab");
  }
});

// disable focus indicator when clicking
document.addEventListener("mousedown", evt => {
  if (evt.button === 0 && !document.body.hasAttribute("data-no-tab")) {
    document.body.setAttribute("data-no-tab", "");
  }
});
