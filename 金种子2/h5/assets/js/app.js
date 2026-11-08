/* ============================================================
 * app.js — 启动、底部导航、全局事件委托
 * ============================================================ */
(function () {
  var A = window.APP;

  var TABS = [
    { id: 'home', name: '首页', icon: 'home' },
    { id: 'map', name: '地图', icon: 'map' },
    { id: 'routes', name: '线路', icon: 'route' },
    { id: 'stories', name: '故事', icon: 'book' },
    { id: 'tasks', name: '研学', icon: 'task' },
    { id: 'me', name: '我的', icon: 'user' }
  ];

  function buildTabbar() {
    var tb = document.getElementById('tabbar');
    if (!tb) return;
    tb.innerHTML = TABS.map(function (t) {
      return '<button class="tabbar__item" data-tab="' + t.id + '" aria-label="' + t.name + '">' +
        A.icon(t.icon, 21) + '<span>' + t.name + '</span></button>';
    }).join('');
  }

  /* 全局跳转委托：兼容页面内与弹层内的 data-go / data-back */
  document.addEventListener('click', function (e) {
    var el = e.target;
    if (!el || !el.closest) return;

    var go = el.closest('[data-go]');
    if (go) {
      var wrap = go.closest('.modal-wrap');
      if (wrap) {
        wrap.classList.remove('in');
        setTimeout(function () { if (wrap.parentNode) wrap.remove(); }, 240);
      }
      e.preventDefault();
      A.go(go.getAttribute('data-go'));
      return;
    }

    var bk = el.closest('[data-back]');
    if (bk) {
      e.preventDefault();
      var mw = bk.closest('.modal-wrap');
      if (mw) { mw.remove(); return; }
      A.back();
      return;
    }

    var tab = el.closest('.tabbar__item');
    if (tab) {
      var page = document.getElementById('page');
      if (tab.classList.contains('is-active') && page) { page.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      A.go(tab.dataset.tab);
    }
  }, false);

  /* 防止 iOS 双击缩放 */
  var lastTouch = 0;
  document.addEventListener('touchend', function (e) {
    var now = Date.now();
    if (now - lastTouch < 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

  function boot() {
    buildTabbar();
    A.render();
    if (!A.state.joined) { A.state.joined = new Date().toISOString(); A.save(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();