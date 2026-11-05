(() => {
  // Router Implementation
  window.Router = {
    navigate(screenId, params = {}) {
      if (!Screens['render' + screenId]) {
        console.warn(`Screen ${screenId} not found, falling back to S12`);
        screenId = 'S12';
      }

      // Security & Auth Guard
      const publicScreens = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11'];
      const currentUser = window.DuoAuth ? DuoAuth.getCurrentUser() : null;
      if (!currentUser && !publicScreens.includes(screenId)) {
        screenId = 'S04';
      } else if (currentUser && screenId === 'S46') {
        const allowed = ['super_admin', 'admin_finance', 'admin_ai'].includes(currentUser.role);
        if (!allowed) {
          if (window.UI && UI.showToast) UI.showToast('Akses ditolak: Hanya Admin yang dapat mengakses portal ini');
          screenId = 'S12';
        }
      }

      DuoState.currentScreen = screenId;
      DuoState.screenParams = params;
      if (DuoState.history[DuoState.history.length - 1] !== screenId) {
        DuoState.history.push(screenId);
      }
      this.closeOverlay();
      this.closeDialog();
      this.renderApp(params);
    },

    back() {
      if (DuoState.history.length > 1) {
        DuoState.history.pop();
        const prev = DuoState.history[DuoState.history.length - 1];
        DuoState.currentScreen = prev;
      } else {
        DuoState.currentScreen = 'S12';
      }
      DuoState.screenParams = {};
      this.closeOverlay();
      this.closeDialog();
      this.renderApp();
    },

    openOverlay(overlayId, params = {}) {
      DuoState.activeOverlay = overlayId;
      const overlayEl = document.getElementById('overlay-container');
      const backdropEl = document.getElementById('overlay-backdrop');
      if (Overlays['render' + overlayId]) {
        overlayEl.innerHTML = Overlays['render' + overlayId](params);
        overlayEl.classList.add('open');
        backdropEl.classList.add('open');
      }
    },

    closeOverlay() {
      DuoState.activeOverlay = null;
      const overlayEl = document.getElementById('overlay-container');
      const backdropEl = document.getElementById('overlay-backdrop');
      if (overlayEl) overlayEl.classList.remove('open');
      if (backdropEl) backdropEl.classList.remove('open');
    },

    openDialog(dialogId, params = {}) {
      DuoState.activeDialog = dialogId;
      const dialogEl = document.getElementById('dialog-container');
      const backdropEl = document.getElementById('dialog-backdrop');
      if (Dialogs['render' + dialogId]) {
        dialogEl.innerHTML = Dialogs['render' + dialogId](params);
        dialogEl.classList.add('open');
        backdropEl.classList.add('open');
      }
    },

    closeDialog() {
      DuoState.activeDialog = null;
      const dialogEl = document.getElementById('dialog-container');
      const backdropEl = document.getElementById('dialog-backdrop');
      if (dialogEl) dialogEl.classList.remove('open');
      if (backdropEl) backdropEl.classList.remove('open');
    },

    renderApp(params = {}) {
      const screenId = DuoState.currentScreen;
      const container = document.getElementById('screen-container');
      if (container && Screens['render' + screenId]) {
        container.innerHTML = Screens['render' + screenId](params);
        container.scrollTop = 0;
      }

      // Sync Desktop Shell if on desktop
      if (window.DesktopShell && window.LayoutManager && LayoutManager.isDesktop()) {
        DesktopShell.sync();
      }

      // Synchronize quick widget metrics dynamically
      const safeSpendEl = document.getElementById('desktop-safe-spend');
      if (safeSpendEl) {
        safeSpendEl.innerHTML = `${DuoState.maskAmounts ? '••••' : formatMoney(DuoState.getSafeToSpendDaily())}<span class="text-xs">/hari</span>`;
      }
      const debtInfoEl = document.getElementById('desktop-debt-info');
      if (debtInfoEl) {
        const debt = DuoState.getSettleUpTotal();
        debtInfoEl.innerHTML = `
          <span class="material-symbols-rounded icon-xs text-orange">balance</span>
          <span>Dimas: <strong>${DuoState.maskAmounts ? '••••' : formatMoney(debt)}</strong></span>
        `;
      }

      // Toggle Bottom Nav: show only for S12..S44 (mobile only)
      const bottomNav = document.getElementById('bottom-nav');
      const screenNum = parseInt(screenId.replace('S', ''), 10);
      if (bottomNav) {
        if (screenNum >= 12 && screenNum <= 44) {
          bottomNav.classList.remove('hidden');
          this.updateNavHighlight(screenId);
        } else {
          bottomNav.classList.add('hidden');
        }
      }

      // DuoAI Floating FAB button visibility guard
      const fabBtn = document.getElementById('ai-fab-btn');
      const activeUser = window.DuoAuth ? DuoAuth.getCurrentUser() : null;
      if (fabBtn) {
        if (activeUser && screenNum >= 12 && screenNum <= 44) {
          fabBtn.style.display = '';
        } else {
          fabBtn.style.display = 'none';
        }
      }
    },

    updateNavHighlight(screenId) {
      const navButtons = document.querySelectorAll('.bottom-nav-item');
      navButtons.forEach(btn => btn.classList.remove('active'));
      const num = parseInt(screenId.replace('S', ''), 10);
      if (num >= 12 && num <= 25) {
        const el = document.getElementById('nav-personal');
        if (el) el.classList.add('active');
      } else if (num >= 26 && num <= 33) {
        const el = document.getElementById('nav-collab');
        if (el) el.classList.add('active');
      } else if (num === 19 || num === 20 || num === 21 || num === 31) {
        const el = document.getElementById('nav-budgets');
        if (el) el.classList.add('active');
      } else if (num >= 34 && num <= 37) {
        const el = document.getElementById('nav-wallets');
        if (el) el.classList.add('active');
      } else {
        const el = document.getElementById('nav-more');
        if (el) el.classList.add('active');
      }
    }
  };

  // UI Action Handlers
  window.UI = {
    toggleMask() {
      DuoState.maskAmounts = !DuoState.maskAmounts;
      Router.renderApp();
      this.showToast(DuoState.maskAmounts ? 'Amounts masked' : 'Amounts visible');
    },

    toggleSplitSection(show) {
      const el = document.getElementById('split-options');
      if (el) el.style.display = show ? 'block' : 'none';
    },

    filterFeed(query) {
      const q = query.toLowerCase();
      const cards = document.querySelectorAll('#feed-tx-list .tx-card');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? 'flex' : 'none';
      });
    },

    filterChip(el, tag) {
      const chips = el.parentElement.querySelectorAll('.chip');
      chips.forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      const cards = document.querySelectorAll('#feed-tx-list .tx-card');
      cards.forEach(card => {
        if (tag === 'all') {
          card.style.display = 'flex';
        } else if (tag === 'shared') {
          card.style.display = card.innerHTML.includes('tag-shared') ? 'flex' : 'none';
        } else if (tag === 'private') {
          card.style.display = card.innerHTML.includes('tag-private') ? 'flex' : 'none';
        } else {
          card.style.display = card.textContent.includes(tag) ? 'flex' : 'none';
        }
      });
    },

    filterCollabFeed(query) {
      const q = query.toLowerCase();
      const cards = document.querySelectorAll('#collab-feed-list .tx-card');
      cards.forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
      });
    },

    filterCollabChip(el, tag) {
      const chips = el.parentElement.querySelectorAll('.chip');
      chips.forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      const cards = document.querySelectorAll('#collab-feed-list .tx-card');
      cards.forEach(card => {
        if (tag === 'all') {
          card.style.display = 'flex';
        } else {
          card.style.display = card.textContent.includes(tag) ? 'flex' : 'none';
        }
      });
    },

    saveManualTransaction() {
      const amtInput = document.getElementById('manual-tx-amount');
      const merchantInput = document.getElementById('manual-tx-merchant');
      const catInput = document.getElementById('manual-tx-category');
      const walletInput = document.getElementById('manual-tx-wallet');
      const isShared = document.getElementById('share-toggle') ? document.getElementById('share-toggle').checked : false;

      const rawAmt = amtInput ? amtInput.value : '';
      const cleanAmt = Security.validateAmount(rawAmt);
      if (!cleanAmt) {
        this.showToast(DuoState.lang === 'id' ? 'Nominal transaksi tidak valid' : 'Invalid transaction amount');
        return;
      }
      const merchant = Security.sanitizeText(merchantInput && merchantInput.value, 60) || 'Merchant';
      const category = Security.sanitizeText(catInput && catInput.value, 40) || 'Groceries';
      const walletId = walletInput && walletInput.value ? walletInput.value : 'w_bca';

      const wallet = DuoState.data.wallets.find(w => w.id === walletId);
      if (!wallet) {
        this.showToast(DuoState.lang === 'id' ? 'Dompet tidak ditemukan' : 'Wallet not found');
        return;
      }
      if (wallet.balance < cleanAmt) {
        this.showToast(DuoState.lang === 'id' ? `Saldo ${wallet.name} tidak mencukupi` : `Insufficient balance in ${wallet.name}`);
        return;
      }

      const newTx = {
        id: 'tx_' + Date.now(),
        merchant: merchant,
        category: category,
        amount: -Math.abs(cleanAmt),
        walletId: walletId,
        date: 'Today',
        shared: isShared,
        split: isShared ? '50/50' : null,
        dimasOwes: isShared ? Math.round(cleanAmt / 2) : 0,
        isSettled: false
      };

      DuoState.data.transactions.unshift(newTx);

      // Deduct from wallet
      wallet.balance -= cleanAmt;

      // Update personal budget spent
      const budget = (DuoState.data.budgets && DuoState.data.budgets.personal || []).find(b => b.category.toLowerCase() === category.toLowerCase());
      if (budget) {
        budget.spent += cleanAmt;
      }

      if (isShared) {
        DuoState.data.collabActivity.unshift({
          id: 'ca_' + Date.now(),
          merchant: merchant,
          category: category,
          amount: -Math.abs(cleanAmt),
          wallet: wallet ? wallet.name : 'Personal Account',
          date: 'Today',
          actor: 'Rina',
          type: 'shared_rina',
          owesText: `Dimas owes Rina ${formatMoney(Math.round(cleanAmt / 2))}`
        });
        DuoState.data.activityLogs.unshift({
          time: 'Just now',
          text: `Rina shared ${merchant} (${formatMoney(cleanAmt)})`
        });
      } else {
        DuoState.data.activityLogs.unshift({
          time: 'Just now',
          text: `Rina recorded ${merchant} (${formatMoney(cleanAmt)})`
        });
      }

      DuoState.persist();
      this.showToast('Transaction saved');
      Router.navigate(isShared ? 'S26' : 'S12');
    },

    saveIncome() {
      const amtInput = document.getElementById('income-amount');
      const sourceInput = document.getElementById('income-source');
      const walletInput = document.getElementById('income-wallet');

      const rawAmt = amtInput ? amtInput.value : '';
      const cleanAmt = Security.validateAmount(rawAmt);
      if (!cleanAmt) {
        this.showToast(DuoState.lang === 'id' ? 'Nominal pemasukan tidak valid' : 'Invalid income amount');
        return;
      }
      const source = Security.sanitizeText(sourceInput && sourceInput.value, 60) || 'Salary';
      const walletId = walletInput && walletInput.value ? walletInput.value : 'w_bca';

      const wallet = DuoState.data.wallets.find(w => w.id === walletId);
      if (!wallet) {
        this.showToast(DuoState.lang === 'id' ? 'Dompet tidak ditemukan' : 'Wallet not found');
        return;
      }
      wallet.balance += cleanAmt;

      DuoState.data.transactions.unshift({
        id: 'tx_' + Date.now(),
        merchant: source,
        category: 'Income',
        amount: cleanAmt,
        walletId: walletId,
        date: 'Today',
        shared: false
      });

      DuoState.data.activityLogs.unshift({
        time: 'Just now',
        text: `Rina received ${source} (${formatMoney(cleanAmt)})`
      });

      DuoState.persist();
      this.showToast('Income added: ' + formatMoney(cleanAmt));
      Router.navigate('S12');
    },

    updateTransaction(txId) {
      const tx = DuoState.data.transactions.find(t => t.id === txId);
      if (tx) {
        const m = document.getElementById('edit-merchant');
        const c = document.getElementById('edit-category');
        const n = document.getElementById('edit-notes');
        if (m) tx.merchant = Security.sanitizeText(m.value, 60) || tx.merchant;
        if (c) tx.category = Security.sanitizeText(c.value, 40) || tx.category;
        if (n) tx.notes = Security.sanitizeText(n.value, 150);
      }
      this.showToast('Changes saved');
      Router.navigate('S17', { txId });
    },

    confirmDeleteTransaction(txId) {
      DuoState.data.transactions = DuoState.data.transactions.filter(t => t.id !== txId);
      Router.closeDialog();
      this.showToast('Transaction deleted');
      Router.navigate('S12');
    },

    saveCollabExpense() {
      const amtInput = document.getElementById('collab-tx-amount');
      const descInput = document.getElementById('collab-tx-desc');
      const catInput = document.getElementById('collab-tx-category');
      const payerInput = document.getElementById('collab-tx-payer');
      const walletInput = document.getElementById('collab-tx-wallet');

      const rawAmt = amtInput ? amtInput.value : '';
      const amt = Security.validateAmount(rawAmt);
      if (!amt) {
        this.showToast(DuoState.lang === 'id' ? 'Nominal pengeluaran tidak valid' : 'Invalid expense amount');
        return;
      }
      const desc = Security.sanitizeText(descInput && descInput.value, 60) || 'Joint Expense';
      const cat = Security.sanitizeText(catInput && catInput.value, 40) || 'Groceries';
      const payer = Security.sanitizeText(payerInput && payerInput.value, 30) || 'Rina';
      const chosenWalletId = walletInput && walletInput.value ? walletInput.value : 'w_joint_bca';

      // Deduct from joint wallet or personal wallet with balance check
      let walletName = 'Joint BCA';
      if (chosenWalletId === 'personal_rina') {
        const pWallet = DuoState.data.wallets.find(w => w.id === 'w_bca');
        if (!pWallet || pWallet.balance < amt) {
          this.showToast(DuoState.lang === 'id' ? 'Saldo Rina BCA tidak mencukupi' : 'Insufficient balance in Rina BCA');
          return;
        }
        pWallet.balance -= amt;
        walletName = pWallet.name;
      } else {
        const jWallet = DuoState.data.wallets.find(w => w.id === chosenWalletId) || DuoState.data.wallets.find(w => w.scope === 'collab');
        if (!jWallet || jWallet.balance < amt) {
          this.showToast(DuoState.lang === 'id' ? `Saldo ${jWallet ? jWallet.name : 'kas bersama'} tidak mencukupi` : 'Insufficient joint balance');
          return;
        }
        jWallet.balance -= amt;
        walletName = jWallet.name;
      }

      // Update collab budget spent
      const collabBudget = (DuoState.data.budgets && DuoState.data.budgets.collab || []).find(b => b.category.toLowerCase() === cat.toLowerCase());
      if (collabBudget) {
        collabBudget.spent += amt;
      }

      // Add to collab activity
      const owes = payer === 'Rina' ? Math.round(amt / 2) : 0;
      DuoState.data.collabActivity.unshift({
        id: 'ca_' + Date.now(),
        merchant: desc,
        category: cat,
        amount: -Math.abs(amt),
        wallet: walletName,
        date: 'Today',
        actor: payer,
        type: payer === 'Rina' ? 'shared_rina' : 'shared_dimas',
        owesText: payer === 'Rina' ? `Dimas owes Rina ${formatMoney(owes)}` : 'Paid from joint'
      });

      // If Rina paid personally or as shared, record to personal transactions so S30 settle-up matches
      if (payer === 'Rina') {
        DuoState.data.transactions.unshift({
          id: 'tx_' + Date.now(),
          merchant: desc,
          category: cat,
          amount: -Math.abs(amt),
          walletId: chosenWalletId === 'personal_rina' ? 'w_bca' : chosenWalletId,
          date: 'Today',
          shared: true,
          split: '50/50',
          dimasOwes: owes,
          isSettled: false
        });
      }

      DuoState.data.activityLogs.unshift({
        time: 'Just now',
        text: `${payer} added ${desc} (${formatMoney(amt)}) in Collab Space`
      });

      DuoState.persist();
      this.showToast('Collab expense recorded');
      Router.navigate('S26');
    },

    handleDepositActorChange(actor) {
      const sourceGroup = document.getElementById('rina-deposit-source-group');
      if (sourceGroup) {
        sourceGroup.style.display = actor === 'Rina' ? 'block' : 'none';
      }
    },

    saveCollabDeposit() {
      const amtInput = document.getElementById('deposit-amount');
      const actorInput = document.getElementById('deposit-actor');
      const sourceInput = document.getElementById('deposit-source-wallet');
      const destInput = document.getElementById('deposit-dest-wallet');

      const rawAmt = amtInput ? amtInput.value : '';
      const amt = Security.validateAmount(rawAmt);
      if (!amt) {
        this.showToast(DuoState.lang === 'id' ? 'Nominal setoran tidak valid' : 'Invalid deposit amount');
        return;
      }
      const actor = Security.sanitizeText(actorInput && actorInput.value, 30) || 'Rina';
      const dest = destInput && destInput.value ? destInput.value : 'w_joint_bca';
      const sourceId = sourceInput && sourceInput.value ? sourceInput.value : 'w_bca';

      const wallet = DuoState.data.wallets.find(w => w.id === dest);
      if (!wallet) {
        this.showToast(DuoState.lang === 'id' ? 'Dompet tujuan tidak ditemukan' : 'Destination wallet not found');
        return;
      }

      // Deduct from Rina's personal account if Rina is depositor
      if (actor === 'Rina') {
        const rinaWallet = DuoState.data.wallets.find(w => w.id === sourceId) || DuoState.data.wallets.find(w => w.id === 'w_bca');
        if (rinaWallet) {
          if (rinaWallet.balance < amt) {
            this.showToast(DuoState.lang === 'id' ? `Saldo ${rinaWallet.name} tidak mencukupi untuk setor` : `Insufficient ${rinaWallet.name} balance for deposit`);
            return;
          }
          rinaWallet.balance -= amt;

          // Record transaction under Rina's personal ledger
          DuoState.data.transactions.unshift({
            id: 'tx_' + Date.now(),
            merchant: `Deposit to ${wallet.name}`,
            category: 'Savings & Joint',
            amount: -Math.abs(amt),
            walletId: rinaWallet.id,
            date: 'Today',
            shared: false
          });
        }
      }

      wallet.balance += amt;

      DuoState.data.collabActivity.unshift({
        id: 'ca_' + Date.now(),
        merchant: `Deposit from ${actor}`,
        category: 'Pool Contribution',
        amount: Math.abs(amt),
        wallet: wallet ? wallet.name : 'Joint BCA',
        date: 'Today',
        actor: actor,
        type: 'deposit',
        owesText: 'Pool Contribution'
      });

      DuoState.data.activityLogs.unshift({
        time: 'Just now',
        text: `${actor} deposited ${formatMoney(amt)} to ${wallet ? wallet.name : 'Joint Pool'}`
      });

      DuoState.persist();
      this.showToast(DuoState.lang === 'id' ? 'Setoran kas bersama berhasil' : 'Pool deposit confirmed');
      Router.navigate('S26');
    },

    confirmShare(txId) {
      const tx = DuoState.data.transactions.find(t => t.id === txId);
      if (tx) {
        tx.shared = true;
        tx.split = '50/50';
        tx.dimasOwes = Math.round(Math.abs(tx.amount) / 2);
        tx.isSettled = false;
      }
      Router.closeOverlay();
      this.showToast('Shared with Dimas');
      Router.navigate('S17', { txId });
    },

    confirmSettlePayment() {
      const debt = DuoState.getSettleUpTotal();
      const destSelect = document.getElementById('settle-dest-wallet');
      const destWalletId = (destSelect && destSelect.value) ? destSelect.value : 'w_bca';
      const destWallet = DuoState.data.wallets.find(w => w.id === destWalletId) || DuoState.data.wallets.find(w => w.id === 'w_bca');
      const destName = destWallet ? destWallet.name : 'Rina BCA';

      DuoState.data.transactions.forEach(t => {
        if (t.shared && !t.isSettled) {
          t.isSettled = true;
          t.dimasOwes = 0;
        }
      });

      // Settle payment adds funds to selected personal wallet
      if (destWallet && debt > 0) {
        destWallet.balance += debt;
      }

      DuoState.data.transactions.unshift({
        id: 'tx_' + Date.now(),
        merchant: 'Dimas Settle-Up Repayment',
        category: 'Income',
        amount: Math.abs(debt),
        walletId: destWallet ? destWallet.id : 'w_bca',
        date: 'Today',
        shared: false
      });

      DuoState.data.activityLogs.unshift({
        time: 'Just now',
        text: `Dimas settled all pending balances with Rina (${formatMoney(debt)}) to ${destName}`
      });
      DuoState.data.collabActivity.unshift({
        id: 'ca_' + Date.now(),
        merchant: 'Settle Up Payment',
        category: 'Settlement',
        amount: debt,
        wallet: destName,
        date: 'Today',
        actor: 'Dimas',
        type: 'settlement',
        owesText: 'All settled'
      });

      DuoState.persist();
      Router.closeOverlay();
      Router.openDialog('D10');
    },

    resetDemoData() {
      DuoState.reset();
      Router.closeDialog();
      this.showToast('Reset to demo state');
      Router.navigate('S12');
    },

    logOut() {
      if (window.DuoAuth) DuoAuth.logout();
      Router.closeDialog();
      this.showToast('Berhasil keluar dari akun');
      Router.navigate('S04');
    },

    fillDummyLogin(email, password) {
      const emailEl = document.getElementById('login-email');
      const passEl = document.getElementById('login-password');
      if (emailEl) emailEl.value = email;
      if (passEl) passEl.value = password;
      this.showToast(`Kredensial diisi: ${email}`);
    },

    handleLoginSubmit() {
      const email = (document.getElementById('login-email')?.value || '').trim();
      const password = (document.getElementById('login-password')?.value || '').trim();
      if (!email || !password) {
        this.showToast('Harap masukkan email dan kata sandi');
        return;
      }
      if (!window.DuoAuth) {
        Router.navigate('S12');
        return;
      }
      const res = DuoAuth.login(email, password);
      if (res.success) {
        this.showToast(`Selamat datang, ${res.user.name}!`);
        if (['super_admin', 'admin_finance', 'admin_ai'].includes(res.user.role)) {
          Router.navigate('S46');
        } else {
          Router.navigate('S12');
        }
      } else {
        this.showToast(res.message || 'Login gagal');
      }
    },

    handleSignUpSubmit() {
      const name = (document.getElementById('signup-name')?.value || '').trim();
      const email = (document.getElementById('signup-email')?.value || '').trim();
      const password = (document.getElementById('signup-password')?.value || '').trim();
      if (!name || !email || !password) {
        this.showToast('Harap lengkapi semua kolom');
        return;
      }
      if (password.length < 6) {
        this.showToast('Password minimal 6 karakter');
        return;
      }
      if (!window.DuoAuth) {
        Router.navigate('S12');
        return;
      }
      const res = DuoAuth.register(name, email, password);
      if (res.success) {
        this.showToast(`Akun berhasil dibuat! Halo, ${res.user.name}`);
        Router.navigate('S12');
      } else {
        this.showToast(res.message || 'Pendaftaran gagal');
      }
    },

    loginWithGoogle() {
      // Buka dialog pemilih akun Google yang interaktif & realistis
      Router.openDialog('D_GOOGLE_AUTH');
    },

    confirmGoogleLogin(name, email, avatarUrl) {
      if (!window.DuoAuth) return;
      const res = DuoAuth.loginGoogle({
        name: name || 'Pengguna Google',
        email: email || 'user@gmail.com',
        picture: avatarUrl || null
      });
      Router.closeDialog();
      this.showToast(`Berhasil masuk sebagai ${res.user.name}!`);
      Router.navigate('S12');
    },

    handleForgotPasswordSubmit() {
      const email = (document.getElementById('forgot-email-input')?.value || '').trim();
      if (!email) {
        this.showToast('Masukkan alamat email Anda');
        return;
      }
      Router.closeDialog();
      this.showToast(`Tautan pemulihan kata sandi telah dikirim ke ${email}`);
    },

    quickSwitchUser(userId) {
      if (!window.DuoAuth) return;
      const users = DuoAuth.getUsers();
      const target = users.find(u => u.id === userId);
      if (target) {
        DuoAuth.setCurrentUser(target);
        this.showToast(`Beralih ke akun ${target.name} (${target.roleLabel || target.role})`);
        if (['super_admin', 'admin_finance', 'admin_ai'].includes(target.role)) {
          Router.navigate('S46');
        } else {
          Router.navigate('S12');
        }
      }
    },
    handleSaveSiteConfig() {
      const appName = document.getElementById('cfg-app-name')?.value.trim() || 'DuoWallet';
      const tagline = document.getElementById('cfg-tagline')?.value.trim() || '';
      const announcement = document.getElementById('cfg-announcement')?.value.trim() || '';
      const primaryColor = document.getElementById('cfg-primary-color')?.value || '#6366F1';
      const accentColor = document.getElementById('cfg-accent-color')?.value || '#10B981';

      if (!DuoState.data.siteConfig) DuoState.data.siteConfig = {};
      DuoState.data.siteConfig.appName = appName;
      DuoState.data.siteConfig.tagline = tagline;
      DuoState.data.siteConfig.announcement = announcement;
      DuoState.data.siteConfig.primaryColor = primaryColor;
      DuoState.data.siteConfig.accentColor = accentColor;

      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-accent', accentColor);
      document.title = appName + (tagline ? ' - ' + tagline : '');

      DuoState.save();
      this.showToast('Konfigurasi UI berhasil diterapkan!');
      Router.renderApp();
    },

    resetSiteConfig() {
      DuoState.data.siteConfig = {
        appName: 'DuoWallet',
        tagline: 'Your money. Together when you choose.',
        primaryColor: '#6366F1',
        accentColor: '#10B981',
        announcement: '',
        featuresEnabled: { aiCopilot: true, collabSpace: true, safeToSpend: true }
      };
      document.documentElement.style.setProperty('--color-primary', '#6366F1');
      document.documentElement.style.setProperty('--color-accent', '#10B981');
      DuoState.save();
      this.showToast('Pengaturan UI dikembalikan ke default');
      Router.renderApp();
    },

    handleSaveAiConfig() {
      const input = (document.getElementById('admin-ai-endpoint')?.value || '').trim().replace(/\/+$/, '');
      if (input) {
        localStorage.setItem('duoai_endpoint', input);
        this.showToast(`Endpoint AI tersimpan: ${input}`);
      }
    },

    async testAiEndpointConnection() {
      const ep = (localStorage.getItem('duoai_endpoint') || '').replace(/\/+$/, '');
      this.showToast('Menguji sambungan AI...');
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(`${ep}/api/tags`, { method: 'GET', signal: ctrl.signal });
        clearTimeout(tid);
        if (res.ok) {
          this.showToast('✅ Berhasil terhubung ke endpoint AI Cloudflare!');
        } else {
          this.showToast(`Koneksi aktif (HTTP ${res.status})`);
        }
      } catch (e) {
        this.showToast('Endpoint merespons atau tunnel aktif.');
      }
    },

    exportAdminPdf() {
      const prevTitle = document.title;
      const site = (DuoState.data && DuoState.data.siteConfig) || {};
      document.title = `${site.appName || 'DuoWallet'}_Laporan_Audit_${new Date().toISOString().slice(0, 10)}`;
      window.print();
      document.title = prevTitle;
    },

    showToast(message) {
      const toast = document.getElementById('toast-notification');
      if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
          toast.classList.remove('show');
        }, 2400);
      }
    },

    toggleViewMode() {
      const mode = window.LayoutManager ? LayoutManager.toggleMode() : (DuoState.viewMode === 'desktop' ? 'mobile' : 'desktop');
      const msg = DuoState.lang === 'id' 
        ? `Mode diubah ke ${mode === 'desktop' ? 'Desktop' : 'Mobile'}`
        : `Switched to ${mode === 'desktop' ? 'Desktop' : 'Mobile'} view`;
      this.showToast(msg);
      if (window.Router) Router.renderApp();
    },

    applyViewMode() {
      if (window.LayoutManager) {
        LayoutManager.applyLayout();
        return;
      }
      const body = document.body;
      const frame = document.getElementById('prototype-frame');
      const icon = document.getElementById('icon-view-mode');
      const lbl = document.getElementById('lbl-view-mode');

      if (DuoState.viewMode === 'desktop') {
        body.classList.add('mode-desktop');
        if (frame) frame.classList.add('desktop-mode');
        if (icon) icon.textContent = 'smartphone';
        if (lbl) lbl.textContent = DuoState.lang === 'id' ? 'Tampilan Mobile' : 'Mobile View';
      } else {
        body.classList.remove('mode-desktop');
        if (frame) frame.classList.remove('desktop-mode');
        if (icon) icon.textContent = 'desktop_windows';
        if (lbl) lbl.textContent = DuoState.lang === 'id' ? 'Tampilan Desktop' : 'Desktop View';
      }
    },

    toggleLanguage() {
      const cycle = { id: 'en', en: 'su', su: 'id' };
      DuoState.lang = cycle[DuoState.lang] || 'id';
      if (DuoState.persist) DuoState.persist();
      this.applyLanguage();
      Router.renderApp();
      const msgs = {
        id: 'Bahasa Indonesia aktif',
        en: 'English mode active',
        su: 'Basa Sunda aktip'
      };
      this.showToast(msgs[DuoState.lang] || 'Bahasa diubah');
    },

    setLanguage(lang) {
      if (['id', 'en', 'su'].includes(lang)) {
        DuoState.lang = lang;
        if (DuoState.persist) DuoState.persist();
        this.applyLanguage();
        Router.renderApp();
        const msgs = {
          id: 'Bahasa Indonesia aktif',
          en: 'English mode active',
          su: 'Basa Sunda aktip'
        };
        this.showToast(msgs[lang] || 'Bahasa diubah');
      }
    },
    promptAiEndpoint() {
      const user = (window.DuoAuth && DuoAuth.getCurrentUser()) || (DuoState.data && DuoState.data.currentUser) || { role: 'user' };
      if (!['super_admin', 'admin_ai'].includes(user.role)) {
        this.showToast('Pengaturan Endpoint AI hanya dapat diubah oleh Administrator AI');
        return;
      }
      const defaultTunnel = '';
      const current = (localStorage.getItem('duoai_endpoint') || defaultTunnel).replace(/\/+$/, '');
      const input = prompt('Masukkan Ollama Endpoint URL (kosongkan = same-origin via proxy server):', current);
      if (input !== null) {
        const clean = input.trim();
        if (clean) {
          localStorage.setItem('duoai_endpoint', clean);
          this.showToast(`AI Endpoint disimpan: ${clean}`);
        } else {
          localStorage.removeItem('duoai_endpoint');
          this.showToast(`AI Endpoint dikembalikan ke default: ${defaultTunnel}`);
        }
        Router.renderApp();
      }
    },


    applyLanguage() {
      const lang = DuoState.lang || 'id';
      const isEn = lang === 'en';
      const isSu = lang === 'su';
      const flagEl = document.getElementById('lbl-lang-flag');
      const codeEl = document.getElementById('lbl-lang-code');
      const viewLbl = document.getElementById('lbl-view-mode');

      const flagMap = { id: '🇮🇩', en: '🇬🇧', su: '🌱' };
      const codeMap = { id: 'ID', en: 'EN', su: 'SU' };

      if (flagEl) flagEl.textContent = flagMap[lang] || '🇮🇩';
      if (codeEl) codeEl.textContent = codeMap[lang] || 'ID';

      if (viewLbl) {
        if (DuoState.viewMode === 'desktop') {
          viewLbl.textContent = isEn ? 'Mobile View' : (isSu ? 'Tampilan HP' : 'Tampilan Mobile');
        } else {
          viewLbl.textContent = isEn ? 'Desktop View' : (isSu ? 'Tampilan Desktop' : 'Tampilan Desktop');
        }
      }

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && window.t) el.textContent = window.t(key);
      });

      const aiTitle = document.getElementById('ai-drawer-title');
      const aiSub = document.getElementById('ai-drawer-sub');
      const aiInput = document.getElementById('ai-user-input');
      const quickLbl = document.getElementById('ai-quick-label');

      if (aiTitle) aiTitle.textContent = window.t('aiAdvisorTitle');
      if (aiSub) aiSub.textContent = window.t('aiAdvisorSub');
      if (aiInput) aiInput.placeholder = window.t('aiPlaceholder');
      if (quickLbl) quickLbl.textContent = window.t('quickPrompts');

      this.renderAiQuickChips();
    },

    toggleAiChat() {
      const activeUser = window.DuoAuth ? DuoAuth.getCurrentUser() : null;
      if (!activeUser) {
        this.showToast('Silakan login terlebih dahulu untuk mengakses DuoAI');
        return;
      }
      DuoState.isAiOpen = !DuoState.isAiOpen;
      if (DuoState.isAiOpen) this.openAiChat();
      else this.closeAiChat();
    },

    openAiChat() {
      const activeUser = window.DuoAuth ? DuoAuth.getCurrentUser() : null;
      if (!activeUser) {
        this.showToast('Silakan login terlebih dahulu untuk mengakses DuoAI');
        return;
      }
      DuoState.isAiOpen = true;
      if (window.DesktopShell && DesktopShell.syncAiModeUI) DesktopShell.syncAiModeUI();
      const drawer = document.getElementById('ai-chat-drawer');
      const backdrop = document.getElementById('ai-chat-backdrop');
      const fab = document.getElementById('ai-fab-btn');

      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      if (fab) fab.classList.add('active');

      if (!DuoState.aiChatHistory || DuoState.aiChatHistory.length === 0) {
        this.initAiWelcomeMessage();
      }
      this.renderAiMessages();
      this.renderAiQuickChips();

      setTimeout(() => {
        const input = document.getElementById('ai-user-input');
        if (input) input.focus();
      }, 250);
    },

    closeAiChat() {
      DuoState.isAiOpen = false;
      const drawer = document.getElementById('ai-chat-drawer');
      const backdrop = document.getElementById('ai-chat-backdrop');
      const fab = document.getElementById('ai-fab-btn');

      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      if (fab) fab.classList.remove('active');
    },

    initAiWelcomeMessage() {
      const lang = DuoState.lang || 'id';
      const userName = (window.getUserName && window.getUserName()) || 'Rina';
      let welcomeText;
      let timeText;
      if (lang === 'su') {
        welcomeText = `Sampurasun ${userName}! 👋 Sim kuring **DuoAI**, panaros kauangan pinter anjeun.\n• Saldo Pribadi: **${formatMoney(DuoState.getPersonalBalance())}**\n• Saldo Babarengan: **${formatMoney(DuoState.getCollabBalance())}**\n• Sambetan Dimas: **${formatMoney(DuoState.getSettleUpTotal())}**\nAya anu tiasa dibantos dinten ieu?`;
        timeText = 'Nembe pisan';
      } else if (lang === 'en') {
        welcomeText = `Hello ${userName}! 👋 I'm **DuoAI**, your smart financial co-pilot.\n• Personal Balance: **${formatMoney(DuoState.getPersonalBalance())}**\n• Shared Balance: **${formatMoney(DuoState.getCollabBalance())}**\n• Dimas Owes: **${formatMoney(DuoState.getSettleUpTotal())}**\nHow can I help you today?`;
        timeText = 'Just now';
      } else {
        welcomeText = `Halo ${userName}! 👋 Saya **DuoAI**, asisten keuangan cerdasmu.\n• Saldo Pribadi: **${formatMoney(DuoState.getPersonalBalance())}**\n• Saldo Bersama: **${formatMoney(DuoState.getCollabBalance())}**\n• Piutang Dimas: **${formatMoney(DuoState.getSettleUpTotal())}**\nAda yang bisa saya bantu analisis hari ini?`;
        timeText = 'Baru saja';
      }

      DuoState.aiChatHistory = [{ role: 'assistant', text: welcomeText, time: timeText }];
    },

    openEditProfileModal() {
      Router.openDialog('D24');
    },

    handleAvatarUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        this.showToast(DuoState.lang === 'id' ? 'Format file harus berupa gambar' : 'File must be an image');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        if (!DuoState.data.currentUser) DuoState.data.currentUser = {};
        DuoState.data.currentUser.avatarUrl = dataUrl;
        this.showToast(window.t('photoUpdated') || 'Foto profil berhasil diubah!');
        if (DuoState.activeDialog === 'D24') {
          Router.openDialog('D24');
        } else {
          Router.renderApp();
        }
      };
      reader.readAsDataURL(file);
    },

    removeAvatarPhoto() {
      if (DuoState.data.currentUser) {
        DuoState.data.currentUser.avatarUrl = null;
      }
      this.showToast(window.t('photoRemoved') || 'Foto profil dihapus.');
      if (DuoState.activeDialog === 'D24') {
        Router.openDialog('D24');
      } else {
        Router.renderApp();
      }
    },

    setAvatarColor(color) {
      if (DuoState.data.currentUser) {
        DuoState.data.currentUser.avatarColor = color;
      }
      if (DuoState.activeDialog === 'D24') {
        Router.openDialog('D24');
      }
    },

    saveUserProfile() {
      const nameEl = document.getElementById('edit-profile-name');
      const emailEl = document.getElementById('edit-profile-email');
      const phoneEl = document.getElementById('edit-profile-phone');
      const bioEl = document.getElementById('edit-profile-bio');
      const selectedColorEl = document.querySelector('input[name="edit-avatar-color"]:checked');

      const rawName = nameEl ? nameEl.value : '';
      const newName = Security.sanitizeText(rawName, 30);
      const newEmail = Security.sanitizeText(emailEl && emailEl.value, 60);
      const newPhone = Security.sanitizeText(phoneEl && phoneEl.value, 20);
      const newBio = Security.sanitizeText(bioEl && bioEl.value, 120);

      if (!newName) {
        this.showToast(DuoState.lang === 'id' ? 'Nama tidak boleh kosong!' : 'Name cannot be empty!');
        return;
      }

      if (!DuoState.data.currentUser) DuoState.data.currentUser = {};
      DuoState.data.currentUser.name = newName;
      if (newEmail) DuoState.data.currentUser.email = newEmail;
      DuoState.data.currentUser.phone = newPhone;
      DuoState.data.currentUser.bio = newBio;
      if (selectedColorEl) {
        DuoState.data.currentUser.avatarColor = Security.sanitizeText(selectedColorEl.value, 15);
      }

      Router.closeDialog();
      this.showToast(window.t('profileUpdated') || 'Profil berhasil diperbarui!');
      Router.renderApp();
    },

    renderAiMessages() {
      const container = document.getElementById('ai-chat-messages');
      if (!container) return;

      container.innerHTML = (DuoState.aiChatHistory || []).map(msg => {
        const isBot = msg.role === 'assistant';
        const formattedText = Security.renderSafeMarkdown(msg.text || '');

        return `
          <div class="ai-msg-bubble ${isBot ? 'ai-bubble-bot' : 'ai-bubble-user'}">
            ${isBot ? '<div class="ai-bubble-avatar"><span class="material-symbols-rounded">auto_awesome</span></div>' : ''}
            <div class="ai-msg-content">
              <div class="ai-bubble-text">${formattedText}</div>
              <span class="ai-msg-time">${Security.escapeHtml(msg.time || '')}</span>
            </div>
          </div>
        `;
      }).join('');
      container.scrollTop = container.scrollHeight;
    },

    renderAiQuickChips() {
      const chipsEl = document.getElementById('ai-quick-chips');
      if (!chipsEl) return;

      const lang = DuoState.lang || 'id';
      let chips;
      if (lang === 'su') {
        chips = [
          { label: '💡 Tips Nyimpen Artos', query: 'Pasihan tips nyimpen artos dumasar kana pangaluaran sasih ieu' },
          { label: '⚖️ Sambetan Dimas', query: 'Sabaraha total sambetan anu kedah ditaros ka Dimas?' },
          { label: '🎯 Target Liburan Bali', query: 'Kumaha kamajuan udagan tabungan Liburan ka Bali?' },
          { label: '🛒 Tiasa jajan kopi?', query: 'Naha wates dinten ieu aman kanggo mesér kopi?' }
        ];
      } else if (lang === 'en') {
        chips = [
          { label: '💡 Savings Tips', query: 'Give me smart savings tips based on my spending' },
          { label: '⚖️ Dimas Debt', query: 'How much does Dimas owe me right now?' },
          { label: '🎯 Bali Goal', query: 'What is the progress on our Bali Trip goal?' },
          { label: '🛒 Buy Coffee?', query: 'Is my daily budget safe for extra coffee today?' }
        ];
      } else {
        chips = [
          { label: '💡 Tips Berhemat', query: 'Beri aku tips berhemat berdasarkan pengeluaran bulan ini' },
          { label: '⚖️ Cek Hutang Dimas', query: 'Berapa total yang harus ditagih ke Dimas?' },
          { label: '🎯 Target Liburan Bali', query: 'Bagaimana progres target tabungan Liburan Bali?' },
          { label: '🛒 Boleh jajan kopi?', query: 'Apakah batas harian saya aman untuk jajan kopi?' }
        ];
      }

      chipsEl.innerHTML = chips.map(c => `
        <button type="button" class="ai-quick-chip" onclick="UI.sendAiQuickQuery('${c.query.replace(/'/g, "\\'")}')">
          ${c.label}
        </button>
      `).join('');
    },

    sendAiQuickQuery(query) {
      const input = document.getElementById('ai-user-input');
      if (input) input.value = query;
      this.handleAiSubmit();
    },

    handleAiSubmit() {
      const input = document.getElementById('ai-user-input');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      DuoState.aiChatHistory.push({ role: 'user', text, time: timeStr });
      input.value = '';
      this.renderAiMessages();

      // Add temporary loading indicator
      const loadingTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const loadingMsg = { role: 'assistant', text: '...', time: loadingTimeStr, isLoading: true };
      DuoState.aiChatHistory.push(loadingMsg);
      this.renderAiMessages();

      this.generateAiResponse(text).then(botReply => {
        const idx = DuoState.aiChatHistory.indexOf(loadingMsg);
        if (idx !== -1) DuoState.aiChatHistory.splice(idx, 1);
        DuoState.aiChatHistory.push({ role: 'assistant', text: botReply, time: loadingTimeStr });
        this.renderAiMessages();
      }).catch(() => {
        const idx = DuoState.aiChatHistory.indexOf(loadingMsg);
        if (idx !== -1) DuoState.aiChatHistory.splice(idx, 1);
        DuoState.aiChatHistory.push({ role: 'assistant', text: 'Maaf, terjadi kendala saat memproses jawaban.', time: loadingTimeStr });
        this.renderAiMessages();
      });
    },

    saveSafetyBuffer() {
      const input = document.getElementById('buffer-amount-input');
      const raw = input ? input.value : '';
      const clean = Security.validateAmount(raw, 0, 50000000);
      if (clean === null) {
        this.showToast(DuoState.lang === 'id' ? 'Nominal safety buffer tidak valid' : 'Invalid safety buffer amount');
        return;
      }
      DuoState.data.safetyBuffer = clean;
      Router.closeOverlay();
      this.showToast(DuoState.lang === 'id' ? `Safety buffer diperbarui: ${formatMoney(clean)}` : `Safety buffer updated: ${formatMoney(clean)}`);
      Router.renderApp();
    },

    updateSplitPreview(mode, absAmt) {
      const box = document.getElementById('split-preview-box');
      if (!box) return;
      let yourShare = absAmt / 2;
      let dimasShare = absAmt / 2;
      if (mode === '60_40') {
        yourShare = absAmt * 0.6;
        dimasShare = absAmt * 0.4;
      } else if (mode === '100_0') {
        yourShare = 0;
        dimasShare = absAmt;
      }
      box.innerHTML = `
        <div class="meta-row"><span>Your share:</span><strong>${formatMoney(yourShare)}</strong></div>
        <div class="meta-row"><span>Dimas's share:</span><strong class="text-teal">${formatMoney(dimasShare)}</strong></div>
      `;
    },

    applyItemSplit() {
      Router.closeOverlay();
      this.showToast('Itemized split saved');
    },

    saveContribution(goalId) {
      const amtInput = document.getElementById('contrib-amount');
      const walletSelect = document.getElementById('contrib-wallet');
      const cleanAmt = parseInt((amtInput ? amtInput.value : '0').replace(/[^0-9]/g, ''), 10) || 0;
      if (cleanAmt <= 0) {
        this.showToast(DuoState.lang === 'id' ? 'Nominal kontribusi tidak valid' : 'Invalid contribution amount');
        return;
      }

      const walletId = walletSelect ? walletSelect.value : 'w_bca';
      const wallet = DuoState.data.wallets.find(w => w.id === walletId);
      if (!wallet) {
        this.showToast(DuoState.lang === 'id' ? 'Dompet sumber tidak ditemukan' : 'Source wallet not found');
        return;
      }
      if (wallet.balance < cleanAmt) {
        this.showToast(DuoState.lang === 'id' ? `Saldo ${wallet.name} tidak mencukupi` : `Insufficient balance in ${wallet.name}`);
        return;
      }

      const allGoals = [...(DuoState.data.goals.personal || []), ...(DuoState.data.goals.collab || [])];
      const goal = allGoals.find(g => g.id === goalId);
      if (!goal) {
        this.showToast(DuoState.lang === 'id' ? 'Target tabungan tidak ditemukan' : 'Savings goal not found');
        return;
      }

      // Double-entry mutation
      wallet.balance -= cleanAmt;
      goal.saved += cleanAmt;

      // Personal transaction record
      DuoState.data.transactions.unshift({
        id: 'tx_' + Date.now(),
        merchant: `Goal: ${goal.name}`,
        category: 'Savings & Joint',
        amount: -Math.abs(cleanAmt),
        walletId: wallet.id,
        date: 'Today',
        shared: false
      });

      DuoState.data.activityLogs.unshift({
        time: 'Just now',
        text: `Transferred ${formatMoney(cleanAmt)} from ${wallet.name} to goal "${goal.name}"`
      });

      DuoState.persist();
      Router.closeOverlay();
      this.showToast((DuoState.lang === 'id' ? 'Berhasil menabung ' : 'Contributed ') + formatMoney(cleanAmt));
      Router.renderApp();
    },

    acceptSuggestion(sugId) {
      const idx = DuoState.data.suggestedToShare.findIndex(s => s.id === sugId);
      if (idx !== -1) {
        const s = DuoState.data.suggestedToShare.splice(idx, 1)[0];
        const absAmt = Math.abs(s.amount);
        DuoState.data.transactions.unshift({
          id: 'tx_' + Date.now(),
          merchant: s.merchant,
          category: s.category,
          amount: s.amount,
          walletId: 'w_bca',
          date: 'Today',
          shared: true,
          split: '50/50',
          dimasOwes: Math.round(absAmt / 2),
          isSettled: false
        });
        DuoState.data.collabActivity.unshift({
          id: 'ca_' + Date.now(),
          merchant: s.merchant,
          category: s.category,
          amount: s.amount,
          wallet: 'Joint BCA',
          date: 'Today',
          actor: 'Rina',
          type: 'shared_rina',
          owesText: `Dimas owes Rina ${formatMoney(Math.round(absAmt / 2))}`
        });
        this.showToast('Shared with Dimas (50/50)');
        Router.closeOverlay();
        Router.renderApp();
      }
    },

    dismissSuggestion(sugId) {
      DuoState.data.suggestedToShare = DuoState.data.suggestedToShare.filter(s => s.id !== sugId);
      const el = document.getElementById('sug-' + sugId);
      if (el) el.remove();
      this.showToast('Marked as private');
    },

    executeTransfer() {
      const amtInput = document.getElementById('transfer-amount');
      const fromId = document.getElementById('transfer-from') ? document.getElementById('transfer-from').value : null;
      const toId = document.getElementById('transfer-to') ? document.getElementById('transfer-to').value : null;
      const cleanAmt = parseInt((amtInput ? amtInput.value : '0').replace(/[^0-9]/g, ''), 10) || 0;

      if (cleanAmt <= 0) {
        this.showToast(DuoState.lang === 'id' ? 'Nominal transfer tidak valid' : 'Invalid transfer amount');
        return;
      }
      if (fromId === toId) {
        this.showToast(DuoState.lang === 'id' ? 'Dompet asal dan tujuan tidak boleh sama' : 'Source and destination cannot be identical');
        return;
      }

      const fromW = DuoState.data.wallets.find(w => w.id === fromId);
      const toW = DuoState.data.wallets.find(w => w.id === toId);

      if (!fromW || !toW) {
        this.showToast(DuoState.lang === 'id' ? 'Dompet tidak valid' : 'Invalid wallets');
        return;
      }
      if (fromW.balance < cleanAmt) {
        this.showToast(DuoState.lang === 'id' ? `Saldo ${fromW.name} tidak mencukupi` : `Insufficient balance in ${fromW.name}`);
        return;
      }

      fromW.balance -= cleanAmt;
      toW.balance += cleanAmt;

      // Personal transaction record if moving personal funds
      DuoState.data.transactions.unshift({
        id: 'tx_' + Date.now(),
        merchant: `Transfer to ${toW.name}`,
        category: 'Transfer',
        amount: -Math.abs(cleanAmt),
        walletId: fromW.id,
        date: 'Today',
        shared: false
      });

      DuoState.data.activityLogs.unshift({
        time: 'Just now',
        text: `Transferred ${formatMoney(cleanAmt)} from ${fromW.name} to ${toW.name}`
      });

      DuoState.persist();
      Router.closeOverlay();
      this.showToast((DuoState.lang === 'id' ? 'Transfer berhasil: ' : 'Transferred ') + formatMoney(cleanAmt));
      Router.renderApp();
    },

    quickAddExpense() {
      const amtEl = document.getElementById('quick-amt');
      const merchEl = document.getElementById('quick-merchant');
      const cleanAmt = parseInt((amtEl ? amtEl.value : '0').replace(/[^0-9]/g, ''), 10) || 50000;
      const merch = (merchEl && merchEl.value.trim()) || 'Quick Expense';

      DuoState.data.transactions.unshift({
        id: 'tx_' + Date.now(),
        merchant: merch,
        category: 'Food & Drinks',
        amount: -Math.abs(cleanAmt),
        walletId: 'w_bca',
        date: 'Today',
        shared: false
      });
      const w = DuoState.data.wallets.find(wallet => wallet.id === 'w_bca');
      if (w) w.balance -= cleanAmt;

      Router.closeOverlay();
      this.showToast('Added ' + merch);
      Router.renderApp();
    },

    deleteBudget(budgetId) {
      DuoState.data.budgets.personal = DuoState.data.budgets.personal.filter(b => b.id !== budgetId);
      DuoState.data.budgets.collab = DuoState.data.budgets.collab.filter(b => b.id !== budgetId);
      Router.closeDialog();
      this.showToast('Budget deleted');
      Router.navigate('S19');
    },

    deleteGoal(goalId) {
      DuoState.data.goals.personal = DuoState.data.goals.personal.filter(g => g.id !== goalId);
      DuoState.data.goals.collab = DuoState.data.goals.collab.filter(g => g.id !== goalId);
      Router.closeDialog();
      this.showToast('Goal deleted');
      Router.navigate('S22');
    },

    unlinkPartner() {
      DuoState.data.collabSpace.partnerJoined = false;
      DuoState.data.collabSpace.active = false;
      Router.closeDialog();
      this.showToast('Partner unlinked');
      Router.navigate('S12');
    },

    clearAuditLog() {
      DuoState.data.activityLogs = [];
      Router.closeDialog();
      this.showToast('Audit trail cleared');
      Router.renderApp();
    },

    markBillPaid(billId) {
      const allBills = [...(DuoState.data.bills.personal || []), ...(DuoState.data.bills.collab || [])];
      const bill = allBills.find(b => b.id === billId);
      if (bill) {
        bill.status = 'Paid';
        const w = DuoState.data.wallets.find(wallet => wallet.id === (bill.wallet || 'w_bca'));
        if (w) w.balance -= bill.amount;
      }
      Router.closeDialog();
      this.showToast('Bill marked as paid');
      Router.renderApp();
    },

    unshareTransaction(txId) {
      const tx = DuoState.data.transactions.find(t => t.id === txId);
      if (tx) {
        tx.shared = false;
        tx.dimasOwes = 0;
      }
      Router.closeDialog();
      this.showToast('Transaction is now private');
      Router.renderApp();
    },

    deleteWallet(walletId) {
      DuoState.data.wallets = DuoState.data.wallets.filter(w => w.id !== walletId);
      Router.closeDialog();
      this.showToast('Wallet deleted');
      Router.navigate('S34');
    },

    updateDefaultSplit() {
      const select = document.getElementById('default-split-select');
      if (select) DuoState.data.collabSpace.defaultSplit = select.value;
      Router.closeDialog();
      this.showToast('Default split updated');
      Router.renderApp();
    },

    createBudget() {
      const catEl = document.getElementById('new-budget-cat');
      const limitEl = document.getElementById('new-budget-limit');
      const cat = catEl ? catEl.value : 'Other';
      const cleanLimit = parseInt((limitEl ? limitEl.value : '0').replace(/[^0-9]/g, ''), 10) || 500000;

      DuoState.data.budgets.personal.push({
        id: 'b_' + Date.now(),
        category: cat,
        limit: cleanLimit,
        spent: 0,
        icon: 'pie_chart'
      });
      this.showToast('Budget created');
      Router.navigate('S19');
    },

    createGoal() {
      const nameEl = document.getElementById('new-goal-name');
      const targetEl = document.getElementById('new-goal-target');
      const dateEl = document.getElementById('new-goal-date');
      const name = (nameEl && nameEl.value.trim()) || 'New Goal';
      const target = parseInt((targetEl ? targetEl.value : '0').replace(/[^0-9]/g, ''), 10) || 1000000;
      const dueDate = (dateEl && dateEl.value) || 'No deadline';

      DuoState.data.goals.personal.push({
        id: 'g_' + Date.now(),
        name,
        target,
        saved: 0,
        dueDate,
        status: 'On track',
        monthlyNeeded: Math.round(target / 6),
        icon: 'flag'
      });
      this.showToast('Goal saved');
      Router.navigate('S22');
    },

    createWallet() {
      const nameEl = document.getElementById('new-wallet-name');
      const typeEl = document.getElementById('new-wallet-type');
      const balEl = document.getElementById('new-wallet-balance');
      const scopeEl = document.getElementById('new-wallet-scope');

      const name = (nameEl && nameEl.value.trim()) || 'New Wallet';
      const type = typeEl ? typeEl.value : 'Bank';
      const balance = parseInt((balEl ? balEl.value : '0').replace(/[^0-9]/g, ''), 10) || 0;
      const scope = scopeEl ? scopeEl.value : 'personal';

      DuoState.data.wallets.push({
        id: 'w_' + Date.now(),
        name,
        type,
        balance,
        scope,
        icon: type === 'Cash' ? 'payments' : (type === 'E-wallet' ? 'account_balance_wallet' : 'account_balance')
      });
      this.showToast('Wallet created');
      Router.navigate('S34');
    },

    clearNotifs() {
      const list = document.querySelector('.notif-list');
      if (list) list.innerHTML = '<p class="text-sm text-secondary text-center py-4">No notifications.</p>';
      this.showToast('Notifications cleared');
    },
    executeAiAction(action) {
      if (!action || !action.parameters) return false;
      const params = action.parameters;

      if (action.action === 'record_transaction') {
        const amt = Math.abs(Number(params.amount) || 0);
        if (!amt) return false;
        const wallet = DuoState.data.wallets.find(w => w.id === params.wallet_id) || DuoState.data.wallets[0];
        const category = params.category || 'Shopping';
        const merchant = params.merchant || 'Pengeluaran AI';
        const isShared = !!params.shared;

        if (wallet && wallet.balance >= amt) {
          wallet.balance -= amt;
        }

        DuoState.data.transactions.unshift({
          id: 'tx_' + Date.now(),
          merchant: merchant,
          category: category,
          amount: -amt,
          walletId: wallet ? wallet.id : 'w_bca',
          date: 'Today',
          shared: isShared,
          split: isShared ? '50/50' : null,
          dimasOwes: isShared ? Math.round(amt / 2) : 0,
          isSettled: false
        });
        if (DuoState.persist) DuoState.persist();
        return true;
      }

      if (action.action === 'record_collab_expense') {
        const amt = Math.abs(Number(params.amount) || 0);
        if (!amt) return false;
        const merchant = params.merchant || 'Belanja Bersama';
        const category = params.category || 'Food & Drinks';
        const dimasOwes = Number(params.dimas_owes) || Math.round(amt / 2);

        DuoState.data.transactions.unshift({
          id: 'tx_' + Date.now(),
          merchant: merchant,
          category: category,
          amount: -amt,
          walletId: 'w_bca',
          date: 'Today',
          shared: true,
          split: params.split_ratio || '50/50',
          dimasOwes: dimasOwes,
          isSettled: false
        });

        DuoState.data.collabActivity.unshift({
          id: 'ca_' + Date.now(),
          merchant: merchant,
          category: category,
          amount: -amt,
          wallet: 'Rina Personal',
          date: 'Today',
          actor: params.paid_by || 'Rina',
          type: 'shared_rina',
          owesText: `Dimas owes Rina ${formatMoney(dimasOwes)}`
        });
        if (DuoState.persist) DuoState.persist();
        return true;
      }

      if (action.action === 'record_income') {
        const amt = Math.abs(Number(params.amount) || 0);
        if (!amt) return false;
        const wallet = DuoState.data.wallets.find(w => w.id === params.wallet_id) || DuoState.data.wallets[0];
        if (wallet) wallet.balance += amt;
        DuoState.data.transactions.unshift({
          id: 'tx_' + Date.now(),
          merchant: params.source || 'Pemasukan',
          category: 'Salary',
          amount: amt,
          walletId: wallet ? wallet.id : 'w_bca',
          date: 'Today',
          shared: false
        });
        if (DuoState.persist) DuoState.persist();
        return true;
      }
      return false;
    },


    async generateAiResponse(userQuery) {
      const q = userQuery.toLowerCase();
      const lang = DuoState.lang || 'id';
      const isId = lang === 'id';
      const isSu = lang === 'su';
      const pBal = DuoState.getPersonalBalance();
      const cBal = DuoState.getCollabBalance();
      const debt = DuoState.getSettleUpTotal();
      const safeDaily = DuoState.getSafeToSpendDaily ? DuoState.getSafeToSpendDaily() : 180000;
      const spentBudget = (DuoState.data.budgets && DuoState.data.budgets.personal ? DuoState.data.budgets.personal : []).reduce((s, b) => s + (b.spent || 0), 0);
      const daysLeft = 8;

      // Ambil user aktif untuk aturan isolasi data privasi
      const currentUser = (window.DuoAuth && DuoAuth.getCurrentUser()) || (DuoState.data && DuoState.data.currentUser) || { name: 'Rina', role: 'user' };
      const currentUserName = currentUser.name || 'Rina';
      const isDimas = currentUserName.toLowerCase().includes('dimas');
      const partnerName = isDimas ? 'Rina' : 'Dimas';

      // 1. Coba koneksi ke Ollama runtime (duoai-copilot via /api/chat)
      // Default '' = same-origin: saat deploy Docker, nginx mem-proxy /api -> ollama dan /rag -> layanan RAG
      const defaultTunnel = '';
      const ollamaEndpoint = (localStorage.getItem('duoai_endpoint') || defaultTunnel).replace(/\/+$/, '');

      // Ambil mode cakupan pengetahuan AI (default: Full Knowledge Base)
      const isAppOnly = localStorage.getItem('duoai_app_only') === 'true';

      // Pre-guard mode Khusus DuoWallet: tolak segera topik di luar domain aplikasi
      const isOffDomainForAppOnly = /(cuti|krs|presiden|kampus|kuliah|dosen|semester|dekan|kaprodi|skripsi|rektor|sks)/i.test(q);
      if (isAppOnly && isOffDomainForAppOnly) {
        return 'Maaf, saat ini saya berada dalam Mode Khusus DuoWallet, sehingga hanya dapat melayani pengelolaan keuangan dan fitur aplikasi DuoWallet. Silakan alihkan ke Mode Full Knowledge Base jika ingin menanyakan dokumen lainnya.';
      }

      const ctrl = new AbortController();

      // 0. RAG: ambil konteks dokumentasi DuoWallet & knowledge base (timeout 15s)
      let ragContext = '';
      try {
        const rCtrl = new AbortController();
        const rTid = setTimeout(() => rCtrl.abort(), 15000);
        const ragEndpoint = (ollamaEndpoint && !ollamaEndpoint.includes('localhost:11434'))
          ? `${ollamaEndpoint}/rag/query`
          : '/rag/query';
        const rRes = await fetch(ragEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: userQuery, top_k: 5 }),
          signal: rCtrl.signal
        });
        clearTimeout(rTid);
        if (rRes.ok) {
          const rData = await rRes.json();
          if (isAppOnly) {
            // Dalam Mode Khusus DuoWallet: filter ketat agar HANYA dokumen duowallet-panduan.md yang masuk ke prompt
            if (Array.isArray(rData.sources)) {
              const hasAppHit = rData.sources.some(s => (s.source || '').includes('duowallet'));
              if (hasAppHit && rData.context) {
                const parts = rData.context.split('\n\n---\n\n').filter(p => !p.toLowerCase().includes('cuti') && !p.toLowerCase().includes('krs') && !p.toLowerCase().includes('presiden'));
                ragContext = parts.join('\n\n---\n\n');
              } else {
                ragContext = '';
              }
            }
          } else {
            if (rData.context) ragContext = String(rData.context);
          }
        }
      } catch (e) { /* RAG offline / bukan same-origin: abaikan */ }

      try {
        let sysPrompt = '';
        if (isAppOnly) {
          sysPrompt = `Anda adalah DuoAI, asisten pintar serbabisa di aplikasi DuoWallet.
Sesi pengguna yang sedang aktif saat ini adalah: "${currentUserName}".
INFORMASI ANGGARAN & KEUANGAN KHUSUS ${currentUserName.toUpperCase()}:
- Saldo Akun Pribadi ${currentUserName}: ${formatMoney(pBal)}
- Anggaran Terpakai ${currentUserName}: ${formatMoney(spentBudget)}
- Kas Bersama (Collab Space): ${formatMoney(cBal)}
- Safe-to-Spend ${currentUserName}: ${formatMoney(safeDaily)}/hari (${daysLeft} hari tersisa bulan ini)
- Settle-up Hutang Kas: ${formatMoney(debt)}

ATURAN PRIVASI & ISOLASI DATA (SANGAT KETAT):
1. Terkait data keuangan, Anda HANYA boleh membeberkan saldo/pengeluaran milik "${currentUserName}" dan Kas Bersama (DILARANG membocorkan rincian saldo pribadi "${partnerName}").
2. Jika pengguna berniat mencatat transaksi atau patungan, kembalikan JSON action (record_transaction / record_collab_expense / record_income).

MODE OPERASIONAL: MODE KHUSUS DUOWALLET (APP ONLY).
- Anda HANYA diizinkan menjawab pertanyaan seputar fitur, keuangan, dan panduan DuoWallet.
- Jika pengguna menanyakan hal lain (seperti SOP akademik kampus, KRS, cuti kuliah, riwayat presiden, atau topik umum di luar DuoWallet), Anda WAJIB menolak dengan sopan:
  "Maaf, saat ini saya berada dalam Mode Khusus DuoWallet, sehingga hanya dapat melayani pengelolaan keuangan dan fitur aplikasi DuoWallet. Silakan alihkan ke Mode Full Knowledge Base jika ingin menanyakan dokumen lainnya."`;
          if (ragContext) {
            sysPrompt += `\n\nKONTEKS PANDUAN DUOWALLET:\n${ragContext}`;
          }
        } else {
          sysPrompt = `Anda adalah DuoAI, asisten pintar serbabisa di aplikasi DuoWallet yang menguasai manajemen finansial, teknologi, dan seluruh pengetahuan resmi di knowledge base.
Sesi pengguna yang sedang aktif saat ini adalah: "${currentUserName}".
INFORMASI ANGGARAN & KEUANGAN KHUSUS ${currentUserName.toUpperCase()}:
- Saldo Akun Pribadi ${currentUserName}: ${formatMoney(pBal)}
- Anggaran Terpakai ${currentUserName}: ${formatMoney(spentBudget)}
- Kas Bersama (Collab Space): ${formatMoney(cBal)}
- Safe-to-Spend ${currentUserName}: ${formatMoney(safeDaily)}/hari (${daysLeft} hari tersisa bulan ini)
- Settle-up Hutang Kas: ${formatMoney(debt)}

ATURAN PRIVASI & ISOLASI DATA (SANGAT KETAT):
1. Terkait data keuangan, Anda HANYA boleh membeberkan saldo/pengeluaran milik "${currentUserName}" dan Kas Bersama (DILARANG membocorkan rincian saldo pribadi "${partnerName}").
2. Jika pengguna berniat mencatat transaksi atau patungan, kembalikan JSON action (record_transaction / record_collab_expense / record_income).
3. Anda mengacu pada ATURAN BAKU (rules.md): Anda melayani pengelolaan DuoWallet DAN seluruh dokumen resmi di Knowledge Base (seperti SOP pendaftaran KRS online, SOP permohonan cuti akademik, riwayat Presiden RI, dll.).
4. Untuk pertanyaan tentang SOP kampus, akademik, atau presiden: Jawablah secara ramah, lengkap, terstruktur, dan akurat berdasarkan KONTEKS PENGETAHUAN di bawah. JANGAN tolak pertanyaan akademik jika dokumennya tersedia di konteks!
5. Jika pengguna bertanya hal di luar DuoWallet dan TIDAK ADA di konteks knowledge base (misal: resep masakan acak, gosip selebriti, ramalan bintang), tolak dengan sopan sesuai rules.md:
   "Maaf, sebagai asisten DuoAI, saya difokuskan untuk membantu pengelolaan keuangan DuoWallet serta informasi resmi yang tersedia di knowledge base kami. Ada hal seputar keuangan atau panduan aplikasi yang bisa saya bantu?"`;
          if (ragContext) {
            sysPrompt += `\n\nKONTEKS PENGETAHUAN / KNOWLEDGE BASE (Gunakan informasi faktual berikut sebagai rujukan utama):\n${ragContext}`;
          }
        }

        // Timeout 120s untuk memberi waktu proses inferensi model lokal
        const tid = setTimeout(() => ctrl.abort(), 120000);
        const res = await fetch(`${ollamaEndpoint}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'duoai-copilot',
            messages: [
              { role: 'system', content: sysPrompt },
              { role: 'user', content: userQuery }
            ],
            stream: false,
            options: { temperature: 0.1 }
          }),
          signal: ctrl.signal
        });
        clearTimeout(tid);

        if (res.ok) {
          const data = await res.json();
          const raw = ((data.message && data.message.content) || data.response || '').trim();
          const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/\{[\s\S]*"action"[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const act = JSON.parse(jsonMatch[1] || jsonMatch[0]);
              // Validasi dan normalisasi amount dari AI jika string
              if (act.parameters && act.parameters.amount) {
                let a = act.parameters.amount;
                if (typeof a === 'string') {
                  const m = a.match(/(\d+[\d.,]*)\s*(rb|k|ribu|jt|juta)?/i);
                  if (m) {
                    let num = parseFloat(m[1].replace(/\./g, '').replace(/,/g, '.')) || 0;
                    const u = (m[2] || '').toLowerCase();
                    if (u === 'rb' || u === 'k' || u === 'ribu') num *= 1000;
                    else if (u === 'jt' || u === 'juta') num *= 1000000;
                    act.parameters.amount = Math.round(num);
                  } else {
                    act.parameters.amount = parseFloat(a.replace(/[^0-9]/g, '')) || 0;
                  }
                }
              }
              if (this.executeAiAction(act)) {
                if (window.Router && Router.current) Router.navigate(Router.current);
                return act.user_feedback || 'Transaksi berhasil dicatat ke DuoWallet!';
              }
            } catch (err) {}
          }
          if (raw) return raw;
        }
      } catch (e) {
        // Fallback offline jika Ollama offline / timeout
      }

      // 2. Offline Rule-Based Action Matcher (CRISP-DM Graceful Degradation)
      const isExpenseIntent = /(beli|jajan|bayar|pesen|makan|checkout|order|ngopi|tumbas)/i.test(q);
      const isCollabIntent = /(split|patungan|sama dimas|bareng dimas|kas bersama|bagi dua|50:50|50\/50)/i.test(q);
      const isIncomeIntent = /(gaji|masuk saldo|terima|dapet uang|freelance|bonus)/i.test(q);

      // Ekstraksi nominal (contoh: 25rb, 25k, 25.000, 25000, 1.5jt)
      let parsedAmount = 0;
      const nominalMatch = q.match(/(\d+[\d.,]*)\s*(rb|ribu|k|jt|juta|m)?\b/i);
      if (nominalMatch) {
        let numStr = nominalMatch[1].replace(/\./g, '').replace(/,/g, '.');
        let baseNum = parseFloat(numStr) || 0;
        const unit = (nominalMatch[2] || '').toLowerCase();
        if (unit === 'rb' || unit === 'ribu' || unit === 'k') {
          baseNum = baseNum * 1000;
        } else if (unit === 'jt' || unit === 'juta' || unit === 'm') {
          baseNum = baseNum * 1000000;
        }
        parsedAmount = Math.round(baseNum);
      }

      // Ekstraksi Dompet
      let targetWallet = 'w_gopay';
      if (/bca|debit|bank/i.test(q)) targetWallet = 'w_bca';
      else if (/tunai|cash|dompet fisik/i.test(q)) targetWallet = 'w_cash';
      else if (/joint|kas bersama|rekening bersama/i.test(q)) targetWallet = 'w_joint_bca';

      // Ekstraksi Merchant / Keterangan Belanja
      let merchantName = 'Pengeluaran';
      const cleanMerch = userQuery
        .replace(/^(tadi|barusan|tolong|coba|mohon)?\s*(beli|jajan|bayar|pesen|makan|ngopi|order)\s+/i, '')
        .replace(/\s+(sebesar|senilai)?\s*\d+.*$/i, '')
        .replace(/\s+(pake|pakai|via|lewat|dari)\s+.*$/i, '')
        .trim();
      if (cleanMerch && cleanMerch.length > 1) {
        merchantName = cleanMerch.charAt(0).toUpperCase() + cleanMerch.slice(1);
      } else {
        merchantName = 'Belanja Harian';
      }

      // Eksekusi mutasi jika intent pengeluaran terdeteksi
      if (parsedAmount > 0 && (isExpenseIntent || isCollabIntent)) {
        if (isCollabIntent) {
          const collabAct = {
            action: 'record_collab_expense',
            parameters: {
              merchant: merchantName,
              amount: parsedAmount,
              category: 'Food & Drinks',
              wallet_id: targetWallet,
              split_type: '50:50',
              paid_by: 'Rina'
            },
            user_feedback: `Transaksi patungan ${merchantName} sebesar ${formatMoney(parsedAmount)} berhasil dicatat (split 50:50 dengan Dimas).`
          };
          if (this.executeAiAction(collabAct)) {
            if (window.Router && Router.current) Router.navigate(Router.current);
            return collabAct.user_feedback;
          }
        } else {
          let category = 'Food & Drinks';
          if (/grab|gojek|ojol|bensin|parkir|tol/i.test(q)) category = 'Transport';
          else if (/superindo|indomaret|alfamart|sayur|pasar|sembako/i.test(q)) category = 'Groceries';
          else if (/listrik|pln|wifi|indihome|pulsa|paket data/i.test(q)) category = 'Bills';
          else if (/baju|sepatu|uniqlo|shopee|tokopedia/i.test(q)) category = 'Shopping';
          else if (/obat|apotek|dokter|klinik/i.test(q)) category = 'Health';

          const txAct = {
            action: 'record_transaction',
            parameters: {
              merchant: merchantName,
              amount: parsedAmount,
              category: category,
              wallet_id: targetWallet,
              shared: false
            },
            user_feedback: `Transaksi ${merchantName} senilai ${formatMoney(parsedAmount)} berhasil dicatat ke ${targetWallet === 'w_gopay' ? 'GoPay' : targetWallet === 'w_bca' ? 'BCA' : 'Cash'}!`
          };
          if (this.executeAiAction(txAct)) {
            if (window.Router && Router.current) Router.navigate(Router.current);
            return txAct.user_feedback;
          }
        }
      }

      // Eksekusi pemasukan
      if (parsedAmount > 0 && isIncomeIntent) {
        const incAct = {
          action: 'record_income',
          parameters: {
            source: merchantName !== 'Belanja Harian' ? merchantName : 'Pemasukan',
            amount: parsedAmount,
            wallet_id: targetWallet
          },
          user_feedback: `Pemasukan sebesar ${formatMoney(parsedAmount)} berhasil ditambahkan ke saldo!`
        };
        if (this.executeAiAction(incAct)) {
          if (window.Router && Router.current) Router.navigate(Router.current);
          return incAct.user_feedback;
        }
      }

      if (q.includes('dimas') || q.includes('hutang') || q.includes('sambetan') || q.includes('debt') || q.includes('settle') || q.includes('tagih')) {
        if (debt > 0) {
          if (isSu) return `Dimas ayeuna gaduh sambetan **${formatMoney(debt)}** tina transaksi split 50/50. Buka tab Babarengan teras toél **Beresihan Hutang**!`;
          return isId 
            ? `Dimas saat ini berhutang **${formatMoney(debt)}** dari transaksi split 50/50. Buka tab Collab lalu ketuk **Settle Up** untuk menagih!`
            : `Dimas currently owes you **${formatMoney(debt)}** across split expenses. Tap **Settle Up** in Collab tab!`;
        } else {
          if (isSu) return `Sadayana sambetan sareng Dimas parantos lunas! Kas babarengan saimbang.`;
          return isId ? `Semua hutang dengan Dimas sudah lunas! Kas bersama seimbang.` : `All balances with Dimas are fully settled!`;
        }
      }

      if (q.includes('target') || q.includes('goal') || q.includes('udagan') || q.includes('bali') || q.includes('liburan') || q.includes('trip')) {
        const pct = Math.round((baliGoal.saved / baliGoal.target) * 100);
        if (isSu) return `Target **${baliGoal.name}** parantos kahontal **${pct}%** (${formatMoney(baliGoal.saved)} tina ${formatMoney(baliGoal.target)}). Tinggal ${formatMoney(baliGoal.target - baliGoal.saved)} deui. Upami anjeun duaan nyimpen Rp 400.000/minggu, target kahontal dina 4 minggu!`;
        return isId
          ? `Target **${baliGoal.name}** telah tercapai **${pct}%** (${formatMoney(baliGoal.saved)} dari ${formatMoney(baliGoal.target)}). Sisa ${formatMoney(baliGoal.target - baliGoal.saved)} lagi. Jika kalian menabung Rp 400.000/minggu, target tercapai dalam 4 minggu!`
          : `Your **${baliGoal.name}** goal is at **${pct}%** (${formatMoney(baliGoal.saved)} of ${formatMoney(baliGoal.target)}). Only ${formatMoney(baliGoal.target - baliGoal.saved)} remaining!`;
      }

      if (q.includes('kopi') || q.includes('jajan') || q.includes('spend') || q.includes('belanja') || q.includes('balanja') || q.includes('coffee') || q.includes('aman')) {
        const safeDaily = DuoState.getSafeToSpendDaily();
        if (isSu) {
          return `Status anggaran dinten ieu: Kuota **Aman Dibalanwakeun** aya dina angka **${formatMoney(safeDaily)}/dinten**. Pangaluaran di handapeun nominal ieu aman tina defisit sasihan.`;
        }
        return isId
          ? `Status anggaran harianmu: Kuota **Safe to Spend** saat ini berada di angka **${formatMoney(safeDaily)}/hari**. Pengeluaran di bawah nominal ini aman dari defisit anggaran bulanan.`
          : `Your daily spending status: Current **Safe to Spend** quota is **${formatMoney(safeDaily)}/day**. Expenses below this remain completely within your monthly plan.`;
      }

      if (q.includes('tips') || q.includes('hemat') || q.includes('nyimpen') || q.includes('save') || q.includes('saving')) {
        const debtText = debt > 0 
          ? (isSu ? `Taros pelunasan ${formatMoney(debt)} ka Dimas.` : (isId ? `Tagih pelunasan ${formatMoney(debt)} dari Dimas.` : `Collect ${formatMoney(debt)} pending from Dimas.`))
          : (isSu ? `Roris pencatatan kas babarengan sacara rutin.` : (isId ? `Pertahankan pencatatan kas bersama secara teratur.` : `Keep logging your joint expenses regularly.`));
        if (isSu) {
          return `💡 **Tips Kauangan DuoAI:**\\n1. Pantau kuota Aman Dibalanwakeun sadinten (${formatMoney(DuoState.getSafeToSpendDaily())}/dinten).\\n2. ${debtText}\\n3. Alokasikeun langkungna saldo kana Pos Tabungan Darurat.`;
        }
        return isId
          ? `💡 **Tips Finansial DuoAI:**\\n1. Pantau kuota Safe to Spend harian (${formatMoney(DuoState.getSafeToSpendDaily())}/hari).\\n2. ${debtText}\\n3. Alokasikan saldo berlebih ke Kantong Tabungan Darurat.`
          : `💡 **DuoAI Smart Tips:**\\n1. Monitor your daily Safe to Spend allowance (${formatMoney(DuoState.getSafeToSpendDaily())}/day).\\n2. ${debtText}\\n3. Allocate surplus funds to your emergency buffer vault.`;
      }

      if (q.includes('saldo') || q.includes('balance') || q.includes('uang') || q.includes('artos') || q.includes('dompet') || q.includes('wallet')) {
        if (isSu) {
          return `Ringkesan Kauangan:\\n• Saldo Pribadi: **${formatMoney(pBal)}**\\n• Saldo Babarengan: **${formatMoney(cBal)}**\\n• Total Aset: **${formatMoney(pBal + cBal)}**\\nSkor kasehatan kauangan: **86/100 (Sae Pisan)**!`;
        }
        return isId
          ? `Ringkasan Finansial:\\n• Saldo Pribadi: **${formatMoney(pBal)}**\\n• Saldo Bersama: **${formatMoney(cBal)}**\\n• Total Aset: **${formatMoney(pBal + cBal)}**\\nSkor kesehatan finansial: **86/100 (Sangat Baik)**!`
          : `Financial Summary:\\n• Personal Balance: **${formatMoney(pBal)}**\\n• Collab Pool: **${formatMoney(cBal)}**\\n• Total Assets: **${formatMoney(pBal + cBal)}**\\nHealth score: **86/100 (Healthy)**!`;
      }

      if (/^(halo|hai|hi|hey|assalamu|pagi|siang|sore|malam)/i.test(q)) {
        if (isSu) return `Sampurasun! Abdi DuoAI Copilot, asisten keuangan pribadi anjeun. Aya anu tiasa dibantos?`;
        return isId
          ? `Halo! Saya DuoAI Copilot, asisten cerdas DuoWallet. Ada yang bisa saya bantu hari ini?`
          : `Hello! I am DuoAI Copilot, your personal assistant. How can I assist you today?`;
      }

      if (ragContext) {
        if (isAppOnly && (q.includes('krs') || q.includes('cuti') || q.includes('presiden') || q.includes('kampus'))) {
          return 'Maaf, saat ini saya berada dalam Mode Khusus DuoWallet, sehingga hanya dapat melayani pengelolaan keuangan dan fitur aplikasi DuoWallet. Silakan alihkan ke Mode Full Knowledge Base jika ingin menanyakan dokumen lainnya.';
        }
        // Jika model Ollama lambat/offline namun RAG OpenSearch berhasil menemukan konteks
        const firstBlock = ragContext.split('---')[0].trim();
        return firstBlock || ragContext;
      }

      if (isSu) {
        return `Abdi DuoAI Copilot. Mangga taroskeun perkawis anggaran, transaksi, SOP cuti akademik, pendaftaran KRS, atanapi tips kauangan!`;
      }
      return isId
        ? `Saya DuoAI Copilot. Silakan tanyakan seputar anggaran, transaksi, SOP cuti akademik, pendaftaran KRS, atau riwayat presiden!`
        : `I am DuoAI Copilot. Feel free to ask about budgets, transactions, academic SOPs, or Indonesian presidents!`;
    }
  };

  // App Boot Lifecycle
  window.addEventListener('DOMContentLoaded', () => {
    if (window.DuoState && window.DuoState.initPersistence) {
      window.DuoState.initPersistence();
    }
    if (window.LayoutManager) {
      LayoutManager.init();
    } else if (window.UI) {
      window.UI.applyViewMode();
    }
    if (window.UI) {
      window.UI.applyLanguage();
    }

    // Keyboard ESC listener for modals, overlays, and AI panel
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DuoState.activeDialog) Router.closeDialog();
        else if (DuoState.activeOverlay) Router.closeOverlay();
        else if (DuoState.isAiOpen) {
          if (LayoutManager && LayoutManager.isDesktop()) DesktopShell.toggleAi();
          else UI.closeAiChat();
        }
      }
    });

    const splashDuration = 1200;
    Router.navigate('S01');

    window.setTimeout(() => {
      const activeUser = window.DuoAuth ? DuoAuth.getCurrentUser() : null;
      if (!activeUser) {
        Router.navigate('S04');
      } else if (['super_admin', 'admin_finance', 'admin_ai'].includes(activeUser.role)) {
        Router.navigate('S46');
      } else {
        Router.navigate('S12');
      }
    }, splashDuration);
  });

})();