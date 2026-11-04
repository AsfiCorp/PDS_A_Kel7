// DuoWallet Layout Manager & Navigation Map
(() => {
  const desktopQuery = window.matchMedia('(min-width: 1024px)');

  window.NavigationMap = {
    personal: {
      dashboard: 'S12',
      activity: 'S13',
      filter: 'S14',
      addTx: 'S15',
      addIncome: 'S16',
      detailTx: 'S17',
      editTx: 'S18',
      budgets: 'S19',
      newBudget: 'S20',
      detailBudget: 'S21',
      goals: 'S22',
      newGoal: 'S23',
      detailGoal: 'S24',
      bills: 'S25',
      wallets: 'S34',
      detailWallet: 'S35',
      newWallet: 'S36',
      networth: 'S37',
      health: 'S38',
      settings: 'S40',
      privacy: 'S41',
      export: 'S42',
      safeSpend: 'S43',
      notifications: 'S44'
    },
    collab: {
      dashboard: 'S26',
      activity: 'S27',
      addExpense: 'S28',
      deposit: 'S29',
      settleUp: 'S30',
      budgets: 'S31',
      goals: 'S32',
      auditTrail: 'S33',
      settings: 'S39'
    }
  };

  window.LayoutManager = {
    userManualMode: null, // 'desktop' | 'mobile' | null (null = auto from media query)

    isDesktop() {
      if (this.userManualMode) return this.userManualMode === 'desktop';
      return desktopQuery.matches;
    },

    getLayoutMode() {
      return this.isDesktop() ? 'desktop' : 'mobile';
    },

    setManualMode(mode) {
      this.userManualMode = mode;
      DuoState.viewMode = mode;
      this.applyLayout();
    },

    toggleMode() {
      const next = this.isDesktop() ? 'mobile' : 'desktop';
      this.setManualMode(next);
      return next;
    },

    init() {
      desktopQuery.addEventListener('change', () => {
        if (!this.userManualMode) {
          DuoState.viewMode = desktopQuery.matches ? 'desktop' : 'mobile';
          this.applyLayout();
          if (window.Router) Router.renderApp();
        }
      });
      DuoState.viewMode = this.getLayoutMode();
      this.applyLayout();
    },

    applyLayout() {
      const isDesk = this.isDesktop();
      const body = document.body;
      const mobileFrame = document.getElementById('prototype-frame');
      const desktopShell = document.getElementById('desktop-app-shell');
      const icon = document.getElementById('icon-view-mode');
      const lbl = document.getElementById('lbl-view-mode');
      const isId = DuoState.lang === 'id';
      const currentUser = window.DuoAuth ? DuoAuth.getCurrentUser() : null;

      // Desktop shell hanya diizinkan untuk pengguna yang sudah terautentikasi
      if (isDesk && currentUser) {
        body.classList.add('mode-desktop');
        body.classList.remove('mode-mobile');
        if (mobileFrame) mobileFrame.style.display = 'none';
        if (desktopShell) desktopShell.style.display = 'grid';
        if (icon) icon.textContent = 'smartphone';
        if (lbl) lbl.textContent = window.t ? window.t('mobileMode') : (isId ? 'Tampilan Mobile' : 'Mobile View');
        if (window.DesktopShell) DesktopShell.sync();
      } else {
        body.classList.remove('mode-desktop');
        body.classList.add('mode-mobile');
        if (mobileFrame) {
          mobileFrame.style.display = '';
          if (isDesk && !currentUser) {
            mobileFrame.classList.add('desktop-mode');
          } else {
            mobileFrame.classList.remove('desktop-mode');
          }
        }
        if (desktopShell) desktopShell.style.display = 'none';
        if (icon) icon.textContent = isDesk ? 'smartphone' : 'desktop_windows';
        if (lbl) lbl.textContent = window.t ? (isDesk ? window.t('mobileMode') : window.t('desktopMode')) : (isDesk ? (isId ? 'Tampilan Mobile' : 'Mobile View') : (isId ? 'Tampilan Desktop' : 'Desktop View'));
      }
    }
  };
})();
