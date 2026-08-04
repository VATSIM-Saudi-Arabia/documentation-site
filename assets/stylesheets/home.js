function updateHeader() {
    if (window.scrollY > 20) {
        document.body.classList.add("scrolled");
    } else {
        document.body.classList.remove("scrolled");
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getStoredProfile() {
    const match = document.cookie.match(/(?:^|;\s*)vatsim_profile=([^;]+)/);
    if (!match) return null;

    try {
        return JSON.parse(atob(decodeURIComponent(match[1])));
    } catch (error) {
        return null;
    }
}

function getInitials(profile) {
    const source = profile?.displayName || profile?.cid || '';
    const parts = source.trim().split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
}

function renderProfileWidget() {
    const headerInner = document.querySelector('.md-header__inner');
    if (!headerInner || headerInner.querySelector('.profile-shell')) return;

    const profile = getStoredProfile();
    if (!profile) return;

    const shell = document.createElement('div');
    shell.className = 'profile-shell';
    const initials = getInitials(profile);
    shell.innerHTML = `
        <button class="profile-trigger" type="button" aria-label="User profile">
            ${escapeHtml(initials)}
        </button>
        <div class="profile-dropdown">
            <div class="profile-dropdown__label">${escapeHtml(profile.displayName || `CID ${profile.cid || 'user'}`)}</div>
            <a class="profile-dropdown__logout" href="/logout">Log out</a>
        </div>
    `;

    headerInner.appendChild(shell);
}

window.addEventListener('scroll', updateHeader);
window.addEventListener('load', updateHeader);
document.addEventListener('DOMContentLoaded', renderProfileWidget);

if (typeof document$ !== 'undefined') {
    document$.subscribe(() => {
        renderProfileWidget();

        const heroBg = document.querySelector('.hero-background');

        if (!heroBg) return;

        function updateParallax() {
            const scrolled = window.scrollY;

            heroBg.style.transform =
                `translateY(${scrolled * 0.3}px) scale(1.05)`;
        }

        updateParallax();

        window.addEventListener('scroll', updateParallax);
    });
} else {
    renderProfileWidget();
}
