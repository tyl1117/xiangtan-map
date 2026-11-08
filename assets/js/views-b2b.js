/* ============================================================
 * views-b2b.js — 机构定制服务（方案 · 工具包 · 执行 · 咨询表单）
 * ============================================================ */
(function () {
  var A = window.APP, D = A.D;

  A.pages.b2b = {
    title: '机构定制',
    render: function () {
      var b = A.state.booking;
      var html = '<div class="topbar"><button class="circle-btn circle-btn--dark" data-back aria-label="返回">' + A.icon('back', 20) + '</button>' +
        '<div class="topbar__title">机构定制</div><div style="width:38px"></div></div>';

      html += '<header class="b2b-hero">' +
        '<div class="b2b-hero__kicker">FOR SCHOOLS &amp; INSTITUTIONS</div>' +
        '<h1 class="b2b-hero__title">把一次研学<br>做成一套可复用的课程</h1>' +
        '<p class="b2b-hero__desc">线路、任务单、讲解素材、成果报告——按学段与教学目标组合，机构一次采购，多次开课。</p>' +
        '<div class="b2b-hero__tags">' +
        '<span class="b2b-hero__tag">中小学</span><span class="b2b-hero__tag">高校党校</span>' +
        '<span class="b2b-hero__tag">研学机构</span><span class="b2b-hero__tag">场馆基地</span>' +
        '</div></header>';

      html += '<div class="sec" style="padding-bottom:4px"><div class="target-row">';
      D.targets.forEach(function (t) {
        html += '<div class="target"><b>' + t.num + '<small>' + t.unit + '</small></b><span>' + t.label + '</span></div>';
      });
      html += '</div></div>';

      html += '<div class="sec" style="padding-top:10px"><div class="sec__head"><div>' +
        '<div class="kicker">SERVICES</div><h2 class="sec__title">四类服务</h2>' +
        '<div class="sec__sub">从方案到执行，可单点采购，也可整体打包</div></div></div>' +
        '<div class="service-grid">';
      D.services.forEach(function (s) {
        html += '<div class="service"><div class="service__char">' + s.char + '</div>' +
          '<div class="service__body"><div class="service__name">' + s.name + '</div>' +
          '<div class="service__for">' + s.forWho + '</div>' +
          '<div class="service__desc">' + s.desc + '</div><div>';
        s.items.forEach(function (it) { html += '<span class="service__item">' + it + '</span>'; });
        html += '</div></div></div>';
      });
      html += '</div></div>';

      html += '<div class="sec" style="padding-top:8px"><div class="sec__head"><div>' +
        '<div class="kicker">PACKAGES</div><h2 class="sec__title">合作套餐</h2>' +
        '<div class="sec__sub">价格为试点报价，按人数与内容浮动</div></div></div>' +
        '<div class="plan-grid">';
      D.plans.forEach(function (p) {
        html += '<div class="plan ' + (p.hot ? 'is-hot' : '') + '">' +
          (p.hot ? '<span class="plan__hot">推荐</span>' : '') +
          '<div class="plan__row"><div class="plan__name">' + p.name + '</div>' +
          '<div class="plan__price">' + p.price + '</div></div>' +
          '<div class="plan__target">' + p.target + '</div>' +
          '<div class="plan__items">';
        p.items.forEach(function (it) { html += '<div class="plan__item">' + A.icon('check', 13) + it + '</div>'; });
        html += '</div></div>';
      });
      html += '</div></div>';

      html += '<div class="sec" style="padding-top:8px"><div class="sec__head"><div>' +
        '<div class="kicker">PROCESS</div><h2 class="sec__title">合作流程</h2>' +
        '<div class="sec__sub">从沟通到复盘，最快 5 个工作日落地</div></div></div>' +
        '<div class="steps">';
      D.process.forEach(function (p) {
        html += '<div class="step"><div class="step__no">' + p.step + '</div>' +
          '<div class="step__body"><div class="step__name">' + p.name + '</div>' +
          '<div class="step__desc">' + p.desc + '</div></div></div>';
      });
      html += '</div></div>';

      html += '<div class="sec" style="padding-top:8px"><div class="sec__head"><div>' +
        '<div class="kicker">INQUIRY</div><h2 class="sec__title">提交需求</h2>' +
        '<div class="sec__sub">试点阶段由项目组直接对接，2 个工作日内回复方案草案</div></div></div>' +
        '<div class="form" id="b2b-form">' +
        '<div class="field"><label class="field__label">机构类型</label>' +
        '<select class="select" id="f-type">' +
        '<option>中小学</option><option>高校 / 党校</option><option>研学机构 / 旅行社</option><option>场馆 / 基地</option><option>其他</option>' +
        '</select></div>' +
        '<div class="field"><label class="field__label">机构名称</label>' +
        '<input class="input" id="f-org" maxlength="30" placeholder="如：XX 中学 / XX 研学中心" value="' + (b ? A.esc(b.org || '') : '') + '"></div>' +
        '<div class="form-row">' +
        '<div class="field"><label class="field__label">联系人</label><input class="input" id="f-name" maxlength="10" placeholder="姓名" value="' + (b ? A.esc(b.name || '') : '') + '"></div>' +
        '<div class="field"><label class="field__label">手机号</label><input class="input" id="f-phone" maxlength="11" inputmode="numeric" placeholder="用于回访" value="' + (b ? A.esc(b.phone || '') : '') + '"></div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="field"><label class="field__label">预计人数</label><input class="input" id="f-people" maxlength="6" inputmode="numeric" placeholder="如 120"></div>' +
        '<div class="field"><label class="field__label">计划时间</label><input class="input" id="f-date" type="date"></div>' +
        '</div>' +
        '<div class="field"><label class="field__label">需求说明</label>' +
        '<textarea class="textarea" id="f-need" rows="3" maxlength="200" placeholder="学段、时长、课程目标、是否需要现场执行……"></textarea></div>' +
        '<label class="checkline"><input type="checkbox" id="f-agree" checked> 同意项目组就本次需求与我联系</label>' +
        '<button class="btn btn--red btn--block mt16" id="f-submit">提交需求</button>' +
        '<p class="source">试点阶段不接入支付与在线签约；表单内容仅保存在本机用于演示，不会上传服务器。</p>' +
        '</div></div>';

      html += '<footer class="foot"><div class="foot__seal">韶</div>' +
        '<div class="foot__txt">' + D.meta.fullName + '<br>' + D.meta.disclaimer + '</div>' +
        '<div class="foot__ver">' + D.meta.version + '</div></footer>';

      return html;
    },
    mount: function (root) {
      var btn = root.querySelector('#f-submit');
      btn.addEventListener('click', function () {
        var org = root.querySelector('#f-org').value.trim();
        var name = root.querySelector('#f-name').value.trim();
        var phone = root.querySelector('#f-phone').value.trim();
        if (!org) { A.toast('请填写机构名称', { icon: 'info' }); return; }
        if (!name) { A.toast('请填写联系人', { icon: 'info' }); return; }
        if (!/^1\d{10}$/.test(phone)) { A.toast('请填写 11 位手机号', { icon: 'info' }); return; }
        if (!root.querySelector('#f-agree').checked) { A.toast('请勾选同意联系', { icon: 'info' }); return; }

        A.state.booking = {
          type: root.querySelector('#f-type').value,
          org: org, name: name, phone: phone,
          people: root.querySelector('#f-people').value.trim(),
          date: root.querySelector('#f-date').value,
          need: root.querySelector('#f-need').value.trim(),
          at: new Date().toISOString()
        };
        A.save();
        var no = 'B2B-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 8999));
        A.modal('<div class="modal-body tc"><div class="badge-medal" style="margin-bottom:12px">约</div>' +
          '<h3 class="modal-title">需求已记录</h3>' +
          '<p class="modal-text">受理编号 <b>' + no + '</b><br>' + A.esc(org) + ' · ' + A.esc(name) + '<br>项目组将在 2 个工作日内联系您（试点演示，不真实外呼）。</p>' +
          '<div class="modal-actions"><button class="btn btn--primary btn--block" data-close>知道了</button></div></div>', { dismissible: false });
        A.vibrate([12, 40, 12]);
      });

      root.querySelectorAll('.input').forEach(function (i) {
        i.addEventListener('focus', function () { i.classList.add('is-focus'); });
        i.addEventListener('blur', function () { i.classList.remove('is-focus'); });
      });
    }
  };
})();