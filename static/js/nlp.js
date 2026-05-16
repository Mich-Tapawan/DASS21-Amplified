document.addEventListener("DOMContentLoaded", () => {
  const textArea = document.getElementById("user-input");
  const analyzeBtn = document.getElementById("analyze-btn");
  const resetBtn = document.getElementById("reset");
  const backBtn = document.getElementById("nlp-back-btn");
  const inputView = document.getElementById("nlp-input-view");
  const resultsView = document.getElementById("nlp-results-view");
  const symptomsList = document.getElementById("symptoms-list");
  const depressionCount = document.getElementById("depression-count");
  const anxietyCount = document.getElementById("anxiety-count");
  const stressCount = document.getElementById("stress-count");

  const CATEGORIES = ["Depression", "Anxiety", "Stress"];

  function showInputView() {
    resultsView.hidden = true;
    inputView.hidden = false;
  }

  function showResultsView() {
    inputView.hidden = true;
    resultsView.hidden = false;
  }

  function clearResults() {
    depressionCount.textContent = "0";
    anxietyCount.textContent = "0";
    stressCount.textContent = "0";
    symptomsList.innerHTML = "";
  }

  analyzeBtn.addEventListener("click", () => {
    const userText = textArea.value.trim();
    if (userText === "") {
      alert("Please enter text before submitting");
      return;
    }
    processText(userText);
  });

  backBtn.addEventListener("click", () => {
    showInputView();
  });

  resetBtn.addEventListener("click", () => {
    textArea.value = "";
    clearResults();
    showInputView();
  });

  function renderResults(data) {
    const items = data.matched_items || [];

    if (items.length === 0) {
      symptomsList.innerHTML =
        '<p class="symptoms-empty">No DASS-21-related themes were matched in your text.</p>';
    } else {
      const sections = CATEGORIES.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (categoryItems.length === 0) {
          return "";
        }
        const listItems = categoryItems
          .map(
            (item) =>
              `<li><span class="symptoms-item__label">${escapeHtml(item.label)}</span>` +
              (item.evidence
                ? `<span class="symptoms-item__evidence">Matched: “${escapeHtml(item.evidence)}”</span>`
                : "") +
              `</li>`
          )
          .join("");
        return (
          `<section class="symptoms-group">` +
          `<h4 class="symptoms-group__title">${category}</h4>` +
          `<ul class="symptoms-group__list">${listItems}</ul>` +
          `</section>`
        );
      }).join("");
      symptomsList.innerHTML = sections;
    }

    depressionCount.textContent = String(data.symptom_counts?.Depression ?? 0);
    anxietyCount.textContent = String(data.symptom_counts?.Anxiety ?? 0);
    stressCount.textContent = String(data.symptom_counts?.Stress ?? 0);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  async function processText(text) {
    setButtonLoading(analyzeBtn, true, { loadingLabel: "Analyzing…" });

    try {
      const response = await fetch("/processText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      renderResults(data);
      showResultsView();
    } catch (error) {
      console.error("Error processing text: ", error);
      clearResults();
      symptomsList.innerHTML = `<p class="symptoms-error">${escapeHtml(
        error.message || "Something went wrong while analyzing your text."
      )}</p>`;
      showResultsView();
    } finally {
      await clearButtonLoading(analyzeBtn, { minDuration: 1000 });
    }
  }
});
