// ==UserScript==
// @name         ChatGPT Pins
// @namespace    chatgpt-pins.local
// @version      1.0.0
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

    let navigationId = 0;

    function getMarker(url) {
        if (url.origin !== location.origin
            || url.pathname !== '/'
            || !url.hash.startsWith(hashPrefix)) {
            return null;
        }

        let marker;

        try {
            marker = decodeURIComponent(
                url.hash.slice(hashPrefix.length),
            );
        } catch {
            return null;
        }

        return markerPattern.test(marker) ? marker : null;
    }

    function findTarget(marker) {
        const headings = document.querySelectorAll(
            'h1, h2, h3, h4, h5, h6',
        );

        for (const heading of headings) {
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

    let noticeTimeout = null;

    function showNotice(text, delay = 5000) {
        let notice = document.getElementById('chatgpt-pin-notice');

        if (!notice) {
            notice = document.createElement('div');
            notice.id = 'chatgpt-pin-notice';

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
                maxWidth: 'min(320px, 85vw)',
            });

            const message = document.createElement('span');
            message.className = 'chatgpt-pin-message';

            const close = document.createElement('button');
            close.type = 'button';
            close.textContent = '×';
            close.title = 'Close notification';

            Object.assign(close.style, {
                border: 'none',
                background: 'transparent',
                color: '#fff',
                fontSize: '22px',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1',
            });

            notice.append(message, close);
            document.body.append(notice);
        }

        clearTimeout(noticeTimeout);
        noticeTimeout = null;

        const closeNotice = () => {
            clearTimeout(noticeTimeout);
            noticeTimeout = null;

            notice.remove();
        };

        notice.querySelector('button').onclick = closeNotice;
        notice.querySelector('.chatgpt-pin-message').textContent = text;

        if (delay > 0) {
            noticeTimeout = setTimeout(closeNotice, delay);
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

        const started = Date.now();
        const timeout = 120000;
        const stepDelay = 450;

        let lastTop = container.scrollTop;
        let stalled = 0;

        showNotice('Searching chat history. Wait...', 0);

        while (Date.now() - started < timeout) {
            if (id !== navigationId) {
                return;
            }

            const target = findTarget(marker);

            if (target) {
                target.scrollIntoView({
                    behavior: 'instant',
                    block: 'start',
                });

                showNotice('Bookmark found. Navigation completed.');
                return;
            }

            const before = container.scrollTop;

            container.scrollBy({
                top: -Math.max(300, container.clientHeight * 0.7),
                behavior: 'instant',
            });

            await wait(stepDelay);

            const after = container.scrollTop;

            if (Math.abs(after - before) < 2
                && Math.abs(after - lastTop) < 2) {
                stalled++;
            } else {
                stalled = 0;
            }

            lastTop = after;

            if (stalled >= 12) {
                await wait(1500);

                if (container.scrollTop <= 1) {
                    break;
                }

                stalled = 0;
            }
        }

        if (id !== navigationId) {
            return;
        }

        const target = findTarget(marker);

        if (target) {
            target.scrollIntoView({
                behavior: 'instant',
                block: 'start',
            });

            showNotice('Bookmark found. Navigation completed.');
        } else {
            showNotice('Marker not found before search timeout.');
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

        if (!link) {
            return;
        }

        let url;

        try {
            url = new URL(link.href, location.href);
        } catch {
            return;
        }

        const marker = getMarker(url);

        if (!marker) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        navigate(marker);
    }

    window.addEventListener('click', handleClick, true);
})();
