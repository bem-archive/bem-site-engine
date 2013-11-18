/* hotfix https://st.yandex-team.ru/BEM-1464
 * Touch detection idea by Modernizr
 */
if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    document.documentElement.className += " i-ua_touch_yes";
}
