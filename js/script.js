/*
WEDE5020 Part 3 — JavaScript functionality
Oak & Bean Coffee

Features:
1. Dynamic menu rendering, search, filter and sort.
2. Accordion interactions.
3. Image gallery lightbox using <dialog>.
4. Scroll reveal animations using IntersectionObserver.
5. Client-side form validation.
6. Asynchronous form submission using fetch() as an AJAX demonstration.
*/

document.addEventListener("DOMContentLoaded", () => {
    initDynamicMenu();
    initAccordion();
    initLightbox();
    initRevealAnimations();
    initForms();
});

/* -----------------------------
   Dynamic menu + search/filter
   ----------------------------- */
const menuItems = [
    { name: "Espresso", category: "coffee", description: "A short, rich coffee with a full-bodied flavour.", price: 28 },
    { name: "Americano", category: "coffee", description: "Espresso topped with hot water for a smooth, balanced cup.", price: 32 },
    { name: "Cappuccino", category: "coffee", description: "Espresso with steamed milk and a generous layer of foam.", price: 38 },
    { name: "Flat White", category: "coffee", description: "Double espresso with silky steamed milk and a smooth finish.", price: 42 },
    { name: "Iced Latte", category: "coffee", description: "Espresso, cold milk and ice for a refreshing coffee option.", price: 45 },
    { name: "Breakfast Toast", category: "food", description: "Sourdough toast with scrambled eggs, tomato and baby spinach.", price: 72 },
    { name: "Chicken Pesto Toastie", category: "food", description: "Grilled chicken, basil pesto, mozzarella and tomato on toasted sourdough.", price: 86 },
    { name: "Roasted Vegetable Wrap", category: "food", description: "Roasted vegetables, hummus and fresh leaves in a soft wrap.", price: 78 },
    { name: "Butter Croissant", category: "baked", description: "Classic flaky croissant baked until golden.", price: 34 },
    { name: "Chocolate Muffin", category: "baked", description: "Soft chocolate muffin with chocolate pieces.", price: 38 },
    { name: "Carrot Cake Slice", category: "baked", description: "Spiced carrot cake finished with cream cheese icing.", price: 48 }
];

function initDynamicMenu() {
    const container = document.querySelector("#dynamic-menu");
    if (!container) return;

    const search = document.querySelector("#menu-search");
    const category = document.querySelector("#menu-category");
    const sort = document.querySelector("#menu-sort");
    const summary = document.querySelector("#menu-results");

    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    if (requestedCategory && ["coffee", "food", "baked"].includes(requestedCategory)) {
        category.value = requestedCategory;
    }

    function renderMenu() {
        const term = search.value.trim().toLowerCase();
        const selectedCategory = category.value;
        const sortValue = sort.value;

        let filtered = menuItems.filter(item => {
            const matchesTerm = `${item.name} ${item.description}`.toLowerCase().includes(term);
            const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
            return matchesTerm && matchesCategory;
        });

        if (sortValue === "price-asc") filtered.sort((a, b) => a.price - b.price);
        if (sortValue === "price-desc") filtered.sort((a, b) => b.price - a.price);
        if (sortValue === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

        container.innerHTML = "";

        if (!filtered.length) {
            container.innerHTML = '<p class="empty-state">No menu items match your search. Try another word or category.</p>';
        } else {
            filtered.forEach(item => {
                const article = document.createElement("article");
                article.className = "menu-item";
                const content = document.createElement("div");
                const heading = document.createElement("h3");
                const description = document.createElement("p");
                const price = document.createElement("strong");

                heading.textContent = item.name;
                description.textContent = item.description;
                price.textContent = `R${item.price}`;

                content.append(heading, description);
                article.append(content, price);
                container.append(article);
            });
        }

        summary.textContent = `${filtered.length} menu item${filtered.length === 1 ? "" : "s"} shown.`;
    }

    [search, category, sort].forEach(control => control.addEventListener("input", renderMenu));
    renderMenu();
}

/* -----------------------------
   FAQ accordion
   ----------------------------- */
function initAccordion() {
    document.querySelectorAll(".accordion-trigger").forEach(trigger => {
        trigger.addEventListener("click", () => {
            const panel = trigger.closest(".accordion-item").querySelector(".accordion-panel");
            const expanded = trigger.getAttribute("aria-expanded") === "true";
            trigger.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    });
}

/* -----------------------------
   Gallery lightbox
   ----------------------------- */
function initLightbox() {
    const dialog = document.querySelector("#lightbox");
    if (!dialog) return;

    const image = dialog.querySelector("#lightbox-image");
    const closeButton = dialog.querySelector(".lightbox-close");

    document.querySelectorAll(".gallery-item").forEach(button => {
        button.addEventListener("click", () => {
            image.src = button.dataset.full;
            image.alt = button.querySelector("img")?.alt || "Oak & Bean Coffee gallery image";
            dialog.showModal();
        });
    });

    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
    });
}

/* -----------------------------
   Scroll animations
   ----------------------------- */
function initRevealAnimations() {
    const elements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
        elements.forEach(el => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    elements.forEach(el => observer.observe(el));
}

/* -----------------------------
   Forms: validation + AJAX
   ----------------------------- */
function initForms() {
    document.querySelectorAll(".ajax-form").forEach(form => {
        const fields = [...form.querySelectorAll("input, select, textarea")];

        fields.forEach(field => {
            field.addEventListener("blur", () => validateField(field));
            field.addEventListener("input", () => {
                if (field.getAttribute("aria-invalid") === "true") validateField(field);
            });
        });

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const valid = fields.every(validateField);
            const status = form.querySelector(".form-status");

            if (!valid) {
                status.textContent = "Please correct the highlighted fields before submitting.";
                status.className = "form-status status-error";
                return;
            }

            status.textContent = "Sending your message…";
            status.className = "form-status";

            const payload = Object.fromEntries(new FormData(form).entries());
            payload.formType = form.dataset.formType;
            payload.recipient = "hello@oakandbean.example";

            try {
                const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error("Network response was not successful");

                status.textContent = "Thank you. Your message passed validation and was submitted asynchronously.";
                status.className = "form-status status-success";
                form.reset();
            } catch (error) {
                status.innerHTML = 'The demonstration submission service is currently unavailable. You can still email us at <a href="mailto:hello@oakandbean.example">hello@oakandbean.example</a>.';
                status.className = "form-status status-error";
            }
        });
    });
}

function validateField(field) {
    const error = document.querySelector(`[data-error-for="${field.id}"]`);
    if (!error) return field.checkValidity();

    let message = "";

    if (field.validity.valueMissing) {
        message = "This field is required.";
    } else if (field.validity.typeMismatch) {
        message = "Please enter a valid value.";
    } else if (field.validity.patternMismatch) {
        message = "Please use a valid phone number format.";
    } else if (field.validity.tooShort) {
        message = `Please enter at least ${field.minLength} characters.`;
    } else if (field.validity.tooLong) {
        message = `Please use no more than ${field.maxLength} characters.`;
    }

    error.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
}
