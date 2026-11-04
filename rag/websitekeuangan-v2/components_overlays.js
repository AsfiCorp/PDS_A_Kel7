// Overlays (C01 to C23) and Dialogs (D01 to D23)
window.Overlays = window.Overlays || {};
window.Dialogs = window.Dialogs || {};

// --- OVERLAYS (Bottom Sheets) ---

// C01: Share Transaction Sheet
Overlays.renderC01 = function(params = {}) {
  const tx = DuoState.data.transactions.find(t => t.id === params.txId) || DuoState.data.transactions[0];
  const absAmt = Math.abs(tx.amount);
  return `
    <div class="sheet-header">
      <h4>Share with Dimas</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <div class="meta-row"><span>Transaction</span><strong>${tx.merchant} (${formatMoney(absAmt)})</strong></div>
      <label class="form-group mt-3">
        <span>Select Split Mode</span>
        <select id="sheet-split-select" onchange="UI.updateSplitPreview(this.value, ${absAmt})">
          <option value="50_50">50/50 Equal (Dimas owes ${formatMoney(absAmt / 2)})</option>
          <option value="60_40">60/40 Split (Dimas owes ${formatMoney(absAmt * 0.4)})</option>
          <option value="100_0">100% Dimas (Dimas owes ${formatMoney(absAmt)})</option>
        </select>
      </label>
      <div class="card mt-3" id="split-preview-box">
        <div class="meta-row"><span>Your share:</span><strong>${formatMoney(absAmt / 2)}</strong></div>
        <div class="meta-row"><span>Dimas's share:</span><strong class="text-teal">${formatMoney(absAmt / 2)}</strong></div>
      </div>
      <button class="btn btn-primary mt-4" onclick="UI.confirmShare('${tx.id}')">Apply to Collab Space</button>
    </div>
  `;
};

// C02: Split By Item Sheet
Overlays.renderC02 = function(params = {}) {
  return `
    <div class="sheet-header">
      <h4>Split by Item</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <p class="text-xs text-secondary mb-3">Assign individual items to each person or share 50/50.</p>
      <div class="card">
        <div class="meta-row"><span>Ultra Milk 1L</span><select class="select-xs"><option>50/50</option><option>Rina</option><option>Dimas</option></select></div>
        <div class="meta-row"><span>Sari Roti</span><select class="select-xs"><option>Rina</option><option>50/50</option><option>Dimas</option></select></div>
        <div class="meta-row"><span>Telur 10s</span><select class="select-xs"><option>50/50</option><option>Dimas</option></select></div>
      </div>
      <button class="btn btn-primary mt-4" onclick="UI.applyItemSplit()">Save Item Split</button>
    </div>
  `;
};

// C03: Contribute to Goal Sheet
Overlays.renderC03 = function(params = {}) {
  const isId = DuoState.lang === 'id';
  const pWallets = DuoState.data.wallets.filter(w => w.scope === 'personal');
  const allGoals = [...(DuoState.data.goals.personal || []), ...(DuoState.data.goals.collab || [])];
  const goal = allGoals.find(g => g.id === params.goalId) || allGoals[0];

  return `
    <div class="sheet-header">
      <h4>${window.t ? window.t('contributeToGoal') : 'Setor ke Target Tabungan'}</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      ${goal ? `
        <div class="card meta-card mb-3 text-center">
          <span class="text-xs text-secondary">${window.t ? window.t('savingsTarget') : 'Target Tabungan'}</span>
          <strong class="block text-base mt-1">${goal.name}</strong>
          <span class="text-xs text-teal">${formatMoney(goal.saved)} / ${formatMoney(goal.target)}</span>
        </div>
      ` : ''}
      <div class="amount-input-box">
        <span class="curr-label">Rp</span>
        <input type="text" id="contrib-amount" value="250.000" />
      </div>
      <label class="form-group mt-3">
        <span>${window.t ? window.t('fromWallet') : 'Dari Dompet Sumber'}</span>
        <select id="contrib-wallet">
          ${pWallets.map(w => `
            <option value="${w.id}">${w.name} (${formatMoney(w.balance)})</option>
          `).join('')}
        </select>
      </label>
      <button class="btn btn-primary mt-4" onclick="UI.saveContribution('${params.goalId || (goal ? goal.id : 'g_headphones')}')">
        ${window.t ? window.t('confirmTransferToGoal') : 'Konfirmasi Setoran'}
      </button>
    </div>
  `;
};

// C04: Receipt Scanner Simulation Sheet
Overlays.renderC04 = function() {
  return `
    <div class="sheet-header">
      <h4>Scan Receipt</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body text-center">
      <div class="scanner-view">
        <span class="material-symbols-rounded scanner-reticle">filter_center_focus</span>
        <div class="scanner-laser"></div>
      </div>
      <div class="ocr-result-card card mt-3 text-left">
        <div class="badge badge-success mb-1">OCR Detected</div>
        <strong>Indomaret Point — Rp 87.500</strong>
        <p class="text-xs text-secondary">4 line items parsed cleanly</p>
      </div>
      <button class="btn btn-primary mt-4" onclick="Router.closeOverlay(); Router.navigate('S15')">Import & Edit</button>
    </div>
  `;
};

// C05: Review Suggested Expenses to Share Sheet
Overlays.renderC05 = function() {
  const suggestions = DuoState.data.suggestedToShare;
  return `
    <div class="sheet-header">
      <h4>Review Suggested Expenses</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <p class="text-xs text-secondary mb-3">AI detected dining and groceries that might be shared:</p>
      <div class="suggestions-list">
        ${suggestions.map(s => `
          <div class="card suggestion-item-card" id="sug-${s.id}">
            <div class="meta-row">
              <strong>${s.merchant}</strong>
              <span class="text-expense">${formatMoney(s.amount)}</span>
            </div>
            <p class="text-xs text-secondary">${s.date} • ${s.reason}</p>
            <div class="suggestion-actions mt-2">
              <button class="btn-xs" onclick="UI.acceptSuggestion('${s.id}')">Share 50/50</button>
              <button class="btn-xs btn-outline" onclick="UI.dismissSuggestion('${s.id}')">Keep Private</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// C06: Quick Transfer Sheet
Overlays.renderC06 = function(params = {}) {
  const isId = DuoState.lang === 'id';
  const wallets = DuoState.data.wallets || [];
  const defaultFrom = params.fromWallet || 'w_bca';
  const defaultTo = wallets.find(w => w.id !== defaultFrom)?.id || 'w_gopay';

  return `
    <div class="sheet-header">
      <h4>${window.t ? window.t('transferFunds') : 'Transfer Saldo Antar Rekening'}</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <div class="amount-input-box">
        <span class="curr-label">Rp</span>
        <input type="text" id="transfer-amount" value="500.000" />
      </div>
      <label class="form-group mt-3">
        <span>${window.t ? window.t('fromWallet') : 'Dari Dompet Sumber'}</span>
        <select id="transfer-from">
          ${wallets.map(w => `
            <option value="${w.id}" ${w.id === defaultFrom ? 'selected' : ''}>
              ${w.name} (${formatMoney(w.balance)})
            </option>
          `).join('')}
        </select>
      </label>
      <label class="form-group">
        <span>${window.t ? window.t('toWallet') : 'Ke Dompet Tujuan'}</span>
        <select id="transfer-to">
          ${wallets.map(w => `
            <option value="${w.id}" ${w.id === defaultTo ? 'selected' : ''}>
              ${w.name} (${formatMoney(w.balance)})
            </option>
          `).join('')}
        </select>
      </label>
      <button class="btn btn-primary mt-4" onclick="UI.executeTransfer()">
        ${window.t ? window.t('completeTransfer') : 'Eksekusi Transfer'}
      </button>
    </div>
  `;
};

// C07: Filter Sheet
Overlays.renderC07 = function() {
  return `
    <div class="sheet-header">
      <h4>Filter Options</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <label class="form-group">
        <span>Sort Order</span>
        <select><option>Newest first</option><option>Highest amount</option><option>Lowest amount</option></select>
      </label>
      <label class="form-group">
        <span>Timeframe</span>
        <select><option>Current billing cycle</option><option>Last 30 days</option><option>Custom</option></select>
      </label>
      <button class="btn btn-primary mt-4" onclick="Router.closeOverlay()">Apply</button>
    </div>
  `;
};

// C08: Settle Up Confirmation Sheet
Overlays.renderC08 = function() {
  const isId = DuoState.lang === 'id';
  const total = DuoState.getSettleUpTotal();
  const pWallets = (DuoState.data.wallets || []).filter(w => w.scope === 'personal');

  return `
    <div class="sheet-header">
      <h4>${window.t ? window.t('recordSettlePayment') : 'Catat Pelunasan Utang'}</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <div class="card text-center">
        <span class="text-xs text-secondary">${window.t ? window.t('dimasPayingRina') : 'Dimas melunasi ke Rina'}</span>
        <h2 class="text-teal mt-1">${formatMoney(total)}</h2>
      </div>
      <label class="form-group mt-3">
        <span>${window.t ? window.t('paymentMethodReceived') : 'Metode Penerimaan'}</span>
        <select id="settle-payment-method">
          <option>BCA Bank Transfer</option>
          <option>GoPay / QRIS</option>
          <option>Cash in Hand</option>
        </select>
      </label>
      <label class="form-group">
        <span>${window.t ? window.t('destPersonalWallet') : 'Dompet Pribadi Penerima'}</span>
        <select id="settle-dest-wallet">
          ${pWallets.map(w => `
            <option value="${w.id}">${w.name} (${formatMoney(w.balance)})</option>
          `).join('')}
        </select>
      </label>
      <button class="btn btn-primary mt-4" onclick="UI.confirmSettlePayment()">
        ${window.t ? window.t('confirmClearBalance') : 'Konfirmasi & Lunaskan Saldo'}
      </button>
    </div>
  `;
};

// C09: Add Note / Comment Sheet
Overlays.renderC09 = function(params = {}) {
  return `
    <div class="sheet-header">
      <h4>Add Note for Partner</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <textarea class="form-textarea" placeholder="Add a comment or question about this expense..."></textarea>
      <button class="btn btn-primary mt-4" onclick="Router.closeOverlay()">Post Note</button>
    </div>
  `;
};

// C10: Partner Invite QR / Link Sheet
Overlays.renderC10 = function() {
  return `
    <div class="sheet-header">
      <h4>Partner Invite</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body text-center">
      <div class="qr-mock card">
        <span class="material-symbols-rounded icon-qr">qr_code_2</span>
        <div class="code-box mt-2">K7M2QX</div>
      </div>
      <p class="text-xs text-secondary mt-2">Share this code with Dimas to link accounts.</p>
      <button class="btn btn-primary mt-4" onclick="Router.openDialog('D19')">Copy Invite Link</button>
    </div>
  `;
};

// C11: Category Selector Sheet
Overlays.renderC11 = function() {
  const cats = ['Groceries', 'Food & Drinks', 'Transport', 'Shopping', 'Bills & Utilities', 'Entertainment', 'Health'];
  return `
    <div class="sheet-header">
      <h4>Select Category</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <div class="categories-list">
        ${cats.map(c => `
          <div class="category-item-row" onclick="Router.closeOverlay()">
            <span>${c}</span>
            <span class="material-symbols-rounded icon-chevron">chevron_right</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// C12: Wallet Selector Sheet
Overlays.renderC12 = function() {
  return `
    <div class="sheet-header">
      <h4>Select Wallet</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      ${DuoState.data.wallets.map(w => `
        <div class="meta-row py-2" onclick="Router.closeOverlay()">
          <strong>${w.name}</strong>
          <span>${formatMoney(w.balance)}</span>
        </div>
      `).join('')}
    </div>
  `;
};

// C13: Adjust Safe-to-Spend Buffer Sheet
Overlays.renderC13 = function() {
  const currentBuffer = DuoState.getSafetyBuffer();
  const formattedVal = Math.round(currentBuffer).toLocaleString('id-ID');
  return `
    <div class="sheet-header">
      <h4>Emergency Safety Buffer</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <p class="text-xs text-secondary mb-3">Reserve a safety cushion before calculating daily spending allowance.</p>
      <div class="amount-input-box">
        <span class="curr-label">Rp</span>
        <input type="text" id="buffer-amount-input" value="${formattedVal}" />
      </div>
      <button class="btn btn-primary mt-4" onclick="UI.saveSafetyBuffer()">Save Buffer</button>
    </div>
  `;
};

// C14: Recurrence / Repeat Settings Sheet
Overlays.renderC14 = function() {
  return `
    <div class="sheet-header">
      <h4>Repeat Frequency</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <label class="form-group"><select><option>Never</option><option selected>Monthly on due date</option><option>Weekly</option><option>Yearly</option></select></label>
      <button class="btn btn-primary mt-4" onclick="Router.closeOverlay()">Confirm</button>
    </div>
  `;
};

// C15: Export Date Range Sheet
Overlays.renderC15 = function() {
  return `
    <div class="sheet-header">
      <h4>Export Time Period</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <label class="form-group"><span>Start Date</span><input type="date" value="2026-10-01"/></label>
      <label class="form-group"><span>End Date</span><input type="date" value="2026-10-31"/></label>
      <button class="btn btn-primary mt-4" onclick="Router.closeOverlay()">Set Range</button>
    </div>
  `;
};

// C16: Currency Picker Sheet
Overlays.renderC16 = function() {
  return `
    <div class="sheet-header">
      <h4>Primary Currency</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <div class="meta-row py-2" onclick="Router.closeOverlay()"><span>Indonesian Rupiah (IDR - Rp)</span><span class="material-symbols-rounded text-teal">check</span></div>
      <div class="meta-row py-2" onclick="Router.closeOverlay()"><span>US Dollar (USD - $)</span></div>
      <div class="meta-row py-2" onclick="Router.closeOverlay()"><span>Singapore Dollar (SGD - S$)</span></div>
    </div>
  `;
};

// C17: Security PIN / Biometrics Sheet
Overlays.renderC17 = function() {
  return `
    <div class="sheet-header">
      <h4>Security & Privacy Lock</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <div class="toggle-row">
        <div><strong>Require Face ID / Fingerprint</strong><p class="text-xs text-secondary">Prompt upon opening app</p></div>
        <input type="checkbox" checked />
      </div>
      <div class="toggle-row mt-3">
        <div><strong>Lock When Inactive for 5 min</strong><p class="text-xs text-secondary">Prevent unauthorized access</p></div>
        <input type="checkbox" checked />
      </div>
      <button class="btn btn-primary mt-4" onclick="Router.closeOverlay()">Save Preferences</button>
    </div>
  `;
};

// C18: Partner Privacy Rules Sheet
Overlays.renderC18 = function() {
  return `
    <div class="sheet-header">
      <h4>Partner Privacy Permissions</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <p class="text-xs text-secondary mb-3">Controls what metadata accompanies shared transactions:</p>
      <div class="toggle-row"><div><strong>Include Receipt Scans</strong></div><input type="checkbox" checked /></div>
      <div class="toggle-row mt-2"><div><strong>Include Private Notes</strong></div><input type="checkbox" /></div>
      <button class="btn btn-primary mt-4" onclick="Router.closeOverlay()">Done</button>
    </div>
  `;
};

// C19: Health Score Advice Sheet
Overlays.renderC19 = function(params = {}) {
  return `
    <div class="sheet-header">
      <h4>Financial Advice</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <div class="card alert-card">
        <div class="alert-head">
          <span class="material-symbols-rounded text-teal">tips_and_updates</span>
          <strong>Boost Your Health Score to 80+</strong>
        </div>
        <p class="text-xs text-secondary mt-1">
          Your safety net currently covers 1.2 months of living expenses. Reaching 3 months (Rp 10.000.000) will raise your overall financial grade to "Excellent".
        </p>
      </div>
      <button class="btn btn-primary mt-4" onclick="Router.closeOverlay()">Got it</button>
    </div>
  `;
};

// C20: Budget Alert Threshold Sheet
Overlays.renderC20 = function() {
  return `
    <div class="sheet-header">
      <h4>Create Collab Budget</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <label class="form-group"><span>Category</span><input type="text" value="Dining Out" /></label>
      <label class="form-group"><span>Joint Limit (Rp)</span><input type="text" value="1.200.000" /></label>
      <button class="btn btn-primary mt-4" onclick="Router.closeOverlay()">Create Budget</button>
    </div>
  `;
};

// C21: Edit Itemized Items Sheet
Overlays.renderC21 = function() {
  return `
    <div class="sheet-header">
      <h4>Edit Items</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <div class="card"><div class="meta-row"><span>Indomie Goreng</span><strong>Rp 8.000</strong></div></div>
      <button class="btn btn-primary mt-4" onclick="Router.closeOverlay()">Update Items</button>
    </div>
  `;
};

// C22: Quick Add Expense Mini Sheet
Overlays.renderC22 = function() {
  return `
    <div class="sheet-header">
      <h4>Quick Expense</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <div class="amount-input-box"><span class="curr-label">Rp</span><input type="text" id="quick-amt" placeholder="50.000" /></div>
      <input type="text" class="mt-2 form-input" id="quick-merchant" placeholder="Where did you spend?" />
      <button class="btn btn-primary mt-4" onclick="UI.quickAddExpense()">Add Quick</button>
    </div>
  `;
};

// C23: Activity Details Sheet
Overlays.renderC23 = function(params = {}) {
  const act = DuoState.data.collabActivity.find(a => a.id === params.actId) || DuoState.data.collabActivity[0];
  return `
    <div class="sheet-header">
      <h4>Shared Expense Detail</h4>
      <button class="icon-btn" onclick="Router.closeOverlay()"><span class="material-symbols-rounded">close</span></button>
    </div>
    <div class="sheet-body">
      <div class="card text-center">
        <span class="badge ${act.actor === 'Rina' ? 'badge-personal' : 'badge-collab'}">${act.actor} paid</span>
        <h2 class="mt-1">${formatMoney(act.amount)}</h2>
        <strong>${act.merchant}</strong>
      </div>
      <div class="card meta-card mt-3">
        <div class="meta-row"><span>Wallet</span><strong>${act.wallet}</strong></div>
        <div class="meta-row"><span>Date</span><strong>${act.date}</strong></div>
        <div class="meta-row"><span>Status</span><strong>${act.owesText}</strong></div>
      </div>
      <button class="btn btn-secondary mt-4" onclick="Router.closeOverlay()">Close</button>
    </div>
  `;
};


// --- DIALOGS (Modal popups D01 to D23) ---

// D01: Delete Transaction Confirmation
Dialogs.renderD01 = function(params = {}) {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-danger">delete</span>
      <h4>Delete Transaction?</h4>
      <p class="text-xs text-secondary mt-1">This will permanently remove this entry from your ledger.</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Cancel</button>
        <button class="btn btn-danger" onclick="UI.confirmDeleteTransaction('${params.txId}')">Delete</button>
      </div>
    </div>
  `;
};

// D02: Delete Budget Confirmation
Dialogs.renderD02 = function(params = {}) {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-danger">delete</span>
      <h4>Delete Budget?</h4>
      <p class="text-xs text-secondary mt-1">You will no longer receive alerts for this spending category.</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Cancel</button>
        <button class="btn btn-danger" onclick="UI.deleteBudget('${params.budgetId}')">Delete</button>
      </div>
    </div>
  `;
};

// D03: Delete Goal Confirmation
Dialogs.renderD03 = function(params = {}) {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-danger">delete</span>
      <h4>Delete Goal?</h4>
      <p class="text-xs text-secondary mt-1">Funds allocated to this goal will be returned to your liquid balance.</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Cancel</button>
        <button class="btn btn-danger" onclick="UI.deleteGoal('${params.goalId}')">Delete</button>
      </div>
    </div>
  `;
};

// D04: Unlink Partner Confirmation
Dialogs.renderD04 = function() {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-danger">link_off</span>
      <h4>Unlink Partner?</h4>
      <p class="text-xs text-secondary mt-1">
        Dimas will lose access to Collab Space. All pending Settle Up debts will be marked archived.
      </p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Keep Linked</button>
        <button class="btn btn-danger" onclick="UI.unlinkPartner()">Unlink</button>
      </div>
    </div>
  `;
};

// D05: Clear Audit Log Confirmation
Dialogs.renderD05 = function() {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon">cleaning_services</span>
      <h4>Clear Collab Trail?</h4>
      <p class="text-xs text-secondary mt-1">Clear history logs older than 30 days.</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Cancel</button>
        <button class="btn btn-primary" onclick="UI.clearAuditLog()">Clear</button>
      </div>
    </div>
  `;
};

// D06: Mark Bill Paid Confirmation
Dialogs.renderD06 = function(params = {}) {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-teal">check_circle</span>
      <h4>Mark Bill as Paid?</h4>
      <p class="text-xs text-secondary mt-1">Deducts amount from your primary wallet and marks bill settled.</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Cancel</button>
        <button class="btn btn-primary" onclick="UI.markBillPaid('${params.billId}')">Mark Paid</button>
      </div>
    </div>
  `;
};

// D07: Reset Demo Data Confirmation
Dialogs.renderD07 = function() {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-warning">restart_alt</span>
      <h4>Reset Demo Data?</h4>
      <p class="text-xs text-secondary mt-1">Restores all wallets, budgets, and transactions to default presentation state.</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Cancel</button>
        <button class="btn btn-primary" onclick="UI.resetDemoData()">Reset</button>
      </div>
    </div>
  `;
};

// D08: Unshare Transaction Confirmation
Dialogs.renderD08 = function(params = {}) {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-warning">lock</span>
      <h4>Make Private?</h4>
      <p class="text-xs text-secondary mt-1">Removes this item from Dimas's feed and reverses any split debts.</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Cancel</button>
        <button class="btn btn-primary" onclick="UI.unshareTransaction('${params.txId}')">Make Private</button>
      </div>
    </div>
  `;
};

// D09: Delete Wallet Confirmation
Dialogs.renderD09 = function(params = {}) {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-danger">delete</span>
      <h4>Delete Wallet?</h4>
      <p class="text-xs text-secondary mt-1">Wallet must have zero balance before deletion.</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Cancel</button>
        <button class="btn btn-danger" onclick="UI.deleteWallet('${params.walletId}')">Delete</button>
      </div>
    </div>
  `;
};

// D10: Confirm Settle Up Payment
Dialogs.renderD10 = function() {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-teal">thumb_up</span>
      <h4>Payment Confirmed</h4>
      <p class="text-xs text-secondary mt-1">Settle Up balance successfully updated to Rp 0.</p>
      <button class="btn btn-primary mt-4" onclick="Router.closeDialog(); Router.navigate('S26')">Back to Collab</button>
    </div>
  `;
};

// D11: Over-budget Alert Warning Dialog
Dialogs.renderD11 = function() {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-danger">warning</span>
      <h4>Budget Exceeded!</h4>
      <p class="text-xs text-secondary mt-1">Shopping is at 116% of limit. Would you like to review suggestions?</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Dismiss</button>
        <button class="btn btn-primary" onclick="Router.closeDialog(); Router.navigate('S19')">View Budgets</button>
      </div>
    </div>
  `;
};

// D12: Discard Unsaved Changes Dialog
Dialogs.renderD12 = function() {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-warning">edit_off</span>
      <h4>Discard Changes?</h4>
      <p class="text-xs text-secondary mt-1">Your unsaved modifications will be lost.</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Keep Editing</button>
        <button class="btn btn-danger" onclick="Router.closeDialog(); Router.back()">Discard</button>
      </div>
    </div>
  `;
};

// D13: Log Out Confirmation Dialog
Dialogs.renderD13 = function() {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-danger">logout</span>
      <h4>Log Out?</h4>
      <p class="text-xs text-secondary mt-1">You will return to the welcome screen.</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Cancel</button>
        <button class="btn btn-danger" onclick="UI.logOut()">Log Out</button>
      </div>
    </div>
  `;
};

// D14: Privacy Mode Activated Dialog
Dialogs.renderD14 = function() {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-indigo">visibility_off</span>
      <h4>Mask Amounts Toggled</h4>
      <p class="text-xs text-secondary mt-1">All currency amounts are now obfuscated on cards.</p>
      <button class="btn btn-primary mt-4" onclick="Router.closeDialog()">OK</button>
    </div>
  `;
};

// D15: Bank Auto-sync Confirmation Dialog
Dialogs.renderD15 = function() {
  return `
    <div class="dialog-box">
      <span class="material-symbols-rounded dialog-icon text-teal">sync</span>
      <h4>Bank Sync Verified</h4>
      <p class="text-xs text-secondary mt-1">BCA Open Banking session connected securely.</p>
      <button class="btn btn-primary mt-4" onclick="Router.closeDialog()">Done</button>
    </div>
  `;
};

// D16: Goal Milestone Achieved Dialog
Dialogs.renderD16 = function() {
  return `
    <div class="dialog-box text-center">
      <span class="material-symbols-rounded dialog-icon text-teal">celebration</span>
      <h4>60% Milestone Reached!</h4>
      <p class="text-xs text-secondary mt-1">Anniversary Trip goal is well over halfway funded. Keep it up!</p>
      <button class="btn btn-primary mt-4" onclick="Router.closeDialog()">Awesome</button>
    </div>
  `;
};

// D17: Export Complete Dialog
Dialogs.renderD17 = function() {
  return `
    <div class="dialog-box text-center">
      <span class="material-symbols-rounded dialog-icon text-teal">download_done</span>
      <h4>Report Downloaded</h4>
      <p class="text-xs text-secondary mt-1">Monthly Ledger (October 2026) has been exported.</p>
      <button class="btn btn-primary mt-4" onclick="Router.closeDialog()">Close</button>
    </div>
  `;
};

// D18: Change Default Split Dialog
Dialogs.renderD18 = function() {
  return `
    <div class="dialog-box">
      <h4>Default Split Ratio</h4>
      <p class="text-xs text-secondary mt-1">Applied automatically to newly created shared expenses.</p>
      <select id="default-split-select" class="mt-3">
        <option value="50/50">50/50 Equal</option>
        <option value="60/40">60/40 (Rina 60%, Dimas 40%)</option>
        <option value="70/30">70/30 (Rina 70%, Dimas 30%)</option>
      </select>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Cancel</button>
        <button class="btn btn-primary" onclick="UI.updateDefaultSplit()">Save</button>
      </div>
    </div>
  `;
};

// D19: Invite Code Copied Dialog
Dialogs.renderD19 = function() {
  return `
    <div class="dialog-box text-center">
      <span class="material-symbols-rounded dialog-icon text-teal">content_copy</span>
      <h4>Code Copied!</h4>
      <p class="text-xs text-secondary mt-1">Invite code <strong>K7M2QX</strong> copied to clipboard.</p>
      <button class="btn btn-primary mt-4" onclick="Router.closeDialog()">Done</button>
    </div>
  `;
};

// D20: Settle Up Reminder Sent Dialog
Dialogs.renderD20 = function() {
  return `
    <div class="dialog-box text-center">
      <span class="material-symbols-rounded dialog-icon text-teal">outgoing_mail</span>
      <h4>Reminder Sent to Dimas</h4>
      <p class="text-xs text-secondary mt-1">A notification and WhatsApp preview link have been sent.</p>
      <button class="btn btn-primary mt-4" onclick="Router.closeDialog()">Close</button>
    </div>
  `;
};

// D21: Safe-to-Spend Exceeded Dialog
Dialogs.renderD21 = function() {
  return `
    <div class="dialog-box text-center">
      <span class="material-symbols-rounded dialog-icon text-warning">speed</span>
      <h4>Daily Pace Warning</h4>
      <p class="text-xs text-secondary mt-1">This transaction exceeds your daily safe-to-spend allowance of Rp 180.000.</p>
      <div class="dialog-actions mt-4">
        <button class="btn btn-outline" onclick="Router.closeDialog()">Adjust</button>
        <button class="btn btn-primary" onclick="Router.closeDialog()">Proceed Anyway</button>
      </div>
    </div>
  `;
};

// D22: Connection Error / Offline Dialog
Dialogs.renderD22 = function() {
  return `
    <div class="dialog-box text-center">
      <span class="material-symbols-rounded dialog-icon text-secondary">wifi_off</span>
      <h4>Offline Mode</h4>
      <p class="text-xs text-secondary mt-1">Transactions will sync automatically when connection is restored.</p>
      <button class="btn btn-primary mt-4" onclick="Router.closeDialog()">Understood</button>
    </div>
  `;
};

// D23: Welcome Back / Quick Summary Dialog
Dialogs.renderD23 = function() {
  return `
    <div class="dialog-box text-center">
      <span class="material-symbols-rounded dialog-icon text-teal">waving_hand</span>
      <h4>Welcome Back, Rina</h4>
      <p class="text-xs text-secondary mt-1">Dimas shared 1 new grocery expense while you were away.</p>
      <button class="btn btn-primary mt-4" onclick="Router.closeDialog(); Router.navigate('S26')">View Collab</button>
    </div>
  `;
};

// D24: Edit User Profile Dialog
Dialogs.renderD24 = function() {
  const user = (DuoState.data && DuoState.data.currentUser) || { name: 'Rina', email: 'rina@example.com', avatarColor: '#6366F1' };
  const colors = ['#6366F1', '#10B981', '#F97316', '#EC4899', '#0EA5E9', '#8B5CF6'];
  const isId = (DuoState.lang === 'id');

  return `
    <div class="dialog-box edit-profile-dialog">
      <div class="dialog-header-row">
        <h4>${window.t ? window.t('editProfile') : (isId ? 'Edit Profil' : 'Edit Profile')}</h4>
        <button class="icon-btn" onclick="Router.closeDialog()"><span class="material-symbols-rounded">close</span></button>
      </div>

      <div class="edit-avatar-section mt-3">
        <div class="profile-avatar-wrapper">
          ${window.renderUserAvatar ? window.renderUserAvatar('avatar-large', 'margin:0 auto; width:80px; height:80px; font-size:32px;') : '<div class="avatar-large" style="background:#6366F1; margin:0 auto;">R</div>'}
          <label for="edit-photo-modal-input" class="avatar-camera-badge" title="${window.t ? window.t('uploadPhoto') : 'Unggah Foto'}">
            <span class="material-symbols-rounded">photo_camera</span>
          </label>
          <input type="file" id="edit-photo-modal-input" accept="image/*" style="display:none;" onchange="UI.handleAvatarUpload(event)" />
        </div>
        <div class="mt-2 flex-center gap-2">
          <label for="edit-photo-modal-input" class="btn-xs btn-outline" style="cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
            <span class="material-symbols-rounded icon-xs">upload</span> ${window.t ? window.t('uploadPhoto') : 'Unggah Foto'}
          </label>
          ${user.avatarUrl ? `
            <button type="button" class="btn-xs btn-outline text-danger" onclick="UI.removeAvatarPhoto()" style="display:inline-flex; align-items:center; gap:4px;">
              <span class="material-symbols-rounded icon-xs">delete</span> ${window.t ? window.t('removePhoto') : 'Hapus'}
            </button>
          ` : ''}
        </div>
      </div>

      <div class="color-picker-row mt-3">
        <label class="text-xs font-semibold text-secondary" style="display:block; margin-bottom:4px; text-align:left;">${window.t ? window.t('avatarColor') : 'Warna Avatar'}:</label>
        <div class="color-options-flex">
          ${colors.map(c => `
            <label class="color-radio-label">
              <input type="radio" name="edit-avatar-color" value="${c}" ${user.avatarColor === c ? 'checked' : ''} onchange="UI.setAvatarColor('${c}')" />
              <span class="color-radio-swatch" style="background-color: ${c};"></span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="form-inputs-group mt-3" style="text-align:left;">
        <div class="form-group mb-2">
          <label class="text-xs font-semibold text-secondary">${window.t ? window.t('fullName') : 'Nama Lengkap'}</label>
          <input type="text" id="edit-profile-name" class="input-field mt-1" value="${user.name || ''}" placeholder="Nama..." autocomplete="name" />
        </div>

        <div class="form-group mb-2">
          <label class="text-xs font-semibold text-secondary">${window.t ? window.t('emailAddress') : 'Alamat Email'}</label>
          <input type="email" id="edit-profile-email" class="input-field mt-1" value="${user.email || ''}" placeholder="email@example.com" autocomplete="email" />
        </div>

        <div class="form-group mb-2">
          <label class="text-xs font-semibold text-secondary">${window.t ? window.t('phoneNumber') : 'Nomor Telepon'}</label>
          <input type="tel" id="edit-profile-phone" class="input-field mt-1" value="${user.phone || '+62 812-3456-7890'}" placeholder="+62 8..." />
        </div>

        <div class="form-group mb-2">
          <label class="text-xs font-semibold text-secondary">${window.t ? window.t('bioStatus') : 'Bio / Catatan'}</label>
          <input type="text" id="edit-profile-bio" class="input-field mt-1" value="${user.bio || 'Smart saver & personal finance enthusiast'}" placeholder="Bio..." />
        </div>
      </div>

      <div class="dialog-actions mt-4">
        <button type="button" class="btn btn-outline" onclick="Router.closeDialog()">${window.t ? window.t('cancel') : 'Batal'}</button>
        <button type="button" class="btn btn-primary" onclick="UI.saveUserProfile()">${window.t ? window.t('saveChanges') : 'Simpan'}</button>
      </div>
    </div>
  `;
};

// D25: Forgot Password Dialog
Dialogs.renderD25 = function() {
  return `
    <div class="dialog-box forgot-password-dialog" style="max-width:380px;">
      <div class="dialog-header-row">
        <h4>Lupa Kata Sandi</h4>
        <button class="icon-btn" onclick="Router.closeDialog()"><span class="material-symbols-rounded">close</span></button>
      </div>
      <p class="text-xs text-secondary mt-1 text-left">
        Masukkan email akun DuoWallet Anda. Tautan dan petunjuk pemulihan kata sandi akan dikirimkan langsung ke email terdaftar.
      </p>
      
      <form onsubmit="event.preventDefault(); UI.handleForgotPasswordSubmit();" class="mt-3 text-left">
        <label class="form-group">
          <span>Email Terdaftar</span>
          <input type="email" id="forgot-email-input" placeholder="contoh: rina@example.com" value="" required />
        </label>
        
        <div class="dialog-actions mt-4">
          <button type="button" class="btn btn-outline" onclick="Router.closeDialog()">Batal</button>
          <button type="submit" class="btn btn-primary">
            <span class="material-symbols-rounded">send</span> Kirim Instruksi
          </button>
        </div>
      </form>
    </div>
  `;
};

// D_GOOGLE_AUTH: Interactive Google Sign-In Selector
Dialogs.renderD_GOOGLE_AUTH = function() {
  return `
    <div class="dialog-box google-oauth-dialog" style="max-width:400px; text-align:left; padding:24px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        <svg style="width:24px;height:24px;" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <div>
          <h4 style="margin:0; font-size:16px; font-weight:700;">Masuk dengan Google</h4>
          <span style="font-size:12px; color:var(--text-secondary, #64748B);">Pilih akun untuk melanjutkan ke DuoWallet</span>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
        <button type="button" class="btn btn-outline" style="display:flex; align-items:center; justify-content:flex-start; gap:12px; padding:10px 14px; text-align:left; border-radius:12px;" onclick="UI.confirmGoogleLogin('Atha (Google Workspace)', 'atha.dev@gmail.com')">
          <div style="width:36px; height:36px; border-radius:50%; background:#4285F4; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px;">A</div>
          <div style="overflow:hidden;">
            <div style="font-weight:600; font-size:13px; color:#1E293B;">Atha (Google Workspace)</div>
            <div style="font-size:11px; color:#64748B;">atha.dev@gmail.com</div>
          </div>
        </button>

        <button type="button" class="btn btn-outline" style="display:flex; align-items:center; justify-content:flex-start; gap:12px; padding:10px 14px; text-align:left; border-radius:12px;" onclick="UI.confirmGoogleLogin('Budi Santoso', 'budi.santoso@gmail.com')">
          <div style="width:36px; height:36px; border-radius:50%; background:#0D9488; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px;">B</div>
          <div style="overflow:hidden;">
            <div style="font-weight:600; font-size:13px; color:#1E293B;">Budi Santoso</div>
            <div style="font-size:11px; color:#64748B;">budi.santoso@gmail.com</div>
          </div>
        </button>
      </div>

      <div style="border-top:1px solid #E2E8F0; padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:11px; color:#94A3B8;">Aman & Terenkripsi</span>
        <button class="btn btn-sm btn-ghost" onclick="Router.closeDialog()">Batal</button>
      </div>
    </div>
  `;
};
