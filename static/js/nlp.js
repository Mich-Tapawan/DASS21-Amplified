document.addEventListener("DOMContentLoaded", () => {
  const textArea = document.getElementById("user-input");
  const analyzeBtn = document.getElementById("analyze-btn");
  const resetBtn = document.getElementById("reset");
  const symptomsList = document.getElementById("symptoms-list");
  const depressionCount = document.getElementById("depression-count");
  const anxietyCount = document.getElementById("anxiety-count");
  const stressCount = document.getElementById("stress-count");

  analyzeBtn.addEventListener("click", () => {
    const userText = textArea.value.trim();
    if (userText === "") {
      alert("Please enter text before submitting");
      return;
    }
    processText(userText);
  });

  resetBtn.addEventListener("click", () => {
    depressionCount.innerHTML = "0";
    anxietyCount.innerHTML = "0";
    stressCount.innerHTML = "0";
    symptomsList.innerHTML = "";
    textArea.value = "";
  });

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

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const formattedSymptoms = [];
      for (const [category, symptoms] of Object.entries(
        data.matched_symptoms || {}
      )) {
        symptoms.forEach((symptom) => {
          formattedSymptoms.push(`${symptom} (${category})`);
        });
      }
      symptomsList.innerHTML =
        formattedSymptoms.length > 0
          ? formattedSymptoms.join(", ")
          : "No DASS-21 symptoms were matched in your text.";

      depressionCount.innerHTML = data.symptom_counts?.Depression ?? 0;
      anxietyCount.innerHTML = data.symptom_counts?.Anxiety ?? 0;
      stressCount.innerHTML = data.symptom_counts?.Stress ?? 0;
    } catch (error) {
      console.error("Error processing text: ", error);
      symptomsList.innerHTML =
        "Something went wrong while analyzing your text. Please try again.";
    } finally {
      setButtonLoading(analyzeBtn, false);
    }
  }
});
