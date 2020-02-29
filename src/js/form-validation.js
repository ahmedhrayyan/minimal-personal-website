const ClassName = {
  ALERT: "form__validation-alert",
};
const DataAttr = {
  NEED_VALIDATION: "data-need-validation",
  VALIDATED_FORM: "data-was-validated",
};
const Selector = {
  ALERT: `.${ClassName.ALERT}`,
  NEED_VALIDATION: `form[${DataAttr.NEED_VALIDATION}]`,
  VALIDATED_FORM: `form[${DataAttr.VALIDATED}]`,
  INVALID_INPUT: "input:invalid, textarea:invalid",
};

class Form {
  constructor(elm) {
    this.elm = elm;
    elm.addEventListener("submit", this.handleSubmit.bind(this));
  }

  get invalidInput() {
    return this.elm.querySelector(Selector.INVALID_INPUT);
  }

  createAlert(type = null, topPos) {
    const alert = document.createElement("span");
    alert.setAttribute("role", "alert");
    alert.className = ClassName.ALERT;
    alert.style.top = topPos; // position the alert vertically to the invalid input
    // setting textContent
    if (type) {
      alert.textContent = this.elm.hasAttribute("data-invalid-feedback")
        ? this.elm.getAttribute("data-invalid-feedback")
        : "Please enter a valid " + type;
    } else {
      alert.textContent = this.elm.hasAttribute("data-empty-feedback")
        ? this.elm.getAttribute("data-empty-feedback")
        : "Please fill out this field";
    }
    return alert;
  }

  removeAlert() {
    const alert = this.elm.querySelector(Selector.ALERT);
    if (alert) {
      this.elm.removeChild(alert);
      // clearing timeout and eventlistener which have been mounted from submiting the form
      clearTimeout(this.timeoutId);
      this.invalidInput.removeEventListener("input", this.handleInput);
    }
  }

  handleInput(evt, oldVal) {
    if (evt.target.value !== oldVal) {
      this.removeAlert();
    }
  }

  handleSubmit(evt) {
    if (!this.elm.checkValidity()) {
      evt.preventDefault();
      // select the first invalid input
      const invalidInput = this.invalidInput;
      this.removeAlert(); // removing the old alert if it exists

      // creating & pushing the alert
      const type = invalidInput.value === "" ? null : invalidInput.type;
      // note: the line of code below only possible cuz the parent container (the form) has position: relative rule
      const invalidInputTopPos =
        invalidInput.offsetTop + invalidInput.offsetHeight + "px";
      const alert = this.createAlert(type, invalidInputTopPos);
      evt.target.appendChild(alert);
      invalidInput.focus();

      // remove the alert when the user start inputing || after 2.5 seconds
      const oldVal = invalidInput.value; // prevent IE from firing input event when the value is not changed. see https://tinyurl.com/yxt9ax8d
      invalidInput.addEventListener("input", evt => {
        this.handleInput(evt, oldVal);
      });

      this.timeoutId = window.setTimeout(() => {
        this.removeAlert();
      }, 2500);

      this.elm.setAttribute(DataAttr.VALIDATED_FORM, ""); // to activate invalid inputs styling
    } else {
      evt.preventDefault();
      evt.target.removeAttribute(DataAttr.VALIDATED_FORM); // remove the attribute incase it was added by the logic above
      document.getElementById("no-contact-form").logic.show();
    }
  }
}

const forms = document.querySelectorAll(Selector.NEED_VALIDATION);
if (forms.length > 0) {
  for (const form of forms) {
    new Form(form);
  }
}
