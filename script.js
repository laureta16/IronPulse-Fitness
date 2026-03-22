const revealTargets = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const topbar = document.querySelector(".topbar");
const navToggle = document.querySelector(".nav-toggle");
const reviewForm = document.querySelector("#review-form");
const reviewList = document.querySelector("#review-list");
const reviewAverage = document.querySelector("#review-average");
const reviewTotal = document.querySelector("#review-total");
const testimonialText = [
  "IronPulse gave me structure, confidence, and coaches who actually track progress. I feel stronger every month.",
  "The energy here is unmatched. The classes are intense, but the community makes it easy to stay consistent.",
  "I joined to get healthier, and now I'm lifting more, recovering better, and actually look forward to training.",
];

const storageKey = "ironpulse-reviews";
const seedReviews = [
  { name: "Jenna M.", rating: 5, comment: "IronPulse gave me structure, confidence, and coaches who actually track progress. I feel stronger every month." },
  { name: "Daniel R.", rating: 5, comment: "The energy here is unmatched. The classes are intense, but the community makes it easy to stay consistent." },
  { name: "Sofia T.", rating: 5, comment: "I joined to get healthier, and now I'm lifting more, recovering better, and actually look forward to training." },
  { name: "Marcus A.", rating: 4, comment: "Clean equipment, sharp coaching, and a premium feel from the moment you walk in." },
  { name: "Leah S.", rating: 5, comment: "The recovery area and programming made it easy to stay consistent without burning out." },
];

const cursorOrb = document.createElement("div");
cursorOrb.className = "cursor-orb";
document.body.appendChild(cursorOrb);

const pageLoader = document.querySelector(".page-loader");

const loadReviews = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : seedReviews;
  } catch {
    return seedReviews;
  }
};

let reviews = loadReviews();

const saveReviews = () => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(reviews));
  } catch {
    // Local storage can be unavailable in restricted environments.
  }
};

const renderReviews = () => {
  if (!reviewList) return;

  reviewList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  if (!reviews.length) {
    const empty = document.createElement("div");
    empty.className = "review-empty";
    empty.textContent = "No reviews yet. Be the first to share your experience.";
    reviewList.appendChild(empty);
  }

  reviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "review-card";

    const top = document.createElement("div");
    top.className = "review-card__top";

    const name = document.createElement("span");
    name.className = "review-card__name";
    name.textContent = review.name;

    const stars = document.createElement("span");
    stars.className = "review-card__stars";
    stars.textContent = "★".repeat(review.rating);

    const comment = document.createElement("p");
    comment.className = "review-card__comment";
    comment.textContent = review.comment;

    top.append(name, stars);
    card.append(top, comment);
    fragment.appendChild(card);
  });

  reviewList.appendChild(fragment);

  if (reviewAverage) {
    const average = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    reviewAverage.textContent = average.toFixed(1);
  }

  if (reviewTotal) {
    reviewTotal.textContent = String(reviews.length);
  }
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealTargets.forEach((target) => revealObserver.observe(target));

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = Number(el.dataset.count);
      const duration = 1400;
      const start = performance.now();

      const animate = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const value = Math.floor(progress * target);
        el.textContent = value.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);

counters.forEach((counter) => counterObserver.observe(counter));

document.querySelectorAll(".testimonial-card p").forEach((paragraph, index) => {
  if (testimonialText[index]) {
    paragraph.textContent = testimonialText[index];
  }
});

window.addEventListener("pointermove", (event) => {
  cursorOrb.style.left = `${event.clientX}px`;
  cursorOrb.style.top = `${event.clientY}px`;
});

navToggle?.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  topbar.classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    topbar.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelector(".signup-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
});

reviewForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(reviewForm);
  const name = String(formData.get("name") || "").trim();
  const rating = Number(formData.get("rating") || 5);
  const comment = String(formData.get("comment") || "").trim();

  if (!name || !comment) {
    return;
  }

  reviews = [{ name, rating, comment }, ...reviews];
  saveReviews();
  renderReviews();
  reviewForm.reset();
  reviewList?.firstElementChild?.scrollIntoView({ behavior: "smooth", block: "start" });
});

renderReviews();

window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    pageLoader?.classList.add("is-hidden");
    document.body.classList.remove("is-loading");
    window.setTimeout(() => pageLoader?.remove(), 700);
  });
});
