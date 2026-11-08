/* ============================================================
 * views-story.js — 红色故事（列表 + 详情）
 * ============================================================ */
(function () {
  var A = window.APP, D = A.D, UI = window.UI;

  A.pages.stories = {
    tab: 'stories',
    title: '红色故事',
    render: function (params) {
      var cats = [];
      D.stories.forEach(function (s) { if (cats.indexOf(s.cat) === -1) cats.push(s.cat); });
      var feat = D.stories[0];

      var html = '<header class="page-hero">' +
        '<div class="page-hero__kicker">RED STORIES</div>' +
        '<h1 class="page-hero__title">红色故事</h1>' +
        '<p class="page-hero__desc">从一间农舍、一块石碑、一首诗里，读懂一个人与一个时代。每篇 3–6 分钟，都标注了史料出处。</p>' +
        '<div class="page-hero__stats">' +
        '<div class="page-hero__stat"><b>' + D.stories.length + '</b><span>篇故事</span></div>' +
        '<div class="page-hero__stat"><b>' + cats.length + '</b><span>个类别</span></div>' +
        '<div class="page-hero__stat"><b>' + D.pois.length + '</b><span>个点位</span></div>' +
        '</div></header>';

      html += '<div class="story-list" style="padding-top:0">' +
        '<button class="story-hero-lg" data-go="story/' + feat.id + '">' +
        (feat.cover ? '<img src="' + feat.cover + '" alt="' + feat.title + '">' : '<div class="detail-hero__arch"><div class="detail-hero__char">' + (feat.archive || '文') + '</div></div>') +
        '<div class="story-hero-lg__veil"></div>' +
        '<div class="story-hero-lg__body"><span class="story-hero-lg__cat">' + feat.cat + '</span>' +
        '<div class="story-hero-lg__title">' + feat.title + '</div></div></button></div>';

      html += '<div style="padding:14px 20px 0"><div class="chips" id="story-chips">' +
        '<button class="chip is-on" data-cat="all">全部</button>';
      cats.forEach(function (c) {
        html += '<button class="chip" data-cat="' + c + '">' + c + '</button>';
      });
      html += '</div></div>';

      html += '<div class="story-list" id="story-list">';
      D.stories.forEach(function (s, i) {
        var read = (A.state.seenStory || []).indexOf(s.id) > -1;
        html += '<button class="story-item" data-cat="' + s.cat + '" data-go="story/' + s.id + '">' +
          '<span class="story-item__no">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>' +
          '<span class="story-item__body"><span class="story-item__cat">' + s.cat + (read ? ' · 已读' : '') + '</span>' +
          '<span class="story-item__title">' + s.title + '</span>' +
          '<span class="story-item__excerpt">' + s.excerpt + '</span>' +
          '<span class="story-item__meta">' + s.mins + ' 分钟 · 关联 ' + s.poiIds.length + ' 个点位</span></span>' +
          (s.cover ? '<img class="story-item__thumb" src="' + s.cover + '" alt="" loading="lazy">' : '<span class="story-item__thumb story-item__thumb--ph">' + (s.archive || '文') + '</span>') +
          '</button>';
      });
      html += '</div>';

      html += '<div class="sec"><div class="tip">' + A.icon('info', 15) +
        '<span>故事内容在学生研学任务中会作为答题与复述素材；所有篇目均标注公开史料出处，正式上线前须经场馆与党史部门核定。</span></div></div>';

      return html;
    },
    mount: function (root) {
      var chips = root.querySelectorAll('#story-chips .chip');
      chips.forEach(function (c) {
        c.addEventListener('click', function () {
          chips.forEach(function (x) { x.classList.remove('is-on'); });
          c.classList.add('is-on');
          var cat = c.dataset.cat;
          root.querySelectorAll('#story-list .story-item').forEach(function (it) {
            it.classList.toggle('hide', cat !== 'all' && it.dataset.cat !== cat);
          });
        });
      });
    }
  };

  A.pages.story = {
    title: '故事',
    render: function (params) {
      var st = A.story(params[0]);
      if (!st) return UI.empty('未找到该故事', 'book');
      var idx = D.stories.findIndex(function (x) { return x.id === st.id; });
      var next = D.stories[(idx + 1) % D.stories.length];
      var pois = (st.poiIds || []).map(A.poi).filter(Boolean);
      var saved = (A.state.favorites || []).some(function (f) { return f.type === 'story' && f.id === st.id; });

      var html = '<header class="story-hero-lg">' +
        (st.cover ? '<img src="' + st.cover + '" alt="' + st.title + '">' : '<div class="detail-hero__arch"><div class="detail-hero__char">' + (st.archive || '文') + '</div><small>影像待补</small></div>') +
        '<div class="story-hero-lg__veil"></div>' +
        '<div class="story-hero-lg__top">' +
        '<button class="circle-btn" data-back aria-label="返回">' + A.icon('back', 20) + '</button>' +
        '<button class="circle-btn" data-act="fav" aria-label="收藏">' + A.icon('heart', 18) + '</button>' +
        '</div>' +
        '<div class="story-hero-lg__body"><span class="story-hero-lg__cat">' + st.cat + ' · ' + st.mins + ' 分钟</span>' +
        '<div class="story-hero-lg__title">' + st.title + '</div></div></header>';

      html += '<div class="story-body">';
      st.body.forEach(function (p) { html += '<p class="text">' + p + '</p>'; });

      if (st.quote) html += '<blockquote class="quote">' + st.quote + '</blockquote>';

      if (st.knowledge && st.knowledge.length) {
        html += '<div class="know"><div class="know__title">知识点</div><div class="hl-list">';
        st.knowledge.forEach(function (k, i) {
          html += '<div class="hl"><span class="hl__n">0' + (i + 1) + '</span>' + k + '</div>';
        });
        html += '</div></div>';
      }

      if (pois.length) {
        html += '<div class="know"><div class="know__title">故事发生地</div><div>';
        pois.forEach(function (p) {
          html += '<button class="list-row" data-go="poi/' + p.id + '">' +
            '<span class="list-row__ico">' + A.icon('locate', 16) + '</span>' +
            '<span class="list-row__body">' + p.name + '<span class="list-row__sub">' + A.catName(p.cat) + ' · ' + p.duration + '</span></span>' +
            '<span style="color:#B09A78">' + A.icon('next', 16) + '</span></button>';
        });
        html += '</div></div>';
      }

      if (st.source) html += '<p class="source">' + st.source + '</p>';

      html += '<button class="list-row" data-go="story/' + next.id + '" style="margin:8px 0 20px">' +
        '<span class="list-row__ico">' + A.icon('book', 16) + '</span>' +
        '<span class="list-row__body">下一篇：' + next.title + '<span class="list-row__sub">' + next.cat + ' · ' + next.mins + ' 分钟</span></span>' +
        '<span style="color:#B09A78">' + A.icon('next', 16) + '</span></button>';

      html += '</div>';
      return html;
    },
    mount: function (root, params) {
      var st = A.story(params[0]);
      var seen = A.state.seenStory || [];
      if (seen.indexOf(st.id) === -1) {
        seen.push(st.id);
        A.state.seenStory = seen;
        A.save();
      }
      var fav = root.querySelector('[data-act="fav"]');
      var on = (A.state.favorites || []).some(function (f) { return f.type === 'story' && f.id === st.id; });
      paint();
      function paint() {
        fav.style.background = on ? 'rgba(163,34,34,.55)' : 'rgba(24,12,10,.38)';
        fav.style.color = on ? '#E8B4B4' : '#fff';
      }
      fav.addEventListener('click', function () {
        var list = A.state.favorites || [];
        var i = list.findIndex(function (f) { return f.type === 'story' && f.id === st.id; });
        if (i > -1) list.splice(i, 1); else list.push({ type: 'story', id: st.id, at: new Date().toISOString() });
        A.state.favorites = list;
        A.save();
        on = i === -1;
        paint();
        A.toast(on ? '已收藏到「我的」' : '已取消收藏', { icon: 'heart' });
      });
    }
  };
})();