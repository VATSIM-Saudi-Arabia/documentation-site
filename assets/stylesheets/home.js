function updateHeader() {
    if (window.scrollY > 20) {
        document.body.classList.add("scrolled");
    } else {
        document.body.classList.remove("scrolled");
    }
}

window.addEventListener("scroll", updateHeader);
window.addEventListener("load", updateHeader);

document$.subscribe(() => {

    const heroBg = document.querySelector(".hero-background");

    if (!heroBg) return;

    function updateParallax() {
        const scrolled = window.scrollY;

        heroBg.style.transform =
            `translateY(${scrolled * 0.3}px) scale(1.05)`;
    }

    updateParallax();

    window.addEventListener("scroll", updateParallax);
});