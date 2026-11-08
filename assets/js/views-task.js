/* ============================================================
 * views-task.js — 研学任务 / 知识问答 / 诗词填空 / 观察记录 / 证书
 * ============================================================ */
(function () {
  var A = window.APP, D = A.D, UI = window.UI;

  function stampGrid() {
    var s = A.state;
    var html = '<div class="stamp-grid">';
    D.pois.forEach(function (p) {
      var on = !!s.visits[p.id];
      html += '<button class="stamp ' + (on ? 'is-done' : '') + '" data-go="poi/' + p.id + '">' +
        '<span class="stamp__char">' + p.short.charAt(0) + '</span>' +
        '<span class="stamp__name">' + p.short + '</span>' +
        (on ? '<span class="stamp__tick">' + A.icon('check', 11) + '</span>' : '') +
        '</button>';
    });
    return html + '</div>';
  }

 /* ---------------- 研学主页 ---------------- */
  A.pages.tasks = {
    tab: 'tasks',
    title: '研学任务',
    render: function () {
      var s = A.state;
      var visited = Object.keys(s.visits).length;
      var quizBest = s.quiz.best || 0;
      var html = '';

      html += '<div class="task-hero">' +
        '<div class="task-hero__row"><span class="kicker" style="color:rgba(232,211,168,.8)">MY STUDY</span>' +
        '<span class="task-hero__pts">积分 <b>' + s.points + '</b></span></div>' +
        '<div class="task-hero__title">我的研学任务</div>' +
        '<div class="task-hero__sub">' + s.name + ' · ' + s.sid + '</div>' +
        '<div class="task-hero__badges">';
      D.badges.forEach(function (b) { html += UI.badgeMini(b, A.badgeState(b)); });
      html += '</div></div>';

      var tasks = [
        { ico: 'locate', name: '实地打卡', desc: '在 9 个核心点位留下足迹', state: visited + '/' + D.pois.length, done: visited >= D.pois.length, go: 'map' },
        { ico: 'task', name: '知识问答', desc: '8 道韶山红色知识题', state: quizBest ? '最高 ' + quizBest + '/8' : '未开始', done: !!s.quiz.attempts, go: 'quiz' },
        { ico: 'book', name: '诗词填空', desc: '填补《七律·到韶山》名句', state: s.poem.done ? '已完成' : '未完成', done: !!s.poem.done, go: 'poem' },
        { ico: 'edit', name: '观察记录', desc: '写一条现场观察或访谈', state: s.notes.length + ' 条', done: s.notes.length > 0, go: 'notes' },
        { ico: 'award', name: '研学成果', desc: '生成研学证书与成果报告', state: s.cert.issued ? '已生成' : '未生成', done: !!s.cert.issued, go: 'cert' }
      ];
      html += '<div class="task-list">';
      tasks.forEach(function (t) {
        html += '<button class="task-item" data-go="' + t.go + '">' +
          '<span class="task-item__ico">' + A.icon(t.ico, 18) + '</span>' +
          '<span class="task-item__body"><span class="task-item__name">' + t.name + '</span>' +
          '<span class="task-item__desc">' + t.desc + '</span></span>' +
          '<span class="task-item__state ' + (t.done ? 'is-done' : '') + '">' + t.state + '</span>' +
          '</button>';
      });
      html += '</div>';

      html += '<div class="sec"><div class="sec__head"><div><div class="kicker">STAMPS</div>' +
        '<h2 class="sec__title">打卡印章墙</h2><div class="sec__sub">走过的地方，会留下一枚印章</div></div></div>' +
        stampGrid() + '</div>';

      html += '<div class="sec" style="padding-top:8px"><div class="tip">' + A.icon('info', 15) +
        '<span>打卡需在点位现场点击「实地打卡」，试点阶段不做定位校验；教师端可导出班级打卡与答题汇总（规划中）。</span></div></div>';

      return html;
    }
  };

  /* ---------------- 知识问答 ---------------- */
  var QZ = { i: 0, right: 0, locked: false };

  A.pages.quiz = {
    title: '知识问答',
    render: function () {
      QZ = { i: 0, right: 0, locked: false };
      return '<div class="topbar"><button class="circle-btn circle-btn--dark" data-back aria-label="返回">' + A.icon('back', 20) + '</button>' +
        '<div class="topbar__title">知识问答</div><div style="width:38px"></div></div>' +
        '<div class="quiz-wrap" id="quiz-host"></div>';
    },
    mount: function (root) {
      var host = root.querySelector('#quiz-host');

      function draw() {
        var q = D.quiz[QZ.i];
        var pct = QZ.i / D.quiz.length;
        var html = '<div class="quiz-progress"><div class="quiz-progress__bar"><i style="width:' + (pct * 100) + '%"></i></div>' +
          '<div class="quiz-progress__txt">第 ' + (QZ.i + 1) + ' / ' + D.quiz.length + ' 题 · 已答对 ' + QZ.right + '</div></div>' +
          '<div class="q-stem">' + q.q + '</div>';
        q.options.forEach(function (o, i) {
          html += '<button class="opt" data-i="' + i + '"><span class="opt__key">' + 'ABCD'.charAt(i) + '</span><span>' + o + '</span></button>';
        });
        html += '<div class="q-explain hide" id="q-explain"></div>' +
          '<button class="btn btn--red btn--block hide" id="q-next" style="margin-top:18px">' + (QZ.i === D.quiz.length - 1 ? '查看成绩' : '下一题') + '</button>';
        host.innerHTML = html;

        host.querySelectorAll('.opt').forEach(function (b) {
          b.addEventListener('click', function () {
            if (QZ.locked) return;
            QZ.locked = true;
            var pick = +b.dataset.i;
            var ok = pick === q.answer;
            if (ok) QZ.right++;
            host.querySelectorAll('.opt').forEach(function (x, i) {
              x.classList.add('is-disabled');
              if (i === q.answer) x.classList.add('is-right');
              else if (i === pick) x.classList.add('is-wrong');
            });
            var ex = host.querySelector('#q-explain');
            ex.innerHTML = '<b>' + (ok ? '答对了' : '正确答案：' + 'ABCD'.charAt(q.answer)) + '</b>' + q.explain;
            ex.classList.remove('hide');
            host.querySelector('#q-next').classList.remove('hide');
            A.vibrate(ok ? 10 : [8, 40, 8]);
          });
        });

        host.querySelector('#q-next').addEventListener('click', function () {
          if (QZ.i >= D.quiz.length - 1) return finish();
          QZ.i++; QZ.locked = false;
          draw();
        });
      }

      function finish() {
        var s = A.state;
        s.quiz.attempts = (s.quiz.attempts || 0) + 1;
        s.quiz.last = QZ.right;
        s.quiz.best = Math.max(s.quiz.best || 0, QZ.right);
        s.quiz.wrong = D.quiz.length - QZ.right;
        A.save();
        A.addPoints(QZ.right * 2, '知识问答');
        A.checkBadges();

        var pct = QZ.right / D.quiz.length;
        var title = pct === 1 ? '满分，韶山通！' : pct >= 0.6 ? '不错，再走一遍会更熟' : '故事还没读透，回去看看';
        host.innerHTML = '<div class="result"><div class="result__ring">' + UI.ring(pct, 120, '#A32222', '#C9A45C', 'rgba(120,90,60,.16)') + '</div>' +
          '<div class="result__score">' + QZ.right + '<span style="font-size:18px;opacity:.4">/' + D.quiz.length + '</span></div>' +
          '<div class="result__title">' + title + '</div>' +
          '<div class="result__desc">本次答对 ' + QZ.right + ' 题，累计积分 ' + A.state.points + '。错题涉及的史料可在「红色故事」中查到。</div>' +
          '<div class="flex gap8 mt20"><button class="btn btn--line" data-go="stories">去看故事</button>' +
          '<button class="btn btn--red" id="q-again">再答一次</button></div></div>';
        host.querySelector('#q-again').addEventListener('click', function () {
          QZ = { i: 0, right: 0, locked: false };
          draw();
        });
      }

      draw();
    }
  };

  /* ---------------- 诗词填空 ---------------- */
  A.pages.poem = {
    title: '诗词填空',
    render: function () {
      var P = D.poem;
      var k = 0, html = '';
      html += '<div class="topbar"><button class="circle-btn circle-btn--dark" data-back aria-label="返回">' + A.icon('back', 20) + '</button>' +
        '<div class="topbar__title">诗词填空</div><div style="width:38px"></div></div>';
      html += '<div class="sec" style="padding-top:6px"><p class="text small muted">' + P.intro + '</p></div>';
      html += '<div class="poem"><div class="poem__title">' + P.title + '</div>' +
        '<div class="poem__author">' + P.author + '</div>';
      P.lines.forEach(function (line) {
        html += '<div class="poem__line">';
        line.forEach(function (tk) {
          if (tk.t != null) html += '<span>' + tk.t + '</span>';
          if (tk.b) {
            html += '<button class="blank" data-i="' + k + '" data-ans="' + tk.b + '"></button>';
            k++;
          }
        });
        html += '</div>';
      });
      html += '</div>';

      html += '<div class="sec" style="padding-top:2px"><div class="kicker" style="margin-bottom:10px">候选词 · 点击填入</div>' +
        '<div class="bank" id="poem-bank">';
      P.bank.forEach(function (w) {
        html += '<button class="bank__item" data-w="' + w + '">' + w + '</button>';
      });
      html += '</div>';
      html += '<div class="flex gap8 mt20"><button class="btn btn--line" id="poem-clear">清空</button>' +
        '<button class="btn btn--red" id="poem-check" style="flex:1">检查答案</button></div>' +
        '<p class="source" style="margin-top:16px">诗句依据《毛泽东诗词》通行版本，标点为后加。</p></div>';

      return html;
    },
    mount: function (root) {
      var blanks = Array.prototype.slice.call(root.querySelectorAll('.blank'));
      var focused = null;
      var finished = false;

      function focusBlank(b) {
        blanks.forEach(function (x) { x.classList.remove('is-focus'); });
        focused = b;
        if (b) b.classList.add('is-focus');
      }

      blanks.forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.textContent) {
            b.textContent = '';
            b.classList.remove('is-ok', 'is-bad');
            b.classList.add('is-empty');
          }
          focusBlank(b);
        });
      });

      root.querySelectorAll('#poem-bank .bank__item').forEach(function (w) {
        w.addEventListener('click', function () {
          if (finished) return;
          var target = focused || blanks.filter(function (b) { return !b.textContent; })[0];
          if (!target) { A.toast('先点一下要填的空', { icon: 'info' }); return; }
          target.textContent = w.dataset.w;
          target.classList.remove('is-empty', 'is-ok', 'is-bad');
          root.querySelectorAll('#poem-bank .bank__item').forEach(function (x) { x.classList.remove('is-on'); });
          w.classList.add('is-on');
          var next = blanks[blanks.indexOf(target) + 1];
          focusBlank(next && !next.textContent ? next : null);
          if (entryCount() === blanks.length) check(true);
        });
      });

      function entryCount() {
        return blanks.filter(function (b) { return !!b.textContent; }).length;
      }

      root.querySelector('#poem-clear').addEventListener('click', function () {
        finished = false;
        blanks.forEach(function (b) { b.textContent = ''; b.className = 'blank is-empty'; });
        root.querySelectorAll('#poem-bank .bank__item').forEach(function (x) { x.classList.remove('is-on'); });
        focusBlank(null);
      });

      root.querySelector('#poem-check').addEventListener('click', function () { check(false); });

      function check(auto) {
        var right = 0;
        blanks.forEach(function (b) {
          b.classList.remove('is-focus', 'is-ok', 'is-bad');
          if (!b.textContent) return;
          if (b.textContent === b.dataset.ans) { b.classList.add('is-ok'); right++; }
          else b.classList.add('is-bad');
        });
        if (right === blanks.length) {
          finished = true;
          var first = !A.state.poem.done;
          A.state.poem.done = true;
          A.state.poem.at = new Date().toISOString();
          A.save();
          if (first) {
            A.addPoints(15, '诗词填空');
            A.checkBadges();
          }
          A.modal('<div class="modal-body tc"><div class="badge-medal" style="margin-bottom:12px">诗</div>' +
            '<h3 class="modal-title">全对！</h3><p class="modal-text">「为有牺牲多壮志，敢教日月换新天。」<br>这两句写于 1959 年回韶山时，距他离乡已 32 年。</p>' +
            '<div class="modal-actions"><button class="btn btn--ghost" data-close>再看一遍</button>' +
            '<button class="btn btn--primary" data-go="story/qilv">读这首诗的故事</button></div></div>', { dismissible: true });
        } else if (auto) {
          A.toast('填了 ' + right + '/' + blanks.length + ' 个正确，检查一下红色的空', { icon: 'edit' });
        } else {
          A.toast(right === 0 ? '还没填对，先读读上下文' : '对了 ' + right + ' 个，红色的再想想', { icon: 'info' });
        }
      }

      focusBlank(blanks[0]);
    }
  };

  /* ---------------- 观察记录 ---------------- */
  A.pages.notes = {
    title: '观察记录',
    render: function () {
      var notes = A.state.notes || [];
      var html = '<div class="topbar"><button class="circle-btn circle-btn--dark" data-back aria-label="返回">' + A.icon('back', 20) + '</button>' +
        '<div class="topbar__title">观察记录</div><div style="width:38px"></div></div>';

      html += '<div class="sec" style="padding-top:8px"><div class="note-card">' +
        '<div class="note-card__q">写一条现场观察</div>' +
        '<div class="note-card__hint">可以是建筑的细节、讲解里的一句话、同伴的提问，或采访到的一段回忆。</div>' +
        '<textarea class="textarea" id="note-input" rows="4" maxlength="200" placeholder="例：故居堂屋正中的神龛与两侧农具，说明这间屋子既祭祖也劳作……"></textarea>' +
        '<div class="flex between mt12"><span class="small muted"><span id="note-count">0</span>/200</span>' +
        '<button class="btn btn--red btn--sm" id="note-save">保存记录 +5</button></div></div></div>';

      html += '<div class="sec" style="padding-top:6px"><div class="sec__head"><div><div class="kicker">RECORDS</div>' +
        '<h2 class="sec__title">我的记录</h2><div class="sec__sub">共 ' + notes.length + ' 条</div></div></div>';
      if (!notes.length) {
        html += UI.empty('还没有记录，写下第一条吧', 'edit');
      } else {
        notes.slice().reverse().forEach(function (n) {
          html += '<div class="list-row" style="cursor:default">' +
            '<span class="list-row__ico">' + A.icon('note', 16) + '</span>' +
            '<span class="list-row__body">' + A.esc(n.text) + '<span class="list-row__sub">' + A.fmtDate(new Date(n.at)) + ' ' + A.fmtTime(new Date(n.at)) + '</span></span>' +
            '<button class="btn btn--sm btn--ghost" data-del="' + n.at + '" aria-label="删除">' + A.icon('trash', 15) + '</button></div>';
        });
      }
      html += '</div>';

      html += '<div class="sec" style="padding-top:0"><div class="tip">' + A.icon('info', 15) +
        '<span>记录仅保存在本机浏览器；如用于班级成果汇总，可在机构版中导出（规划中）。请勿记录未成年人姓名、联系方式等个人信息。</span></div></div>';
      return html;
    },
    mount: function (root) {
      var input = root.querySelector('#note-input');
      var count = root.querySelector('#note-count');
      input.addEventListener('input', function () { count.textContent = input.value.length; });

      root.querySelector('#note-save').addEventListener('click', function () {
        var v = input.value.trim();
        if (!v) { A.toast('先写点什么', { icon: 'info' }); input.focus(); return; }
        var notes = A.state.notes || [];
        notes.push({ text: v, at: new Date().toISOString() });
        A.state.notes = notes;
        A.save();
        A.addPoints(5, '观察记录');
        A.go('notes');
      });

      root.querySelectorAll('[data-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          A.confirm('删除这条记录？', '删除后无法恢复。', function () {
            A.state.notes = (A.state.notes || []).filter(function (n) { return n.at !== b.dataset.del; });
            A.save();
            A.go('notes');
          }, '删除');
        });
      });
    }
  };

  /* ---------------- 研学证书 ---------------- */
  A.pages.cert = {
    title: '研学证书',
    render: function () {
      var s = A.state;
      var visited = Object.keys(s.visits).length;
      var html = '<div class="topbar"><button class="circle-btn circle-btn--dark" data-back aria-label="返回">' + A.icon('back', 20) + '</button>' +
        '<div class="topbar__title">研学成果</div><div style="width:38px"></div></div>';

      if (!visited) {
        html += '<div class="sec">' + UI.empty('完成至少 1 次实地打卡后<br>即可生成研学证书', 'award') +
          '<button class="btn btn--red btn--block mt16" data-go="map">去地图打卡</button></div>';
        return html;
      }

      var r = s.cert.route ? A.route(s.cert.route) : null;
      html += '<div class="sec" style="padding-top:8px">' +
        '<div class="sec__head"><div><div class="kicker">CERTIFICATE</div><h2 class="sec__title">红色研学证书</h2>' +
        '<div class="sec__sub">' + (r ? r.name : '韶山红色研学主题线路') + '</div></div></div>' +
        '<div id="cert-host"></div>' +
        '<div class="flex gap8 mt16"><button class="btn btn--line" id="cert-regen">重新生成</button>' +
        '<button class="btn btn--red" id="cert-save" style="flex:1">' + A.icon('download', 17) + '保存图片</button></div>' +
        '<p class="source">证书为试点版纪念凭证，编号可写入机构研学报告；正式版将支持学校盖章与批量签发。</p></div>';

      html += '<div class="sec" style="padding-top:4px"><div class="sec__head"><div>' +
        '<div class="kicker">REPORT</div><h2 class="sec__title">成果摘要</h2></div></div>' +
        '<div class="me-card">' +
        '<div class="list-row" style="cursor:default"><span class="list-row__ico">' + A.icon('locate', 16) + '</span>' +
        '<span class="list-row__body">打卡点位<span class="list-row__sub">' + visited + ' / ' + D.pois.length + ' 个</span></span></div>' +
        '<div class="list-row" style="cursor:default"><span class="list-row__ico">' + A.icon('route', 16) + '</span>' +
        '<span class="list-row__body">完成线路<span class="list-row__sub">' + ((s.route.done || []).length || 0) + ' 条</span></span></div>' +
        '<div class="list-row" style="cursor:default"><span class="list-row__ico">' + A.icon('task', 16) + '</span>' +
        '<span class="list-row__body">知识问答<span class="list-row__sub">' + (s.quiz.best ? '最高 ' + s.quiz.best + '/8 · 作答 ' + s.quiz.attempts + ' 次' : '未参与') + '</span></span></div>' +
        '<div class="list-row" style="cursor:default"><span class="list-row__ico">' + A.icon('edit', 16) + '</span>' +
        '<span class="list-row__body">观察记录<span class="list-row__sub">' + s.notes.length + ' 条</span></span></div>' +
        '<div class="list-row" style="cursor:default"><span class="list-row__ico">' + A.icon('award', 16) + '</span>' +
        '<span class="list-row__body">获得徽章<span class="list-row__sub">' + s.badges.length + ' / ' + D.badges.length + ' 枚 · 积分 ' + s.points + '</span></span></div>' +
        '</div></div>';

      return html;
    },
    mount: function (root) {
      var host = root.querySelector('#cert-host');
      if (!host) return;

      function build() {
        A.checkBadges(true);
        var res = A.makeCertificate();
        var s = A.state;
        s.cert = {
          issued: true,
          at: s.cert.at || new Date().toISOString(),
          no: res.data.no,
          route: s.cert.route || null,
          visits: res.data.visits
        };
        A.save();
        host.innerHTML = '<img class="cert-img" alt="研学证书" src="' + res.url + '">' +
          '<div class="flex between mt8"><span class="small muted">编号 ' + res.data.no + '</span>' +
          '<button class="btn btn--sm btn--ghost" id="cert-copy">' + A.icon('copy', 13) + '复制编号</button></div>';
        var cp = root.querySelector('#cert-copy');
        if (cp) cp.addEventListener('click', function () {
          if (navigator.clipboard) navigator.clipboard.writeText(res.data.no).then(function () { A.toast('编号已复制', { icon: 'copy' }); });
        });
        return res;
      }

      var last = build();

      root.querySelector('#cert-regen').addEventListener('click', function () {
        A.state.cert.at = new Date().toISOString();
        last = build();
        A.toast('已按最新足迹重新生成', { icon: 'award' });
      });

      root.querySelector('#cert-save').addEventListener('click', function () {
        var a = document.createElement('a');
        a.href = last.url;
        a.download = '韶山红色研学证书-' + (A.state.cert.no || 'SS') + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        A.toast('已保存到下载目录', { icon: 'download' });
      });
    }
  };
})();