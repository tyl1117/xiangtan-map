/* ============================================================
 * views-map.js — 数字地图（示意导览图 · 拖拽缩放 · 打卡 · 线路引导）
 * ============================================================ */
(function () {
  var A = window.APP, D = A.D;

  var LABELS = {
    guju: { dx: 0, dy: -42, anchor: 'middle' },
    tongxiang: { dx: 0, dy: -40, anchor: 'middle' },
    jinianguan: { dx: 0, dy: 46, anchor: 'middle' },
    nanan: { dx: 54, dy: 6, anchor: 'start' },
    maoshi: { dx: 0, dy: 46, anchor: 'middle' },
    tezhi: { dx: 0, dy: -40, anchor: 'middle' },
    dishui: { dx: 0, dy: 46, anchor: 'middle' },
    beilin: { dx: 0, dy: 46, anchor: 'middle' },
    daotian: { dx: -50, dy: 30, anchor: 'end' }
  };

  function svgMap() {
    var s = A.state;
    var cur = s.route.activeId;
    var r = cur ? A.route(cur) : null;
    var out = '';

    out += '<defs>' +
      '<pattern id="mpGrid" width="75" height="75" patternUnits="userSpaceOnUse">' +
      '<path d="M75 0H0V75" fill="none" stroke="rgba(150,120,80,.10)" stroke-width="1"/></pattern>' +
      '<linearGradient id="mpWaterG" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#BBD6DE"/><stop offset="100%" stop-color="#9FC2CE"/></linearGradient>' +
      '</defs>';

    out += '<rect class="mp-paper" x="0" y="0" width="750" height="1080"/>';
    out += '<rect x="0" y="0" width="750" height="1080" fill="url(#mpGrid)" opacity=".8"/>';

    /* 山体 */
    out += '<path class="mp-hill mp-hill--2" d="M0 0h750v118c-70 26-118-14-186 6-64 19-96 66-170 52C316 162 250 196 176 176 108 158 44 190 0 176Z"/>';
    out += '<path class="mp-hill mp-hill--3" d="M0 250c62-24 96-64 156-58 64 6 84 62 148 70 56 7 82-30 130-18 46 12 54 54 96 62V0H0Z" opacity=".55"/>';
    out += '<path class="mp-hill mp-hill--2" d="M0 1080V842c58-16 96-56 152-46 56 10 74 58 128 62 52 4 76-34 124-26 50 8 62 52 104 58 52 7 74-26 118-30 48-4 78 22 124 22v198Z"/>';
    out += '<path class="mp-hill mp-hill--3" d="M750 1080V690c-44-8-70 30-108 32-40 2-56-32-92-30-34 2-42 30-42 30v358Z" opacity=".5"/>';
    out += '<path class="mp-ridge" d="M28 1042c60-34 112-96 186-98 66-2 92 44 150 40 46-3 66-32 108-30"/>';
    out += '<path class="mp-ridge" d="M470 1060c40-18 66-58 112-64 34-5 56 8 78 4" opacity=".6"/>';

    /* 韶河 */
    out += '<path class="mp-water" stroke="url(#mpWaterG)" d="M196 232c46 40 66 96 118 132 54 37 96 34 130 76 40 50 44 118 86 166 44 50 84 78 108 148"/>';
    out += '<path class="mp-water mp-water--thin" stroke="url(#mpWaterG)" d="M196 232c-30 18-52 26-84 26"/>';
    out += '<text class="mp-label mp-label--sm" x="520" y="742" transform="rotate(56 520 742)">韶 河</text>';

    /* 道路 */
    out += '<path class="mp-road" d="M742 806c-74-6-124-40-186-64-52-20-96-14-140-30-44-16-62-44-84-80"/>';
    out += '<path class="mp-road--inner" d="M742 806c-74-6-124-40-186-64-52-20-96-14-140-30-44-16-62-44-84-80"/>';
    out += '<path class="mp-road" d="M396 664c-8-44 6-88 6-128 0-46-14-84-6-124 8-38 44-68 62-104"/>';
    out += '<path class="mp-road--inner" d="M396 664c-8-44 6-88 6-128 0-46-14-84-6-124 8-38 44-68 62-104"/>';
    out += '<path class="mp-road" d="M410 700c-42 46-84 74-112 118-26 40-32 82-42 122"/>';
    out += '<path class="mp-road--inner" d="M410 700c-42 46-84 74-112 118-26 40-32 82-42 122"/>';
    out += '<path class="mp-road--dash" d="M604 400c-40 30-70 66-96 106"/>';
    out += '<path class="mp-road--dash" d="M172 330c-6 60 4 118 24 172"/>';

    /* 农田 / 树 */
    var fields = [[318, 700], [352, 726], [386, 748], [286, 728], [330, 758], [372, 776], [406, 800], [270, 790]];
    fields.forEach(function (f) {
      out += '<rect class="mp-field" x="' + f[0] + '" y="' + f[1] + '" width="70" height="24" rx="4" opacity=".65" transform="rotate(-16 ' + f[0] + ' ' + f[1] + ')"/>';
    });
    out += '<path class="mp-paddy" d="M300 712l60-16M310 736l66-16M322 762l64-18M336 788l58-18M282 758l54-14"/>';

    var trees = [[250, 470], [268, 500], [238, 522], [470, 860], [496, 892], [444, 910], [640, 640], [664, 668], [612, 690], [120, 640], [150, 676], [96, 700], [548, 260], [576, 236], [520, 232]];
    trees.forEach(function (t) {
      out += '<circle class="mp-tree" cx="' + t[0] + '" cy="' + t[1] + '" r="11"/>' +
        '<circle class="mp-tree" cx="' + (t[0] + 13) + '" cy="' + (t[1] + 5) + '" r="8"/>';
    });

    /* 区域文字 */
    out += '<text class="mp-label" x="120" y="214" letter-spacing="6">滴 水 洞 景 区</text>';
    out += '<text class="mp-label" x="286" y="1008" letter-spacing="8">韶 峰</text>';
    out += '<text class="mp-label" x="486" y="330" letter-spacing="6">韶 山 冲</text>';
    out += '<text class="mp-label mp-label--sm" x="626" y="852">景区入口</text>';
    out += '<text class="mp-label mp-label--sm" x="86" y="880" transform="rotate(-72 86 880)">西 部 山 林</text>';

    /* 线路 */
    if (r) {
      var pts = r.stops.map(function (id) { var p = A.poi(id); return p.x + ',' + p.y; }).join(' ');
      out += '<polyline class="route-line route-line--base" points="' + pts + '"/>';
      out += '<polyline class="route-line" points="' + pts + '"/>';
    }

    /* 我的位置 */
    out += '<g class="me-g" transform="translate(648,736)">' +
      '<circle class="me-dot__ring" r="16"/><circle class="me-dot" r="6"/>' +
      '<circle r="2.4" fill="#fff"/></g>';

    /* 点位 */
    D.pois.forEach(function (p, i) {
      var lb = LABELS[p.id] || { dx: 0, dy: 44, anchor: 'middle' };
      var color = A.catColor(p.cat);
      var cls = 'mp-poi' + (s.visits[p.id] ? ' is-visited' : '');
      var isCur = r && r.stops[s.route.step] === p.id;
      if (isCur) cls += ' is-active';
      /* 序号只在有进行中的线路时出现，按线路站序编号 */
      var ridx = r ? r.stops.indexOf(p.id) : -1;
      out += '<g class="' + cls + '" data-poi="' + p.id + '" transform="translate(' + p.x + ',' + p.y + ')" role="button" tabindex="0" aria-label="' + p.name + '">' +
        '<circle class="mp-poi__hit" r="46"/>' +
        (isCur ? '<circle class="pulse-ring" r="20"/>' : '') +
        '<circle class="mp-poi__pin" r="17" stroke="' + color + '"/>' +
        '<circle class="mp-poi__core" r="11" fill="' + color + '"/>' +
        '<text class="mp-poi__num" fill="#fff" y="1">' + (ridx >= 0 ? ridx + 1 : '') + '</text>' +
        '<text class="mp-poi__label" x="' + lb.dx + '" y="' + lb.dy + '" text-anchor="' + lb.anchor + '">' + p.mapLabel + '</text>' +
        '</g>';
    });

    return '<svg class="map-svg" viewBox="0 0 750 1080" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' + out + '</svg>';
  }

  function sheetHtml(p) {
    var visited = !!A.state.visits[p.id];
    var html = '<div class="sheet__grab"></div><div class="sheet__main">' +
      (p.hero ? '<img class="sheet__img" src="' + p.hero + '" alt="' + p.name + '">' : '<div class="sheet__img sheet__img--ph">' + p.archive + '</div>') +
      '<div class="sheet__body"><div class="sheet__type">' + A.catName(p.cat) + ' · ' + (p.level || '') + '</div>' +
      '<div class="sheet__name">' + p.name + '</div>' +
      '<div class="sheet__meta"><span>' + A.icon('clock', 12) + p.hours + '</span><span>' + A.icon('walk', 12) + p.walk + '</span></div>' +
      '</div></div>' +
      '<div class="sheet__actions">' +
      '<button class="btn btn--line btn--sm" data-act="audio">' + A.icon('audio', 15) + '讲解</button>' +
      '<button class="btn btn--red btn--sm" data-act="detail">查看详情</button>' +
      '</div>';
    return html;
  }

  A.pages.map = {
    tab: 'map',
    cls: 'page--map',
    title: '数字地图',
    render: function () {
      var s = A.state;
      var r = s.route.activeId ? A.route(s.route.activeId) : null;
      var cats = D.categories;
      var html = '';

      html += '<div class="map-head">' +
        '<div class="map-head__row">' +
        '<div class="map-head__title">韶山 · 数字地图<small>SHAOSHAN GUIDE MAP · 示意图</small></div>' +
        '<button class="circle-btn" data-go="stories" aria-label="红色故事" style="background:rgba(120,90,60,.1);color:#2B2320;box-shadow:inset 0 0 0 1px rgba(120,90,60,.18)">' + A.icon('book', 18) + '</button>' +
        '</div>' +
        '<div class="chips" id="map-chips">' +
        '<button class="chip is-on" data-cat="all"><i class="chip__dot"></i>全部</button>';
      cats.forEach(function (c) {
        html += '<button class="chip" data-cat="' + c.id + '"><i class="chip__dot" style="background:' + c.color + '"></i>' + c.name + '</button>';
      });
      html += '</div></div>';

      html += '<div class="map-viewport" id="map-vp"><div class="map-inner" id="map-inner">' + svgMap() + '</div></div>';

      html += '<div class="map-legend"><span><i style="background:#A32222"></i>故居旧址</span>' +
        '<span><i style="background:#8C5A2B"></i>纪念场馆</span>' +
        '<span><i style="background:#3E5D4B"></i>革命遗址</span>' +
        '<span><i style="background:#3F6B7D"></i>自然人文</span>' +
        (s.visits && Object.keys(s.visits).length ? '<span><i style="background:#C9A45C"></i>已打卡 ' + Object.keys(s.visits).length + '/' + D.pois.length + '</span>' : '') +
        '</div>';

      html += '<div class="map-zoom">' +
        '<button data-zoom="in" aria-label="放大">' + A.icon('plus', 18) + '</button>' +
        '<button data-zoom="out" aria-label="缩小">' + A.icon('minus', 18) + '</button>' +
        '<button data-zoom="reset" aria-label="复位">' + A.icon('locate', 18) + '</button>' +
        '</div>';

      html += '<div class="sheet" id="sheet"></div>';

      if (r) {
        var step = s.route.step || 0;
        var cur = A.poi(r.stops[step]);
        html += '<div class="guide-bar" id="guide-bar">' +
          '<div class="guide-bar__no">' + (step + 1) + '<span style="opacity:.5;font-size:11px">/' + r.stops.length + '</span></div>' +
          '<div class="guide-bar__body" data-act="sheet"><div class="guide-bar__kicker">研学进行中 · ' + r.theme + '</div>' +
          '<div class="guide-bar__name">' + (cur ? cur.name : '已完成') + '</div></div>' +
          '<button class="guide-bar__btn" data-act="next">' + (step >= r.stops.length - 1 ? '完成' : '下一站') + '</button>' +
          '<button class="guide-bar__close" data-act="quit" aria-label="退出">' + A.icon('close', 16) + '</button>' +
          '</div>';
      }

      return html;
    },

    mount: function (root) {
      var vp = root.querySelector('#map-vp');
      var inner = root.querySelector('#map-inner');
      var sheet = root.querySelector('#sheet');
      var guide = root.querySelector('#guide-bar');
      if (!vp || !inner) return;

      var st = { x: 0, y: 0, s: 1 };
      var MAXS = 3.2, MINS = 1;
      var raf = null;

      function apply() {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          inner.style.transform = 'translate3d(' + st.x + 'px,' + st.y + 'px,0) scale(' + st.s + ')';
          /* 标签反向缩放，保证可读 */
          var labels = inner.querySelectorAll('.mp-poi__label');
          for (var i = 0; i < labels.length; i++) {
            labels[i].style.transform = '';
          }
        });
      }
      function clampPan() {
        var w = vp.clientWidth, h = vp.clientHeight;
        var mx = (w * (st.s - 1)) / 2 + w * 0.18;
        var my = (h * (st.s - 1)) / 2 + h * 0.18;
        st.x = Math.max(-mx, Math.min(mx, st.x));
        st.y = Math.max(-my, Math.min(my, st.y));
      }
      function zoomTo(next, cx, cy) {
        next = Math.max(MINS, Math.min(MAXS, next));
        var rect = vp.getBoundingClientRect();
        cx = cx == null ? rect.width / 2 : cx;
        cy = cy == null ? rect.height / 2 : cy;
        /* 以 (cx,cy) 为不动点缩放 */
        var dx = cx - rect.width / 2 - st.x;
        var dy = cy - rect.height / 2 - st.y;
        var k = next / st.s;
        st.x = cx - rect.width / 2 - dx * k;
        st.y = cy - rect.height / 2 - dy * k;
        st.s = next;
        clampPan();
        apply();
      }

      /* 拖拽 / 缩放 */
      var pts = {};
      var dragStart = null, pinchStart = null, suppressTap = false;
      function ptCount() { return Object.keys(pts).length; }
      function ptList() { return Object.keys(pts).map(function (k) { return pts[k]; }); }

      vp.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.mp-poi__hit, .mp-poi__pin, .mp-poi__core, .mp-poi__num')) return;
        if (e.target.closest('button')) return;
        try { vp.setPointerCapture(e.pointerId); } catch (err) {}
        pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        if (ptCount() === 1) {
          dragStart = { x: st.x, y: st.y, px: e.clientX, py: e.clientY, moved: false };
          vp.classList.add('is-drag');
        } else if (ptCount() === 2) {
          var l = ptList();
          pinchStart = {
            d: Math.hypot(l[0].x - l[1].x, l[0].y - l[1].y),
            s: st.s,
            cx: (l[0].x + l[1].x) / 2,
            cy: (l[0].y + l[1].y) / 2
          };
        }
      });
      vp.addEventListener('pointermove', function (e) {
        if (!pts[e.pointerId]) return;
        pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        if (ptCount() === 1 && dragStart) {
          var mx = e.clientX - dragStart.px, my = e.clientY - dragStart.py;
          if (Math.abs(mx) + Math.abs(my) > 4) dragStart.moved = true;
          st.x = dragStart.x + mx;
          st.y = dragStart.y + my;
          clampPan();
          apply();
        } else if (ptCount() === 2 && pinchStart) {
          var l = ptList();
          var d = Math.hypot(l[0].x - l[1].x, l[0].y - l[1].y);
          var rect = vp.getBoundingClientRect();
          var cx = (l[0].x + l[1].x) / 2 - rect.left;
          var cy = (l[0].y + l[1].y) / 2 - rect.top;
          zoomTo(pinchStart.s * (d / pinchStart.d), cx, cy);
        }
      });
      function endPointer(e) {
        delete pts[e.pointerId];
        if (ptCount() === 0) {
          var wasDrag = dragStart && dragStart.moved;
          dragStart = null; pinchStart = null;
          vp.classList.remove('is-drag');
          if (!wasDrag) closeSheet();
          else {
            suppressTap = true;
            setTimeout(function () { suppressTap = false; }, 400);
          }
        }
        if (ptCount() === 1) dragStart = null;
        if (ptCount() < 2) pinchStart = null;
      }
      vp.addEventListener('pointerup', endPointer);
      vp.addEventListener('pointercancel', endPointer);
      vp.addEventListener('wheel', function (e) {
        e.preventDefault();
        var rect = vp.getBoundingClientRect();
        zoomTo(st.s * (1 - e.deltaY * 0.0016), e.clientX - rect.left, e.clientY - rect.top);
      }, { passive: false });
      vp.addEventListener('dblclick', function (e) {
        var rect = vp.getBoundingClientRect();
        zoomTo(st.s * 1.5, e.clientX - rect.left, e.clientY - rect.top);
      });

      root.querySelectorAll('[data-zoom]').forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.dataset.zoom;
          if (k === 'in') zoomTo(st.s * 1.35);
          else if (k === 'out') zoomTo(st.s / 1.35);
          else { st.x = 0; st.y = 0; st.s = 1; apply(); }
        });
      });

      /* 筛选 */
      root.querySelectorAll('#map-chips .chip').forEach(function (c) {
        c.addEventListener('click', function () {
          root.querySelectorAll('#map-chips .chip').forEach(function (x) { x.classList.remove('is-on'); });
          c.classList.add('is-on');
          var cat = c.dataset.cat;
          inner.querySelectorAll('.mp-poi').forEach(function (g) {
            var p = A.poi(g.dataset.poi);
            g.classList.toggle('is-dim', cat !== 'all' && p.cat !== cat);
          });
        });
      });

      /* 打开点位卡 */
      var curPoi = null;
      function openSheet(id, silent) {
        var p = A.poi(id);
        if (!p) return;
        curPoi = p;
        sheet.innerHTML = sheetHtml(p);
        sheet.classList.add('is-open');
        if (guide) guide.classList.add('hide');
        inner.querySelectorAll('.mp-poi').forEach(function (g) {
          g.classList.toggle('is-active', g.dataset.poi === id);
        });
        sheet.querySelector('[data-act="detail"]').addEventListener('click', function () {
          A.go('poi/' + p.id);
        });
        sheet.querySelector('[data-act="audio"]').addEventListener('click', function () {
          A.go('poi/' + p.id + '/audio');
        });
        if (!silent) A.vibrate(8);
      }
      function closeSheet() {
        sheet.classList.remove('is-open');
        curPoi = null;
        if (guide) guide.classList.remove('hide');
        var r = A.state.route.activeId ? A.route(A.state.route.activeId) : null;
        var curId = r ? r.stops[A.state.route.step] : null;
        inner.querySelectorAll('.mp-poi').forEach(function (g) {
          g.classList.toggle('is-active', g.dataset.poi === curId);
        });
      }

      inner.querySelectorAll('.mp-poi').forEach(function (g) {
        g.addEventListener('click', function (e) {
          e.stopPropagation();
          if (suppressTap) { suppressTap = false; return; }
          openSheet(g.dataset.poi);
        });
      });

      /* 线路引导 */
      if (guide) {
        guide.addEventListener('click', function (e) {
          var act = e.target.closest('[data-act]');
          if (!act) return;
          var r = A.route(A.state.route.activeId);
          if (act.dataset.act === 'next') {
            var last = A.state.route.step >= r.stops.length - 1;
            if (last) return finishRoute(r);
            A.state.route.step += 1;
            A.save();
            A.go('map');
            setTimeout(function () {
              A.toast('第 ' + (A.state.route.step + 1) + ' 站 · ' + A.poi(r.stops[A.state.route.step]).name, { icon: 'locate' });
            }, 300);
          } else if (act.dataset.act === 'quit') {
            A.confirm('结束本次研学？', '当前进度会保留，可随时重新开始。', function () {
              A.state.route.activeId = null;
              A.state.route.step = 0;
              A.save();
              A.go('map');
            }, '结束');
          } else if (act.dataset.act === 'sheet') {
            openSheet(r.stops[A.state.route.step]);
          }
        });
      }

      function finishRoute(r) {
        var done = A.state.route.done || [];
        if (done.indexOf(r.id) === -1) done.push(r.id);
        A.state.route.done = done;
        A.state.route.activeId = null;
        A.state.route.step = 0;
        A.save();
        A.addPoints(30, '完成主题线路');
        A.checkBadges();
        A.modal('<div class="modal-body tc"><div class="badge-medal" style="margin-bottom:14px">成</div>' +
          '<div class="kicker">线路完成</div><h3 class="modal-title" style="margin-top:6px">' + r.name + '</h3>' +
          '<p class="modal-text">已记录本次研学足迹，可在「研学」页生成证书或继续下一条线路。</p>' +
          '<div class="modal-actions"><button class="btn btn--ghost" data-close>留在原地</button>' +
          '<button class="btn btn--primary" id="to-cert">生成证书</button></div></div>', { dismissible: true });
        var b = document.querySelector('#to-cert');
        if (b) b.addEventListener('click', function () {
          A.state.cert = A.state.cert || {};
          A.state.cert.route = r.id;
          A.save();
          A.go('cert');
        });
      }

      /* 首次进入给个提示 */
      if (!A.state.seenMap) {
        A.state.seenMap = true; A.save();
        setTimeout(function () { A.toast('拖动地图浏览，点击红色标记查看点位', { icon: 'info', ms: 3200 }); }, 600);
      }

      /* 若线路进行中，聚焦当前站 */
      var ar = A.state.route.activeId ? A.route(A.state.route.activeId) : null;
      if (ar) {
        var p = A.poi(ar.stops[A.state.route.step]);
        setTimeout(function () { centerOn(p.x, p.y, 1.45); }, 200);
      }

      function centerOn(x, y, scale) {
        var w = vp.clientWidth, h = vp.clientHeight;
        var k = Math.max(w / 750, h / 1080);
        var offX = (w - 750 * k) / 2;
        var offY = (h - 1080 * k) / 2;
        var vx = offX + x * k, vy = offY + y * k;
        st.s = scale || st.s;
        st.x = -((vx - w / 2) * st.s);
        st.y = -((vy - h / 2) * st.s);
        clampPan();
        apply();
      }
      apply();
    }
  };
})();