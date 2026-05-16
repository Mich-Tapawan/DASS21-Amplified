/**
 * Toggle loading state on a button (spinner + label + disabled).
 */
function setButtonLoading(button, isLoading, options = {}) {
  const { loadingLabel = "Loading…" } = options;
  const labelEl = button.querySelector(".btn__label");

  if (!button.dataset.label && labelEl) {
    button.dataset.label = labelEl.textContent.trim();
  }

  if (isLoading) {
    button.dataset.loadingStarted = String(Date.now());
    button.classList.add("is-loading");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.setAttribute("aria-disabled", "true");

    if (!button.querySelector(".btn__spinner")) {
      const spinner = document.createElement("span");
      spinner.className = "btn__spinner";
      spinner.setAttribute("aria-hidden", "true");
      button.insertBefore(spinner, button.firstChild);
    }

    if (labelEl) {
      labelEl.textContent = loadingLabel;
    }
  } else {
    button.classList.remove("is-loading");
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.removeAttribute("aria-disabled");
    delete button.dataset.loadingStarted;

    const spinner = button.querySelector(".btn__spinner");
    if (spinner) {
      spinner.remove();
    }

    if (labelEl && button.dataset.label) {
      labelEl.textContent = button.dataset.label;
    }
  }
}

/**
 * End loading after at least minDuration ms (from when loading started).
 */
async function clearButtonLoading(button, options = {}) {
  const { minDuration = 0 } = options;
  const started = Number(button.dataset.loadingStarted || Date.now());
  const remaining = Math.max(0, minDuration - (Date.now() - started));
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
  setButtonLoading(button, false);
}
