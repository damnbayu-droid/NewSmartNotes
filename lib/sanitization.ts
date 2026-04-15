import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Version for Next.js that works on both Server and Client.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';

    // Next.js Server side detection
    const isServer = typeof window === 'undefined';
    
    let purify;
    if (isServer) {
        // Dynamic require to prevent bundling on client and handle ESM/CJS compatibility
        const { JSDOM } = require('jsdom');
        const window = new JSDOM('').window;
        purify = DOMPurify(window);
    } else {
        purify = DOMPurify;
    }

    return purify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'span',
            'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'style'],
        ADD_ATTR: ['target'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed'],
        FORBID_ATTR: ['onerror', 'onclick', 'onmouseover'],
    });
}
