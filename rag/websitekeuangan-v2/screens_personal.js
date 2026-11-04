// Screens: S12 to S25 (Personal Space)
window.Screens = window.Screens || {};

// S12: Personal Dashboard
Screens.renderS12 = function() {
  const pBalance = DuoState.getPersonalBalance();
  const settleUp = DuoState.getSettleUpTotal();
  const txList = DuoState.data.transactions.slice(0, 5);

  return `
    <div class="screen dashboard">
      <div class="dashboard-header">
        <div class="header-user">
          ${window.renderUserAvatar ? window.renderUserAvatar() : '<div class="avatar" style="background:#6366F1;">R</div>'}
          <div>
            <span class="greeting">${window.t ? window.t('greeting') : 'Halo'}, ${window.getUserName ? window.getUserName() : 'Rina'}</span>
            <div class="space-badge personal">${window.t ? window.t('personalSpace') : 'Personal Space'}</div>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-btn" title="${window.t ? window.t('notifications') : 'Notifications'}" onclick="Router.navigate('S44')">
            <span class="material-symbols-rounded">notifications</span>
          </button>
          <button class="icon-btn" title="${window.t ? window.t('settings') : 'Settings'}" onclick="Router.navigate('S40')">
            <span class="material-symbols-rounded">settings</span>
          </button>
        </div>
      </div>

      <div class="collab-switcher" onclick="Router.navigate('S26')">
        <div class="switcher-info">
          <div class="switcher-avatars">
            ${window.renderUserAvatar ? window.renderUserAvatar('mini-avatar') : '<span class="mini-avatar" style="background:#6366F1;">R</span>'}
            <span class="mini-avatar" style="background:#F97316;">D</span>
          </div>
          <div>
            <strong class="switcher-title">${window.t ? window.t('switchToCollab') : 'Switch to Collab Space'}</strong>
            <p class="switcher-sub">${window.t ? window.t('sharedPoolDesc') : 'Rina & Dimas • Shared Pool'}</p>
          </div>
        </div>
        <span class="material-symbols-rounded arrow">chevron_right</span>
      </div>

      <div class="card balance-card personal-accent">
        <div class="balance-meta">
          <span>${window.t ? window.t('personalBalance') : 'Personal Balance'}</span>
          <button class="eye-btn" onclick="UI.toggleMask()">
            <span class="material-symbols-rounded">${DuoState.maskAmounts ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>
        <h1 class="balance-val">${DuoState.maskAmounts ? 'Rp ••••••••' : formatMoney(pBalance)}</h1>
        <div class="safe-spend-pill" onclick="Router.navigate('S43')">
          <span class="material-symbols-rounded text-teal">verified</span>
          <span>${window.t ? window.t('safeToSpend') : 'Safe to spend'}: <strong>${DuoState.maskAmounts ? '••••' : formatMoney(DuoState.getSafeToSpendDaily())}</strong>${window.t ? window.t('perDay') : '/day'}</span>
          <span class="material-symbols-rounded icon-chevron">chevron_right</span>
        </div>
      </div>

      ${settleUp > 0 ? `
        <div class="settle-banner" onclick="Router.navigate('S30')">
          <div class="settle-text">
            <span class="material-symbols-rounded settle-icon">swap_horiz</span>
            <div>
              <strong>${window.t ? window.t('dimasOwesYou') : 'Dimas owes you'} ${formatMoney(settleUp)}</strong>
              <p class="text-xs text-secondary">${window.t ? window.t('fromSharedExpenses') : 'From 4 shared expenses'}</p>
            </div>
          </div>
          <button class="btn-xs" onclick="event.stopPropagation(); Router.navigate('S30')">${window.t ? window.t('settleUp') : 'Settle Up'}</button>
        </div>
      ` : ''}

      <div class="action-grid">
        <button class="action-item" onclick="Router.navigate('S15')">
          <div class="action-icon"><span class="material-symbols-rounded">add</span></div>
          <span>${window.t ? window.t('add') : 'Add'}</span>
        </button>
        <button class="action-item" onclick="Router.openOverlay('C04')">
          <div class="action-icon"><span class="material-symbols-rounded">document_scanner</span></div>
          <span>${window.t ? window.t('scan') : 'Scan'}</span>
        </button>
        <button class="action-item" onclick="Router.navigate('S34')">
          <div class="action-icon"><span class="material-symbols-rounded">account_balance_wallet</span></div>
          <span>${window.t ? window.t('wallets') : 'Wallets'}</span>
        </button>
        <button class="action-item" onclick="Router.navigate('S19')">
          <div class="action-icon"><span class="material-symbols-rounded">pie_chart</span></div>
          <span>${window.t ? window.t('budgets') : 'Budgets'}</span>
        </button>
      </div>

      <div class="section-title">
        <h4>${window.t ? window.t('recentTx') : 'Recent Transactions'}</h4>
        <button class="btn-text" onclick="Router.navigate('S13')">${window.t ? window.t('viewAll') : 'View All'}</button>
      </div>
      <div class="tx-list">
        ${txList.map(tx => `
          <div class="tx-card" onclick="Router.navigate('S17', { txId: '${tx.id}' })">
            <div class="tx-icon">
              <span class="material-symbols-rounded">${
                tx.category === 'Groceries' ? 'local_grocery_store' :
                tx.category === 'Transport' ? 'directions_car' :
                tx.category === 'Shopping' ? 'shopping_bag' : 'restaurant'
              }</span>
            </div>
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

      <div class="card health-banner mt-3" onclick="Router.navigate('S38')">
        <div class="health-gauge">
          <span class="health-score">${DuoState.data.healthScore.total}</span>
          <span class="health-label">Score</span>
        </div>
        <div class="health-info">
          <strong>Financial Health: ${DuoState.data.healthScore.grade}</strong>
          <p class="text-xs text-secondary">${DuoState.data.healthScore.trend} • Tap for 5-factor analysis</p>
        </div>
        <span class="material-symbols-rounded arrow">chevron_right</span>
      </div>

      ${(DuoState.data.suggestedToShare && DuoState.data.suggestedToShare.length > 0) ? `
      <div class="card suggestion-card mt-3" onclick="Router.openOverlay('C05')">
        <div class="suggestion-header">
          <span class="material-symbols-rounded text-teal">tips_and_updates</span>
          <strong>${DuoState.data.suggestedToShare.length} Unshared Expenses Found</strong>
        </div>
        <p class="text-xs text-secondary mt-1">Looks like ${DuoState.data.suggestedToShare.slice(0, 2).map(s => s.merchant).join(', ')} might be shared with Dimas?</p>
        <button class="btn-xs mt-2" onclick="event.stopPropagation(); Router.openOverlay('C05')">Review Suggestions</button>
      </div>` : ''}
    </div>
  `;
};

// S13: Personal Transactions Feed
Screens.renderS13 = function() {
  const transactions = DuoState.data.transactions;
  return `
    <div class="screen feed-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Personal Transactions</h3>
        <button class="icon-btn" onclick="Router.navigate('S14')"><span class="material-symbols-rounded">filter_list</span></button>
      </div>
      <div class="search-bar">
        <span class="material-symbols-rounded">search</span>
        <input type="text" placeholder="Search merchant, notes, amount..." oninput="UI.filterFeed(this.value)" />
      </div>
      <div class="chips-row">
        <button class="chip active" onclick="UI.filterChip(this, 'all')">All</button>
        <button class="chip" onclick="UI.filterChip(this, 'shared')">Shared</button>
        <button class="chip" onclick="UI.filterChip(this, 'private')">Private</button>
        <button class="chip" onclick="UI.filterChip(this, 'Groceries')">Groceries</button>
        <button class="chip" onclick="UI.filterChip(this, 'Food & Drinks')">Food</button>
      </div>
      <div class="tx-list mt-2" id="feed-tx-list">
        ${transactions.map(tx => `
          <div class="tx-card" onclick="Router.navigate('S17', { txId: '${tx.id}' })">
            <div class="tx-icon">
              <span class="material-symbols-rounded">${
                tx.category === 'Groceries' ? 'local_grocery_store' :
                tx.category === 'Transport' ? 'directions_car' :
                tx.category === 'Shopping' ? 'shopping_bag' : 'restaurant'
              }</span>
            </div>
            <div class="tx-details">
              <strong>${tx.merchant}</strong>
              <span class="tx-sub">${tx.date} • ${tx.category} • ${tx.shared ? '<span class="tag-shared">Shared</span>' : '<span class="tag-private">Private</span>'}</span>
            </div>
            <div class="tx-amount ${tx.amount < 0 ? 'text-expense' : 'text-income'}">
              ${formatMoney(tx.amount, true)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// S14: Filter Transactions
Screens.renderS14 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">close</span></button>
        <h3>Filter Transactions</h3>
        <button class="btn-text" onclick="Router.navigate('S13')">Reset</button>
      </div>
      <div class="form-body">
        <label class="form-group">
          <span>Category</span>
          <select id="filter-category">
            <option value="all">All Categories</option>
            <option value="Groceries">Groceries</option>
            <option value="Food & Drinks">Food & Drinks</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
          </select>
        </label>
        <label class="form-group">
          <span>Sharing Status</span>
          <select id="filter-shared">
            <option value="all">All Statuses</option>
            <option value="shared">Shared with Dimas</option>
            <option value="private">Private (Not Shared)</option>
          </select>
        </label>
        <label class="form-group">
          <span>Wallet</span>
          <select id="filter-wallet">
            <option value="all">All Wallets</option>
            <option value="w_bca">Rina BCA</option>
            <option value="w_gopay">Rina GoPay</option>
            <option value="w_cash">Rina Cash</option>
          </select>
        </label>
        <label class="form-group">
          <span>Date Range</span>
          <select id="filter-date">
            <option value="month">This Month (October 2026)</option>
            <option value="last-month">Last Month (September 2026)</option>
            <option value="all">All Time</option>
          </select>
        </label>
        <button class="btn btn-primary mt-6" onclick="Router.navigate('S13')">Apply Filters</button>
      </div>
    </div>
  `;
};

// S15: Add Transaction (Manual + Share Toggle)
Screens.renderS15 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">close</span></button>
        <h3>Add Transaction</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <div class="amount-input-box">
          <span class="curr-label">Rp</span>
          <input type="text" id="manual-tx-amount" value="87.500" placeholder="0" />
        </div>

        <label class="form-group">
          <span>Merchant / Note</span>
          <input type="text" id="manual-tx-merchant" placeholder="e.g. Indomaret" value="Indomaret" />
        </label>

        <label class="form-group">
          <span>Category</span>
          <select id="manual-tx-category">
            <option>Groceries</option>
            <option>Food & Drinks</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Bills & Utilities</option>
          </select>
        </label>

        <label class="form-group">
          <span>Paid From Wallet</span>
          <select id="manual-tx-wallet">
            <option value="w_bca">Rina BCA (Rp 4.100.000)</option>
            <option value="w_gopay">Rina GoPay (Rp 650.000)</option>
            <option value="w_cash">Rina Cash (Rp 250.000)</option>
          </select>
        </label>

        <div class="share-toggle-card mt-3">
          <div class="share-toggle-info">
            <span class="material-symbols-rounded icon-teal">share</span>
            <div>
              <strong>Share with Dimas?</strong>
              <p class="text-xs text-secondary">Copies transaction to Collab Space</p>
            </div>
          </div>
          <input type="checkbox" id="share-toggle" checked onchange="UI.toggleSplitSection(this.checked)" />
        </div>

        <div id="split-options" class="card mt-2">
          <label class="form-group">
            <span>Split Method</span>
            <select id="split-ratio">
              <option value="50_50">50/50 (Dimas owes 50%)</option>
              <option value="60_40">60/40 (Dimas owes 40%)</option>
              <option value="100_0">100% Dimas (Dimas owes 100%)</option>
              <option value="custom">Custom amount...</option>
            </select>
          </label>
        </div>

        <button class="btn btn-primary mt-6" onclick="UI.saveManualTransaction()">Save Transaction</button>
      </div>
    </div>
  `;
};

// S16: Add Income
Screens.renderS16 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">close</span></button>
        <h3>Add Income</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <div class="amount-input-box">
          <span class="curr-label">Rp</span>
          <input type="text" id="income-amount" value="7.500.000" />
        </div>
        <label class="form-group">
          <span>Source / Title</span>
          <input type="text" id="income-source" value="Monthly Salary" />
        </label>
        <label class="form-group">
          <span>Deposit To Wallet</span>
          <select id="income-wallet">
            <option value="w_bca">Rina BCA</option>
            <option value="w_gopay">Rina GoPay</option>
          </select>
        </label>
        <button class="btn btn-primary mt-6" onclick="UI.saveIncome()">Save Income</button>
      </div>
    </div>
  `;
};

// S17: Transaction Detail
Screens.renderS17 = function(params = {}) {
  const tx = DuoState.data.transactions.find(t => t.id === params.txId) || DuoState.data.transactions[0];
  const wallet = DuoState.data.wallets.find(w => w.id === tx.walletId) || { name: 'Rina BCA' };

  return `
    <div class="screen detail-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Transaction Detail</h3>
        <button class="icon-btn" onclick="Router.openDialog('D01', { txId: '${tx.id}' })">
          <span class="material-symbols-rounded">delete</span>
        </button>
      </div>
      <div class="detail-body">
        <div class="detail-hero">
          <span class="detail-amount ${tx.amount < 0 ? 'text-expense' : 'text-income'}">${formatMoney(tx.amount)}</span>
          <h4>${tx.merchant}</h4>
          <span class="badge ${tx.shared ? 'badge-collab' : 'badge-personal'}">
            ${tx.shared ? 'Shared with Dimas' : 'Private to Rina'}
          </span>
        </div>

        <div class="card meta-card">
          <div class="meta-row"><span>Date</span><strong>${tx.date}</strong></div>
          <div class="meta-row"><span>Category</span><strong>${tx.category}</strong></div>
          <div class="meta-row"><span>Paid From</span><strong>${wallet.name}</strong></div>
          ${tx.notes ? `<div class="meta-row"><span>Notes</span><strong>${tx.notes}</strong></div>` : ''}
          ${tx.shared ? `
            <div class="meta-row"><span>Split Mode</span><strong>${tx.split || '50/50'}</strong></div>
            <div class="meta-row"><span>Dimas owes</span><strong class="text-teal">${formatMoney(tx.dimasOwes || Math.abs(tx.amount)/2)}</strong></div>
            <div class="meta-row"><span>Status</span><span class="badge ${tx.isSettled ? 'badge-neutral' : 'badge-warning'}">${tx.isSettled ? 'Settled' : 'Pending Settle Up'}</span></div>
          ` : ''}
        </div>

        ${tx.items && tx.items.length ? `
          <div class="section-title mt-4">
            <h4>Itemized Receipt (${tx.items.length} items)</h4>
          </div>
          <div class="card">
            ${tx.items.map(it => `
              <div class="item-row">
                <div>
                  <strong>${it.name}</strong>
                  <span class="text-xs text-secondary">Qty: ${it.qty}</span>
                </div>
                <span>${formatMoney(it.price)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="detail-actions mt-4">
          ${!tx.shared ? `
            <button class="btn btn-primary" onclick="Router.openOverlay('C01', { txId: '${tx.id}' })">
              <span class="material-symbols-rounded">share</span> Share with Dimas
            </button>
          ` : `
            <button class="btn btn-outline" onclick="Router.openOverlay('C01', { txId: '${tx.id}' })">
              <span class="material-symbols-rounded">tune</span> Adjust Split Ratio
            </button>
          `}
          <button class="btn btn-secondary mt-2" onclick="Router.navigate('S18', { txId: '${tx.id}' })">
            Edit Details
          </button>
        </div>
      </div>
    </div>
  `;
};

// S18: Edit Transaction
Screens.renderS18 = function(params = {}) {
  const tx = DuoState.data.transactions.find(t => t.id === params.txId) || DuoState.data.transactions[0];
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">close</span></button>
        <h3>Edit Transaction</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <label class="form-group">
          <span>Merchant</span>
          <input type="text" id="edit-merchant" value="${tx.merchant}" />
        </label>
        <label class="form-group">
          <span>Amount (Rp)</span>
          <input type="text" id="edit-amount" value="${Math.abs(tx.amount).toLocaleString('id-ID')}" />
        </label>
        <label class="form-group">
          <span>Category</span>
          <select id="edit-category">
            <option ${tx.category === 'Groceries' ? 'selected' : ''}>Groceries</option>
            <option ${tx.category === 'Food & Drinks' ? 'selected' : ''}>Food & Drinks</option>
            <option ${tx.category === 'Transport' ? 'selected' : ''}>Transport</option>
            <option ${tx.category === 'Shopping' ? 'selected' : ''}>Shopping</option>
            <option ${tx.category === 'Bills & Utilities' ? 'selected' : ''}>Bills & Utilities</option>
          </select>
        </label>
        <label class="form-group">
          <span>Notes</span>
          <input type="text" id="edit-notes" value="${tx.notes || ''}" />
        </label>
        <button class="btn btn-primary mt-6" onclick="UI.updateTransaction('${tx.id}')">Save Changes</button>
      </div>
    </div>
  `;
};

// S19: Personal Budgets
Screens.renderS19 = function() {
  const budgets = DuoState.data.budgets.personal;
  return `
    <div class="screen feed-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Personal Budgets</h3>
        <button class="icon-btn" onclick="Router.navigate('S20')"><span class="material-symbols-rounded">add</span></button>
      </div>
      <div class="card budget-summary-card">
        <div class="summary-meta">
          <span>Total Budgeted</span>
          <strong>${formatMoney(budgets.reduce((s, b) => s + b.limit, 0))}</strong>
        </div>
        <div class="summary-meta mt-1">
          <span>Total Spent</span>
          <strong class="text-teal">${formatMoney(budgets.reduce((s, b) => s + b.spent, 0))}</strong>
        </div>
      </div>
      <div class="budgets-list mt-3">
        ${budgets.map(b => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const isOver = pct > 100;
          return `
            <div class="card budget-card" onclick="Router.navigate('S21', { budgetId: '${b.id}' })">
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

// S20: New Budget
Screens.renderS20 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">close</span></button>
        <h3>Create New Budget</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <label class="form-group">
          <span>Category</span>
          <select id="new-budget-cat">
            <option>Food & Drinks</option>
            <option>Shopping</option>
            <option>Transport</option>
            <option>Entertainment</option>
            <option>Health</option>
          </select>
        </label>
        <label class="form-group">
          <span>Monthly Limit (Rp)</span>
          <input type="text" id="new-budget-limit" value="600.000" />
        </label>
        <label class="form-group">
          <span>Alert When Reaching</span>
          <select id="new-budget-alert">
            <option>80% of limit</option>
            <option>90% of limit</option>
            <option>100% of limit</option>
          </select>
        </label>
        <button class="btn btn-primary mt-6" onclick="UI.createBudget()">Create Budget</button>
      </div>
    </div>
  `;
};

// S21: Budget Detail
Screens.renderS21 = function(params = {}) {
  const b = DuoState.data.budgets.personal.find(item => item.id === params.budgetId) || DuoState.data.budgets.personal[0];
  const pct = Math.round((b.spent / b.limit) * 100);
  const remaining = b.limit - b.spent;

  return `
    <div class="screen detail-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>${b.category} Budget</h3>
        <button class="icon-btn" onclick="Router.openDialog('D02', { budgetId: '${b.id}' })">
          <span class="material-symbols-rounded">tune</span>
        </button>
      </div>
      <div class="detail-body">
        <div class="card text-center">
          <span class="text-xs text-secondary uppercase font-bold">Remaining Budget</span>
          <h2 class="${remaining < 0 ? 'text-danger' : 'text-teal'} mt-1">
            ${remaining < 0 ? 'Over budget by ' + formatMoney(Math.abs(remaining)) : formatMoney(remaining) + ' left'}
          </h2>
          <p class="text-secondary text-sm mt-1">Spent ${formatMoney(b.spent)} of ${formatMoney(b.limit)} (${pct}%)</p>
          <div class="progress-bar-bg mt-3">
            <div class="progress-bar-fill ${pct > 100 ? 'danger' : ''}" style="width: ${Math.min(pct, 100)}%;"></div>
          </div>
        </div>

        <div class="section-title mt-4">
          <h4>Transactions in this category</h4>
        </div>
        <div class="tx-list">
          ${DuoState.data.transactions.filter(t => t.category === b.category).map(tx => `
            <div class="tx-card">
              <div class="tx-icon"><span class="material-symbols-rounded">${b.icon}</span></div>
              <div class="tx-details">
                <strong>${tx.merchant}</strong>
                <span class="tx-sub">${tx.date}</span>
              </div>
              <div class="tx-amount text-expense">${formatMoney(tx.amount, true)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// S22: Personal Goals
Screens.renderS22 = function() {
  const goals = DuoState.data.goals.personal;
  return `
    <div class="screen feed-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Personal Goals</h3>
        <button class="icon-btn" onclick="Router.navigate('S23')"><span class="material-symbols-rounded">add</span></button>
      </div>
      <div class="goals-list mt-2">
        ${goals.map(g => {
          const pct = Math.round((g.saved / g.target) * 100);
          return `
            <div class="card goal-card" onclick="Router.navigate('S24', { goalId: '${g.id}' })">
              <div class="goal-head">
                <div class="goal-title-area">
                  <span class="material-symbols-rounded goal-icon">${g.icon}</span>
                  <div>
                    <strong>${g.name}</strong>
                    <p class="text-xs text-secondary">Target: ${g.dueDate}</p>
                  </div>
                </div>
                <span class="badge ${g.status === 'At risk' ? 'badge-danger' : 'badge-success'}">${g.status}</span>
              </div>
              <div class="progress-bar-bg mt-3">
                <div class="progress-bar-fill" style="width: ${pct}%;"></div>
              </div>
              <div class="goal-amounts mt-2">
                <strong>${formatMoney(g.saved)}</strong>
                <span class="text-secondary text-xs">of ${formatMoney(g.target)} (${pct}%)</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
};

// S23: New Goal
Screens.renderS23 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">close</span></button>
        <h3>New Savings Goal</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <label class="form-group">
          <span>Goal Title</span>
          <input type="text" id="new-goal-name" placeholder="e.g. New Laptop" value="New Laptop" />
        </label>
        <label class="form-group">
          <span>Target Amount (Rp)</span>
          <input type="text" id="new-goal-target" value="12.000.000" />
        </label>
        <label class="form-group">
          <span>Target Date</span>
          <input type="date" id="new-goal-date" value="2027-02-28" />
        </label>
        <button class="btn btn-primary mt-6" onclick="UI.createGoal()">Save Goal</button>
      </div>
    </div>
  `;
};

// S24: Goal Detail
Screens.renderS24 = function(params = {}) {
  const g = DuoState.data.goals.personal.find(item => item.id === params.goalId) || DuoState.data.goals.personal[0];
  const pct = Math.round((g.saved / g.target) * 100);

  return `
    <div class="screen detail-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>${g.name}</h3>
        <button class="icon-btn" onclick="Router.openDialog('D03', { goalId: '${g.id}' })">
          <span class="material-symbols-rounded">more_vert</span>
        </button>
      </div>
      <div class="detail-body">
        <div class="card text-center">
          <span class="badge ${g.status === 'At risk' ? 'badge-danger' : 'badge-success'}">${g.status}</span>
          <h2 class="mt-2">${formatMoney(g.saved)}</h2>
          <p class="text-secondary text-sm">Target ${formatMoney(g.target)} • ${g.dueDate} (${g.daysLeft || 30} days left)</p>
          <div class="progress-bar-bg mt-3">
            <div class="progress-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>

        ${g.status === 'At risk' ? `
          <div class="card alert-card mt-3">
            <div class="alert-head">
              <span class="material-symbols-rounded text-danger">warning</span>
              <strong>Why is this goal at risk?</strong>
            </div>
            <p class="text-sm mt-1 text-secondary">${g.whyAtRisk}</p>
            <div class="alert-action mt-2">
              <span class="badge badge-teal">AI Suggestion</span>
              <p class="text-xs mt-1"><strong>${g.suggestion}</strong></p>
            </div>
          </div>
        ` : ''}

        <div class="card meta-card mt-3">
          <div class="meta-row"><span>Monthly needed</span><strong>${formatMoney(g.monthlyNeeded || 290000)}</strong></div>
          <div class="meta-row"><span>Weekly pace</span><strong>${formatMoney(g.weeklyNeeded || 66000)}</strong></div>
          <div class="meta-row"><span>Daily pace</span><strong>${formatMoney(g.dailyNeeded || 9500)}</strong></div>
        </div>

        <button class="btn btn-primary mt-4" onclick="Router.openOverlay('C03', { goalId: '${g.id}' })">
          Contribute Funds
        </button>
      </div>
    </div>
  `;
};

// S25: Upcoming Bills
Screens.renderS25 = function() {
  const bills = DuoState.data.bills.personal;
  return `
    <div class="screen feed-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Upcoming Bills</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="bills-list mt-2">
        ${bills.map(b => `
          <div class="card bill-card" onclick="Router.openDialog('D06', { billId: '${b.id}' })">
            <div class="bill-info">
              <strong>${b.name}</strong>
              <p class="text-xs text-secondary">Due ${b.dueDate} • ${b.category}</p>
            </div>
            <div class="bill-right">
              <span class="bill-amount">${formatMoney(b.amount)}</span>
              <span class="badge ${b.status === 'Due soon' ? 'badge-warning' : 'badge-neutral'}">${b.status}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};