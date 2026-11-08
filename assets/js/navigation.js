/* Connect native browser/phone Back to open dialogs and modals. */
(() => {
  'use strict';
  const history = window.history;
  if (!history?.pushState || !window.MutationObserver) return;
  const token = `unilink-${Date.now()}-${Math.random()}`;
  const marker = depth => ({ ...history.state, unilinkNavigation: { token, depth } });
  const byID = id => document.getElementById(id);
  let entries = [], moving = false, applying = false;
  function screens() {
    const result = [];
    const add = (key, button) => { if (button) result.push({ key, button }); };
    const scheduleShare = byID('scheduleShareDialog');
    if (scheduleShare?.open && !scheduleShare.hasAttribute('data-motion-closing')) add('schedule-share', byID('scheduleShareClose'));
    for (const [key, id] of [['city-modal', 'cityModal'], ['accent-modal', 'accentModal'], ['bells-modal', 'bellsModal']]) {
      const modal = byID(id);
      if (modal?.classList.contains('active')) add(key, modal.querySelector('.modal-btn.cancel, .modal-btn.save'));
    }
    return result;
  }
  function sync() {
    if (moving || applying) return;
    const next = screens();
    let common = 0;
    while (common < entries.length && common < next.length && entries[common].key === next[common].key) common++;
    if (common < entries.length) {
      const removed = entries.length - common;
      entries = entries.slice(0, common);
      moving = true;
      history.go(-removed);
      return;
    }
    entries = next.slice(0, common);
    for (const entry of next.slice(common)) {
      entries.push(entry);
      history.pushState(marker(entries.length), '');
    }
  }
  history.replaceState(marker(0), '');
  window.addEventListener('popstate', event => {
    const state = event.state?.unilinkNavigation;
    if (state?.token !== token) return;
    if (moving) { moving = false; sync(); return; }
    applying = true;
    const depth = Math.max(0, Math.min(entries.length, state.depth));
    while (entries.length > depth) entries.pop().button.click();
    applying = false;
    history.replaceState(marker(entries.length), '');
    sync();
  });
  const observer = new window.MutationObserver(sync);
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'open', 'data-motion-closing'] });
  sync();
})();
