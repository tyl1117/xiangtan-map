/* ============================================================
 * views-poi.js — 点位详情（图文 · 语音讲解 · 打卡 · 相关故事）
 * ============================================================ */
(function () {
  var A = window.APP, D = A.D, UI = window.UI;

  function isFav(id) {
    return (A.state.favorites || []).some(function (f) { return f.type === 'poi' && f.id === id; });
  }
  function toggleFav(id) {
    var list = A.state.favorites || [];
    var i = list.findIndex(function (f) { return f.type === 'poi' && f.id === id; });
    if (i > -1) list.splice(i, 1); else list.push({ type: 'poi', id: id, at: new Date().toISOString() });
    A.state.favorites = list;
    A.save();
    return i === -1;
  }

  A.pages.poi = {
    title: '点位详情',
    render: function (params) {
      var p = A.poi(params[0]);
      if (!p) return UI.empty('未找到该点位', 'info');
      var s = A.state;
      var visited = s.visits[p.id];
      var html = '';

      /* 头图 */
      html += '<header class="detail-hero">';
      if (p.hero) {
        html += '<img src="' + p.hero + '" alt="' + p.name + '">';
      } else {
        html += '<div class="detail-hero__arch"><div class="detail-hero__char">' + p.archive + '</div><small>实景影像待补 · 试点阶段</small></div>';
      }
      html += '<div class="detail-hero__veil"></div>' +
        '<div class="detail-hero__top">' +
        '<button class="circle-btn" data-back aria-label="返回">' + A.icon('back', 20) + '</button>' +
        '<div class="flex gap8">' +
        '<button class="circle-btn" data-act="fav" aria-label="收藏">' + A.icon('heart', 18) + '</button>' +
        '<button class="circle-btn" data-act="share" aria-label="分享">' + A.icon('share', 17) + '</button>' +
        '</div></div>' +
        '<div class="detail-hero__body">' +
        '<span class="detail-hero__kicker">' + A.catName(p.cat) + '</span>' +
        '<h1 class="detail-hero__title">' + p.name + '</h1>' +
        '<div class="detail-hero__tags">';
      (p.tags || []).forEach(function (t) { html += '<span class="detail-hero__tag">' + t + '</span>'; });
      html += '</div></div></header>';

      /* 正文 */
      html += '<div class="detail-body">';

      html += '<div class="fact-grid fact-grid--2">' +
        '<div class="fact"><span>建议停留</span><b>' + p.duration + '</b></div>' +
        '<div class="fact"><span>开放时间</span><b style="font-size:13px">' + p.hours + '</b></div>' +
        '<div class="fact"><span>步行距离</span><b style="font-size:13px">' + p.walk + '</b></div>' +
        '<div class="fact"><span>我的打卡</span><b style="font-size:13px;color:' + (visited ? '#2F6B4F' : '#A32222') + '">' + (visited ? '已打卡' : '未打卡') + '</b></div>' +
        '</div>';

      html += '<section class="blk"><h3 class="blk__title">概况<small>OVERVIEW</small></h3>' +
        '<p class="text">' + p.summary + '</p></section>';

      html += '<section class="blk"><h3 class="blk__title">语音讲解<small>AUDIO GUIDE</small></h3>' +
        '<div class="audio-wrap" id="audio-host"></div></section>';

      html += '<section class="blk"><h3 class="blk__title">看点<small>HIGHLIGHTS</small></h3><div class="hl-list">';
      (p.highlights || []).forEach(function (h, i) {
        html += '<div class="hl"><span class="hl__n">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>' + h + '</div>';
      });
      html += '</div></section>';

      if (p.history && p.history.length) {
        html += '<section class="blk"><h3 class="blk__title">历史沿革<small>TIMELINE</small></h3><div class="tl">';
        p.history.forEach(function (h) {
          html += '<div class="tl__item"><div class="tl__year">' + h.year + '</div><div class="tl__text">' + h.text + '</div></div>';
        });
        html += '</div></section>';
      }

      if (p.photos && p.photos.length) {
        html += '<section class="blk"><h3 class="blk__title">影像<small>PHOTOS</small></h3><div class="gallery">';
        p.photos.forEach(function (src) { html += '<img src="' + src + '" alt="' + p.name + '" loading="lazy">'; });
        html += '</div></section>';
      }

      var relStories = (p.storyIds || []).map(A.story).filter(Boolean);
      if (relStories.length) {
        html += '<section class="blk"><h3 class="blk__title">相关故事<small>STORIES</small></h3><div>';
        relStories.forEach(function (st, i) {
          html += '<button class="story-row" data-go="story/' + st.id + '">' +
            '<span class="story-row__no">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>' +
            '<span class="story-row__body"><span class="story-row__title">' + st.title + '</span>' +
            '<span class="story-row__meta">' + st.cat + ' · ' + st.mins + ' 分钟</span></span>' +
            (st.cover ? '<img class="story-row__thumb" src="' + st.cover + '" alt="">' : '') +
            '</button>';
        });
        html += '</div></section>';
      }

      if (p.tips) {
        html += '<section class="blk"><div class="tip">' + A.icon('info', 15) + '<span>' + p.tips + '</span></div></section>';
      }

      html += '<p class="source">实地打卡需到达点位现场，允许定位后由系统校验距离（约 ' + ((p.geo && p.geo.r) || 200) + ' 米内有效）；内容依据公开史料整理，开放时间与预约规则以景区当日公告为准。</p>';
      html += '<div class="actionbar">' +
        '<button class="btn btn--line btn--icon" data-go="map" aria-label="在地图中查看">' + A.icon('map', 19) + '</button>' +
        '<button class="btn ' + (visited ? 'btn--line' : 'btn--red') + '" data-act="checkin"' + (visited ? ' disabled' : '') + '>' +
        (visited ? A.icon('check', 17) + '已打卡' : A.icon('locate', 18) + '到现场打卡 +10') + '</button>' +
        '</div>';

      html += '</div>';
      return html;
    },

    mount: function (root, params) {
      var p = A.poi(params[0]);
      if (!p) return;

      var host = root.querySelector('#audio-host');
      var player = A.audioPlayer(host, p.audio, {
        onEnd: function () { A.toast('讲解听完了，可以试着复述一遍', { icon: 'audio' }); }
      });
      if (params[1] === 'audio') setTimeout(function () { player.play(); }, 500);

      var favBtn = root.querySelector('[data-act="fav"]');
      function paintFav(on) {
        favBtn.style.color = on ? '#E8B4B4' : '#fff';
        favBtn.innerHTML = on ? A.icon('heart', 18) : A.icon('heart', 18);
        favBtn.style.background = on ? 'rgba(163,34,34,.55)' : 'rgba(24,12,10,.38)';
      }
      paintFav(isFav(p.id));
      favBtn.addEventListener('click', function () {
        var on = toggleFav(p.id);
        paintFav(on);
        A.toast(on ? '已收藏，可在「我的」查看' : '已取消收藏', { icon: 'heart' });
      });

      root.querySelector('[data-act="share"]').addEventListener('click', function () {
        var url = location.href;
        if (navigator.share) {
          navigator.share({ title: p.name + ' · 韶山红研学地图', text: p.summary, url: url }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(p.name + ' ' + url).then(function () {
            A.toast('链接已复制，可粘贴分享', { icon: 'copy' });
          }).catch(function () { A.toast('当前浏览器不支持一键分享', { icon: 'info' }); });
        } else {
          A.toast('当前浏览器不支持一键分享', { icon: 'info' });
        }
      });

      var btn = root.querySelector('[data-act="checkin"]');
      if (btn && !btn.disabled) {
        var idle = btn.innerHTML;
        function restore() {
          btn.disabled = false;
          btn.innerHTML = idle;
        }
        function done() {
          btn.className = 'btn btn--line';
          btn.disabled = true;
          btn.innerHTML = A.icon('check', 17) + '已打卡';
          A.vibrate([14, 50, 14]);
          var facts = root.querySelectorAll('.fact b');
          var last = facts[facts.length - 1];
          if (last) { last.textContent = '已打卡'; last.style.color = '#2F6B4F'; }
        }
        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          btn.disabled = true;
          btn.innerHTML = '定位中…';
          A.locate(p.id).then(function (res) {
            if (res.ok) {
              var first = A.addVisit(p.id);
              done();
              if (res.demo) A.toast('演示模式：已跳过定位校验', { icon: 'info', ms: 2200 });
              else A.toast('打卡成功 · 距点位约 ' + res.distance + ' 米', { icon: 'check', ms: 2400 });
              return;
            }
            restore();
            if (res.code === 'far') {
              A.modal(
                '<div class="modal-title">还没到达这个点位</div>' +
                '<div class="modal-text">你当前位置距「' + p.name + '」约 <b>' + res.distance + ' 米</b>，' +
                '需要进入点位周边 ' + res.radius + ' 米范围内才能打卡。' +
                (res.accuracy ? '<br><span class="small muted">当前定位精度约 ±' + res.accuracy + ' 米，可在空旷处重新定位。</span>' : '') +
                '</div>' +
                '<div class="modal-actions"><button class="btn btn--line" data-close>知道了</button></div>',
                { dismissible: true }
              );
            } else if (res.code === 'denied') {
              A.modal(
                '<div class="modal-title">需要开启定位权限</div>' +
                '<div class="modal-text">实地打卡需要读取你的当前位置，用来确认你确实到达了现场。<br>' +
                '请在浏览器或微信的「设置 → 隐私 → 位置信息」中允许本站使用定位后重试。<br>' +
                '<span class="small muted">我们只在你点击打卡时读取一次坐标，不保存轨迹。</span></div>' +
                '<div class="modal-actions"><button class="btn btn--line" data-close>知道了</button>' +
                (A.state.demo ? '' : '<button class="btn btn--red" data-go="me">去「我的」开启演示模式</button>') + '</div>',
                { dismissible: true }
              );
            } else if (res.code === 'nogeo') {
              A.modal(
                '<div class="modal-title">该点位暂未开放定位打卡</div>' +
                '<div class="modal-text">「' + p.name + '」的现场坐标还在核定中，试点阶段先用列表里的其他点位体验打卡流程。</div>' +
                '<div class="modal-actions"><button class="btn btn--line" data-close>知道了</button></div>',
                { dismissible: true }
              );
            } else {
              A.modal(
                '<div class="modal-title">没能获取到位置</div>' +
                '<div class="modal-text">' + (res.code === 'timeout' ? '定位超时。' : '当前环境不支持或暂时无法定位。') +
                '请到室外空旷处、打开定位开关后重试。</div>' +
                '<div class="modal-actions"><button class="btn btn--line" data-close>知道了</button></div>',
                { dismissible: true }
              );
            }
          });
        });
      }
    }
  };
})();