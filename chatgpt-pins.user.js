// ==UserScript==
// @name         ChatGPT Pins
// @namespace    chatgpt-pins.local
// @version      1.0.1
// @author       Roman Chuikov
// @description  Bookmark ChatGPT conversations and navigate to saved positions without opening new tabs.
// @homepageURL  https://github.com/rchuikov/chatgpt-pins
// @supportURL   https://github.com/rchuikov/chatgpt-pins/issues
// @updateURL    https://raw.githubusercontent.com/rchuikov/chatgpt-pins/main/chatgpt-pins.user.js
// @downloadURL  https://raw.githubusercontent.com/rchuikov/chatgpt-pins/main/chatgpt-pins.user.js
// @match        https://chatgpt.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const hashPrefix = '#chatgpt-pin=';
    const markerPattern = /^CHATGPT_PIN_[A-Za-z0-9_]+$/;
    const searchTimeout = 120000;
    const stepDelay = 450;

    let navigationId = 0;
    let noticeTimeout = null;

    function getMarker(url) {
        if (url.origin !== location.origin
            || url.pathname !== '/'
            || !url.hash.startsWith(hashPrefix)) {
            return null;
        }

        let marker;

        try {
            marker = decodeURIComponent(url.hash.slice(hashPrefix.length));
        } catch {
            return null;
        }

        return markerPattern.test(marker) ? marker : null;
    }

    function findTarget(marker) {
        for (const heading of document.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
            const text = heading.textContent.trim();

            if (text === marker || text.startsWith(`${marker} — `)) {
                return heading;
            }
        }

        return null;
    }

    function getScrollContainer() {
        return document.querySelector('.thread-scroll-container');
    }

    function wait(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    function hideNotice() {
        clearTimeout(noticeTimeout);
        noticeTimeout = null;
        document.getElementById('chatgpt-pin-notice')?.remove();
    }

    function showNotice(text, delay = 5000, cancelSearch = null) {
        let notice = document.getElementById('chatgpt-pin-notice');

        if (!notice) {
            notice = document.createElement('div');
            notice.id = 'chatgpt-pin-notice';
            notice.setAttribute('role', 'status');
            notice.setAttribute('aria-live', 'polite');

            Object.assign(notice.style, {
                position: 'fixed',
                right: '24px',
                bottom: '110px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#262626',
                color: '#fff',
                font: '14px system-ui',
                zIndex: '2147483647',
                boxShadow: '0 4px 16px #0005',
                maxWidth: 'min(360px, 85vw)',
            });

            const message = document.createElement('span');
            message.className = 'chatgpt-pin-message';

            const cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.className = 'chatgpt-pin-cancel';
            cancel.textContent = 'Cancel search';
            Object.assign(cancel.style, {
                border: 'none',
                background: 'transparent',
                color: '#9ecbff',
                font: 'inherit',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0',
                whiteSpace: 'nowrap',
            });

            const close = document.createElement('button');
            close.type = 'button';
            close.className = 'chatgpt-pin-close';
            close.textContent = '×';
            close.title = 'Close notification';
            close.setAttribute('aria-label', 'Close notification');
            Object.assign(close.style, {
                border: 'none',
                background: 'transparent',
                color: '#fff',
                fontSize: '22px',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1',
            });

            notice.append(message, cancel, close);
            document.body.append(notice);
        }

        clearTimeout(noticeTimeout);
        noticeTimeout = null;

        notice.querySelector('.chatgpt-pin-message').textContent = text;
        notice.querySelector('.chatgpt-pin-close').onclick = hideNotice;

        const cancel = notice.querySelector('.chatgpt-pin-cancel');
        cancel.hidden = !cancelSearch;
        cancel.style.display = cancelSearch ? '' : 'none';
        cancel.onclick = cancelSearch;

        if (delay > 0) {
            noticeTimeout = setTimeout(hideNotice, delay);
        }

        return notice;
    }

    async function navigate(marker) {
        const id = ++navigationId;
        const container = getScrollContainer();

        if (!container) {
            showNotice('Chat scroll container not found.');
            return;
        }

        const conversation = location.pathname + location.search;
        const started = Date.now();
        const cancellationReason = () => {
            if (id !== navigationId) {
                return 'replaced';
            }
            if (location.pathname + location.search !== conversation) {
                return 'chat changed';
            }
            if (!container.isConnected) {
                return 'chat container removed';
            }
            return null;
        };

        const cancelSearch = () => {
            if (id === navigationId) {
                ++navigationId;
                showNotice('Search cancelled.');
            }
        };

        function finishInterrupted() {
            const reason = cancellationReason();
            if (!reason) return false;

            // A newer search owns its own notice; never remove it here.
            if (reason !== 'replaced') hideNotice();
            return true;
        }

        showNotice('Searching chat history. Wait...', 0, cancelSearch);

        while (Date.now() - started < searchTimeout) {
            if (finishInterrupted()) return;

            const target = findTarget(marker);
            if (target) {
                target.scrollIntoView({ behavior: 'instant', block: 'start' });
                showNotice('Bookmark found. Navigation completed.');
                return;
            }

            container.scrollBy({
                top: -Math.max(300, container.clientHeight * 0.7),
                behavior: 'instant',
            });

            await wait(stepDelay);
            if (finishInterrupted()) return;
        }

        if (finishInterrupted()) return;

        const target = findTarget(marker);
        if (target) {
            target.scrollIntoView({ behavior: 'instant', block: 'start' });
            showNotice('Bookmark found. Navigation completed.');
        } else {
            showNotice('Bookmark not found. Search timed out.');
        }
    }

    function handleClick(event) {
        if (event.button !== 0
            || event.ctrlKey
            || event.shiftKey
            || event.altKey
            || event.metaKey) {
            return;
        }

        const link = event.target instanceof Element
            ? event.target.closest('a[href]')
            : null;

        if (!link) return;

        let url;
        try {
            url = new URL(link.href, location.href);
        } catch {
            return;
        }

        const marker = getMarker(url);
        if (!marker) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        navigate(marker);
    }

    window.addEventListener('click', handleClick, true);
})();
