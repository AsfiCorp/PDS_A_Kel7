// DuoWallet Desktop Shell (Part 1: Core & Shell Sync)
(() => {
  window.DesktopShell = {
    activeSpace: 'personal',

    setSpace(space) {
      this.activeSpace = space;
      Router.navigate(space === 'personal' ? 'S12' : 'S26');
    },

    sync() {
      const shell = document.getElementById('desktop-app-shell');
      if (!shell || !LayoutManager.isDesktop()) return;

      const screenId = DuoState.currentScreen;
      const num = parseInt(screenId.replace('S', ''), 10);
      if (num >= 26 && num <= 33) this.activeSpace = 'collab';
      else if (num >= 12 && num <= 25) this.activeSpace = 'personal';

      this.renderSidebar();
      this.renderHeader();
      this.renderContent();
      this.syncAiPanel();
    },

    renderSidebar() {
      const el = document.getElementById('desktop-sidebar-container');
      if (!el) return;
      const isCollab = this.activeSpace === 'collab';
      const isId = DuoState.lang === 'id';
      const sid = DuoState.currentScreen;
      const user = (DuoState.data && DuoState.data.currentUser) || { name: 'Rina' };
      const pBal = DuoState.getPersonalBalance();
      const cBal = DuoState.getCollabBalance();
      const debt = DuoState.getSettleUpTotal();

    el.innerHTML = `
      <div class="desktop-sidebar-inner">
        <div class="desktop-brand">
          <div class="duo-mark-mini">
            <span class="ring ring--rina"></span>
            <span class="ring ring--dimas"></span>
          </div>
          <div>
            <strong class="desktop-brand-title">DuoWallet</strong>
            <span class="desktop-brand-sub">${window.t ? window.t('smartLedger') : 'Keuangan Cerdas'}</span>
          </div>
        </div>

        <div class="desktop-workspace-card">
          <span class="desktop-workspace-label">${window.t ? window.t('activeSpace') : 'RUANG AKTIF'}</span>
          <div class="desktop-workspace-tabs">
            <button type="button" class="desk-ws-tab ${!isCollab ? 'active personal' : ''}" onclick="DesktopShell.setSpace('personal')">
              <span class="material-symbols-rounded icon-sm">person</span>
              <span class="desk-ws-name">${window.t ? window.t('personal') : 'Pribadi'}</span>
              <span class="desk-ws-val">${DuoState.maskAmounts ? '••••' : formatMoney(pBal)}</span>
            </button>
            <button type="button" class="desk-ws-tab ${isCollab ? 'active collab' : ''}" onclick="DesktopShell.setSpace('collab')">
              <span class="material-symbols-rounded icon-sm">group</span>
              <span class="desk-ws-name">${window.t ? window.t('collab') : 'Bersama'}</span>
              <span class="desk-ws-val">${DuoState.maskAmounts ? '••••' : formatMoney(cBal)}</span>
            </button>
          </div>
        </div>

        <nav class="desktop-nav-list" aria-label="Desktop Navigation">
          <div class="desktop-nav-sec-title">${window.t ? window.t('mainMenu') : 'MENU UTAMA'}</div>
          <button type="button" class="desk-nav-btn ${sid === (isCollab ? 'S26' : 'S12') ? 'active' : ''}" onclick="Router.navigate('${isCollab ? 'S26' : 'S12'}')">
            <span class="material-symbols-rounded">dashboard</span>
            <span>${window.t ? (isCollab ? window.t('collab') : window.t('personal')) : 'Ringkasan'}</span>
          </button>
          <button type="button" class="desk-nav-btn ${sid === (isCollab ? 'S27' : 'S13') ? 'active' : ''}" onclick="Router.navigate('${isCollab ? 'S27' : 'S13'}')">
            <span class="material-symbols-rounded">receipt_long</span>
            <span>${window.t ? window.t('recentTx') : 'Transaksi'}</span>
          </button>
          <button type="button" class="desk-nav-btn ${sid === (isCollab ? 'S31' : 'S19') ? 'active' : ''}" onclick="Router.navigate('${isCollab ? 'S31' : 'S19'}')">
            <span class="material-symbols-rounded">pie_chart</span>
            <span>${window.t ? window.t('budgets') : 'Anggaran'}</span>
          </button>
          <button type="button" class="desk-nav-btn ${sid === (isCollab ? 'S32' : 'S22') ? 'active' : ''}" onclick="Router.navigate('${isCollab ? 'S32' : 'S22'}')">
            <span class="material-symbols-rounded">flag</span>
            <span>${window.t ? (DuoState.lang === 'su' ? 'Udagan' : (DuoState.lang === 'en' ? 'Goals' : 'Target')) : 'Target'}</span>
          </button>
          <button type="button" class="desk-nav-btn ${sid === 'S34' ? 'active' : ''}" onclick="Router.navigate('S34')">
            <span class="material-symbols-rounded">account_balance_wallet</span>
            <span>${window.t ? window.t('wallets') : 'Dompet'}</span>
          </button>
          ${isCollab ? `
            <button type="button" class="desk-nav-btn ${sid === 'S30' ? 'active' : ''}" onclick="Router.navigate('S30')">
              <span class="material-symbols-rounded">balance</span>
              <span>${window.t ? window.t('settleUp') : 'Pelunasan'}</span>
              ${debt > 0 ? `<span class="desk-nav-badge">${DuoState.maskAmounts ? '•' : formatMoney(debt)}</span>` : ''}
            </button>
          ` : `
            <button type="button" class="desk-nav-btn ${sid === 'S25' ? 'active' : ''}" onclick="Router.navigate('S25')">
              <span class="material-symbols-rounded">calendar_month</span>
              <span>${window.t ? (DuoState.lang === 'su' ? 'Tagihan' : (DuoState.lang === 'en' ? 'Bills' : 'Tagihan')) : 'Tagihan'}</span>
            </button>
          `}
          <div class="desktop-nav-sec-title mt-3">${window.t ? window.t('systemMenu') : 'SISTEM'}</div>
          ${(user.role && ['super_admin', 'admin_finance', 'admin_ai'].includes(user.role)) ? `
            <button type="button" class="desk-nav-btn ${sid === 'S46' ? 'active' : ''}" style="color:#DC2626;font-weight:700;" onclick="Router.navigate('S46')">
              <span class="material-symbols-rounded">admin_panel_settings</span>
              <span>Admin Center</span>
            </button>
          ` : ''}
          <button type="button" class="desk-nav-btn ${sid === (isCollab ? 'S39' : 'S40') ? 'active' : ''}" onclick="Router.navigate('${isCollab ? 'S39' : 'S40'}')">
            <span class="material-symbols-rounded">settings</span>
            <span>${window.t ? window.t('settings') : 'Pengaturan'}</span>
          </button>
        </nav>

        <div class="desktop-user-footer">
          ${window.renderUserAvatar ? window.renderUserAvatar('avatar-sm') : '<div class="avatar avatar-sm">R</div>'}
          <div class="desktop-user-info">
            <strong>${Security.escapeHtml(user.name)}</strong>
            <span class="text-xs text-secondary">${window.t ? (isCollab ? window.t('collabSpace') : window.t('personalSpace')) : (isCollab ? 'Ruang Bersama' : 'Ruang Pribadi')}</span>
          </div>
          <button type="button" class="icon-btn" onclick="Router.openDialog('D13')" title="Log Out">
            <span class="material-symbols-rounded">logout</span>
          </button>
        </div>
      </div>
    `;
    },

    renderHeader() {
    const el = document.getElementById('desktop-header-container');
    if (!el) return;
    const isCollab = this.activeSpace === 'collab';
    const isId = DuoState.lang === 'id';
    const user = (DuoState.data && DuoState.data.currentUser) || (window.DuoAuth && DuoAuth.getCurrentUser()) || { id: 'usr_rina', name: 'Rina' };
    const isDemo = ['usr_rina', 'usr_dimas', 'usr_admin', 'usr_finance', 'usr_ai'].includes(user.id);
    const partner = (DuoState.data && DuoState.data.partner) || (isDemo ? { name: 'Dimas' } : null);

    const title = isCollab
      ? (partner ? `${window.t ? window.t('collabSpace') : 'Ruang Bersama'} · ${user.name} & ${partner.name}` : `${window.t ? window.t('collabSpace') : 'Ruang Bersama'} · ${user.name}`)
      : `${window.t ? window.t('personalSpace') : 'Ruang Pribadi'} · ${user.name}`;

    el.innerHTML = `
      <div class="desktop-header-left">
        <h2 class="desktop-title">${title}</h2>
        <span class="desktop-header-badge">
          <span class="material-symbols-rounded icon-xs">calendar_today</span>
          ${DuoState.data.todayFormatted || '24 Oct 2026'} · ${DuoState.data.daysLeftInMonth || 8} ${window.t ? window.t('daysLeft') : 'hari tersisa'}
        </span>
      </div>

      <div class="desktop-header-right">
        <!-- Language Switcher -->
        <button type="button" class="desk-head-btn" onclick="UI.toggleLanguage()" title="Ganti Bahasa / Switch Language">
          <span class="lang-flag">${DuoState.lang === 'en' ? '🇬🇧' : (DuoState.lang === 'su' ? '🌱' : '🇮🇩')}</span>
          <span>${(DuoState.lang || 'id').toUpperCase()}</span>
        </button>

        <!-- Mask / Privacy Toggle -->
        <button type="button" class="desk-head-btn" onclick="UI.toggleMask()" title="Sensor Angka / Mask Amounts">
          <span class="material-symbols-rounded">${DuoState.maskAmounts ? 'visibility_off' : 'visibility'}</span>
          <span>${DuoState.maskAmounts ? (window.t ? window.t('unhide') : 'Buka Sensor') : (window.t ? window.t('mask') : 'Sensor')}</span>
        </button>

        <!-- DuoAI Copilot Trigger -->
        <button type="button" class="desk-head-btn ${DuoState.isAiOpen ? 'active' : ''}" onclick="DesktopShell.toggleAi()" title="DuoAI Copilot">
          <span class="material-symbols-rounded text-indigo">auto_awesome</span>
          <span>DuoAI Copilot</span>
        </button>

        <!-- Switch to Mobile Frame View -->
        <button type="button" class="desk-head-btn" onclick="UI.toggleViewMode()" title="Beralih ke Tampilan Mobile Phone">
          <span class="material-symbols-rounded text-indigo">smartphone</span>
          <span>${window.t ? window.t('mobileMode') : 'Tampilan Mobile'}</span>
        </button>

        <!-- Primary Add Transaction CTA -->
        <button type="button" class="btn btn-primary desk-add-btn" onclick="Router.navigate('${isCollab ? 'S28' : 'S15'}')">
          <span class="material-symbols-rounded">add</span>
          <span>${window.t ? (DuoState.lang === 'su' ? 'Tambih Transaksi' : (DuoState.lang === 'en' ? 'Add Transaction' : 'Tambah Transaksi')) : 'Tambah Transaksi'}</span>
        </button>
      </div>
    `;
    }
  };

  DesktopShell.renderContent = function() {
    const el = document.getElementById('desktop-content-container');
    if (!el) return;
    const sid = DuoState.currentScreen;
    if (sid === 'S12' || sid === 'S01') {
      el.innerHTML = this.renderDesktopPersonalDashboard();
    } else if (sid === 'S26') {
      el.innerHTML = this.renderDesktopCollabDashboard();
    } else {
      const isId = DuoState.lang === 'id';
      const screenHtml = Screens['render' + sid] ? Screens['render' + sid]() : '<p>Screen not found</p>';
      el.innerHTML = `
        <div class="desktop-subscreen-wrapper">
          <div class="desktop-subscreen-toolbar">
            <button type="button" class="btn-text" onclick="Router.back()">
              <span class="material-symbols-rounded icon-sm">arrow_back</span>
              <span>${window.t ? window.t('back') : 'Kembali'}</span>
            </button>
            <span class="text-xs text-secondary font-mono">${sid}</span>
          </div>
          <div class="desktop-subscreen-body">${screenHtml}</div>
        </div>
      `;
    }
    el.scrollTop = 0;
  };
  DesktopShell.renderDesktopPersonalDashboard = function() {
    const isId = DuoState.lang === 'id';
    const pBal = DuoState.getPersonalBalance();
    const debt = DuoState.getSettleUpTotal();
    const txs = DuoState.data.transactions || [];
    const budgets = (DuoState.data.budgets && DuoState.data.budgets.personal) || [];
    const goals = (DuoState.data.goals && DuoState.data.goals.personal) || [];
    const bills = (DuoState.data.bills && DuoState.data.bills.personal) || [];
    const spent = budgets.reduce((s, b) => s + b.spent, 0);

    return `
      <div class="desktop-dashboard">
        <div class="desktop-stats-row">
          <div class="desk-stat-card safe" onclick="Router.navigate('S43')">
            <span class="text-xs font-semibold text-secondary uppercase">${window.t ? window.t('safeToSpend') : 'Aman Belanja'}</span>
            <div class="desk-stat-val">${DuoState.maskAmounts ? 'Rp ••••••' : formatMoney(DuoState.getSafeToSpendDaily())}<span class="text-xs">${window.t ? window.t('perDay') : '/hari'}</span></div>
            <div class="desk-stat-foot text-xs text-teal">✓ ${window.t ? window.t('safePace') : 'Pace sehat'}</div>
          </div>
          <div class="desk-stat-card">
            <span class="text-xs font-semibold text-secondary uppercase">${window.t ? window.t('personalBalance') : 'Saldo Pribadi'}</span>
            <div class="desk-stat-val">${DuoState.maskAmounts ? 'Rp ••••••••' : formatMoney(pBal)}</div>
            <div class="desk-stat-foot text-xs text-secondary">3 ${window.t ? window.t('activeWallets') : 'kantong aktif'}</div>
          </div>
          <div class="desk-stat-card" onclick="Router.navigate('S19')">
            <span class="text-xs font-semibold text-secondary uppercase">${window.t ? window.t('budgetSpent') : 'Anggaran Terpakai'}</span>
            <div class="desk-stat-val">${DuoState.maskAmounts ? '••••' : formatMoney(spent)}</div>
            <div class="desk-stat-foot text-xs text-secondary">${budgets.length} ${window.t ? window.t('categories') : 'kategori'}</div>
          </div>
          <div class="desk-stat-card" onclick="Router.navigate('S30')">
            <span class="text-xs font-semibold text-secondary uppercase">${window.t ? window.t('dimasOwes') : 'Piutang Dimas'}</span>
            <div class="desk-stat-val text-teal">${debt > 0 ? (DuoState.maskAmounts ? '••••' : formatMoney(debt)) : 'Rp 0'}</div>
            <div class="desk-stat-foot text-xs text-teal">${debt > 0 ? (window.t ? window.t('needCollect') : 'Perlu ditagih') : (window.t ? window.t('settled') : 'Lunas')}</div>
          </div>
        </div>

        <div class="desktop-grid-columns">
          <div class="desktop-main-col">
            <div class="card desk-panel">
              <div class="desk-panel-head">
                <h4>${window.t ? window.t('recentTx') : 'Transaksi Terbaru'}</h4>
                <button type="button" class="btn-text" onclick="Router.navigate('S13')">${window.t ? window.t('all') : 'Semua'}</button>
              </div>
              <div class="tx-list mt-2">
                ${txs.slice(0, 5).map(tx => `
                  <div class="tx-card" onclick="Router.navigate('S17', { txId: '${tx.id}' })">
                    <div class="tx-icon"><span class="material-symbols-rounded">receipt</span></div>
                    <div class="tx-details">
                      <strong>${tx.merchant}</strong>
                      <span class="tx-sub">${tx.date} • ${tx.shared ? '<span class="tag-shared">Shared</span>' : '<span class="tag-private">Private</span>'}</span>
                    </div>
                    <div class="tx-amount ${tx.amount < 0 ? 'text-expense' : 'text-income'}">
                      ${DuoState.maskAmounts ? '••••' : formatMoney(tx.amount, true)}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="desktop-side-col">
            <div class="card desk-panel">
              <div class="desk-panel-head">
                <h4>${window.t ? window.t('savingsTarget') : 'Target Tabungan'}</h4>
                <button type="button" class="btn-text" onclick="Router.navigate('S22')">${window.t ? window.t('all') : 'Semua'}</button>
              </div>
              ${goals.map(g => `
                <div class="card goal-card mb-2" onclick="Router.navigate('S24', { goalId: '${g.id}' })">
                  <div class="goal-head">
                    <strong>${g.name}</strong>
                    <span class="badge ${g.status === 'At risk' ? 'badge-danger' : 'badge-success'}">${g.status}</span>
                  </div>
                  <div class="goal-amounts mt-1"><span>${formatMoney(g.saved)}</span><span class="text-xs text-secondary">/ ${formatMoney(g.target)}</span></div>
                </div>
              `).join('')}
            </div>

            <div class="card desk-panel mt-3">
              <div class="desk-panel-head">
                <h4>${window.t ? window.t('billsUpcoming') : 'Tagihan Mendatang'}</h4>
                <button type="button" class="btn-text" onclick="Router.navigate('S25')">${window.t ? window.t('all') : 'Semua'}</button>
              </div>
              ${bills.slice(0, 3).map(b => `
                <div class="meta-row py-1" onclick="Router.openDialog('D06', { billId: '${b.id}' })">
                  <span>${b.name}</span>
                  <strong>${formatMoney(b.amount)}</strong>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  DesktopShell.renderDesktopCollabDashboard = function() {
    const isId = DuoState.lang === 'id';
    const cBal = DuoState.getCollabBalance();
    const debt = DuoState.getSettleUpTotal();
    const acts = DuoState.data.collabActivity || [];
    const goals = (DuoState.data.goals && DuoState.data.goals.collab) || [];

    return `
      <div class="desktop-dashboard">
        <div class="desktop-stats-row">
          <div class="desk-stat-card collab">
            <span class="text-xs font-semibold text-secondary uppercase">${window.t ? window.t('jointPool') : 'Kas Bersama'}</span>
            <div class="desk-stat-val">${DuoState.maskAmounts ? 'Rp ••••••••' : formatMoney(cBal)}</div>
            <div class="desk-stat-foot text-xs text-secondary">Joint BCA + Household</div>
          </div>
          <div class="desk-stat-card" onclick="Router.navigate('S30')">
            <span class="text-xs font-semibold text-secondary uppercase">${window.t ? window.t('settleStatus') : 'Status Hutang'}</span>
            <div class="desk-stat-val text-teal">${debt > 0 ? (DuoState.maskAmounts ? '••••' : formatMoney(debt)) : (window.t ? window.t('settled') : 'Lunas')}</div>
            <div class="desk-stat-foot text-xs text-teal">${debt > 0 ? (window.t ? window.t('dimasOwesYou') : 'Dimas berhutang') : (window.t ? window.t('balanced') : 'Kas seimbang')}</div>
          </div>
        </div>

        <div class="desktop-grid-columns">
          <div class="desktop-main-col">
            <div class="card desk-panel">
              <div class="desk-panel-head">
                <h4>${window.t ? window.t('sharedActivity') : 'Aktivitas Bersama'}</h4>
                <button type="button" class="btn-text" onclick="Router.navigate('S27')">${window.t ? window.t('all') : 'Semua'}</button>
              </div>
              <div class="tx-list mt-2">
                ${acts.slice(0, 5).map(a => `
                  <div class="tx-card" onclick="Router.openOverlay('C23', { actId: '${a.id}' })">
                    <div class="tx-icon"><span class="actor-tag ${a.actor === 'Rina' ? 'actor-rina' : 'actor-dimas'}">${a.actor[0]}</span></div>
                    <div class="tx-details">
                      <strong>${a.merchant}</strong>
                      <span class="tx-sub">${a.actor} • ${a.category}</span>
                    </div>
                    <div class="tx-amount text-expense">${formatMoney(a.amount, true)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="desktop-side-col">
            <div class="card desk-panel">
              <div class="desk-panel-head">
                <h4>${window.t ? window.t('collabGoals') : 'Target Bersama'}</h4>
                <button type="button" class="btn-text" onclick="Router.navigate('S32')">${window.t ? window.t('all') : 'Semua'}</button>
              </div>
              ${goals.map(g => `
                <div class="card goal-card mb-2">
                  <strong>${g.name}</strong>
                  <div class="goal-amounts mt-1"><span>${formatMoney(g.saved)}</span><span class="text-xs text-secondary">/ ${formatMoney(g.target)}</span></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  DesktopShell.toggleAi = function() {
    const activeUser = window.DuoAuth ? DuoAuth.getCurrentUser() : null;
    if (!activeUser) {
      if (window.UI && window.UI.showToast) UI.showToast('Silakan login terlebih dahulu untuk mengakses DuoAI');
      return;
    }
    DuoState.isAiOpen = !DuoState.isAiOpen;
    this.syncAiPanel();
  };

  DesktopShell.isAppOnlyMode = function() {
    return localStorage.getItem('duoai_app_only') === 'true';
  };

  DesktopShell.toggleAiMode = function() {
    const next = !this.isAppOnlyMode();
    localStorage.setItem('duoai_app_only', next ? 'true' : 'false');
    this.syncAiModeUI();
    const modeName = next ? 'Khusus DuoWallet' : 'Full Knowledge Base';
    if (window.UI && window.UI.showToast) {
      UI.showToast(`Mode AI diubah: ${modeName}`);
    }
  };

  DesktopShell.syncAiModeUI = function() {
    const isAppOnly = this.isAppOnlyMode();
    const label = isAppOnly ? 'Khusus DuoWallet' : 'Full Knowledge Base';
    const color = isAppOnly ? '#6366f1' : '#10b981';

    const textDesk = document.getElementById('duoai-mode-text');
    const dotDesk = document.getElementById('duoai-mode-dot');
    if (textDesk) textDesk.textContent = label;
    if (dotDesk) dotDesk.style.background = color;

    const textMob = document.getElementById('duoai-mobile-mode-text');
    const dotMob = document.getElementById('duoai-mobile-mode-dot');
    if (textMob) textMob.textContent = label;
    if (dotMob) dotMob.style.background = color;
  };

  DesktopShell.syncAiPanel = function() {
    const p = document.getElementById('desktop-ai-panel');
    this.syncAiModeUI();
    if (!p) return;
    if (DuoState.isAiOpen) {
      p.classList.add('open');
      this.renderAiMessages();
      this.renderAiQuickChips();
    } else {
      p.classList.remove('open');
    }
  };

  DesktopShell.renderAiMessages = function() {
    const c = document.getElementById('desk-ai-messages');
    if (!c) return;
    if (!DuoState.aiChatHistory || DuoState.aiChatHistory.length === 0) {
      if (window.UI && window.UI.initAiWelcomeMessage) UI.initAiWelcomeMessage();
    }
    c.innerHTML = (DuoState.aiChatHistory || []).map(m => {
      const isBot = m.role === 'assistant';
      const safe = window.Security ? window.Security.renderSafeMarkdown(m.text || '') : (m.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
      const timeSafe = window.Security ? window.Security.escapeHtml(m.time || '') : (m.time || '');
      return `
        <div class="ai-msg-bubble ${isBot ? 'ai-bubble-bot' : 'ai-bubble-user'}">
          ${isBot ? '<div class="ai-bubble-avatar"><span class="material-symbols-rounded">auto_awesome</span></div>' : ''}
          <div class="ai-msg-content">
            <div class="ai-bubble-text">${safe}</div>
            <span class="ai-msg-time">${timeSafe}</span>
          </div>
        </div>
      `;
    }).join('');
    c.scrollTop = c.scrollHeight;
  };

  DesktopShell.renderAiQuickChips = function() {
    const el = document.getElementById('desk-ai-quick-chips');
    if (!el) return;
    const isId = DuoState.lang === 'id';
    const isSu = DuoState.lang === 'su';
    const chips = isSu ? [
      { label: '🛒 Tiasa Balanja?', query: 'Naha wates dinten abdi aman kanggo jajan kopi?' },
      { label: '⚖️ Sambetan Dimas', query: 'Sabaraha total anu kedah ditaros ka Dimas?' },
      { label: '🎯 Status Udagan', query: 'Kumaha kamajuan udagan tabungan Liburan Bali?' },
      { label: '💡 Tips Hemat', query: 'Pasihan abdi tips hemat dumasar kana pangaluaran sasih ieu' }
    ] : isId ? [
      { label: '🛒 Aman Belanja?', query: 'Apakah batas harian saya aman untuk jajan kopi?' },
      { label: '⚖️ Hutang Dimas', query: 'Berapa total yang harus ditagih ke Dimas?' },
      { label: '🎯 Target Tabungan', query: 'Bagaimana progres target tabungan Liburan Bali?' },
      { label: '💡 Tips Hemat', query: 'Beri aku tips berhemat berdasarkan pengeluaran bulan ini' }
    ] : [
      { label: '🛒 Can I Spend?', query: 'Is my daily budget safe for extra spending today?' },
      { label: '⚖️ Dimas Debt', query: 'How much does Dimas owe me right now?' },
      { label: '💡 Savings Tips', query: 'Give me smart savings tips based on my spending' }
    ];

    el.innerHTML = chips.map(c => `
      <button type="button" class="ai-quick-chip" onclick="DesktopShell.sendPrompt('${c.query.replace(/'/g, "\\'")}')">
        ${c.label}
      </button>
    `).join('');
  };

  DesktopShell.sendPrompt = function(query) {
    const input = document.getElementById('desk-ai-input');
    if (input) input.value = query;
    this.handleAiSubmit();
  };

  DesktopShell.handleAiSubmit = function() {
    const input = document.getElementById('desk-ai-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    DuoState.aiChatHistory.push({ role: 'user', text, time: timeStr });
    input.value = '';
    this.renderAiMessages();
    const loadingTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const loadingMsg = { role: 'assistant', text: '...', time: loadingTimeStr, isLoading: true };
    DuoState.aiChatHistory.push(loadingMsg);
    this.renderAiMessages();

    Promise.resolve(window.UI && window.UI.generateAiResponse ? UI.generateAiResponse(text) : 'OK')
      .then(reply => {
        const idx = DuoState.aiChatHistory.indexOf(loadingMsg);
        if (idx !== -1) DuoState.aiChatHistory.splice(idx, 1);
        DuoState.aiChatHistory.push({ role: 'assistant', text: reply, time: loadingTimeStr });
        this.renderAiMessages();
      })
      .catch(() => {
        const idx = DuoState.aiChatHistory.indexOf(loadingMsg);
        if (idx !== -1) DuoState.aiChatHistory.splice(idx, 1);
        DuoState.aiChatHistory.push({ role: 'assistant', text: 'Maaf, terjadi kendala saat memproses jawaban.', time: loadingTimeStr });
        this.renderAiMessages();
      });
  };
})();

