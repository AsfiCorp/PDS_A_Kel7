// Screens: S34 to S44 (System, Wallets, Settings, Safe-to-Spend, Reports, Health)
window.Screens = window.Screens || {};

// S34: Wallets List
Screens.renderS34 = function() {
  const wallets = DuoState.data.wallets;
  const personalWallets = wallets.filter(w => w.scope === 'personal');
  const collabWallets = wallets.filter(w => w.scope === 'collab');

  return `
    <div class="screen feed-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Wallets & Accounts</h3>
        <button class="icon-btn" onclick="Router.navigate('S36')"><span class="material-symbols-rounded">add</span></button>
      </div>

      <div class="section-title mt-2">
        <h4>Personal Wallets (Private)</h4>
        <span class="text-xs text-secondary">${formatMoney(DuoState.getPersonalBalance())}</span>
      </div>
      <div class="wallets-group">
        ${personalWallets.map(w => `
          <div class="card wallet-card" onclick="Router.navigate('S35', { walletId: '${w.id}' })">
            <div class="wallet-left">
              <span class="material-symbols-rounded wallet-icon">${w.icon}</span>
              <div>
                <strong>${w.name}</strong>
                <span class="wallet-type">${w.type}</span>
              </div>
            </div>
            <div class="wallet-right">
              <strong>${DuoState.maskAmounts ? '••••' : formatMoney(w.balance)}</strong>
              <span class="badge badge-personal">Personal</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="section-title mt-4">
        <h4>Collab Wallets (Shared Pool)</h4>
        <span class="text-xs text-secondary">${formatMoney(DuoState.getCollabBalance())}</span>
      </div>
      <div class="wallets-group">
        ${collabWallets.map(w => `
          <div class="card wallet-card" onclick="Router.navigate('S35', { walletId: '${w.id}' })">
            <div class="wallet-left">
              <span class="material-symbols-rounded wallet-icon collab-wallet-icon">${w.icon}</span>
              <div>
                <strong>${w.name}</strong>
                <span class="wallet-type">${w.type} • Shared Pool</span>
              </div>
            </div>
            <div class="wallet-right">
              <strong>${DuoState.maskAmounts ? '••••' : formatMoney(w.balance)}</strong>
              <span class="badge badge-collab">Collab</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// S35: Wallet Detail
Screens.renderS35 = function(params = {}) {
  const wallet = DuoState.data.wallets.find(w => w.id === params.walletId) || DuoState.data.wallets[0];
  const txs = DuoState.data.transactions.filter(t => t.walletId === wallet.id);

  return `
    <div class="screen detail-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>${wallet.name}</h3>
        <button class="icon-btn" onclick="Router.openDialog('D09', { walletId: '${wallet.id}' })">
          <span class="material-symbols-rounded">delete</span>
        </button>
      </div>
      <div class="detail-body">
        <div class="card text-center">
          <span class="badge ${wallet.scope === 'collab' ? 'badge-collab' : 'badge-personal'}">${wallet.type} • ${wallet.scope}</span>
          <h1 class="mt-2">${DuoState.maskAmounts ? '••••' : formatMoney(wallet.balance)}</h1>
          <p class="text-secondary text-xs mt-1">${wallet.scope === 'collab' ? 'Shared with Dimas' : 'Private to Rina'}</p>
        </div>

        <div class="action-grid mt-4">
          <button class="action-item" onclick="Router.openOverlay('C06', { fromWallet: '${wallet.id}' })">
            <div class="action-icon"><span class="material-symbols-rounded">sync_alt</span></div>
            <span>Transfer</span>
          </button>
          <button class="action-item" onclick="Router.navigate('S15')">
            <div class="action-icon"><span class="material-symbols-rounded">add</span></div>
            <span>Expense</span>
          </button>
          <button class="action-item" onclick="Router.navigate('S16')">
            <div class="action-icon"><span class="material-symbols-rounded">arrow_downward</span></div>
            <span>Top Up</span>
          </button>
        </div>

        <div class="section-title mt-4">
          <h4>Transactions with this wallet</h4>
        </div>
        <div class="tx-list">
          ${txs.length ? txs.map(tx => `
            <div class="tx-card">
              <div class="tx-icon"><span class="material-symbols-rounded">receipt</span></div>
              <div class="tx-details">
                <strong>${tx.merchant}</strong>
                <span class="tx-sub">${tx.date}</span>
              </div>
              <div class="tx-amount text-expense">${formatMoney(tx.amount, true)}</div>
            </div>
          `).join('') : '<p class="text-sm text-secondary text-center py-4">No transactions recorded yet.</p>'}
        </div>
      </div>
    </div>
  `;
};

// S36: Add Wallet
Screens.renderS36 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">close</span></button>
        <h3>Add New Wallet</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <label class="form-group">
          <span>Wallet Name</span>
          <input type="text" id="new-wallet-name" placeholder="e.g. Mandiri Savings" value="Mandiri Debit" />
        </label>
        <label class="form-group">
          <span>Account Type</span>
          <select id="new-wallet-type">
            <option>Bank</option>
            <option>E-wallet</option>
            <option>Cash</option>
            <option>Investment</option>
          </select>
        </label>
        <label class="form-group">
          <span>Initial Balance (Rp)</span>
          <input type="text" id="new-wallet-balance" value="1.500.000" />
        </label>
        <label class="form-group">
          <span>Scope & Privacy</span>
          <select id="new-wallet-scope">
            <option value="personal">Personal (100% Private to Rina)</option>
            <option value="collab">Collab (Visible in Shared Pool)</option>
          </select>
        </label>
        <button class="btn btn-primary mt-6" onclick="UI.createWallet()">Save Wallet</button>
      </div>
    </div>
  `;
};

// S37: Net Worth Overview
Screens.renderS37 = function() {
  const pBal = DuoState.getPersonalBalance();
  const cBal = DuoState.getCollabBalance();
  const rinaJointShare = Math.round(cBal / 2);
  const receivables = DuoState.getSettleUpTotal();
  const totalNetWorth = pBal + rinaJointShare + receivables;

  // Build dynamic asset allocation list
  const pWallets = (DuoState.data.wallets || []).filter(w => w.scope === 'personal');
  const items = pWallets.map(w => ({
    name: w.name,
    amount: w.balance,
    pct: totalNetWorth > 0 ? Math.round((w.balance / totalNetWorth) * 100) : 0
  }));

  if (rinaJointShare > 0) {
    items.push({
      name: 'Joint Pool (50% Equity)',
      amount: rinaJointShare,
      pct: totalNetWorth > 0 ? Math.round((rinaJointShare / totalNetWorth) * 100) : 0
    });
  }

  if (receivables > 0) {
    items.push({
      name: 'Receivables (Dimas Owes)',
      amount: receivables,
      pct: totalNetWorth > 0 ? Math.round((receivables / totalNetWorth) * 100) : 0
    });
  }

  return `
    <div class="screen detail-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Net Worth Overview</h3>
        <button class="icon-btn" onclick="Router.navigate('S42')"><span class="material-symbols-rounded">download</span></button>
      </div>
      <div class="detail-body">
        <div class="card text-center hero-networth">
          <span class="text-xs text-secondary uppercase font-bold">Rina's Total Net Worth</span>
          <h1 class="mt-1">${DuoState.maskAmounts ? '••••••••' : formatMoney(totalNetWorth)}</h1>
          <p class="text-secondary text-xs mt-1">Personal Assets + Joint Equity + Receivables</p>
        </div>

        <div class="card meta-card mt-3">
          <div class="meta-row">
            <span>Personal Wallets</span>
            <strong>${formatMoney(pBal)}</strong>
          </div>
          <div class="meta-row">
            <span>50% Share of Joint Pool</span>
            <strong class="text-teal">${formatMoney(rinaJointShare)}</strong>
          </div>
          <div class="meta-row">
            <span>Unsettled Receivables (Dimas owes)</span>
            <strong class="text-teal">+${formatMoney(receivables)}</strong>
          </div>
        </div>

        <div class="section-title mt-4">
          <h4>Asset Allocation</h4>
        </div>
        <div class="card">
          ${items.map(item => `
            <div class="meta-row">
              <span>${item.name}</span>
              <strong>${formatMoney(item.amount)} (${item.pct}%)</strong>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// S38: Financial Health 5-Factor Score
Screens.renderS38 = function() {
  const health = DuoState.data.healthScore;
  return `
    <div class="screen detail-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Financial Health</h3>
        <button class="icon-btn" onclick="Router.openOverlay('C19')"><span class="material-symbols-rounded">help_outline</span></button>
      </div>
      <div class="detail-body">
        <div class="card text-center hero-health">
          <div class="big-score-circle">${health.total}</div>
          <h3 class="mt-2">Grade: ${health.grade}</h3>
          <span class="badge badge-success mt-1">${health.trend}</span>
          <p class="text-secondary text-xs mt-2">Calculated from 5 automated financial pillars</p>
        </div>

        <div class="section-title mt-4">
          <h4>5-Factor Breakdown</h4>
        </div>
        <div class="factors-list">
          ${health.factors.map(f => `
            <div class="card factor-card" onclick="Router.openOverlay('C19', { factor: '${f.name}' })">
              <div class="factor-head">
                <strong>${f.name}</strong>
                <span class="badge ${f.status === 'Excellent' || f.status === 'Good' ? 'badge-success' : 'badge-warning'}">${f.score}/100</span>
              </div>
              <p class="text-xs text-secondary mt-1">${f.detail}</p>
              <div class="progress-bar-bg mt-2">
                <div class="progress-bar-fill ${f.score < 50 ? 'danger' : ''}" style="width: ${f.score}%;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// S39: Collab Settings
Screens.renderS39 = function() {
  const collab = DuoState.data.collabSpace;
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Collab Space Settings</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <div class="card partner-card">
          <div class="avatar-duo">
            <span class="mini-avatar" style="background:#6366F1;">R</span>
            <span class="mini-avatar overlap" style="background:#F97316;">D</span>
          </div>
          <div class="mt-2">
            <h4>${collab.name}</h4>
            <p class="text-xs text-secondary">Partner: Dimas (Connected since 3 Sep 2026)</p>
          </div>
        </div>

        <div class="card meta-card mt-3">
          <div class="meta-row" onclick="Router.openDialog('D19')">
            <span>Invite Code</span>
            <strong class="text-teal">${collab.inviteCode} <span class="material-symbols-rounded icon-sm">content_copy</span></strong>
          </div>
          <div class="meta-row" onclick="Router.openDialog('D18')">
            <span>Default Split Ratio</span>
            <strong>${collab.defaultSplit} <span class="material-symbols-rounded icon-sm">edit</span></strong>
          </div>
        </div>

        <div class="section-title mt-4">
          <h4>Privacy Controls</h4>
        </div>
        <div class="card">
          <div class="toggle-row">
            <div>
              <strong>Share Personal Notes</strong>
              <p class="text-xs text-secondary">Include custom tx notes on shared items</p>
            </div>
            <input type="checkbox" ${DuoState.data.privacySettings.shareNotes ? 'checked' : ''} onchange="DuoState.data.privacySettings.shareNotes = this.checked" />
          </div>
          <div class="toggle-row mt-2">
            <div>
              <strong>Share Scanned Receipts</strong>
              <p class="text-xs text-secondary">Dimas can view itemized receipt images</p>
            </div>
            <input type="checkbox" ${DuoState.data.privacySettings.shareReceipt ? 'checked' : ''} onchange="DuoState.data.privacySettings.shareReceipt = this.checked" />
          </div>
        </div>

        <div class="danger-zone mt-6">
          <button class="btn btn-outline text-danger" onclick="Router.openDialog('D04')">
            <span class="material-symbols-rounded">link_off</span> Unlink Partner
          </button>
        </div>
      </div>
    </div>
  `;
};

// S40: Personal Settings
Screens.renderS40 = function() {
  const user = (DuoState.data && DuoState.data.currentUser) || { name: 'Rina', email: 'rina@example.com' };
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>${window.t ? window.t('personalSettings') : 'Personal Settings'}</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <div class="card user-profile-card">
          <div class="profile-avatar-wrapper">
            ${window.renderUserAvatar ? window.renderUserAvatar('avatar-large', 'margin:0 auto; width:76px; height:76px; font-size:30px;') : '<div class="avatar-large" style="background:#6366F1; margin:0 auto;">R</div>'}
            <label for="profile-avatar-file-input" class="avatar-camera-badge" title="${window.t ? window.t('changePhoto') : 'Ganti Foto'}">
              <span class="material-symbols-rounded">photo_camera</span>
            </label>
            <input type="file" id="profile-avatar-file-input" accept="image/*" style="display:none;" onchange="UI.handleAvatarUpload(event)" />
          </div>
          <h4 class="mt-2" style="font-size:18px; font-weight:700;">${user.name}</h4>
          <p class="text-xs text-secondary mt-1">${user.email}</p>
          ${user.phone ? `<p class="text-xs text-secondary mt-1"><span class="material-symbols-rounded" style="font-size:13px; vertical-align:-2px; color:var(--indigo);">call</span> ${user.phone}</p>` : ''}
          ${user.bio ? `<p class="text-xs text-secondary mt-1" style="font-style:italic;">"${user.bio}"</p>` : ''}

          <div class="profile-card-actions mt-3">
            <button class="btn btn-sm btn-primary" onclick="UI.openEditProfileModal()">
              <span class="material-symbols-rounded icon-sm">edit</span> ${window.t ? window.t('editProfile') : 'Edit Profil'}
            </button>
            ${user.avatarUrl ? `
              <button class="btn btn-sm btn-outline text-danger" onclick="UI.removeAvatarPhoto()" title="${window.t ? window.t('removePhoto') : 'Hapus Foto'}">
                <span class="material-symbols-rounded icon-sm">delete</span>
              </button>
            ` : ''}
          </div>
        </div>

        <div class="card meta-card mt-3">
          <div class="meta-row" onclick="UI.toggleLanguage()">
            <span>${window.t ? window.t('switchLang') : 'Bahasa / Language'}</span>
            <strong class="text-indigo">${DuoState.lang === 'su' ? '🌱 Basa Sunda' : (DuoState.lang === 'en' ? '🇬🇧 English' : '🇮🇩 Indonesia')}</strong>
          </div>
          <div class="meta-row" onclick="Router.navigate('S41')">
            <span>${window.t ? window.t('privacyCenter') : 'Privacy & Sharing Center'}</span>
            <span class="material-symbols-rounded icon-chevron">chevron_right</span>
          </div>
          <div class="meta-row" onclick="Router.openOverlay('C16')">
            <span>${window.t ? window.t('currencyLabel') : 'Currency'}</span>
            <strong>IDR (Rp)</strong>
          </div>
          <div class="meta-row" onclick="Router.openOverlay('C17')">
            <span>${window.t ? window.t('biometricLock') : 'Biometric App Lock'}</span>
            <strong class="text-teal">Enabled</strong>
          </div>
          <div class="meta-row" onclick="Router.navigate('S42')">
            <span>${window.t ? window.t('exportReport') : 'Export Financial Report'}</span>
            <span class="material-symbols-rounded icon-chevron">chevron_right</span>
          </div>
          ${(user.role && ['super_admin', 'admin_finance', 'admin_ai'].includes(user.role)) ? `
            <div class="meta-row" onclick="Router.navigate('S46')" style="background:#FEF2F2;border-radius:6px;cursor:pointer;">
              <span style="color:#B91C1C;font-weight:700;">🛡️ Admin Control Center</span>
              <strong class="text-danger">${user.roleLabel || user.role} &gt;</strong>
            </div>
          ` : ''}
          <div class="meta-row" onclick="UI.promptAiEndpoint()">
            <span>AI Copilot Engine</span>
            <strong class=\"text-indigo\" id=\"ai-endpoint-badge\">${localStorage.getItem('duoai_endpoint') ? 'Custom URL' : 'Localhost / Auto'}</strong>
          </div>

        </div>

        <div class="mt-6 flex-column gap-2">
          <button class="btn btn-secondary" onclick="Router.openDialog('D07')">
            <span class="material-symbols-rounded">restart_alt</span> ${window.t ? window.t('resetData') : 'Reset Demo Data'}
          </button>
          <button class="btn btn-outline text-danger" onclick="Router.openDialog('D13')">
            <span class="material-symbols-rounded">logout</span> ${window.t ? window.t('logOut') : 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  `;
};

// S41: Privacy Center / Data Sharing Rules
Screens.renderS41 = function() {
  return `
    <div class="screen detail-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Privacy Center</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="detail-body">
        <div class="card privacy-banner">
          <span class="material-symbols-rounded icon-shield">verified_user</span>
          <h4 class="mt-1">Zero Leak Ledger</h4>
          <p class="text-xs text-secondary mt-1">DuoWallet isolates personal and collaborative ledgers by cryptographic design.</p>
        </div>

        <div class="section-title mt-4">
          <h4>What Dimas CAN and CANNOT see</h4>
        </div>
        <div class="card">
          <div class="privacy-item allowed">
            <span class="material-symbols-rounded text-teal">check_circle</span>
            <div>
              <strong>Visible to Dimas:</strong>
              <p class="text-xs text-secondary">Joint BCA balance, shared expenses you explicitly split, collab budget limits.</p>
            </div>
          </div>
          <div class="privacy-item blocked mt-3">
            <span class="material-symbols-rounded text-danger">cancel</span>
            <div>
              <strong>Hidden from Dimas:</strong>
              <p class="text-xs text-secondary">Rina BCA balance, personal wallets, private transactions, personal safe-to-spend.</p>
            </div>
          </div>
        </div>

        <div class="card mt-3">
          <div class="toggle-row">
            <div>
              <strong>Mask Amounts on Screen</strong>
              <p class="text-xs text-secondary">Blur figures to prevent shoulder surfing</p>
            </div>
            <input type="checkbox" ${DuoState.maskAmounts ? 'checked' : ''} onchange="UI.toggleMask()" />
          </div>
        </div>
      </div>
    </div>
  `;
};

// S42: Monthly Export / Report
Screens.renderS42 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Export Report</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <label class="form-group">
          <span>Month</span>
          <select id="export-month">
            <option>October 2026</option>
            <option>September 2026</option>
            <option>August 2026</option>
          </select>
        </label>
        <label class="form-group">
          <span>Scope</span>
          <select id="export-scope">
            <option value="all">Complete (Personal + Collab Space)</option>
            <option value="collab">Collab Only (Partner Statement)</option>
            <option value="personal">Personal Only (Private Audit)</option>
          </select>
        </label>
        <label class="form-group">
          <span>Export Format</span>
          <select id="export-format">
            <option value="pdf">PDF Statement</option>
            <option value="csv">CSV Spreadsheet</option>
          </select>
        </label>
        <button class="btn btn-primary mt-6" onclick="Router.openDialog('D17')">Generate & Download</button>
      </div>
    </div>
  `;
};

// S43: Safe-to-Spend Calculator & Daily Breakdown
Screens.renderS43 = function() {
  const pBal = DuoState.getPersonalBalance();
  const upcomingBills = ((DuoState.data.bills && DuoState.data.bills.personal) || [])
    .filter(b => b.status !== 'Paid')
    .reduce((s, b) => s + (b.amount || 0), 0);
  const goalsCommitment = ((DuoState.data.goals && DuoState.data.goals.personal) || [])
    .reduce((s, g) => s + (g.monthlyCommitment || 0), 0);
  const buffer = DuoState.getSafetyBuffer();
  const days = Math.max(1, (DuoState.data && DuoState.data.daysLeftInMonth) || 8);
  const surplus = Math.max(0, pBal - upcomingBills - goalsCommitment - buffer);
  const daily = Math.floor(surplus / days);

  return `
    <div class="screen detail-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Safe-to-Spend</h3>
        <button class="icon-btn" onclick="Router.openOverlay('C13')"><span class="material-symbols-rounded">tune</span></button>
      </div>
      <div class="detail-body">
        <div class="card text-center hero-safe">
          <span class="text-xs text-secondary uppercase font-bold">Daily Allowance</span>
          <h1 class="text-teal mt-1">${DuoState.maskAmounts ? '••••' : formatMoney(daily)}</h1>
          <span class="badge ${daily > 50000 ? 'badge-success' : 'badge-warning'} mt-1">${daily > 50000 ? 'Healthy Pace' : 'Cautious Pace'}</span>
          <p class="text-secondary text-xs mt-2">${days} days left until end of month (31 Oct)</p>
        </div>

        <div class="section-title mt-4">
          <h4>Dynamic Prorated Calculation</h4>
        </div>
        <div class="card meta-card">
          <div class="meta-row"><span>Available Personal Funds</span><strong>${formatMoney(pBal)}</strong></div>
          <div class="meta-row"><span>Upcoming Unpaid Bills</span><strong class="text-danger">− ${formatMoney(upcomingBills)}</strong></div>
          <div class="meta-row"><span>Committed Savings Goals</span><strong class="text-danger">− ${formatMoney(goalsCommitment)}</strong></div>
          <div class="meta-row"><span>Safety Cushion Buffer</span><strong class="text-danger">− ${formatMoney(buffer)}</strong></div>
          <div class="meta-row border-top">
            <strong>Uncommitted Free Money</strong>
            <strong class="text-teal">${formatMoney(surplus)}</strong>
          </div>
          <div class="meta-row">
            <span>Divided by ${days} remaining days:</span>
            <strong class="text-teal">${formatMoney(daily)} / day</strong>
          </div>
        </div>

        <button class="btn btn-outline mt-4" onclick="Router.openOverlay('C13')">Adjust Safety Buffer</button>
      </div>
    </div>
  `;
};

// S44: Notification Center
Screens.renderS44 = function() {
  return `
    <div class="screen feed-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Notifications</h3>
        <button class="btn-text" onclick="UI.clearNotifs()">Clear</button>
      </div>
      <div class="notif-list mt-2">
        <div class="card notif-card">
          <div class="notif-icon actor-dimas"><span class="material-symbols-rounded">share</span></div>
          <div class="notif-body">
            <strong>Dimas shared Alfamart (Rp 64.000)</strong>
            <p class="text-xs text-secondary">Collab pool • 2 hours ago</p>
          </div>
        </div>
        <div class="card notif-card">
          <div class="notif-icon icon-warning"><span class="material-symbols-rounded">receipt_long</span></div>
          <div class="notif-body">
            <strong>PLN Electricity bill due soon</strong>
            <p class="text-xs text-secondary">Rp 450.000 due 27 Oct • 5 hours ago</p>
          </div>
        </div>
        <div class="card notif-card">
          <div class="notif-icon icon-danger"><span class="material-symbols-rounded">warning</span></div>
          <div class="notif-body">
            <strong>Shopping budget at 116%</strong>
            <p class="text-xs text-secondary">Over budget by Rp 80.000 • Yesterday</p>
          </div>
        </div>
        <div class="card notif-card">
          <div class="notif-icon icon-teal"><span class="material-symbols-rounded">check_circle</span></div>
          <div class="notif-body">
            <strong>Goal Milestone reached!</strong>
            <p class="text-xs text-secondary">Anniversary trip is 60% funded • 3 days ago</p>
          </div>
        </div>
      </div>
    </div>
  `;
};