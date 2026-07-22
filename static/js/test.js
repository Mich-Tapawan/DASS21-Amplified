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
    "None",
  );
}

function severityPillClass(severity) {
  const map = {
    Normal: "sev-pill--normal",
    Mild: "sev-pill--mild",
    Moderate: "sev-pill--moderate",
    Severe: "sev-pill--severe",
    "Extremely Severe": "sev-pill--extreme",
  };
  return map[severity] || "sev-pill--normal";
}

function iconSvg(name) {
  const icons = {
    info: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/></svg>`,
    chart: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>`,
    trend: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/></svg>`,
    doc: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>`,
    bulb: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>`,
    book: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg>`,
    warn: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>`,
  };
  return icons[name] || "";
}

function buildInterpretationHTML(data) {
  const likelihoodPct = (
    Number(data.depression_increase_likelihood) * 100
  ).toFixed(2);
  const magnitudeVal = Number(data.depression_increase_magnitude).toFixed(2);
  const DEPRESSION_THRESHOLD = 13;
  const futureScore = (
    Number(data.depression_increase_magnitude) + DEPRESSION_THRESHOLD
  ).toFixed(2);
  const futureSev = data.futureSeverity || computeFutureSeverity(futureScore);

  const highest = highestSeverity({ ...data, futureSeverity: futureSev });
  const highestRank = severityRank(highest);
  const depressionRank = severityRank(data.depression_severity);
  const likelihoodNum = Number(data.depression_increase_likelihood);
  const showCrisis =
    highestRank >= 3 || (depressionRank >= 2 && likelihoodNum >= 0.5);

  const scales = [
    {
      label: "Depression",
      score: data.depression_score,
      severity: data.depression_severity,
      key: "depression",
    },
    {
      label: "Anxiety",
      score: data.anxiety_score,
      severity: data.anxiety_severity,
      key: "anxiety",
    },
    {
      label: "Stress",
      score: data.stress_score,
      severity: data.stress_severity,
      key: "stress",
    },
  ];

  const scoreRows = scales
    .map(
      ({ label, score, severity }) => `
      <div class="interp-score-row" data-severity="${escapeHtml(severity)}">
        <p class="interp-score-row__text">
          Your ${escapeHtml(label.toLowerCase())} score is
          <strong>${escapeHtml(score)}</strong>
        </p>
        <span class="sev-pill ${severityPillClass(severity)}">${escapeHtml(severity)}</span>
      </div>`,
    )
    .join("");

  let meaningBody = "";
  const elevated = scales.filter(({ severity }) => severityRank(severity) >= 1);
  if (elevated.length === 0) {
    meaningBody = `<p>Your current screening indicates that scores fall within the normal range. Continue healthy routines and check in with yourself regularly.</p>`;
  } else {
    meaningBody = `<ul class="interp-meaning-list">${elevated
      .map(({ label, severity, key }) => {
        const blurb = SCALE_BLURBS[key][severity];
        return blurb
          ? `<li data-severity="${escapeHtml(severity)}"><strong>${escapeHtml(label)} (${escapeHtml(severity)})</strong> — ${escapeHtml(blurb)}</li>`
          : "";
      })
      .join("")}</ul>`;
  }

  let recommendationItems = [];
  let recommendationIntro = "";
  if (highestRank <= 1) {
    recommendationIntro =
      "Your results are in a lower range. To support wellbeing, consider:";
    recommendationItems = [
      "Maintain regular sleep, meals, and gentle physical activity when possible.",
      "Stay connected with people you trust; isolation can worsen low mood and anxiety.",
      "Use brief grounding or breathing exercises when stress builds.",
      "If subtle changes persist for two weeks or more, consider speaking with a counselor or GP.",
    ];
  } else if (highestRank === 2) {
    recommendationIntro =
      "Your responses suggest moderate distress. Early support can help:";
    recommendationItems = [
      "Consider scheduling time with a counselor, GP, or licensed mental health professional.",
      "Talk with a trusted friend, family member, or teacher about how you have been feeling.",
      "Protect sleep, rest, and limits on alcohol or stimulants if they worsen how you feel.",
      "Review scoring bands and self-care ideas on the Information page.",
    ];
  } else {
    recommendationIntro =
      "Your screening shows elevated symptoms. Professional support is strongly encouraged:";
    recommendationItems = [
      "Contact a licensed therapist, psychologist, psychiatrist, or your local clinical service.",
      "Let a trusted family member or close support person know what you are experiencing.",
      "If you feel unsafe or in immediate danger, use emergency or crisis channels below.",
    ];
  }

  const recommendationList = recommendationItems
    .map(
      (item) => `
      <li>
        <span class="interp-rec__icon">${iconSvg("check")}</span>
        <span>${escapeHtml(item)}</span>
      </li>`,
    )
    .join("");

  const crisis = showCrisis
    ? `
    <section class="interp-card interp-card--crisis" role="region" aria-label="Crisis resources">
      <h3 class="interp-card__title">
        <span class="interp-card__icon">${iconSvg("warn")}</span>
        Immediate help
      </h3>
      <p>
        If you or someone else is in <strong>immediate danger</strong>, call your
        local emergency number — <strong>117</strong> or <strong>911</strong> in
        the Philippines, <strong>999</strong> in the UK, <strong>911</strong> in
        the US.
      </p>
      <ul class="interp-crisis-list">
        <li><strong>NCMH Crisis Hotline (PH)</strong> — 1553 · 0917-899-8727 · 0966-351-4518</li>
        <li><strong>Hopeline Philippines</strong> — 2919 · 0917-558-4673 · 0918-873-4673</li>
        <li><strong>In Touch Crisis Lines</strong> — (02) 8893-7603 · 0917-800-1123</li>
        <li><strong>988 Lifeline (US)</strong> — call or text <a href="tel:988">988</a></li>
        <li><strong>Crisis Text Line</strong> — text <strong>HOME</strong> to 741741</li>
        <li><a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">findahelpline.com</a> for local helplines</li>
      </ul>
      <p><a class="interp-inline-link" href="/info#crisis">More crisis resources on the Info page →</a></p>
    </section>`
    : "";

  return `
    <aside class="interp-notice">
      <span class="interp-notice__icon">${iconSvg("info")}</span>
      <div>
        <p class="interp-notice__label">System notice</p>
        <p>
          This tool provides educational DASS-21 screening and predictive
          statistical modeling. It is <strong>not</strong> a diagnosis, prescription,
          or substitute for professional clinical assessment.
        </p>
      </div>
    </aside>

    <section class="interp-card">
      <h3 class="interp-card__title">
        <span class="interp-card__icon">${iconSvg("chart")}</span>
        DASS-21 subscale results
      </h3>
      <div class="interp-score-list">${scoreRows}</div>
    </section>

    <section class="interp-card">
      <h3 class="interp-card__title">
        <span class="interp-card__icon">${iconSvg("trend")}</span>
        Predictive insights
      </h3>
      <div class="interp-metrics">
        <article class="interp-metric">
          <span class="interp-metric__icon">${iconSvg("trend")}</span>
          <p class="interp-metric__label">Escalation likelihood</p>
          <p class="interp-metric__value">${escapeHtml(likelihoodPct)}%</p>
          <p class="interp-metric__caption">Past mild depression threshold (&gt;13)</p>
        </article>
        <article class="interp-metric">
          <span class="interp-metric__icon">${iconSvg("chart")}</span>
          <p class="interp-metric__label">Threshold deviation</p>
          <p class="interp-metric__value">${escapeHtml(magnitudeVal)} pts</p>
          <p class="interp-metric__caption">Relative to mild cut-off (score of 13)</p>
        </article>
      </div>
      <div class="interp-projected">
        <p>
          Projected progression score:
          <strong>${escapeHtml(futureScore)}</strong>
        </p>
        <span class="sev-pill ${severityPillClass(futureSev)}">${escapeHtml(futureSev)}</span>
      </div>
      <p class="interp-note">
        These metrics come from logistic and linear models trained on survey
        data. They are statistical projections for education—not a forecast of
        your personal future.
      </p>
    </section>

    <section class="interp-card">
      <h3 class="interp-card__title">
        <span class="interp-card__icon">${iconSvg("doc")}</span>
        Symptom categorization &amp; meaning
      </h3>
      ${meaningBody}
    </section>

    <section class="interp-card">
      <h3 class="interp-card__title">
        <span class="interp-card__icon">${iconSvg("bulb")}</span>
        Action recommendations
      </h3>
      <p>${escapeHtml(recommendationIntro)}</p>
      <ul class="interp-rec-list">${recommendationList}</ul>
    </section>

    ${crisis}

    <section class="interp-card interp-card--docs">
      <span class="interp-docs__icon">${iconSvg("book")}</span>
      <div>
        <p class="interp-docs__label">Documentation</p>
        <p>
          Review score cut-offs, severity bands, and methodology on the
          <a class="interp-inline-link" href="/info">Information &amp; resources page</a>.
        </p>
      </div>
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
    "findings-interpretation-modal",
  );
  const interpretationBody = document.getElementById("interpretation-body");
  const interpretationClose = document.getElementById("interpretation-close");
  const interpretationBackdrop =
    interpretationModal?.querySelector("[data-close-modal]");

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
      currentGroupIndex === groups.length - 1 ? "Submit" : "Next",
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
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
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
        data.depression_increase_magnitude,
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
