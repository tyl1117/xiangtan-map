/* ============================================================
 * views-route.js — 主题线路（列表 + 详情）
 * ============================================================ */
(function () {
  var A = window.APP, D = A.D, UI = window.UI;

  A.pages.routes = {
    tab: 'routes',
    title: '主题线路',
    render: function () {
      var s = A.state;
      var done = s.route.done || [];
      var themes = [];
      D.routes.forEach(function (r) { if (themes.indexOf(r.theme) === -1) themes.push(r.theme); });

      var html = '<header class="page-hero">' +
        '<div class="page-hero__kicker">STUDY ROUTES</div>' +
        '<h1 class="page-hero__title">主题研学线路</h1>' +
        '<p class="page-hero__desc">按学段、时长与教学目标组合点位，跟着编号走，一站一站把历史走成路。</p>' +
        '<div class="page-hero__stats">' +
        '<div class="page-hero__stat"><b>' + D.routes.length + '</b><span>条线路</span></div>' +
        '<div class="page-hero__stat"><b>' + D.pois.length + '</b><span>个点位</span></div>' +
        '<div class="page-hero__stat"><b>' + (done.length ? done.length : 0) + '</b><span>已完成</span></div>' +
        '</div></header>';

      html += '<div style="padding:14px 20px 0"><div class="chips" id="route-chips">' +
        '<button class="chip is-on" data-theme="all">全部线路</button>';
      themes.forEach(function (t) {
        html += '<button class="chip" data-theme="' + t + '">' + t + '</button>';
      });
      html += '</div></div>';

      html += '<div class="route-list" id="route-list">';
      D.routes.forEach(function (r) {
        var isDone = done.indexOf(r.id) > -1;
        html += '<button class="route-item" data-theme="' + r.theme + '" data-go="route/' + r.id + '">' +
          '<span class="route-item__tag" style="background:' + r.color + '">' + (isDone ? '已完成' : r.theme) + '</span>' +
          '<img class="route-item__img" src="' + r.cover + '" alt="' + r.name + '" loading="lazy">' +
          '<div class="route-item__body">' +
          '<div class="route-item__name">' + r.name + '</div>' +
          '<div class="route-item__desc">' + r.intro + '</div>' +
          '<div class="route-item__meta">' +
          '<span>' + A.icon('clock', 12) + r.duration + '</span>' +
          '<span>' + A.icon('walk', 12) + r.distance + '</span>' +
          '<span>' + A.icon('locate', 12) + r.stops.length + ' 站</span>' +
          '</div></div></button>';
      });
      html += '</div>';

      html += '<div class="sec" style="padding-top:6px"><div class="tip">' + A.icon('info', 15) +
        '<span>线路时长含步行与参观，不含往返交通与用餐；团队可按需删减点位，机构定制可调整顺序与任务难度。</span></div></div>';

      html += '<div class="sec" style="padding-top:0"><div class="sec__head"><div>' +
        '<div class="kicker">FOR INSTITUTIONS</div><h2 class="sec__title">需要一条专属线路？</h2>' +
        '<div class="sec__sub">按学段、人数与教学目标定制，附任务单与安全预案</div></div></div>' +
        '<button class="btn btn--red btn--block" data-go="b2b">' + A.icon('building', 18) + '了解机构定制服务</button></div>';

      return html;
    },
    mount: function (root) {
      var chips = root.querySelectorAll('#route-chips .chip');
      chips.forEach(function (c) {
        c.addEventListener('click', function () {
          chips.forEach(function (x) { x.classList.remove('is-on'); });
          c.classList.add('is-on');
          var t = c.dataset.theme;
          root.querySelectorAll('#route-list .route-item').forEach(function (it) {
            it.classList.toggle('hide', t !== 'all' && it.dataset.theme !== t);
          });
        });
      });
    }
  };

  A.pages.route = {
    title: '线路详情',
    render: function (params) {
      var r = A.route(params[0]);
      if (!r) return UI.empty('未找到该线路', 'info');
      var done = (A.state.route.done || []).indexOf(r.id) > -1;
      var active = A.state.route.activeId === r.id;

      var html = '<header class="route-hero">' +
        '<img src="' + r.cover + '" alt="' + r.name + '">' +
        '<div class="route-hero__veil"></div>' +
        '<div class="route-hero__top">' +
        '<button class="circle-btn" data-back aria-label="返回">' + A.icon('back', 20) + '</button>' +
        '<button class="circle-btn" data-act="share" aria-label="分享">' + A.icon('share', 17) + '</button>' +
        '</div>' +
        '<div class="route-hero__body">' +
        '<span class="detail-hero__kicker">' + r.theme + '线路</span>' +
        '<div class="route-hero__name">' + r.name + '</div>' +
        '<div class="route-hero__tags">' +
        '<span>' + A.icon('clock', 13) + r.duration + '</span>' +
        '<span>' + A.icon('walk', 13) + r.distance + '</span>' +
        '<span>' + A.icon('locate', 13) + r.stops.length + ' 站</span>' +
        '</div></div></header>';

      html += '<div class="detail-body">';
      html += '<div class="stat-row">' +
        '<div><b>' + r.stops.length + '</b><span>点位数</span></div>' +
        '<div><b>' + r.duration.replace(' ', '') + '</b><span>建议时长</span></div>' +
        '<div><b>' + r.distance.replace(' ', '') + '</b><span>步行里程</span></div>' +
        '<div><b>' + r.level + '</b><span>强度</span></div></div>';

      html += '<p class="text" style="margin-top:18px">' + r.intro + '</p>';

      html += '<section class="blk"><h3 class="blk__title">研学目标<small>OBJECTIVES</small></h3><div class="hl-list">';
      r.goals.forEach(function (g, i) {
        html += '<div class="hl"><span class="hl__n">0' + (i + 1) + '</span>' + g + '</div>';
      });
      html += '</div></section>';

      html += '<section class="blk"><h3 class="blk__title">行程安排<small>SCHEDULE</small></h3><div>';
      r.schedule.forEach(function (sc, i) {
        var p = A.poi(sc.poiId);
        html += '<button class="stop" data-go="poi/' + sc.poiId + '">' +
          '<span class="stop__rail"><span class="stop__no">' + (i + 1) + '</span><span class="stop__line"></span></span>' +
          '<span class="stop__body"><span class="stop__time">' + sc.time + '</span>' +
          '<span class="stop__name">' + (p ? p.name : '') + '</span>' +
          '<span class="stop__note">' + sc.note + '</span>' +
          '<span class="stop__stay">' + A.icon('clock', 11) + '停留 ' + sc.stay + '</span></span>' +
          '</button>';
      });
      html += '</div></section>';

      html += '<section class="blk"><h3 class="blk__title">研学任务<small>TASKS</small></h3><div class="flex gap8" style="flex-wrap:wrap">';
      r.tasks.forEach(function (t) {
        html += '<span class="service__item" style="font-size:11px;padding:6px 10px;border-radius:7px">' + t + '</span>';
      });
      html += '</div></section>';

      html += '<section class="blk"><div class="tip">' + A.icon('info', 15) + '<span>适合对象：' + r.suit +
        '。开始研学后可在地图上按站导航并记录打卡，完成后可生成研学证书。</span></div></section>';

      html += '<div class="actionbar">' +
        '<button class="btn btn--line btn--icon" data-go="map" aria-label="地图">' + A.icon('map', 19) + '</button>' +
        '<button class="btn ' + (done ? 'btn--line' : 'btn--red') + '" data-act="start">' +
        (active ? '继续研学' : (done ? A.icon('check', 17) + '已完成 · 再走一次' : '开始研学')) + '</button>' +
        '</div>';

      html += '</div>';
      return html;
    },
    mount: function (root, params) {
      var r = A.route(params[0]);
      root.querySelector('[data-act="share"]').addEventListener('click', function () {
        if (navigator.share) {
          navigator.share({ title: r.name, text: r.intro, url: location.href }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(r.name + ' ' + location.href).then(function () {
            A.toast('链接已复制', { icon: 'copy' });
          }).catch(function () { A.toast('当前浏览器不支持一键分享', { icon: 'info' }); });
        }
      });

      root.querySelector('[data-act="start"]').addEventListener('click', function () {
        var s = A.state;
        if (s.route.activeId && s.route.activeId !== r.id) {
          var other = A.route(s.route.activeId);
          A.confirm('切换研学线路？', '当前正在「' + (other ? other.name : '') + '」，切换后当前进度将重置。', function () {
            startRoute(r);
          }, '切换');
          return;
        }
        startRoute(r);
      });

      function startRoute(r) {
        var s = A.state;
        if (s.route.activeId !== r.id) {
          s.route.activeId = r.id;
          s.route.step = 0;
          A.save();
        }
        A.toast('研学开始 · 第 1 站 ' + A.poi(r.stops[s.route.step]).name, { icon: 'route', ms: 2400 });
        A.go('map');
      }
    }
  };
})();