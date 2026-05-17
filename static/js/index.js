const SEVERITY_RANK = {
  None: 0,
  Normal: 0,
  Mild: 1,
  Moderate: 2,
  Severe: 3,
  "Extremely Severe": 4,
};

const SCALE_BLURBS = {
  depression: {
    Mild: "You reported some low mood and loss of interest that are worth monitoring.",
    Moderate:
      "Your answers suggest a noticeable level of low mood, low energy, or negative self-view.",
    Severe:
      "Your answers point to substantial depressive symptoms that may be affecting daily life.",
    "Extremely Severe":
      "Your answers indicate very intense depressive symptoms. Professional support is strongly encouraged.",
  },
  anxiety: {
    Mild: "You reported some worry or physical anxiety signs that are worth keeping an eye on.",
    Moderate:
      "Your answers suggest noticeable anxiety, worry, tension, or bodily symptoms that may be hard to manage alone.",
    Severe:
      "Your answers point to strong anxiety that may be interfering with comfort and daily activities.",
    "Extremely Severe":
      "Your answers indicate very intense anxiety. Speaking with a professional can help you feel safer and more in control.",
  },
  stress: {
    Mild: "You reported some tension and irritability that are worth monitoring.",
    Moderate:
      "Your answers suggest you have been finding it difficult to relax and may be overreacting to pressure.",
    Severe:
      "Your answers point to high stress and agitation that may be wearing you down.",
    "Extremely Severe":
      "Your answers indicate very high stress. Support can help you recover balance and coping skills.",
  },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function severityRank(severity) {
  return SEVERITY_RANK[severity] ?? 0;
}

function computeFutureSeverity(score) {
  const n = Number(score);
  if (n <= 9) return "Normal";
  if (n <= 13) return "Mild";
  if (n <= 20) return "Moderate";
  if (n <= 27) return "Severe";
  return "Extremely Severe";
}

function highestSeverity(data) {
  const severities = [
    data.depression_severity,
    data.anxiety_severity,
    data.stress_severity,
    data.futureSeverity,
  ];
  return severities.reduce(
    (max, s) => (severityRank(s) > severityRank(max) ? s : max),
    "None"
  );
}

function buildInterpretationHTML(data) {
  const likelihoodPct = (Number(data.depression_increase_likelihood) * 100).toFixed(2);
  const magnitudeVal  = Number(data.depression_increase_magnitude).toFixed(2);
  const futureScore   = Number(data.depression_increase_magnitude + 13).toFixed(2);
  const futureSev     = data.futureSeverity;
  const highest       = highestSeverity(data);
  const highestRank   = severityRank(highest);
  const depressionRank  = severityRank(data.depression_severity);
  const likelihoodNum   = Number(data.depression_increase_likelihood);
  const showPredictive  = likelihoodNum >= 0.5 || severityRank(futureSev) >= 2;
  const showCrisis      = highestRank >= 3 || (depressionRank >= 2 && likelihoodNum >= 0.5);
 
  const scales = [
    { label: "Depression", score: data.depression_score, severity: data.depression_severity, key: "depression" },
    { label: "Anxiety",    score: data.anxiety_score,    severity: data.anxiety_severity,    key: "anxiety"    },
    { label: "Stress",     score: data.stress_score,     severity: data.stress_severity,     key: "stress"     },
  ];
 
  // Results list — each <li> gets data-severity for color-coding
  const resultsList = scales.map(({ label, score, severity }) =>
    `<li data-severity="${escapeHtml(severity)}">
      Your ${escapeHtml(label.toLowerCase())} score is <strong>${escapeHtml(score)}</strong>
      <span style="color:var(--modal-text-muted);font-weight:400"> · ${escapeHtml(severity)}</span>
    </li>`
  ).join("") +
  `<li>Likelihood of surpassing mild depression: <strong>${escapeHtml(likelihoodPct)}%</strong></li>
   <li>Magnitude of deviation: <strong>${escapeHtml(magnitudeVal)}</strong></li>
   <li data-severity="${escapeHtml(futureSev)}">Predicted future depression score: <strong>${escapeHtml(futureScore)}</strong>
     <span style="color:var(--modal-text-muted);font-weight:400"> · ${escapeHtml(futureSev)}</span>
   </li>`;
 
  // What this means
  let meaningItems = "";
  scales.forEach(({ label, score, severity, key }) => {
    if (severityRank(severity) >= 1) {
      const blurb = SCALE_BLURBS[key][severity];
      if (blurb) {
        meaningItems += `<li data-severity="${escapeHtml(severity)}"><strong>${escapeHtml(label)}</strong> — ${escapeHtml(blurb)}</li>`;
      }
    }
  });
 
  const meaningSection = meaningItems.length > 0
    ? `<section class="interpretation-section">
        <h3>What this means</h3>
        <ul>${meaningItems}</ul>
      </section>`
    : `<section class="interpretation-section">
        <h3>What this means</h3>
        <p>Your scores are in the normal or minimal range. Keep up the habits that support your wellbeing and check in with yourself if anything changes.</p>
      </section>`;
 
  // Recommendations
  let recommendations = "";
  if (highestRank <= 1) {
    recommendations = `
      <p>Your scores are in a lower range right now. That does not mean you should ignore how you feel.</p>
      <ul>
        <li>Keep a regular sleep schedule and move your body when you can.</li>
        <li>Stay connected with people you trust, even briefly.</li>
        <li>Notice what helps you unwind and make small room for it each day.</li>
        <li>If symptoms persist or worsen, consider talking with a counselor or health professional.</li>
      </ul>`;
  } else if (highestRank === 2) {
    recommendations = `
      <p>Your results suggest symptoms that may benefit from more than self-care alone.</p>
      <ul>
        <li>Consider speaking with a school counselor, GP, or therapist — they can help you understand your options.</li>
        <li>Share how you have been feeling with someone you trust.</li>
        <li>Continue basics: sleep, meals, gentle activity, and limits on alcohol or other substances.</li>
        <li>You do not need to wait until things feel unbearable to ask for support.</li>
      </ul>`;
  } else {
    recommendations = `
      <p>Your results suggest significant distress. Reaching out for professional support soon is a wise and courageous step.</p>
      <ul>
        <li>Contact a mental health professional, campus counseling, or your doctor as soon as you can.</li>
        <li>Tell someone you trust what you are going through today.</li>
        <li>If you feel unsafe or unable to cope, use the crisis resources below or your local emergency number.</li>
      </ul>`;
  }
 
  // Predictive section
  let predictive = "";
  if (showPredictive) {
    predictive = `
      <section class="interpretation-section">
        <h3>About the prediction</h3>
        <p>
          Based on patterns in similar responses, this tool estimates a
          <strong>${escapeHtml(likelihoodPct)}%</strong> chance that depression scores could move beyond mild levels,
          with a projected future depression score of <strong>${escapeHtml(futureScore)}</strong>
          (${escapeHtml(futureSev)}).
        </p>
        <p>
          This is a statistical projection, not a forecast of what will happen to you.
          Many people improve with support, rest, and treatment. Use it as one signal, not a verdict.
        </p>
      </section>`;
  }
 
  // Crisis section
  let crisis = "";
  if (showCrisis) {
    crisis = `
      <div class="interpretation-highlight" role="region" aria-label="Crisis resources">
        <h3>If you need help right now</h3>
        <p>
          <strong>If you or someone else is in immediate danger,</strong>
          call your local emergency number (e.g. 911 in the US, 999 in the UK, <strong>117</strong> in the Philippines).
        </p>
        <p><strong>Philippines</strong></p>
        <ul>
          <li><strong>NCMH Crisis Hotline</strong> — 1553 · 0917-899-8727 (Globe/TM) · 0966-351-4518 (Smart)</li>
          <li><strong>Hopeline Philippines</strong> — 2919 (toll-free Globe/TM) · 0917-558-4673 · 0918-873-4673</li>
          <li><strong>In Touch Crisis Lines</strong> — (02) 8893-7603 · 0917-800-1123 · 0922-893-8944</li>
        </ul>
        <p><strong>United States &amp; international</strong></p>
        <ul>
          <li><strong>988 Suicide &amp; Crisis Lifeline (US)</strong> — Call or text <a href="tel:988">988</a></li>
          <li><strong>Crisis Text Line</strong> — Text <strong>HOME</strong> to 741741</li>
          <li><strong>Find a helpline worldwide</strong> — <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">findahelpline.com</a></li>
        </ul>
      </div>`;
  }
 
  return `
    <p class="interpretation-disclaimer">
      This tool is for education and self-reflection only. It is not a medical diagnosis
      and cannot replace advice from a qualified professional.
    </p>
    <section class="interpretation-section">
      <h3>Your results</h3>
      <ul>${resultsList}</ul>
    </section>
    ${meaningSection}
    ${predictive}
    <section class="interpretation-section">
      <h3>Recommendations</h3>
      ${recommendations}
    </section>
    ${crisis}
    <section class="interpretation-section">
      <h3>Learn more</h3>
      <p>See score bands, severity explanations, and additional resources on the <a href="/info">information page</a>.</p>
    </section>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const questionList = document.getElementById("question-list");
  const returnBtn = document.getElementById("return");
  const nextBtn = document.getElementById("next");
  const completeOverlay = document.getElementById("assessment-complete");
  const restartBtn = document.getElementById("restart-assessment");
  const interpretBtn = document.getElementById("interpret-findings-btn");
  const interpretationModal = document.getElementById(
    "findings-interpretation-modal"
  );
  const interpretationBody = document.getElementById("interpretation-body");
  const interpretationClose = document.getElementById("interpretation-close");
  const interpretationBackdrop = interpretationModal?.querySelector(
    "[data-close-modal]"
  );

  let lastFindings = null;

  const DScore = document.getElementById("D-score");
  const DSeverity = document.getElementById("D-severity");
  const AScore = document.getElementById("A-score");
  const ASeverity = document.getElementById("A-severity");
  const SScore = document.getElementById("S-score");
  const SSeverity = document.getElementById("S-severity");
  const likelihood = document.getElementById("likelihood");
  const magnitude = document.getElementById("magnitude");
  const future = document.getElementById("future");
  const futureSeverity = document.getElementById("future-severity");

  const questions = [
    "I felt that I had nothing to look forward to",
    "I was unable to become enthusiastic about anything",
    "I feel like I am not worth anything as a person",
    "I believe that life is meaningless",
    "I couldn't seem to experience any positive feelings at all",
    "I found it difficult to work up the initiative to do things",
    "I was downhearted and blue",
    "I was aware of dryness of my mouth",
    "I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion)",
    "I experienced trembling (e.g. in the hands)",
    "I was worried about situations in which I might panic and make a fool of myself",
    "I felt I was close to panic",
    "I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart missing a beat)",
    "I felt scared without any good reason",
    "I found it hard to wind down",
    "I tended to over-react to situations",
    "I felt that I was using a lot of nervous energy",
    "I found myself getting agitated",
    "I found it difficult to relax",
    "I was intolerant of anything that kept me from getting on with what I was doing",
    "I felt that I was rather touchy",
  ];

  const choices = ["Never", "Sometimes", "Often", "Very Often"];
  let count = 0;

  questions.forEach((question) => {
    const li = document.createElement("li");
    const p = document.createElement("p");
    const select = document.createElement("select");

    count += 1;
    p.innerHTML = `${count}. ${question}`;

    choices.forEach((choice) => {
      const option = document.createElement("option");
      option.innerHTML = choice;
      option.setAttribute("value", choice);
      select.appendChild(option);
    });

    if (count <= 7) {
      select.setAttribute("class", "D-question");
    } else if (count <= 14) {
      select.setAttribute("class", "A-question");
    } else {
      select.setAttribute("class", "S-question");
    }

    li.append(p, select);
    questionList.appendChild(li);
  });

  const groups = [
    document.querySelectorAll(".D-question"),
    document.querySelectorAll(".A-question"),
    document.querySelectorAll(".S-question"),
  ];
  let currentGroupIndex = 0;
  const stepEls = document.querySelectorAll(".stepper__step");

  function updateStepper(index) {
    stepEls.forEach((el) => {
      const step = Number(el.getAttribute("data-step"));
      el.classList.toggle("is-active", step === index);
    });
  }

  const nextLabelEl = nextBtn.querySelector(".btn__label");

  function setNextButtonLabel(text) {
    if (nextLabelEl) {
      nextLabelEl.textContent = text;
      nextBtn.dataset.label = text;
    }
  }

  function updateNavButtons() {
    if (currentGroupIndex === 0) {
      returnBtn.classList.add("btn--back-muted");
      returnBtn.classList.remove("btn--back-active");
    } else {
      returnBtn.classList.remove("btn--back-muted");
      returnBtn.classList.add("btn--back-active");
    }
    setNextButtonLabel(
      currentGroupIndex === groups.length - 1 ? "Submit" : "Next"
    );
  }

  function showGroup(index) {
    groups.forEach((group, i) => {
      group.forEach((element) => {
        element.parentElement.style.display = i === index ? "block" : "none";
      });
    });
    updateStepper(index);
    updateNavButtons();
  }

  showGroup(currentGroupIndex);

  function showCompletionOverlay() {
    completeOverlay.removeAttribute("hidden");
    completeOverlay.classList.add("is-visible");
    restartBtn.focus();
  }

  function hideCompletionOverlay() {
    completeOverlay.classList.remove("is-visible");
    completeOverlay.setAttribute("hidden", "");
  }

  function openInterpretationModal() {
    if (!lastFindings || !interpretationModal) return;
    interpretationBody.innerHTML = buildInterpretationHTML(lastFindings);
    interpretationModal.removeAttribute("hidden");
    document.body.classList.add("modal-open");
    interpretationClose?.focus();
  }

  function closeInterpretationModal() {
    if (!interpretationModal) return;
    interpretationModal.setAttribute("hidden", "");
    document.body.classList.remove("modal-open");
  }

  function getModalFocusables() {
    if (!interpretationModal) return [];
    return Array.from(
      interpretationModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.disabled && el.offsetParent !== null);
  }

  if (interpretationModal) {
    interpretationModal.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || interpretationModal.hasAttribute("hidden")) return;
      const focusables = getModalFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  interpretBtn?.addEventListener("click", openInterpretationModal);
  interpretationClose?.addEventListener("click", closeInterpretationModal);
  interpretationBackdrop?.addEventListener("click", closeInterpretationModal);

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      interpretationModal &&
      !interpretationModal.hasAttribute("hidden")
    ) {
      closeInterpretationModal();
    }
  });

  function resetAssessment() {
    document.querySelectorAll(".question-list select").forEach((select) => {
      select.selectedIndex = 0;
    });
    currentGroupIndex = 0;
    showGroup(currentGroupIndex);
  }

  restartBtn.addEventListener("click", () => {
    hideCompletionOverlay();
    resetAssessment();
    lastFindings = null;
    if (interpretBtn) interpretBtn.disabled = true;
    closeInterpretationModal();
  });

  nextBtn.addEventListener("click", () => {
    if (currentGroupIndex < groups.length - 1) {
      currentGroupIndex++;
      showGroup(currentGroupIndex);
    } else {
      computeDASS();
    }
  });

  returnBtn.addEventListener("click", () => {
    if (currentGroupIndex > 0) {
      currentGroupIndex--;
      showGroup(currentGroupIndex);
    }
  });

  function gatherAnswers(categoryClass) {
    const answers = [];
    document.querySelectorAll(`.${categoryClass}`).forEach((select) => {
      answers.push(select.value);
    });
    return answers;
  }

  async function computeDASS() {
    const dAnswers = gatherAnswers("D-question");
    const aAnswers = gatherAnswers("A-question");
    const sAnswers = gatherAnswers("S-question");

    setButtonLoading(nextBtn, true, { loadingLabel: "Submitting..." });

    try {
      const res = await fetch("/computeDASS", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dAnswers: dAnswers,
          aAnswers: aAnswers,
          sAnswers: sAnswers,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const data = await res.json();
      DScore.innerHTML = data.depression_score;
      DSeverity.innerHTML = data.depression_severity;
      AScore.innerHTML = data.anxiety_score;
      ASeverity.innerHTML = data.anxiety_severity;
      SScore.innerHTML = data.stress_score;
      SSeverity.innerHTML = data.stress_severity;
      likelihood.innerHTML = `${(
        Number(data.depression_increase_likelihood) * 100
      ).toFixed(2)}%`;
      magnitude.innerHTML = `${Number(
        data.depression_increase_magnitude
      ).toFixed(2)}`;
      const futureScoreNum = Number(data.depression_increase_magnitude + 13);
      future.innerHTML = futureScoreNum.toFixed(2);
      const futureSev = computeFutureSeverity(futureScoreNum);
      futureSeverity.innerHTML = futureSev;

      lastFindings = { ...data, futureSeverity: futureSev };
      if (interpretBtn) interpretBtn.disabled = false;

      showCompletionOverlay();
    } catch (error) {
      console.error("Error computing DASS: ", error);
    } finally {
      await clearButtonLoading(nextBtn, { minDuration: 1000 });
    }
  }
});
