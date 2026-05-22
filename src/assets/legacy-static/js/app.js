const API_ROOT = window.location.origin;
const LEGACY_PAGES = [
    'admin-dashboard.html',
    'employee-dashboard.html',
    'courses.html',
    'departments.html',
    'users.html',
    'upload.html',
    'notifications.html',
    'reports.html',
    'assessments.html',
    'certificates.html'
];

function normalizeRole(role) {
    return String(role || '')
        .replace(/^ROLE_/i, '')
        .toUpperCase();
}

function getAccessToken(data = {}) {
    return data.accessToken || data.token || data.jwt || data.jwtToken || data.access_token || '';
}

function currentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
}

async function request(path, options = {}) {
    const token = localStorage.getItem('jwtToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_ROOT}${path}`, {
        ...options,
        headers
    });
    if (!response.ok) {
        const errorBody = await response.text();
        let message = errorBody || 'Request failed';
        try {
            const parsed = JSON.parse(errorBody);
            message = parsed.error || parsed.message || message;
        } catch (ignored) {
            // Keep the raw server response when it is not JSON.
        }
        if (message.includes('Error occurred while trying to proxy') || response.status === 504) {
            message = 'Backend is not reachable on port 8080. Start the Java backend, then try again.';
        }
        if (response.status === 401 || response.status === 403) {
            clearSession();
            if (currentPage() !== 'login.html') {
                window.location.href = 'login.html';
            }
        }
        throw new Error(message);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}

const api = {
    get: (path) => request(path, { method: 'GET' }),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' })
};

async function upload(path, formData) {
    const token = localStorage.getItem('jwtToken');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_ROOT}${path}`, {
        method: 'POST',
        body: formData,
        headers
    });

    if (!response.ok) {
        const errorBody = await response.text();
        let message = errorBody || 'Upload failed';
        try {
            const parsed = JSON.parse(errorBody);
            message = parsed.error || parsed.message || message;
        } catch (ignored) {
            // raw response
        }
        if (message.includes('Error occurred while trying to proxy') || response.status === 504) {
            message = 'Backend is not reachable on port 8080. Start the Java backend, then try again.';
        }
        throw new Error(message);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}

function downloadFile(path) {
    window.location.href = `${API_ROOT}${path}`;
}

async function login(body) {
    const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body)
    });
    const token = getAccessToken(data);
    const role = normalizeRole(data.role || data.authority || data.userRole);
    if (!token) {
        throw new Error('Login succeeded, but no access token was returned by the backend.');
    }
    if (!role) {
        throw new Error('Login succeeded, but no user role was returned by the backend.');
    }
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('currentRole', role);
    localStorage.setItem('currentEmail', data.email || body.email);
    return data;
}

async function register(body) {
    return await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body)
    });
}

async function fetchApi(path) {
    return await request(path, {
        method: 'GET'
    });
}

function clearSession() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('currentEmail');
}

function logout() {
    clearSession();
    window.location.href = 'login.html';
}

function showMessage(containerId, message, type = 'info') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
}

function clearMessage(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
}

function optionalNumber(value) {
    return value === '' || value === null || value === undefined ? null : Number(value);
}

function navigateHome() {
    const role = getCurrentRole();
    window.location.href = role === 'ADMIN'
        ? 'admin-dashboard.html'
        : role === 'TRAINER'
            ? 'courses.html'
            : 'employee-dashboard.html';
}

function ensureAuthenticated() {
    if (!localStorage.getItem('jwtToken')) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function getCurrentRole() {
    return normalizeRole(localStorage.getItem('currentRole'));
}

function ensureRole(requiredRole) {
    if (!ensureAuthenticated()) {
        return false;
    }
    if (getCurrentRole() !== normalizeRole(requiredRole)) {
        return false;
    }
    return true;
}

if (LEGACY_PAGES.includes(currentPage())) {
    ensureAuthenticated();
}

if ((currentPage() === 'index.html' || currentPage() === '') && localStorage.getItem('jwtToken')) {
    navigateHome();
}
