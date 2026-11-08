/* ============================================================
 * core.js — 状态存储、工具函数、图标、提示、语音讲解、路由
 * ============================================================ */
window.APP = (function () {
  var D = window.APP_DATA;
  var KEY = 'shaoshan_red_h5_v1';
  var mem = null;

  /* ---------------- 基础工具 ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtDate(d) {
    if (!d) return '';
    var t = typeof d === 'string' ? new Date(d) : d;
    return t.getFullYear() + '.' + pad(t.getMonth() + 1) + '.' + pad(t.getDate());
  }
  function fmtTime(d) {
    var t = typeof d === 'string' ? new Date(d) : d;
    return pad(t.getHours()) + ':' + pad(t.getMinutes());
  }
  function today() { return fmtDate(new Date()); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function vibrate(ms) { try { navigator.vibrate && navigator.vibrate(ms || 12); } catch (e) {} }

  /* ---------------- 状态 ---------------- */
  function blank() {
    var d = new Date();
    return {
      v: 1,
      name: '研学学员',
      sid: 'SS-' + d.getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000)),
      joined: d.toISOString(),
      points: 0,
      visits: {},
      notes: [],
      quiz: { attempts: 0, best: 0, last: 0, wrong: [] },
      poem: { done: false },
      cert: { issued: false, at: null, no: null, route: '', visits: 0 },
      route: { activeId: null, step: 0, done: [] },
      favorites: [],
      badges: [],
      booking: null,
      region: 'shaoshan',
      seenStory: [],
      demo: false,
      lastFix: null
    };
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      var s = JSON.parse(raw);
      return Object.assign(blank(), s);
    } catch (e) { return blank(); }
  }
  var state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { mem = state; }
  }
  function reset() {
    state = blank();
    try { localStorage.removeItem(KEY); } catch (e) {}
    save();
  }

  /* ---------------- 数据查询 ---------------- */
  function poi(id) { return D.pois.filter(function (p) { return p.id === id; })[0]; }
  function route(id) { return D.routes.filter(function (r) { return r.id === id; })[0]; }
  function story(id) { return D.stories.filter(function (s) { return s.id === id; })[0]; }
  function catName(id) {
    var c = D.categories.filter(function (x) { return x.id === id; })[0];
    return c ? c.name : '';
  }
  function catColor(id) {
    var c = D.categories.filter(function (x) { return x.id === id; })[0];
    return c ? c.color : '#A32222';
  }

  /* ---------------- 图标 ---------------- */
  var ICON_PATHS = {
    map: '<path d="M9 3.5 3.5 6v14.5L9 18l6 2.5 5.5-2.5V3.5L15 6 9 3.5Z"/><path d="M9 3.5V18M15 6v14.5"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.2 16.2 15.8 7.8"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M8 7.5h7M8 11h5"/>',
    task: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 2.4 2.4L16 9"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5"/>',
    back: '<path d="m14.5 5-7 7 7 7"/>',
    next: '<path d="m9.5 5 7 7-7 7"/>',
    play: '<path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" stroke="none"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 3c0 5-7.5 9.6-7.5 9.6Z"/>',
    share: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.3 10.8 7.4-4M8.3 13.2l7.4 4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    walk: '<circle cx="13" cy="4.5" r="2"/><path d="m10 21 2-6-3-2 1.5-5 3 2 2.5 1.5M9 13l-1 3"/>',
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    star: '<path d="m12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.6-.8L12 4Z"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 7 5-2.6 5 2.6-1.5-7"/>',
    download: '<path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5"/><path d="M4 19.5h16"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    audio: '<path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/>',
    qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h3v3h-3zM19 19h1M14 20h1"/>',
    lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    edit: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14.5 5.5 4 4"/>',
    trash: '<path d="M4 7h16M9 7V5h6v2M6.5 7l1 13h9l1-13"/>',
    building: '<path d="M4 20V6l8-3 8 3v14"/><path d="M9 20v-5h6v5M8 9h2M14 9h2M8 12h2M14 12h2"/>',
    phone: '<path d="M6 3h12v18H6z"/><path d="M10.5 18.5h3"/>',
    arrow: '<path d="M5 12h14m0 0-5-5m5 5-5 5"/>',
    up: '<path d="M12 19V5m0 0-6 6m6-6 6 6"/>',
    home: '<path d="m3.5 10.6 8.5-7 8.5 7V20a1 1 0 0 1-1 1h-4.6v-6.2H9.1V21H4.5a1 1 0 0 1-1-1Z"/>',
    note: '<path d="M5 4h9l5 5v11H5z"/><path d="M14 4v5h5M8.5 13h7M8.5 16.5h4"/>'
  };
  function icon(name, size, extra) {
    var p = ICON_PATHS[name] || '';
    return '<svg class="ico ' + (extra || '') + '" width="' + (size || 22) + '" height="' + (size || 22) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  /* ---------------- 提示 / 弹层 ---------------- */
  function layer() {
    var el = document.getElementById('layer');
    return el;
  }
  var toastTimer = null;
  function toast(msg, opt) {
    opt = opt || {};
    var el = layer();
    var node = document.createElement('div');
    node.className = 'toast' + (opt.type === 'gold' ? ' toast--gold' : '');
    node.innerHTML = (opt.icon ? icon(opt.icon, 18) : '') + '<span>' + esc(msg) + '</span>';
    el.appendChild(node);
    requestAnimationFrame(function () { node.classList.add('in'); });
    setTimeout(function () {
      node.classList.remove('in');
      setTimeout(function () { node.remove(); }, 320);
    }, opt.ms || 2000);
  }
  function modal(html, opts) {
    opts = opts || {};
    var el = layer();
    var wrap = document.createElement('div');
    wrap.className = 'modal-wrap' + (opts.sheet ? ' modal-wrap--sheet' : '');
    wrap.innerHTML = '<div class="modal-mask"></div><div class="modal ' + (opts.cls || '') + '">' + html + '</div>';
    el.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('in'); });
    function close() {
      wrap.classList.remove('in');
      setTimeout(function () { wrap.remove(); }, 260);
    }
    wrap.querySelector('.modal-mask').addEventListener('click', function () {
      if (opts.dismissible !== false) close();
    });
    $$('[data-close]', wrap).forEach(function (b) { b.addEventListener('click', close); });
    return { el: wrap, close: close };
  }
  function confirmModal(title, text, onOk, okText) {
    var m = modal(
      '<div class="modal-body">' +
      '<h3 class="modal-title">' + esc(title) + '</h3>' +
      '<p class="modal-text">' + esc(text) + '</p>' +
      '<div class="modal-actions"><button class="btn btn--ghost" data-close>取消</button>' +
      '<button class="btn btn--primary" data-ok>' + esc(okText || '确定') + '</button></div></div>'
    );
    m.el.querySelector('[data-ok]').addEventListener('click', function () { m.close(); onOk && onOk(); });
    return m;
  }

  /* ---------------- 积分 / 徽章 ---------------- */
  function addPoints(n, reason) {
    if (!n) return;
    state.points += n;
    save();
    toast('+' + n + ' 研学积分' + (reason ? ' · ' + reason : ''), { icon: 'star', type: 'gold' });
  }
  function badgeState(b) {
    if (state.badges.indexOf(b.id) > -1) return 'on';
    return 'off';
  }
  function checkBadges(silent) {
    var have = state.badges;
    var visits = Object.keys(state.visits).length;
    var got = [];
    D.badges.forEach(function (b) {
      if (have.indexOf(b.id) > -1) return;
      var ok = false;
      if (b.rule === 'visit>=1') ok = visits >= 1;
      else if (b.rule === 'quiz') ok = state.quiz.attempts > 0;
      else if (b.rule === 'poem') ok = !!state.poem.done;
      else if (b.rule === 'route') ok = (state.route.done || []).length > 0;
      else if (b.rule === 'all') ok = visits >= D.pois.length;
      else if (b.rule === 'cert') ok = !!state.cert.issued;
      if (ok) { have.push(b.id); got.push(b); }
    });
    if (got.length) {
      save();
      if (!silent) {
        setTimeout(function () {
          var m = modal(
            '<div class="badge-pop">' +
            '<div class="badge-medal"><span>' + esc(got[0].char) + '</span></div>' +
            '<p class="kicker">解锁新徽章</p>' +
            '<h3 class="modal-title">' + esc(got[0].name) + '</h3>' +
            '<p class="modal-text">' + esc(got[0].desc) + '</p>' +
            '<button class="btn btn--primary btn--block" data-close>收下</button></div>', { dismissible: true });
          vibrate([16, 40, 16]);
        }, 420);
      }
    }
    return got;
  }
  function addVisit(poiId) {
    if (state.visits[poiId]) return false;
    state.visits[poiId] = new Date().toISOString();
    save();
    addPoints(10, '实地打卡');
    checkBadges();
    return true;
  }

  /* ---------------- 实地定位（GPS 打卡校验） ---------------- */
  var EARTH_R = 6371008.8;
  function rad(d) { return (d * Math.PI) / 180; }
  function distance(lat1, lng1, lat2, lng2) {
    var dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  /* 返回 { ok, code, distance, accuracy, radius }
     code: ok | far | denied | unavailable | timeout | nolocation | nogeo */
  function locate(poiId) {
    var p = poi(poiId);
    return new Promise(function (resolve) {
      if (!p) return resolve({ ok: false, code: 'nogeo' });
      if (!p.geo || typeof p.geo.lat !== 'number') return resolve({ ok: false, code: 'nogeo' });
      var radius = p.geo.r || 200;
      /* 演示模式：跳过定位校验，仅供答辩/评审现场使用 */
      if (state.demo) return resolve({ ok: true, demo: true, code: 'ok', distance: 0, radius: radius });
      if (!navigator.geolocation) return resolve({ ok: false, code: 'unavailable', radius: radius });
      var done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        resolve({ ok: false, code: 'timeout', radius: radius });
      }, 15000);
      navigator.geolocation.getCurrentPosition(function (pos) {
        if (done) return;
        done = true; clearTimeout(timer);
        var c = pos.coords;
        var d = distance(c.latitude, c.longitude, p.geo.lat, p.geo.lng);
        state.lastFix = { at: new Date().toISOString(), lat: c.latitude, lng: c.longitude, acc: c.accuracy };
        save();
        resolve({
          ok: d <= radius, code: d <= radius ? 'ok' : 'far',
          distance: Math.round(d), accuracy: Math.round(c.accuracy || 0), radius: radius
        });
      }, function (err) {
        if (done) return;
        done = true; clearTimeout(timer);
        var code = 'unavailable';
        if (err && err.code === 1) code = 'denied';
        else if (err && err.code === 3) code = 'timeout';
        resolve({ ok: false, code: code, radius: radius });
      }, { enableHighAccuracy: true, timeout: 14000, maximumAge: 0 });
    });
  }

  /* ---------------- 文字讲解（语音合成 + 跟读进度） ---------------- */
  function splitSentences(text) {
    var out = [], buf = '';
    for (var i = 0; i < text.length; i++) {
      buf += text[i];
      if ('。！？；\n'.indexOf(text[i]) > -1) { if (buf.trim()) out.push(buf.trim()); buf = ''; }
    }
    if (buf.trim()) out.push(buf.trim());
    return out;
  }
  var synthOK = (typeof window.speechSynthesis !== 'undefined') && typeof window.SpeechSynthesisUtterance === 'function';

  function audioPlayer(host, text, opts) {
    opts = opts || {};
    var sentences = splitSentences(text);
    var chars = text.length;
    var totalSec = Math.max(12, Math.round(chars / 4.6));
    var playing = false, idx = 0, elapsed = 0, speed = 1, timer = null;
    var utt = null;

    var spans = sentences.map(function (s, i) {
      var dur = Math.max(1.1, s.length / 4.6);
      return { text: s, dur: dur * (1 / (0.98 + (i % 3) * 0.02)) };
    });
    var total = spans.reduce(function (a, b) { return a + b.dur; }, 0);

    host.innerHTML =
      '<div class="audio">' +
      '<button class="audio__play" type="button" aria-label="播放讲解">' + icon('play', 20) + '</button>' +
      '<div class="audio__main">' +
      '<div class="audio__bar"><div class="audio__fill"></div><div class="audio__dot"></div></div>' +
      '<div class="audio__meta"><span class="audio__state">语音讲解 · 约 ' + Math.ceil(totalSec / 60) + ' 分钟</span>' +
      '<span class="audio__time">00:00 / ' + fmtSec(totalSec) + '</span></div>' +
      '</div>' +
      '<button class="audio__speed" type="button">1.0×</button>' +
      '</div>' +
      '<div class="transcript">' + spans.map(function (s, i) {
        return '<span class="sentence" data-i="' + i + '">' + esc(s.text) + '</span>';
      }).join('') + '</div>';

    var playBtn = host.querySelector('.audio__play');
    var fill = host.querySelector('.audio__fill');
    var dot = host.querySelector('.audio__dot');
    var timeEl = host.querySelector('.audio__time');
    var stateEl = host.querySelector('.audio__state');
    var speedBtn = host.querySelector('.audio__speed');
    var sentencesEls = $$('.sentence', host);
    var bar = host.querySelector('.audio__bar');

    function fmtSec(s) { return pad(Math.floor(s / 60)) + ':' + pad(Math.floor(s % 60)); }
    function elapsedTotal() {
      var sum = 0;
      for (var i = 0; i < idx; i++) sum += spans[i].dur;
      return sum + elapsed;
    }
    function paint() {
      var p = clamp(elapsedTotal() / total, 0, 1);
      fill.style.width = (p * 100) + '%';
      dot.style.left = (p * 100) + '%';
      timeEl.textContent = fmtSec(p * totalSec) + ' / ' + fmtSec(totalSec);
      sentencesEls.forEach(function (s, i) {
        s.classList.toggle('is-active', i === idx && playing);
        s.classList.toggle('is-done', i < idx);
      });
    }
    function speakCurrent() {
      if (!synthOK) { stateEl.textContent = '文字跟读模式 · 约 ' + Math.ceil(totalSec / 60) + ' 分钟'; return; }
      try {
        window.speechSynthesis.cancel();
        utt = new SpeechSynthesisUtterance(spans[idx].text);
        utt.lang = 'zh-CN';
        utt.rate = 0.95 * speed;
        utt.pitch = 1;
        var v = window.speechSynthesis.getVoices().filter(function (x) { return /zh|Chinese/i.test(x.lang); })[0];
        if (v) utt.voice = v;
        window.speechSynthesis.speak(utt);
      } catch (e) {}
    }
    function stopSpeech() { if (synthOK) { try { window.speechSynthesis.cancel(); } catch (e) {} } }
    function tick() {
      elapsed += 0.2 * speed * (spans[idx].dur / (spans[idx].text.length / 4.6)) ;
      var need = spans[idx].dur;
      if (elapsed >= need) {
        elapsed = 0; idx++;
        if (idx >= spans.length) { finish(); return; }
        speakCurrent();
      }
      paint();
    }
    function play() {
      if (playing) return;
      if (idx >= spans.length) { idx = 0; elapsed = 0; }
      playing = true;
      playBtn.innerHTML = icon('pause', 20);
      playBtn.classList.add('is-playing');
      speakCurrent();
      clearInterval(timer);
      timer = setInterval(tick, 200);
      paint();
      opts.onPlay && opts.onPlay();
    }
    function pause() {
      playing = false;
      clearInterval(timer);
      stopSpeech();
      playBtn.innerHTML = icon('play', 20);
      playBtn.classList.remove('is-playing');
      paint();
    }
    function finish() {
      pause();
      idx = spans.length; elapsed = 0;
      var p = 1;
      fill.style.width = '100%'; dot.style.left = '100%';
      timeEl.textContent = fmtSec(totalSec) + ' / ' + fmtSec(totalSec);
      sentencesEls.forEach(function (s) { s.classList.add('is-done'); s.classList.remove('is-active'); });
      stateEl.textContent = '已播放完毕 · 可重新播放';
      opts.onEnd && opts.onEnd();
    }
    playBtn.addEventListener('click', function () { playing ? pause() : play(); });
    speedBtn.addEventListener('click', function () {
      speed = speed === 1 ? 1.25 : (speed === 1.25 ? 1.5 : 1);
      speedBtn.textContent = speed.toFixed(1) + '×';
      if (playing) { stopSpeech(); speakCurrent(); }
    });
    bar.addEventListener('click', function (e) {
      var r = bar.getBoundingClientRect();
      var ratio = clamp((e.clientX - r.left) / r.width, 0, 1);
      var target = ratio * total, acc = 0;
      for (var i = 0; i < spans.length; i++) {
        if (acc + spans[i].dur >= target) { idx = i; elapsed = target - acc; break; }
        acc += spans[i].dur;
      }
      if (playing) { stopSpeech(); speakCurrent(); }
      paint();
    });
    paint();
    return { stop: function () { pause(); }, play: play };
  }

  /* ---------------- 研学证书 ---------------- */
  function certificateData() {
    var visits = Object.keys(state.visits).length;
    var doneRoutes = (state.route && state.route.done) || [];
    var rid = state.cert.route || (doneRoutes.length ? doneRoutes[doneRoutes.length - 1] : null);
    var r = rid ? route(rid) : null;
    return {
      name: state.name,
      no: state.cert.no || ('SS-' + new Date().getFullYear() + '-' + String(Math.floor(100000 + Math.random() * 899999))),
      date: fmtDate(state.cert.at || new Date()),
      routeName: r ? r.name : '韶山红色研学主题线路',
      visits: state.cert.visits || visits,
      points: state.points,
      badges: state.badges.length
    };
  }
  function makeCertificate() {
    var d = certificateData();
    var W = 1000, H = 1400;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var c = cv.getContext('2d');
    var serif = '"Songti SC","STSong","SimSun","Noto Serif SC",serif';

    // 纸底
    c.fillStyle = '#FBF5E8';
    c.fillRect(0, 0, W, H);
    var g = c.createRadialGradient(W / 2, H * 0.32, 80, W / 2, H * 0.32, 900);
    g.addColorStop(0, 'rgba(255,255,255,.85)');
    g.addColorStop(1, 'rgba(232,214,183,.45)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);

    // 边框
    c.strokeStyle = '#B08A47'; c.lineWidth = 3;
    c.strokeRect(38, 38, W - 76, H - 76);
    c.strokeStyle = 'rgba(176,138,71,.55)'; c.lineWidth = 1;
    c.strokeRect(52, 52, W - 104, H - 104);

    // 角饰
    function corner(x, y, sx, sy) {
      c.save(); c.translate(x, y); c.scale(sx, sy);
      c.strokeStyle = '#B08A47'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, 44); c.lineTo(0, 0); c.lineTo(44, 0); c.stroke();
      c.beginPath(); c.moveTo(12, 30); c.lineTo(12, 12); c.lineTo(30, 12); c.stroke();
      c.restore();
    }
    corner(66, 66, 1, 1); corner(W - 66, 66, -1, 1);
    corner(66, H - 66, 1, -1); corner(W - 66, H - 66, -1, -1);

    // 抬头
    c.textAlign = 'center';
    c.fillStyle = '#8A6B35';
    c.font = '500 22px ' + serif;
    c.fillText('S H A O S H A N   R E D   S T U D Y', W / 2, 150);
    c.fillStyle = '#7A1F1F';
    c.font = '700 68px ' + serif;
    c.fillText('红色研学实践证书', W / 2, 240);
    c.fillStyle = 'rgba(122,31,31,.6)';
    c.fillRect(W / 2 - 90, 272, 180, 2);

    // 正文
    c.textAlign = 'left';
    c.fillStyle = '#3A2F27';
    c.font = '400 32px ' + serif;
    var y = 400;
    var lines = [
      '兹证明  ' + d.name,
      '于 ' + d.date + ' 参加「' + d.routeName + '」主题研学，',
      '完成 ' + d.visits + ' 个现场点位打卡，累计研学积分 ' + d.points + ' 分，',
      '获得研学徽章 ' + d.badges + ' 枚。'
    ];
    lines.forEach(function (t, i) { c.fillText(t, 140, y + i * 62); });

    // 评价
    c.fillStyle = '#6B5B4B';
    c.font = '400 26px ' + serif;
    var comment = d.visits >= 8 ? '足迹遍布韶山冲，研学态度认真，记录完整。' :
      d.visits >= 4 ? '参观认真，任务完成度良好，具备继续探究的基础。' :
        '已完成基础研学任务，建议结合任务单进一步补充观察记录。';
    c.fillText(comment, 140, y + 4 * 62 + 30);

    // 落款
    c.fillStyle = '#3A2F27';
    c.font = '400 24px ' + serif;
    c.fillText('编号  ' + d.no, 140, H - 300);
    c.fillText('发证  ' + d.date, 140, H - 258);
    c.fillText('韶山红 · 红色研学数字地图（试点版）', 140, H - 216);

    // 印章
    var cx = W - 260, cy = H - 300, r = 92;
    c.save();
    c.globalAlpha = 0.88;
    c.strokeStyle = '#B02A26'; c.lineWidth = 8;
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r - 12, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#B02A26';
    c.font = '700 30px ' + serif;
    c.textAlign = 'center';
    c.fillText('韶山红研学', cx, cy - 22);
    c.font = '400 20px ' + serif;
    c.fillText('RED STUDY', cx, cy + 12);
    c.fillText(d.date.replace(/\./g, '-'), cx, cy + 44);
    // 五角星
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / 5;
      var rr = i % 2 === 0 ? 12 : 5;
      c[i === 0 ? 'moveTo' : 'lineTo'](cx + Math.cos(ang) * rr, cy - 56 + Math.sin(ang) * rr);
    }
    c.closePath(); c.fill();
    c.restore();

    // 装饰印章底纹
    c.save();
    c.globalAlpha = 0.05;
    c.fillStyle = '#7A1F1F';
    c.font = '700 220px ' + serif;
    c.textAlign = 'center';
    c.fillText('韶', W / 2, H / 2 + 120);
    c.restore();

    return { url: cv.toDataURL('image/png'), data: d };
  }

  /* ---------------- 路由 ---------------- */
  var pages = {};
  var current = { name: '', params: [] };
  var scrollMem = {};
  var TABS = ['home', 'map', 'routes', 'stories', 'tasks', 'me'];

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    if (!h) return { name: 'home', params: [] };
    var parts = h.split('/').filter(Boolean);
    return { name: parts[0] || 'home', params: parts.slice(1) };
  }
  function go(path, opt) {
    opt = opt || {};
    var target = '#/' + String(path).replace(/^#?\/?/, '');
    if (location.hash === target) { render(); return; }
    if (opt.replace) location.replace(target);
    else location.hash = target;
  }
  function back() {
    if (history.length > 1) history.back();
    else go('home');
  }
  function render() {
    var p = parseHash();
    var page = pages[p.name] || pages.home;
    var pageEl = document.getElementById('page');
    var tabbar = document.getElementById('tabbar');
    var scrollTop = pageEl ? pageEl.scrollTop : 0;
    if (current.name) scrollMem[current.name + '/' + current.params.join('/')] = scrollTop;

    tabbar.classList.toggle('is-hidden', !page.tab);
    $$('.tabbar__item', tabbar).forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.tab === (page.tab || p.name));
    });

    pageEl.style.opacity = '0';
    pageEl.innerHTML = page.render(p.params) || '';
    pageEl.scrollTop = 0;
    pageEl.className = 'page' + (page.cls ? ' ' + page.cls : '');
    // 强制回流后淡入
    void pageEl.offsetHeight;
    pageEl.style.opacity = '1';
    try { page.mount && page.mount(pageEl, p.params); } catch (err) {
      console.error('[mount]', p.name, err);
    }
    current = { name: p.name, params: p.params };
    document.title = (page.title ? page.title + ' · ' : '') + D.meta.fullName;
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', render);

  return {
    D: D, state: state, save: save, reset: reset, load: load,
    $: $, $$: $$, esc: esc, pad: pad, fmtDate: fmtDate, fmtTime: fmtTime, today: today, clamp: clamp, vibrate: vibrate,
    poi: poi, route: route, story: story, catName: catName, catColor: catColor, icon: icon,
    toast: toast, modal: modal, confirm: confirmModal, layer: layer,
    addPoints: addPoints, addVisit: addVisit, checkBadges: checkBadges, badgeState: badgeState,
    distance: distance, locate: locate,
    audioPlayer: audioPlayer, makeCertificate: makeCertificate, certificateData: certificateData,
    pages: pages, go: go, back: back, render: render, parseHash: parseHash, TABS: TABS,
    isSynthOK: function () { return synthOK; }
  };
})();