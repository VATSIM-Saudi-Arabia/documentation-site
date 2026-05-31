function updateHeader() {
    if (window.scrollY > 20) {
        document.body.classList.add("scrolled");
    } else {
        document.body.classList.remove("scrolled");
    }
}

window.addEventListener("scroll", updateHeader);
window.addEventListener("load", updateHeader);