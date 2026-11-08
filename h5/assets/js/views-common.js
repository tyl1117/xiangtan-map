/* ============================================================
 * views-common.js — 视图通用片段
 * ============================================================ */
window.UI = (function () {
  var uid = 0;

  function ring(pct, size, colorA, colorB, track) {
    size = size || 74;
    var r = size / 2 - 6;
    var c = 2 * Math.PI * r;
    pct = Math.max(0, Math.min(1, pct || 0));
    var id = 'rg' + (++uid);
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + (colorA || '#E8D3A8') + '"/>' +
      '<stop offset="100%" stop-color="' + (colorB || '#C9A45C') + '"/></linearGradient></defs>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + (track || 'rgba(255,255,255,.16)') + '" stroke-width="5"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="url(#' + id + ')" stroke-width="5" stroke-linecap="round" ' +
      'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - pct)).toFixed(1) + '" style="transition:stroke-dashoffset .6s ease"/>' +
      '</svg>';
  }

  /* 图片或“档案卡”占位 */
  function img(url, cls, alt) {
    if (!url) return '';
    return '<img class="' + cls + '" src="' + url + '" alt="' + (alt || '') + '" loading="lazy">';
  }
  function poiThumb(p, cls) {
    if (p.hero) return '<img class="' + cls + '" src="' + p.hero + '" alt="' + p.name + '" loading="lazy">';
    return '<div class="' + cls + ' ' + (cls + '--ph') + '">' + (p.archive || '·') + '</div>';
  }
  function storyThumb(s, cls) {
    if (s.cover) return '<img class="' + cls + '" src="' + s.cover + '" alt="' + s.title + '" loading="lazy">';
    return '<div class="' + cls + ' ' + (cls + '--ph') + '">' + (s.archive || '文') + '</div>';
  }

  function closeBtn(target) {
    return '<button class="circle-btn" data-' + (target === 'back' ? 'back' : 'close') + ' aria-label="返回">' +
      window.APP.icon('back', 20) + '</button>';
  }

  function empty(text, ico) {
    return '<div class="empty"><div class="empty__ico">' + window.APP.icon(ico || 'note', 22) + '</div>' + text + '</div>';
  }

  function badgeMini(b, st) {
    return '<div class="badge-mini ' + (st === 'on' ? 'is-on' : 'is-off') + '">' +
      '<div class="badge-mini__medal">' + b.char + '</div>' +
      '<div class="badge-mini__name">' + b.name + '</div></div>';
  }

  function fmtDateShort(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  return {
    ring: ring, img: img, poiThumb: poiThumb, storyThumb: storyThumb,
    closeBtn: closeBtn, empty: empty, badgeMini: badgeMini, fmtDateShort: fmtDateShort
  };
})();