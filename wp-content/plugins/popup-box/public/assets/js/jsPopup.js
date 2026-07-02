/*!
 * ========= INFORMATION ============================
 * - document:  Popup Box
 * - brand:     Wow-Company
 * - brand-url: https://wow-company.com/
 * - store-url: https://wow-estore.com/
 * - author:    Dmytro Lobov
 * - url:       https://wordpress.org/plugins/popup-box/
 * ====================================================== */

'use strict';

const PopupBox = function (selector, options, element) {

    let default_options = {
        block_page: false,
        open_popup: 'click',
        open_delay: '0',
        open_distance: '0',
        open_popupTrigger: 'ds-open-popup-1',
        close_popupTrigger: 'ds-close-popup',
        auto_closePopup: false,
        auto_closeDelay: '0',
        redirect_onClose: false,
        redirect_URL: '',
        redirect_target: '_blank',
        cookie_enable: false,
        cookie_name: 'ds-popup-1',
        cookie_days: '30',
        active_url: {
            enable: false,
            url: 'popup=active'
        },
        referrer_url: {
            enable: false,
            url: ''
        },
        loop: {
            start: 5,
            end: 10,
            counter: 3
        },


        // Overlay
        overlay_closesPopup: true,
        overlay_isVisible: true,
        overlay_animation: 'fadeIn',
        overlay_css: {
            'background': 'rgba(0, 0, 0, .75)',
        },

        // Popup
        popup_zindex: '999',
        popup_esc: true,
        popup_animation: 'fadeIn',
        popup_position: '-center',
        popup_css: {
            'width': '550px',
            'height': 'auto',
            'padding': '15px',
            'background': '#ffffff',
        },
        content_css: {
            'padding': '15px',
        },

        // Close Button
        close_isVisible: true,
        close_outer: false,
        close_position: '-topRight',
        close_type: '-text',
        close_content: 'Close',
        close_css: {
            'font-size': '12px',
            'color': '#000000',
        },

        // Mobile
        mobile_show: true,
        mobile_breakpoint: '480px',
        mobile_css: {
            'width': '100%',
        },

        // YooTube video
        video_enable: false,
        video_autoPlay: true,
        video_onClose: true,

        // Event tracking
        tracking_open: {
            enable: false,
            category: 'Popup Box',
            action: 'Popup Open',
        },
        tracking_close: {
            enable: false,
            category: 'Popup Box',
            action: 'Popup Close',
        },


    };
    let settings = Object.assign(default_options, options);
    let prefix = 'ds-popup';
    let self = element;
    let popup = self.querySelector('.' + prefix + '-wrapper');
    let content = self.querySelector('.' + prefix + '-content');
    let overlay = createOverlay();
    let close = createCloseBtn();
    let video = videoHosting();

    if (settings.block_page) {
        self.setAttribute('aria-modal', 'true');
    }

    let loop_counter = 1;
    let originalContent = content.innerHTML;
    let contentRandom = getOptionsFromHTML(originalContent);

    function objConvert(obj) {
        let str = '';
        for (let key in obj) {
            str += key + ':' + obj[key] + ';';
        }
        return str;
    }

    function createOverlay() {
        if (!settings.overlay_isVisible) {
            return false;
        }
        let div = document.createElement('div');
        div.className = prefix + '-overlay fadeIn';
        self.prepend(div);
        return self.querySelector('.' + prefix + '-overlay');
    }

    function createCloseBtn() {
        if (!settings.close_isVisible) {
            return false;
        }
        let div = document.createElement('button');
        div.className = prefix + '-close';
        popup.prepend(div);
        return popup.querySelector('.' + prefix + '-close');
    }

    function videoHosting() {
        let youtube = self.querySelector('iframe[src*="youtube.com"]');
        let vimeo = self.querySelector('iframe[src*="vimeo.com"]');
        if (youtube) {
            return youtube;
        } else if (vimeo) {
            return vimeo;
        } else {
            return false;
        }
    }

    function setStyles() {
        overlayStyle();
        contentStyle();
        popupStyle();
        closeStyle();
    }

    function overlayStyle() {
        if (!overlay) {
            return;
        }
        overlay.style.cssText = 'z-index:' + (settings.popup_zindex - 3) + ';' + objConvert(settings.overlay_css);
        overlay.setAttribute('data-ds-effect', settings.overlay_animation);
    }

    function contentStyle() {
        if (!content) {
            return;
        }
        content.style.cssText = 'z-index:' + (settings.popup_zindex - 1) + ';' + objConvert(settings.content_css);
    }

    function popupStyle() {
        if (!popup) {
            return;
        }
        popup.style.cssText = 'z-index:' + (settings.popup_zindex - 2) + ';' + objConvert(settings.popup_css);
        popup.classList.add(settings.popup_position);
        popup.setAttribute('data-ds-effect', settings.popup_animation);
        let isMobile = window.screen.width <= parseInt(settings.mobile_breakpoint);
        if (isMobile) {
            popup.style.cssText += objConvert(settings.mobile_css);
        }
        fixedPopupStyle();
    }

    function fixedPopupStyle() {
        let style = getComputedStyle(popup);
        let height = style.height;
        let width = style.width;

        if (height === 'auto') {
            popup.style.display = 'block';
            let popup_height = popup.offsetHeight;
            popup.style.display = '';
            popup.style.height = popup_height + 'px';
        }

        if (width === 'auto') {
            popup.style.display = 'block';
            let popup_width = popup.offsetWidth;
            popup.style.display = '';
            popup.style.width = popup_width + 'px';
        }

        switch (settings.popup_position) {
            case '-center':
                popup.style.bottom = '0';
                popup.style.right = '0';
                break;
            case '-bottomCenter':
            case '-topCenter' :
                popup.style.right = '0';
                break;
        }

    }

    function closeStyle() {
        if (!close) {
            return;
        }
        close.classList.add(settings.close_position, settings.close_type);
        close.style.cssText = 'z-index:' + settings.popup_zindex + ';' + objConvert(settings.close_css);
        close.setAttribute('data-ds-close-text', settings.close_content);
        const closeText = settings.close_content || 'Close popup';
        close.setAttribute('aria-label', closeText);
        if (settings.close_outer) {
            close.classList.add('-outer');
        }
        if (settings.close_type === '-tag' || settings.close_type === '-icon') {
            let fontSize = close.style.fontSize;
            let box = parseInt(fontSize) + 5;
            let box_style = {
                'width': box + 'px',
                'height': box + 'px',
                'line-height': box + 'px',
            };
            close.style.cssText += objConvert(box_style);
        }
    }

    function openPopupActions() {
        let action = settings.open_popup;

        if (activatePopupUrl() !== true) {
            return;
        }

        if (referrerPopup() !== true) {
            return;
        }


        switch (action) {
            case 'click':
                clickOpenAction();
                break;
            case 'hover':
                hoverOpenAction();
                break;
            case 'auto':
                autoOpenAction();
                break;
            case 'scrolled':
                scrolledOpenAction();
                break;
            case 'rightclick':
                rightClickOpenAction();
                break;
            case 'selected':
                selectedOpenAction();
                break;
            case 'exit':
                exitOpenAction();
                break;
            case 'loop':
                loopPopup();
                break;
        }
    }

    function loopPopup() {
        const time = Math.floor(Math.random() * (settings.loop.end - settings.loop.start + 1)) + settings.loop.start;
        if (loop_counter > settings.loop.counter) {
            return;
        }
        setTimeout(function () {
            openPopup();
            loop_counter++;
        }, time * 1000);
    }

    function convertRandom() {
        if (contentRandom.length > 0) {
            let count = 0;
            content.innerHTML = originalContent.replace(/\{\{(.*?)\}\}/g, function (match, group1) {
                count++;
                const randomOption = getRandomOption(group1);
                return `<span class='popup-span-box-${count}'>${randomOption}</span>`;
            });
        }
    }

    function getRandomOption(optionString) {
        const options = optionString.split("|"); // Split options into an array
        const randomIndex = Math.floor(Math.random() * options.length); // Get a random index
        return options[randomIndex].trim(); // Return the random option, removing leading/trailing whitespace
    }

    function getOptionsFromHTML(htmlContent) {
        const regex = /\{\{(.*?)\}\}/g;
        const options = htmlContent.match(regex)?.map(match => match.slice(2, -2));

        return options || [];
    }

    function activatePopupUrl() {
        if (settings.active_url.enable !== true) {
            return true;
        }
        const popupParam = (settings.active_url.url).split('=');
        const paramName = popupParam[0];
        const paramVal = popupParam[1];
        const params = new URLSearchParams(document.location.search);
        const name = params.get(paramName);

        if (name === paramVal) {
            return true;
        }

        return false;
    }

    function referrerPopup() {
        if (settings.referrer_url.enable !== true) {
            return true;
        }

        if (settings.referrer_url.url === '') {
            return true;
        }
        const referrerUrl = document.referrer;

        return referrerUrl.includes(settings.referrer_url.url);
    }


    function clickOpenAction() {
        let trigger = '.' + settings.open_popupTrigger + ', a[href$="' + settings.open_popupTrigger + '"]';
        document.addEventListener('click', function (event) {
            if (event.target.closest(trigger)) {
                event.preventDefault();
                openPopup();
            }
        });
    }

    function hoverOpenAction() {
        let trigger = settings.open_popupTrigger;
        let triggers = document.querySelectorAll('.' + trigger + ', a[href$="' + trigger + '"]');
        triggers.forEach((e) => {
            e.addEventListener('mouseover', (event) => {
                event.preventDefault();
                openPopup();
            });
        });
    }

    function autoOpenAction() {
        setTimeout(function () {
            openPopup();
        }, settings.open_delay * 1000);
    }

    function scrolledOpenAction() {
        let ticking = false;
        window.addEventListener('scroll', function (e) {
            let scrollTop = window.scrollY;
            let docHeight = document.body.clientHeight;
            let winHeight = window.innerHeight;
            let scrollPercent = (scrollTop) / (docHeight - winHeight);
            let scrollPercentRounded = Math.round(scrollPercent * 100);
            if (scrollPercentRounded >= settings.open_distance) {
                if (!ticking) {
                    openPopup();
                    ticking = true;
                }
            }
        });
    }

    function rightClickOpenAction() {
        document.addEventListener('contextmenu', function (e) {
            openPopup();
            return false;
        });
    }

    function selectedOpenAction() {
        document.addEventListener('mouseup', function (e) {
            let selected_text = ((window.getSelection && window.getSelection()) ||
                (document.getSelection && document.getSelection()) ||
                (document.selection && document.selection.createRange && document.selection.createRange().text));
            if (selected_text.toString().length > 2) {
                openPopup();
            }
        });
    }

    function exitOpenAction() {
        let ticking = false;
        document.addEventListener('mouseout', function (e) {
            if (e.clientY < 0 && !ticking) {
                openPopup();
                ticking = true;
            }
        });
    }

    function openPopup() {
        if (hideOnMobile() === false) {
            return;
        }
        if (getCookie(settings.cookie_name) && settings.cookie_enable) {
            return;
        }
        self.classList.add('ds-active');
        if (overlay) {
            overlay.style.display = 'block';
        }
        convertRandom();
        popup.style.display = 'block';
        if (settings.block_page) {
            let page = document.querySelectorAll('html, body');
            page.forEach((el) => {
                el.classList.add('no-scroll');
            });
            self.focus();
            addInert();
        }
        videoAutoPlay();
        autoClosePopup();
        trackingOpen();
    }

    // Manage Inert
    function addInert() {
        const bodyChildren = document.body.children;

        for (let el of bodyChildren) {
            if (el.querySelector('.ds-popup') || el.classList.contains('ds-popup')) {
                continue;
            }
            el.setAttribute('inert', '');
        }
    }

    function removeInert() {
        const bodyChildren = document.body.children;

        for (let el of bodyChildren) {
            el.removeAttribute('inert');
        }
    }

    // Youtube video auto play
    function videoAutoPlay() {
        if (!settings.video_enable || !settings.video_autoPlay || !video) {
            return;
        }
        let videoURL = video.getAttribute('src');
        video.setAttribute('src', videoURL + '?autoplay=1');
    }

    // Youtube video stop
    function videoStop() {
        if (!settings.video_enable || !settings.video_onClose || !video) {
            return;
        }
        let videoURL = video.getAttribute('src');
        videoURL = videoURL.split('?')[0];
        video.setAttribute('src', videoURL + '?autoplay=0');
    }

    function hideOnMobile() {
        if (!settings.mobile_show) {
            let isMobile = window.screen.width <= parseInt(settings.mobile_breakpoint);
            if (isMobile) {
                return false;
            }
        }
    }

    function trackingOpen() {
        if (!settings.tracking_open.enable) {
            return false;
        }

        const action = settings.tracking_open.action;

        let data = {
            'event_category': settings.tracking_open.category,
        };

        if (settings.tracking_open.label) {
            data['event_label'] = settings.tracking_open.label;
        }
        if (settings.tracking_open.value) {
            data['value'] = settings.tracking_open.value;
        }

        if (typeof window.gtag === 'function') {
            gtag('event', action, data);
        }

    }

    function trackingClose() {
        if (!settings.tracking_close.enable) {
            return false;
        }

        const action = settings.tracking_close.action;

        let data = {
            'event_category': settings.tracking_close.category,
        };

        if (settings.tracking_close.label) {
            data['event_label'] = settings.tracking_close.label;
        }
        if (settings.tracking_close.value) {
            data['value'] = settings.tracking_close.value;
        }

        if (typeof window.gtag === 'function') {
            gtag('event', action, data);
        }

    }

    function closePopupActions() {
        clickCloseAction();
        closePopupESC();
        closePopupOverlay();
        if (close) {
            close.addEventListener('click', () => {
                closePopup();
            });
        }
    }

    function autoClosePopup() {
        if (!settings.auto_closePopup) {
            return;
        }
        setTimeout(function () {
            closePopup();
        }, settings.auto_closeDelay * 1000);

    }

    function clickCloseAction() {
        let closeBtn = self.querySelector('.' + settings.close_popupTrigger);
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                closePopup();
            });
        }
    }

    function closePopupESC() {
        if (!settings.popup_esc) {
            return;
        }
        window.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                closePopup();
            }
        });
    }

    function closePopupOverlay() {
        if (!settings.overlay_closesPopup || !overlay) {
            return;
        }
        overlay.addEventListener('click', function () {
            closePopup();
        });
    }

    function closePopup() {
        setCookie();
        self.classList.remove('ds-active');
        videoStop();
        trackingClose();
        setTimeout(function () {
            if (overlay) {
                overlay.style.display = '';
            }
            popup.style.display = '';
        }, 600);

        if (settings.block_page) {
            let page = document.querySelectorAll('html, body');
            page.forEach((el) => {
                el.classList.remove('no-scroll');
            });
            removeInert();
        }
        redirectOnClose();
        if (settings.open_popup === 'loop') {
            loopPopup();
        }
    }

    function redirectOnClose() {
        if (!settings.redirect_onClose) {
            return;
        }
        let redirectUrl = settings.redirect_URL;
        if (redirectUrl !== '' && redirectUrl.indexOf('http') > -1) {
            window.open(redirectUrl, settings.redirect_target);
        }
    }

    function setCookie() {
        if (!settings.cookie_enable) {
            return;
        }
        const days = parseFloat(settings.cookie_days);
        const now = new Date();
        const ttl = days * 24 * 60 * 60 * 1000;
        const item = {
            value: 'yes',
            expiry: now.getTime() + ttl,
        };
        localStorage.setItem(settings.cookie_name, JSON.stringify(item));

    }

    function getCookie(key) {
        const itemStr = localStorage.getItem(key);

        if (!itemStr) {
            return false;
        }
        const item = JSON.parse(itemStr);
        const now = new Date();

        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return false;
        }
        return true;
    }

    function popupRun() {
        setStyles();
        openPopupActions();
        closePopupActions();
    }

    return popupRun();

};

document.addEventListener('DOMContentLoaded', function () {

    if (typeof PopupBoxObj !== 'undefined') {
        for (var id in PopupBoxObj) {
            const element = document.getElementById(`ds-popup-${id}`);
            const selector = PopupBoxObj[id]['selector'];
            const options = PopupBoxObj[id];
            new PopupBox(selector, options, element);
        }
    }
});