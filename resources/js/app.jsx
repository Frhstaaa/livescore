import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

// Force Light Theme
if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
}

createInertiaApp({
    title: (title) => title ? `${title} - RS LIVASYA FUTSAL` : 'RS LIVASYA FUTSAL LIVESCORE',
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: false,
});
