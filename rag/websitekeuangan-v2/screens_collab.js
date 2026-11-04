// Screens: S26 to S33 (Collab Space)
window.Screens = window.Screens || {};

// S26: Collab Dashboard
Screens.renderS26 = function() {
  const cBalance = DuoState.getCollabBalance();
  const settleUp = DuoState.getSettleUpTotal();
  const activities = DuoState.data.collabActivity;

  return `
    <div class="screen dashboard">
      <div class="dashboard-header">
        <div class="header-user">
          <div class="avatar-duo">
            ${window.renderUserAvatar ? window.renderUserAvatar('mini-avatar') : '<span class="mini-avatar" style="background:#6366F1;">R</span>'}
            <span class="mini-avatar overlap" style="background:#F97316;">D</span>
          </div>
          <div>
            <span class="greeting">${window.getUserName ? window.getUserName() : 'Rina'} & Dimas</span>
            <div class="space-badge collab">${window.t ? window.t('collabSpace') : 'Collab Space'}</div>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-btn" title="Audit Log" onclick="Router.navigate('S33')">
            <span class="material-symbols-rounded">history</span>
          </button>
          <button class="icon-btn" title="Collab Settings" onclick="Router.navigate('S39')">
            <span class="material-symbols-rounded">tune</span>
          </button>
        </div>
      </div>

      <div class="collab-switcher collab-theme" onclick="Router.navigate('S12')">
        <div class="switcher-info">
          ${window.renderUserAvatar ? window.renderUserAvatar('', 'width:32px; height:32px; font-size:14px;') : '<div class="avatar" style="background:#6366F1; width:32px; height:32px; font-size:14px;">R</div>'}
          <div>
            <strong class="switcher-title">${window.t ? window.t('switchToPersonal') : 'Switch to Personal Space'}</strong>
            <p class="switcher-sub">${window.t ? window.t('privateDesc') : '100% Private to ' + (window.getUserName ? window.getUserName() : 'Rina')}</p>
          </div>
        </div>
        <span class="material-symbols-rounded arrow">chevron_right</span>
      </div>

      <div class="card balance-card collab-accent">
        <div class="balance-meta">
          <span>${window.t ? window.t('jointPool') : 'Joint Shared Pool'}</span>
          <button class="eye-btn" onclick="UI.toggleMask()">
            <span class="material-symbols-rounded">${DuoState.maskAmounts ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>
        <h1 class="balance-val">${DuoState.maskAmounts ? 'Rp ••••••••' : formatMoney(cBalance)}</h1>
        <div class="privacy-lock-pill">
          <span class="material-symbols-rounded text-indigo">lock</span>
          <span>Personal accounts remain strictly hidden</span>
        </div>
      </div>

      ${settleUp > 0 ? `
        <div class="settle-banner" onclick="Router.navigate('S30')">
          <div class="settle-text">
            <span class="material-symbols-rounded settle-icon">balance</span>
            <div>
              <strong>${window.t ? window.t('dimasOwesYou') : 'Dimas owes you'} ${formatMoney(settleUp)}</strong>
              <p class="text-xs text-secondary">${window.t ? window.t('fromSharedExpenses') : 'Tap to review breakdown & settle'}</p>
            </div>
          </div>
          <button class="btn-xs" onclick="event.stopPropagation(); Router.navigate('S30')">${window.t ? window.t('settleUp') : 'Settle Up'}</button>
        </div>
      ` : `
        <div class="settle-banner settled-ok">
          <div class="settle-text">
            <span class="material-symbols-rounded text-teal">check_circle</span>
            <div>
              <strong>${window.t ? window.t('allSettled') : 'All Settled Up!'}</strong>
              <p class="text-xs text-secondary">${window.t ? window.t('noPendingDebts') : 'No pending balances between you and Dimas'}</p>
            </div>
          </div>
        </div>
      `}

      <div class="action-grid">
        <button class="action-item" onclick="Router.navigate('S28')">
          <div class="action-icon action-collab"><span class="material-symbols-rounded">add</span></div>
          <span>${window.t ? window.t('expense') : 'Expense'}</span>
        </button>
        <button class="action-item" onclick="Router.navigate('S29')">
          <div class="action-icon action-collab"><span class="material-symbols-rounded">savings</span></div>
          <span>${window.t ? window.t('deposit') : 'Deposit'}</span>
        </button>
        <button class="action-item" onclick="Router.navigate('S31')">
          <div class="action-icon action-collab"><span class="material-symbols-rounded">pie_chart</span></div>
          <span>${window.t ? window.t('budgets') : 'Budgets'}</span>
        </button>
        <button class="action-item" onclick="Router.navigate('S32')">
          <div class="action-icon action-collab"><span class="material-symbols-rounded">flag</span></div>
          <span>Goals</span>
        </button>
      </div>

      <div class="section-title">
        <h4>Shared Activity</h4>
        <button class="btn-text" onclick="Router.navigate('S27')">View All</button>
      </div>
      <div class="tx-list">
        ${activities.slice(0, 4).map(act => `
          <div class="tx-card" onclick="Router.navigate('S27')">
            <div class="tx-icon">
              <span class="actor-tag ${act.actor === 'Rina' ? 'actor-rina' : 'actor-dimas'}">${act.actor[0]}</span>
            </div>
            <div class="tx-details">
              <strong>${act.merchant}</strong>
              <span class="tx-sub">${act.actor} paid • ${act.wallet} • ${act.date}</span>
              <span class="text-xs text-secondary">${act.owesText}</span>
            </div>
            <div class="tx-amount text-expense">
              ${DuoState.maskAmounts ? '••••' : formatMoney(act.amount, true)}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="section-title mt-4">
        <h4>Shared Goal Highlight</h4>
        <button class="btn-text" onclick="Router.navigate('S32')">All Goals</button>
      </div>
      <div class="card goal-card" onclick="Router.navigate('S32')">
        <div class="goal-head">
          <div class="goal-title-area">
            <span class="material-symbols-rounded goal-icon">flight_takeoff</span>
            <div>
              <strong>Anniversary Trip</strong>
              <p class="text-xs text-secondary">Target: 15 Dec 2026 (52 days left)</p>
            </div>
          </div>
          <span class="badge badge-success">On track</span>
        </div>
        <div class="progress-bar-bg mt-3">
          <div class="progress-bar-fill" style="width: 60%;"></div>
        </div>
        <div class="goal-amounts mt-2">
          <strong>Rp 2.400.000</strong>
          <span class="text-secondary text-xs">of Rp 4.000.000 (60%)</span>
        </div>
        <div class="contributors-split mt-2">
          <span class="text-xs"><span class="dot-indicator rina"></span> Rina: Rp 1.100.000</span>
          <span class="text-xs"><span class="dot-indicator dimas"></span> Dimas: Rp 1.300.000</span>
        </div>
      </div>
    </div>
  `;
};

// S27: Collab Transactions Feed
Screens.renderS27 = function() {
  const activities = DuoState.data.collabActivity;
  return `
    <div class="screen feed-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Shared Feed</h3>
        <button class="icon-btn" onclick="Router.openOverlay('C07')"><span class="material-symbols-rounded">filter_list</span></button>
      </div>
      <div class="search-bar">
        <span class="material-symbols-rounded">search</span>
        <input type="text" placeholder="Search shared expenses..." oninput="UI.filterCollabFeed(this.value)" />
      </div>
      <div class="chips-row">
        <button class="chip active" onclick="UI.filterCollabChip(this, 'all')">All</button>
        <button class="chip" onclick="UI.filterCollabChip(this, 'Rina')">Rina paid</button>
        <button class="chip" onclick="UI.filterCollabChip(this, 'Dimas')">Dimas paid</button>
        <button class="chip" onclick="UI.filterCollabChip(this, 'Groceries')">Groceries</button>
      </div>
      <div class="tx-list mt-2" id="collab-feed-list">
        ${activities.map(act => `
          <div class="tx-card" onclick="Router.openOverlay('C23', { actId: '${act.id}' })">
            <div class="tx-icon">
              <span class="actor-tag ${act.actor === 'Rina' ? 'actor-rina' : 'actor-dimas'}">${act.actor[0]}</span>
            </div>
            <div class="tx-details">
              <strong>${act.merchant}</strong>
              <span class="tx-sub">${act.actor} • ${act.category} • ${act.wallet}</span>
              <span class="text-xs ${act.owesText.includes('owes') ? 'text-teal font-semibold' : 'text-secondary'}">${act.owesText}</span>
            </div>
            <div class="tx-amount text-expense">${formatMoney(act.amount, true)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// S28: Collab Add Shared Expense
Screens.renderS28 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">close</span></button>
        <h3>Add Shared Expense</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <div class="amount-input-box">
          <span class="curr-label">Rp</span>
          <input type="text" id="collab-tx-amount" value="120.000" />
        </div>
        <label class="form-group">
          <span>Description / Merchant</span>
          <input type="text" id="collab-tx-desc" placeholder="e.g. Super Indo" value="Super Indo" />
        </label>
        <label class="form-group">
          <span>Category</span>
          <select id="collab-tx-category">
            <option>Groceries</option>
            <option>Food & Drinks</option>
            <option>Bills & Utilities</option>
            <option>Shopping</option>
            <option>Household</option>
          </select>
        </label>
        <label class="form-group">
          <span>Who Paid?</span>
          <select id="collab-tx-payer">
            <option value="Rina">Rina (I paid)</option>
            <option value="Dimas">Dimas paid</option>
          </select>
        </label>
        <label class="form-group">
          <span>Funding Source</span>
          <select id="collab-tx-wallet">
            <option value="w_joint_bca">Joint BCA (Rp 8.450.000)</option>
            <option value="w_household_cash">Household Cash (Rp 400.000)</option>
            <option value="personal_rina">Rina's Personal Account (Split needed)</option>
          </select>
        </label>
        <label class="form-group">
          <span>Split Method</span>
          <select id="collab-tx-split">
            <option value="50_50">50/50 Equal Split</option>
            <option value="60_40">60/40 Split</option>
            <option value="100_0">100% Partner Owes</option>
            <option value="from_pool">Direct from Joint Pool</option>
          </select>
        </label>
        <button class="btn btn-primary mt-6" onclick="UI.saveCollabExpense()">Save to Collab Space</button>
      </div>
    </div>
  `;
};

// S29: Collab Add Shared Income / Deposit
Screens.renderS29 = function() {
  const isId = DuoState.lang === 'id';
  const pWallets = (DuoState.data.wallets || []).filter(w => w.scope === 'personal');
  const cWallets = (DuoState.data.wallets || []).filter(w => w.scope === 'collab');

  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">close</span></button>
        <h3>${window.t ? window.t('contributeToPool') : 'Setor Dana Kas Bersama'}</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <div class="amount-input-box">
          <span class="curr-label">Rp</span>
          <input type="text" id="deposit-amount" value="1.000.000" />
        </div>
        <label class="form-group">
          <span>${window.t ? window.t('contributor') : 'Penyetor'}</span>
          <select id="deposit-actor" onchange="UI.handleDepositActorChange(this.value)">
            <option value="Rina">Rina</option>
            <option value="Dimas">Dimas</option>
          </select>
        </label>
        <div id="rina-deposit-source-group" class="form-group">
          <span>${window.t ? window.t('fromRinaPersonalWallet') : 'Dari Dompet Pribadi Rina'}</span>
          <select id="deposit-source-wallet">
            ${pWallets.map(w => `
              <option value="${w.id}">${w.name} (${formatMoney(w.balance)})</option>
            `).join('')}
          </select>
        </div>
        <label class="form-group">
          <span>${window.t ? window.t('destJointWallet') : 'Dompet Kas Bersama Tujuan'}</span>
          <select id="deposit-dest-wallet">
            ${cWallets.map(w => `
              <option value="${w.id}">${w.name} (${formatMoney(w.balance)})</option>
            `).join('')}
          </select>
        </label>
        <label class="form-group">
          <span>${window.t ? window.t('note') : 'Catatan'}</span>
          <input type="text" id="deposit-note" value="${window.t ? window.t('monthlyJointDeposit') : 'Setoran Bulanan Kas Bersama'}" />
        </label>
        <button class="btn btn-primary mt-6" onclick="UI.saveCollabDeposit()">
          ${window.t ? window.t('depositFunds') : 'Konfirmasi Setoran'}
        </button>
      </div>
    </div>
  `;
};

// S30: Settle Up Flow & Summary
Screens.renderS30 = function() {
  const total = DuoState.getSettleUpTotal();
  const sharedPending = DuoState.data.transactions.filter(t => t.shared && !t.isSettled);

  return `
    <div class="screen detail-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Settle Up</h3>
        <button class="icon-btn" onclick="Router.openDialog('D20')"><span class="material-symbols-rounded">send</span></button>
      </div>
      <div class="detail-body">
        <div class="card text-center hero-settle">
          <span class="text-xs text-secondary uppercase font-bold">Dimas owes you</span>
          <h1 class="text-teal mt-1">${formatMoney(total)}</h1>
          <p class="text-secondary text-sm mt-1">From ${sharedPending.length} shared transactions</p>
        </div>

        <div class="section-title mt-4">
          <h4>Breakdown of Expenses</h4>
        </div>
        <div class="tx-list">
          ${sharedPending.map(tx => `
            <div class="tx-card">
              <div class="tx-icon"><span class="material-symbols-rounded">receipt</span></div>
              <div class="tx-details">
                <strong>${tx.merchant}</strong>
                <span class="tx-sub">${tx.date} • Total: ${formatMoney(tx.amount)}</span>
              </div>
              <div class="tx-right text-right">
                <strong class="text-teal">${formatMoney(tx.dimasOwes || Math.abs(tx.amount)/2)}</strong>
                <span class="text-xs text-secondary block">${tx.split || '50/50'}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="mt-6 flex-column gap-2">
          <button class="btn btn-primary" onclick="Router.openOverlay('C08')">
            <span class="material-symbols-rounded">payments</span> Record Settle Payment
          </button>
          <button class="btn btn-outline" onclick="Router.openDialog('D20')">
            <span class="material-symbols-rounded">chat</span> Send Reminder to Dimas
          </button>
        </div>
      </div>
    </div>
  `;
};

// S31: Collab Budgets
Screens.renderS31 = function() {
  const budgets = DuoState.data.budgets.collab;
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return `
    <div class="screen feed-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Collab Budgets</h3>
        <button class="icon-btn" onclick="Router.openOverlay('C20')"><span class="material-symbols-rounded">add</span></button>
      </div>
      <div class="card budget-summary-card collab-accent-soft">
        <div class="summary-meta">
          <span>Joint Budgeted</span>
          <strong>${formatMoney(totalLimit)}</strong>
        </div>
        <div class="summary-meta mt-1">
          <span>Joint Spent</span>
          <strong class="text-teal">${formatMoney(totalSpent)}</strong>
        </div>
      </div>
      <div class="budgets-list mt-3">
        ${budgets.map(b => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const isOver = pct > 100;
          return `
            <div class="card budget-card">
              <div class="budget-card-head">
                <div class="budget-icon-name">
                  <span class="material-symbols-rounded">${b.icon}</span>
                  <strong>${b.category}</strong>
                </div>
                <span class="budget-pct ${isOver ? 'text-danger' : ''}">${pct}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill ${isOver ? 'danger' : ''}" style="width: ${Math.min(pct, 100)}%;"></div>
              </div>
              <div class="budget-amounts">
                <span>${formatMoney(b.spent)}</span>
                <span class="text-secondary">Limit: ${formatMoney(b.limit)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
};

// S32: Collab Goals
Screens.renderS32 = function() {
  const goals = DuoState.data.goals.collab;
  return `
    <div class="screen feed-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Collab Goals</h3>
        <button class="icon-btn" onclick="Router.openOverlay('C03')"><span class="material-symbols-rounded">add</span></button>
      </div>
      <div class="goals-list mt-2">
        ${goals.map(g => {
          const pct = Math.round((g.saved / g.target) * 100);
          return `
            <div class="card goal-card">
              <div class="goal-head">
                <div class="goal-title-area">
                  <span class="material-symbols-rounded goal-icon">${g.icon}</span>
                  <div>
                    <strong>${g.name}</strong>
                    <p class="text-xs text-secondary">Target: ${g.dueDate}</p>
                  </div>
                </div>
                <span class="badge ${g.status === 'On track' ? 'badge-success' : 'badge-danger'}">${g.status}</span>
              </div>
              <div class="progress-bar-bg mt-3">
                <div class="progress-bar-fill" style="width: ${pct}%;"></div>
              </div>
              <div class="goal-amounts mt-2">
                <strong>${formatMoney(g.saved)}</strong>
                <span class="text-secondary text-xs">of ${formatMoney(g.target)} (${pct}%)</span>
              </div>
              ${g.contributions ? `
                <div class="contributors-split mt-2">
                  <span class="text-xs"><span class="dot-indicator rina"></span> Rina: ${formatMoney(g.contributions.rina)}</span>
                  <span class="text-xs"><span class="dot-indicator dimas"></span> Dimas: ${formatMoney(g.contributions.dimas)}</span>
                </div>
              ` : ''}
              <button class="btn btn-outline btn-sm mt-3" onclick="Router.openOverlay('C03', { goalId: '${g.id}' })">Contribute</button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
};

// S33: Collab Activity Log / Audit Trail
Screens.renderS33 = function() {
  const logs = DuoState.data.activityLogs;
  return `
    <div class="screen feed-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Collab Audit Trail</h3>
        <button class="icon-btn" onclick="Router.openDialog('D05')"><span class="material-symbols-rounded">delete_sweep</span></button>
      </div>
      <div class="timeline mt-3">
        ${logs.map(log => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-time">${log.time}</span>
              <p class="timeline-text">${log.text}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};