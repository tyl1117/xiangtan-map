/* ============================================================
 * views-home.js — 首页
 * ============================================================ */
(function () {
  var A = window.APP, D = A.D, UI = window.UI;

  A.pages.home = {
    tab: 'home',
    title: '首页',
    render: function () {
      var s = A.state;
      var visited = Object.keys(s.visits).length;
      var total = D.pois.length;
      var pct = visited / total;
      var featured = D.stories[0];
      var route = D.routes[0];

      var features = [
        { ico: 'map', name: '数字地图', desc: '定位 · 讲解 · 导航', go: 'map' },
        { ico: 'route', name: '主题线路', desc: '半日到两日', go: 'routes' },
        { ico: 'book', name: '红色故事', desc: D.stories.length + ' 篇史料故事', go: 'stories' },
        { ico: 'task', name: '研学任务', desc: '打卡 · 答题 · 记录', go: 'tasks' },
        { ico: 'building', name: '机构定制', desc: '方案 · 工具包', go: 'b2b' },
        { ico: 'award', name: '研学成果', desc: '证书 · 报告', go: 'cert' }
      ];

      var html = '';

      /* ---- 主视觉 ---- */
      html += '<section class="hero">' +
        '<img class="hero__img" src="' + D.IMG + 'cover.jpg" alt="韶山毛泽东同志故居">' +
        '<div class="hero__duo"></div><div class="hero__veil"></div>' +
        '<div class="hero__top">' +
        '<div class="brand"><div class="seal">韶</div><div class="brand__txt">' +
        '<span class="brand__name">韶山红</span><span class="brand__sub">RED STUDY MAP</span></div></div>' +
        '<button class="region-pill" data-go="map">' + A.icon('locate', 13) + ' 韶山 · 核心景区</button>' +
        '</div>' +
        '<div class="hero__body">' +
        '<div class="hero__eyebrow">2026 · 红色研学数字地图</div>' +
        '<h1 class="hero__title">寻先辈足迹<em>悟初心使命</em></h1>' +
        '<p class="hero__desc">一张可走、可听、可学的红色地图。从韶山冲出发，把课本里的历史，走成脚下的路。</p>' +
        '<div class="hero__stats">' +
        '<div class="hero__stat"><b>' + total + '</b><span>核心点位</span></div>' +
        '<div class="hero__stat"><b>' + D.routes.length + '</b><span>主题线路</span></div>' +
        '<div class="hero__stat"><b>' + D.stories.length + '</b><span>红色故事</span></div>' +
        '<div class="hero__stat"><b>' + D.badges.length + '</b><span>研学徽章</span></div>' +
        '</div>' +
        '<div class="hero__cta">' +
        '<button class="btn btn--primary" data-go="map">' + A.icon('map', 18) + '开始导览</button>' +
        '<button class="btn btn--ghost" data-go="route/' + route.id + '">推荐线路</button>' +
        '</div></div>' +
        '<div class="scroll-hint">向下探索</div>' +
        '</section>';

      /* ---- 功能入口 ---- */
      html += '<section class="sec">' +
        '<div class="sec__head"><div><div class="kicker">CORE</div><h2 class="sec__title">一张地图的五种打开方式</h2>' +
        '<div class="sec__sub">地图导览 · 主题线路 · 红色故事 · 互动研学 · 机构服务</div></div></div>' +
        '<div class="features">';
      features.forEach(function (f) {
        html += '<button class="feature" data-go="' + f.go + '">' +
          '<div class="feature__ico">' + A.icon(f.ico, 18) + '</div>' +
          '<div class="feature__name">' + f.name + '</div>' +
          '<div class="feature__desc">' + f.desc + '</div></button>';
      });
      html += '</div></section><div class="hair"></div>';

      /* ---- 主题线路 ---- */
      html += '<section class="sec">' +
        '<div class="sec__head"><div><div class="kicker">ROUTES</div><h2 class="sec__title">主题线路</h2>' +
        '<div class="sec__sub">按学段与时长选择，跟着编号走</div></div>' +
        '<button class="sec__more" data-go="routes">全部 ' + A.icon('next', 13) + '</button></div>' +
        '<div class="hscroll">';
      D.routes.forEach(function (r) {
        html += '<button class="route-card" data-go="route/' + r.id + '">' +
          '<img class="route-card__img" src="' + r.cover + '" alt="' + r.name + '" loading="lazy">' +
          '<div class="route-card__veil"></div>' +
          '<div class="route-card__top"><span class="route-card__tag">' + r.theme + '</span>' +
          '<span class="route-card__dur">' + r.duration + '</span></div>' +
          '<div class="route-card__body"><div class="route-card__name">' + r.name + '</div>' +
          '<div class="route-card__meta"><span>' + A.icon('locate', 12) + r.stops.length + ' 个点位</span>' +
          '<span>' + A.icon('walk', 12) + r.distance + '</span></div></div></button>';
      });
      html += '</div></section>';

      /* ---- 今日故事 ---- */
      html += '<section class="sec" style="padding-top:4px">' +
        '<div class="sec__head"><div><div class="kicker">STORY</div><h2 class="sec__title">红色故事</h2>' +
        '<div class="sec__sub">史料为据，讲给人听</div></div>' +
        '<button class="sec__more" data-go="stories">更多 ' + A.icon('next', 13) + '</button></div>' +
        '<button class="story-hero" data-go="story/' + featured.id + '">' +
        '<img src="' + featured.cover + '" alt="' + featured.title + '" loading="lazy">' +
        '<div class="story-hero__veil"></div>' +
        '<div class="story-hero__body"><span class="story-hero__cat">' + featured.cat + '</span>' +
        '<div class="story-hero__title">' + featured.title + '</div>' +
        '<div class="story-hero__meta">' + featured.mins + ' 分钟读完 · 关联点位 ' + featured.poiIds.length + ' 处</div>' +
        '</div></button></section>';

      /* ---- 研学进度 ---- */
      html += '<section class="sec" style="padding-top:6px">' +
        '<div class="progress-card">' +
        '<div class="progress-card__head"><div class="progress-card__title">我的研学足迹</div>' +
        '<span class="kicker" style="color:rgba(232,211,168,.7)">' + (visited ? '进行中' : '未开始') + '</span></div>' +
        '<div class="progress-card__body">' +
        '<div class="ring">' + UI.ring(pct, 74) + '<div class="ring__txt">' +
        '<div><b style="font-size:18px">' + visited + '</b><small>/' + total + '</small></div></div></div>' +
        '<div class="progress-card__stats">' +
        '<div class="progress-card__stat"><b>' + s.points + '</b><span>研学积分</span></div>' +
        '<div class="progress-card__stat"><b>' + s.badges.length + '</b><span>已获徽章</span></div>' +
        '<div class="progress-card__stat"><b>' + s.notes.length + '</b><span>观察记录</span></div>' +
        '</div></div>' +
        '<div class="progress-card__foot"><span>打卡 1 个点位 +10 分，走完线路 +30 分</span>' +
        '<button class="sec__more" style="color:#E8D3A8" data-go="tasks">去研学 ' + A.icon('next', 13) + '</button></div>' +
        '</div></section>';

      /* ---- 机构服务 ---- */
      html += '<section class="sec" style="padding-top:2px">' +
        '<div class="sec__head"><div><div class="kicker">FOR INSTITUTIONS</div><h2 class="sec__title">机构定制服务</h2></div></div>' +
        '<button class="b2b-banner" data-go="b2b">' +
        '<img class="b2b-banner__img" src="' + D.IMG + 'poster-sample.jpg" alt="研学方案样例">' +
        '<div class="b2b-banner__body"><div class="b2b-banner__kicker">学校 · 研学机构 · 场馆</div>' +
        '<div class="b2b-banner__title">把线路、任务与成果装进一个二维码</div>' +
        '<div class="b2b-banner__desc">方案定制 · 工具包 · 现场执行 · 内容授权</div></div>' +
        '<span class="b2b-banner__arrow">' + A.icon('arrow', 18) + '</span></button></section>';

      /* ---- 页脚 ---- */
      html += '<footer class="foot">' +
        '<div class="foot__seal">韶</div>' +
        '<div class="foot__txt">韶山红 · 红色研学数字地图（试点版）<br>' +
        D.meta.disclaimer + '<br>内容依据公开史料整理，上线前须经场馆核定</div>' +
        '<div class="foot__ver">' + D.meta.version + ' · ' + D.meta.updated + '</div>' +
        '</footer>';

      return html;
    },
    mount: function (root) {
      /* 主视觉轻微视差 */
      var hero = root.querySelector('.hero__img');
      var page = root;
      if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var onScroll = function () {
          var y = page.scrollTop;
          if (y < 700) hero.style.transform = 'translateY(' + (y * 0.28) + 'px) scale(1.02)';
        };
        page.addEventListener('scroll', onScroll, { passive: true });
      }
    }
  };
})();