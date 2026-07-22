/**
 * Scroll / entrance animations via IntersectionObserver.
 * Mark elements with data-animate (optional data-animate-delay in ms).
 * Parent with data-animate-stagger delays children that have [data-animate-child].
 */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("motion-reduce");
    document
      .querySelectorAll("[data-animate], [data-animate-child]")
      .forEach((el) => el.classList.add("is-visible"));
    return;
  }

  document.documentElement.classList.add("motion-ready");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("is-visible");

        if (el.hasAttribute("data-animate-stagger")) {
          el.querySelectorAll("[data-animate-child]").forEach((child, i) => {
            child.style.setProperty("--stagger-i", String(i));
            child.classList.add("is-visible");
          });
        }

        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  document.querySelectorAll("[data-animate]").forEach((el) => {
    const delay = el.getAttribute("data-animate-delay");
    if (delay) el.style.setProperty("--animate-delay", `${delay}ms`);
    observer.observe(el);
  });
})();
