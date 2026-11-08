/* ============================================================
 * views-me.js — 我的（足迹 · 徽章 · 收藏 · 设置）
 * ============================================================ */
(function () {
  var A = window.APP, D = A.D, UI = window.UI;

  function rank(points) {
    if (points >= 150) return '研学达人';
    if (points >= 80) return '红色行者';
    if (points >= 30) return '研学新兵';
    return '初入韶山';
  }

  A.pages.me = {
    tab: 'me',
    title: '我的',
    render: function () {
      var s = A.state;
      var visited = Object.keys(s.visits).length;
      var favs = (s.favorites || []).map(function (f) {
        if (f.type === 'poi') return { type: 'poi', item: A.poi(f.id), at: f.at };
        return { type: 'story', item: A.story(f.id), at: f.at };
      }).filter(function (f) { return f.item; });

      var fp = Object.keys(s.visits).map(function (id) {
        return { poi: A.poi(id), at: s.visits[id] };
      }).filter(function (x) { return x.poi; }).sort(function (a, b) { return a.at < b.at ? 1 : -1; });

      var html = '<div class="me-hero">' +
        '<div class="me-id"><div class="me-avatar">' + s.name.charAt(0) + '</div>' +
        '<div class="me-id__body"><div class="me-name" data-act="rename">' + A.esc(s.name) + A.icon('edit', 13) + '</div>' +
        '<div class="me-no">' + s.sid + ' · 加入于 ' + A.fmtDate(new Date(s.joined || Date.now())) + '</div></div>' +
        '<div class="me-rank">' + rank(s.points) + '</div></div>' +
        '</div>' +
        '<div class="me-card">' +
        '<div><b>' + s.points + '</b><span>研学积分</span></div>' +
        '<div><b>' + visited + '</b><span>打卡点位</span></div>' +
        '<div><b>' + s.badges.length + '</b><span>所得徽章</span></div>' +
        '</div>';

      html += '<div class="sec" style="padding-top:26px"><div class="sec__head"><div>' +
        '<div class="kicker">BADGES</div><h2 class="sec__title">研学徽章</h2>' +
        '<div class="sec__sub">已解锁 ' + s.badges.length + ' / ' + D.badges.length + ' 枚</div></div>' +
        '<button class="sec__more" data-go="tasks">去解锁 ' + A.icon('next', 13) + '</button></div>' +
        '<div class="badge-wall">';
      D.badges.forEach(function (b) { html += UI.badgeMini(b, A.badgeState(b)); });
      html += '</div></div>';

      html += '<div class="sec" style="padding-top:6px"><div class="sec__head"><div>' +
        '<div class="kicker">FOOTPRINTS</div><h2 class="sec__title">我的足迹</h2>' +
        '<div class="sec__sub">' + (fp.length ? '最近打卡 ' + fp.length + ' 处' : '还没有打卡记录') + '</div></div></div>' +
        '<div class="footprint">';
      if (!fp.length) {
        html += UI.empty('去地图点亮第一个点位', 'locate');
      } else {
        fp.forEach(function (x) {
          html += '<button class="fp" data-go="poi/' + x.poi.id + '">' +
            '<span class="fp__dot"></span><span class="fp__name">' + x.poi.name + '</span>' +
            '<span class="fp__time">' + UI.fmtDateShort(x.at) + '</span></button>';
        });
      }
      html += '</div></div>';

      html += '<div class="sec" style="padding-top:6px"><div class="sec__head"><div>' +
        '<div class="kicker">SAVED</div><h2 class="sec__title">收藏</h2></div></div>';
      if (!favs.length) {
        html += UI.empty('收藏的点位与故事会出现在这里', 'heart');
      } else {
        favs.forEach(function (f) {
          var isPoi = f.type === 'poi';
          html += '<button class="list-row" data-go="' + (isPoi ? 'poi/' : 'story/') + f.item.id + '">' +
            '<span class="list-row__ico">' + A.icon(isPoi ? 'locate' : 'book', 16) + '</span>' +
            '<span class="list-row__body">' + (f.item.name || f.item.title) +
            '<span class="list-row__sub">' + (isPoi ? '点位 · ' + A.catName(f.item.cat) : '故事 · ' + f.item.cat) + '</span></span>' +
            '<span style="color:#B09A78">' + A.icon('next', 16) + '</span></button>';
        });
      }
      html += '</div>';

      html += '<div class="sec" style="padding-top:6px"><div class="me-card">' +
        '<button class="list-row" data-go="b2b"><span class="list-row__ico">' + A.icon('building', 16) + '</span>' +
        '<span class="list-row__body">机构定制服务<span class="list-row__sub">学校 · 研学机构 · 场馆</span></span>' +
        '<span style="color:#B09A78">' + A.icon('next', 16) + '</span></button>' +
        '<button class="list-row" data-go="stories"><span class="list-row__ico">' + A.icon('book', 16) + '</span>' +
        '<span class="list-row__body">红色故事<span class="list-row__sub">' + D.stories.length + ' 篇史料故事</span></span>' +
        '<span style="color:#B09A78">' + A.icon('next', 16) + '</span></button>' +
        '<button class="list-row" data-go="about"><span class="list-row__ico">' + A.icon('info', 16) + '</span>' +
        '<span class="list-row__body">关于这个项目<span class="list-row__sub">定位 · 资料来源 · 合作</span></span>' +
        '<span style="color:#B09A78">' + A.icon('next', 16) + '</span></button>' +
        '<button class="list-row" data-act="demo"><span class="list-row__ico">' + A.icon('locate', 16) + '</span>' +
        '<span class="list-row__body">演示模式<span class="list-row__sub">答辩演示时跳过定位校验</span></span>' +
        '<span class="demo-state' + (A.state.demo ? ' is-on' : '') + '">' + (A.state.demo ? '已开启' : '已关闭') + '</span></button>' +
        '<button class="list-row" data-act="reset"><span class="list-row__ico">' + A.icon('trash', 16) + '</span>' +
        '<span class="list-row__body">清除本机数据<span class="list-row__sub">打卡、积分与收藏将被清空</span></span>' +
        '<span style="color:#B09A78">' + A.icon('next', 16) + '</span></button>' +
        '</div></div>';

      html += '<footer class="foot"><div class="foot__seal">韶</div>' +
        '<div class="foot__txt">' + D.meta.fullName + '<br>' + D.meta.disclaimer + '</div>' +
        '<div class="foot__ver">' + D.meta.version + '</div></footer>';

      return html;
    },
    mount: function (root) {
      root.querySelector('[data-act="rename"]').addEventListener('click', function () {
        var m = A.modal('<div class="modal-body"><h3 class="modal-title">研学档案姓名</h3>' +
          '<p class="modal-text">用于证书与研学报告，建议填写真实姓名或小组名。</p>' +
          '<input class="input" id="rename-input" maxlength="12" value="' + A.esc(A.state.name) + '">' +
          '<div class="modal-actions"><button class="btn btn--ghost" data-close>取消</button>' +
          '<button class="btn btn--primary" id="rename-ok">保存</button></div></div>', { dismissible: true });
        var input = m.el.querySelector('#rename-input');
        input.focus();
        m.el.querySelector('#rename-ok').addEventListener('click', function () {
          var v = input.value.trim();
          if (!v) { A.toast('名字不能为空', { icon: 'info' }); return; }
          A.state.name = v;
          A.save();
          m.close();
          A.render();
          A.toast('已更新', { icon: 'check' });
        });
      });

      root.querySelector('[data-act="demo"]').addEventListener('click', function () {
        A.state.demo = !A.state.demo;
        A.save();
        A.render();
        A.toast(A.state.demo ? '演示模式已开启：打卡不再校验位置' : '演示模式已关闭：打卡需到达现场', { icon: 'info', ms: 2400 });
      });

      root.querySelector('[data-act="reset"]').addEventListener('click', function () {
        A.confirm('清除本机数据？', '打卡、积分、徽章、收藏与记录都会被清空，且无法恢复。', function () {
          A.reset();
          A.render();
          A.toast('已清除，回到初始状态', { icon: 'trash' });
        }, '确认清除');
      });
    }
  };

  /* ---------------- 关于 ---------------- */
  A.pages.about = {
    title: '关于项目',
    render: function () {
      var html = '<div class="topbar"><button class="circle-btn circle-btn--dark" data-back aria-label="返回">' + A.icon('back', 20) + '</button>' +
        '<div class="topbar__title">关于项目</div><div style="width:38px"></div></div>';

      html += '<div class="sec" style="padding-top:10px">' +
        '<div class="seal" style="width:56px;height:56px;font-size:26px;margin-bottom:14px">韶</div>' +
        '<h2 class="sec__title" style="font-size:24px">' + D.meta.fullName + '</h2>' +
        '<p class="text mt12">以韶山为起点的红色研学数字地图。把分散的场馆、旧址、故事与任务组织进一张可走、可听、可学的地图，让研学从“参观”变成“有目标的行走”。</p>' +
        '<p class="text">试点阶段聚焦韶山核心景区 9 个点位、4 条主题线路与 12 篇史料故事；后续按同一数据结构扩展湘潭、湘乡等其他红色景点。</p>' +
        '<div class="know"><div class="know__title">当前版本能力</div><div class="hl-list">' +
        '<div class="hl"><span class="hl__n">01</span>示意性数字地图：分类筛选、缩放拖拽、点位卡片与线路引导</div>' +
        '<div class="hl"><span class="hl__n">02</span>图文与语音讲解：每个点位含概况、看点、历史沿革与讲解文本</div>' +
        '<div class="hl"><span class="hl__n">03</span>互动研学：实地打卡、知识问答、诗词填空、观察记录、徽章与证书</div>' +
        '<div class="hl"><span class="hl__n">04</span>机构服务：方案定制、工具包、活动执行与内容授权的介绍与咨询入口</div>' +
        '</div></div>' +
        '<div class="know"><div class="know__title">资料来源与声明</div>' +
        '<p class="text small">内容依据公开出版物、纪念馆展陈资料与地方史志整理，属于试点演示素材；地图为示意性导览图，非测绘成果；照片来自项目自有素材与公开渠道，正式上线前须完成版权核验与场馆内容核定。</p></div>' +
        '<div class="know"><div class="know__title">合作与反馈</div>' +
        '<p class="text small">学校、研学机构与场馆可申请试点合作；如发现史实错误或影像版权问题，请联系项目组更正。</p>' +
        '<button class="btn btn--red btn--block mt12" data-go="b2b">联系机构合作</button></div>' +
        '<p class="source">' + D.meta.version + ' · 更新于 ' + D.meta.updated + '</p>' +
        '</div>';
      return html;
    }
  };
})();