const header = document.querySelector("[data-header]");
const navigation = document.querySelector("[data-navigation]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = navigation ? navigation.querySelectorAll("a") : [];
const mobileNavigation = window.matchMedia("(max-width: 48rem)");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll("[data-category]");
const emptyProjects = document.querySelector("[data-empty-projects]");
const filterStatus = document.querySelector("[data-filter-status]");
const projectTriggers = document.querySelectorAll("[data-project-trigger]");
const projectDialog = document.querySelector("#project-dialog");
const dialogTitle = document.querySelector("[data-dialog-title]");
const dialogRole = document.querySelector("[data-dialog-role]");
const dialogPeriod = document.querySelector("[data-dialog-period]");
const dialogSummary = document.querySelector("[data-dialog-summary]");
const dialogHighlights = document.querySelector("[data-dialog-highlights]");
const dialogStack = document.querySelector("[data-dialog-stack]");
const dialogClose = document.querySelector("[data-dialog-close]");
const currentYear = document.querySelector("[data-current-year]");
let lastDialogTrigger = null;

const updateHeader = () => {
  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
};

const setNavigationState = (isOpen, moveFocus = false) => {
  if (!navigation || !navToggle) {
    return;
  }

  navigation.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("nav-open", isOpen);

  if (mobileNavigation.matches && !isOpen) {
    navigation.setAttribute("inert", "");
    navigation.setAttribute("aria-hidden", "true");
  } else {
    navigation.removeAttribute("inert");
    navigation.removeAttribute("aria-hidden");
  }

  if (moveFocus) {
    window.requestAnimationFrame(() => navToggle.focus({ preventScroll: true }));
  }
};

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setNavigationState(!isOpen);

    if (!isOpen) {
      window.requestAnimationFrame(() => navLinks[0]?.focus({ preventScroll: true }));
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => setNavigationState(false, true));
});

document.addEventListener("keydown", (event) => {
  if (!navigation?.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    setNavigationState(false, true);
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusableElements = [navToggle, ...navLinks].filter(Boolean);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
});

mobileNavigation.addEventListener("change", () => setNavigationState(false));
setNavigationState(false);

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;
    let visibleProjects = 0;

    filterButtons.forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle("is-active", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });

    projectCards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      const shouldShow = selectedFilter === "all" || categories.includes(selectedFilter);
      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleProjects += 1;
      }
    });

    if (emptyProjects) {
      emptyProjects.hidden = visibleProjects !== 0;
    }

    if (filterStatus) {
      const filterName = button.textContent.trim().toLowerCase();
      filterStatus.textContent = `${visibleProjects} ${filterName} ${visibleProjects === 1 ? "project" : "projects"} shown.`;
    }
  });
});

const renderDialogContent = (trigger) => {
  if (!dialogTitle || !dialogRole || !dialogPeriod || !dialogSummary || !dialogHighlights || !dialogStack) {
    return;
  }

  dialogTitle.textContent = trigger.dataset.title || "Project details";
  dialogRole.textContent = trigger.dataset.role || "Project contributor";
  dialogPeriod.textContent = trigger.dataset.period || "Timeline unavailable";
  dialogSummary.textContent = trigger.dataset.summary || "Project summary unavailable.";
  dialogStack.textContent = trigger.dataset.stack || "Stack unavailable";

  const highlights = (trigger.dataset.highlights || "")
    .split("|")
    .map((highlight) => highlight.trim())
    .filter(Boolean);

  const items = highlights.map((highlight) => {
    const item = document.createElement("li");
    item.textContent = highlight;
    return item;
  });

  dialogHighlights.replaceChildren(...items);
};

projectTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!projectDialog) {
      return;
    }

    lastDialogTrigger = trigger;
    renderDialogContent(trigger);

    if (typeof projectDialog.showModal === "function") {
      projectDialog.showModal();
    } else {
      projectDialog.setAttribute("open", "");
    }
  });
});

const closeDialog = () => {
  if (!projectDialog) {
    return;
  }

  if (typeof projectDialog.close === "function") {
    projectDialog.close();
  } else {
    projectDialog.removeAttribute("open");
    lastDialogTrigger?.focus();
  }
};

dialogClose?.addEventListener("click", closeDialog);

projectDialog?.addEventListener("click", (event) => {
  if (event.target !== projectDialog) {
    return;
  }

  const bounds = projectDialog.getBoundingClientRect();
  const clickedInside =
    event.clientX >= bounds.left &&
    event.clientX <= bounds.right &&
    event.clientY >= bounds.top &&
    event.clientY <= bounds.bottom;

  if (!clickedInside) {
    closeDialog();
  }
});

projectDialog?.addEventListener("close", () => {
  lastDialogTrigger?.focus();
});

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}
