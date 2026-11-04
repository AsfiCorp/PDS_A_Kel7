// Screens: S01 to S11 (Splash, Onboarding, Auth, Pairing)
window.Screens = window.Screens || {};

Screens.renderS01 = function() {
  return `
    <div class="splash" aria-labelledby="brand-name">
      <div class="brand-lockup">
        <div class="duo-mark" aria-hidden="true">
          <span class="ring ring--rina"></span>
          <span class="ring ring--dimas"></span>
          <span class="ring-overlap"></span>
        </div>
        <h1 id="brand-name">DuoWallet</h1>
        <p>Your money. Together when you choose.</p>
      </div>
      <div class="loading" role="status" aria-live="polite">
        <span class="loading__dot"></span>
        <span class="loading__dot"></span>
        <span class="loading__dot"></span>
      </div>
    </div>
  `;
};

Screens.renderS02 = function() {
  return `
    <div class="screen onboarding">
      <div class="onboarding__header">
        <div class="onboarding__dots">
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <button class="btn-text" onclick="Router.navigate('S04')">Skip</button>
      </div>
      <div class="onboarding__body">
        <div class="hero-illustration">
          <div class="duo-mark large">
            <span class="ring ring--rina"></span>
            <span class="ring ring--dimas"></span>
            <span class="ring-overlap"></span>
          </div>
        </div>
        <h2>Your Money, Together When You Choose</h2>
        <p>Manage your personal finances privately, and share only what you decide with your partner.</p>
      </div>
      <div class="onboarding__footer">
        <button class="btn btn-primary" onclick="Router.navigate('S03')">Next</button>
      </div>
    </div>
  `;
};

Screens.renderS03 = function() {
  return `
    <div class="screen onboarding">
      <div class="onboarding__header">
        <div class="onboarding__dots">
          <span class="dot"></span>
          <span class="dot active"></span>
          <span class="dot"></span>
        </div>
        <button class="btn-text" onclick="Router.navigate('S04')">Skip</button>
      </div>
      <div class="onboarding__body">
        <div class="cards-preview">
          <div class="card card--personal-preview">
            <span class="badge badge-personal">Personal</span>
            <p class="card-title">100% Private to you</p>
            <p class="card-desc">Wallets, safe-to-spend, transactions.</p>
          </div>
          <div class="card card--collab-preview">
            <span class="badge badge-collab">Collab</span>
            <p class="card-title">Shared with Partner</p>
            <p class="card-desc">Joint pool, split expenses, shared bills.</p>
          </div>
        </div>
        <h2>Two Spaces, Zero Leaks</h2>
        <p>Your partner never sees your personal balance or unshared wallets. You stay in full control.</p>
      </div>
      <div class="onboarding__footer">
        <button class="btn btn-primary" onclick="Router.navigate('S04')">Get Started</button>
      </div>
    </div>
  `;
};

Screens.renderS04 = function() {
  const site = (DuoState.data && DuoState.data.siteConfig) || { appName: 'DuoWallet', tagline: 'Your money. Together when you choose.' };
  return `
    <div class="screen auth-screen">
      <div class="auth-header">
        <div class="duo-mark">
          <span class="ring ring--rina"></span>
          <span class="ring ring--dimas"></span>
          <span class="ring-overlap"></span>
        </div>
        <h2>Welcome to ${Security.escapeHtml(site.appName || 'DuoWallet')}</h2>
        <p class="subtitle">${Security.escapeHtml(site.tagline || 'Select your entry point')}</p>
      </div>
      <div class="auth-buttons">
        <button class="btn btn-primary" onclick="Router.navigate('S07')">
          <span class="material-symbols-rounded">login</span> Log In
        </button>
        <button class="btn btn-secondary" onclick="Router.navigate('S05')">
          <span class="material-symbols-rounded">person_add</span> Create New Account
        </button>
        <button class="btn btn-outline" onclick="UI.loginWithGoogle()">
          <svg style="width:18px;height:18px;margin-right:6px;" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
      <p class="privacy-note"><span class="material-symbols-rounded">lock</span> End-to-end encrypted ledger model</p>
    </div>
  `;
};

Screens.renderS05 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.navigate('S04')"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Create Account</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <label class="form-group">
          <span>Full Name</span>
          <input type="text" id="signup-name" placeholder="Nama lengkap Anda" value="" />
        </label>
        <label class="form-group">
          <span>Email Address</span>
          <input type="email" id="signup-email" placeholder="nama@email.com" value="" />
        </label>
        <label class="form-group">
          <span>Password</span>
          <input type="password" id="signup-password" placeholder="Minimal 6 karakter" value="" />
        </label>
        <button class="btn btn-primary mt-4" onclick="UI.handleSignUpSubmit()">Create Account & Sign In</button>
        <div class="text-center mt-3">
          <button class="btn-text" onclick="Router.navigate('S07')">Sudah punya akun? Masuk</button>
        </div>
      </div>
    </div>
  `;
};

Screens.renderS06 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Your Profile</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body text-center">
        <div class="avatar-picker">
          <div class="avatar-large" style="background-color: #6366F1;">R</div>
        </div>
        <p class="avatar-label mt-2"><strong>Rina</strong> (Indigo Theme)</p>
        <div class="card text-left mt-4">
          <h4>Default Currency</h4>
          <p class="text-sm text-secondary">Indonesian Rupiah (IDR - Rp)</p>
        </div>
        <button class="btn btn-primary mt-6" onclick="Router.navigate('S10')">Complete Setup</button>
      </div>
    </div>
  `;
};

Screens.renderS07 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.navigate('S04')"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Masuk ke DuoWallet</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <!-- Quick Select Demo / Dummy Accounts -->
        <div class="card mb-4" style="background:var(--color-surface);border:1px solid var(--color-border);padding:12px;border-radius:12px;">
          <div class="text-xs text-secondary mb-2" style="font-weight:600;display:flex;align-items:center;gap:4px;">
            <span class="material-symbols-rounded" style="font-size:16px;">key</span>
            AKUN DEMO TERSEDIA (KLIK UNTUK ISI CEPAT):
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            <button type="button" class="badge" style="cursor:pointer;border:1px solid #6366F1;background:#EEF2FF;color:#4338CA;padding:5px 8px;border-radius:6px;font-size:11px;" onclick="UI.fillDummyLogin('rina@example.com','password123')">
              👤 Rina (User Utama)
            </button>
            <button type="button" class="badge" style="cursor:pointer;border:1px solid #F97316;background:#FFF7ED;color:#C2410C;padding:5px 8px;border-radius:6px;font-size:11px;" onclick="UI.fillDummyLogin('dimas@example.com','password123')">
              👥 Dimas (Pasangan)
            </button>
            <button type="button" class="badge" style="cursor:pointer;border:1px solid #DC2626;background:#FEF2F2;color:#B91C1C;padding:5px 8px;border-radius:6px;font-size:11px;" onclick="UI.fillDummyLogin('admin@duowallet.com','admin123')">
              👑 Super Admin (Full Akses)
            </button>
            <button type="button" class="badge" style="cursor:pointer;border:1px solid #059669;background:#ECFDF5;color:#047857;padding:5px 8px;border-radius:6px;font-size:11px;" onclick="UI.fillDummyLogin('admin.finance@duowallet.com','admin123')">
              💰 Admin Keuangan (Fitur A)
            </button>
            <button type="button" class="badge" style="cursor:pointer;border:1px solid #7C3AED;background:#F5F3FF;color:#6D28D9;padding:5px 8px;border-radius:6px;font-size:11px;" onclick="UI.fillDummyLogin('admin.ai@duowallet.com','admin123')">
              🤖 Admin AI Copilot (Fitur B)
            </button>
          </div>
        </div>

        <form onsubmit="event.preventDefault(); UI.handleLoginSubmit();">
          <label class="form-group">
            <span>Email Terdaftar</span>
            <input type="email" id="login-email" placeholder="nama@domain.com" value="rina@example.com" required />
          </label>
          <label class="form-group">
            <span>Kata Sandi</span>
            <input type="password" id="login-password" placeholder="••••••••" value="password123" required />
          </label>
          
          <div class="flex items-center justify-between mt-2 mb-4">
            <span class="text-xs text-secondary">Akses Terproteksi</span>
            <button type="button" class="btn-text text-xs" style="color:var(--color-primary);font-weight:600;" onclick="Router.openDialog('D25')">
              Lupa Password?
            </button>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;">
            <span class="material-symbols-rounded">login</span> Masuk Sekarang
          </button>
        </form>

        <div class="mt-4 text-center">
          <div class="text-xs text-secondary mb-3">— ATAU —</div>
          <button type="button" class="btn btn-outline" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;" onclick="UI.loginWithGoogle()">
            <svg style="width:18px;height:18px;" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Masuk dengan Google
          </button>
          
          <div class="mt-4">
            <button type="button" class="btn-text" onclick="Router.navigate('S05')">
              Belum punya akun? <strong style="color:var(--color-primary)">Daftar Baru</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};

Screens.renderS08 = function() {
  return `
    <div class="screen form-screen text-center">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Join Partner</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <span class="material-symbols-rounded feature-icon">group_add</span>
        <h4>Enter Invite Code</h4>
        <p class="text-sm text-secondary">Ask your partner for their 6-character Duo code.</p>
        <input type="text" class="invite-code-input mt-3" value="K7M2QX" maxlength="6" />
        <button class="btn btn-primary mt-6" onclick="Router.navigate('S09')">Find Collab Space</button>
      </div>
    </div>
  `;
};

Screens.renderS09 = function() {
  return `
    <div class="screen form-screen text-center">
      <div class="screen-header">
        <button class="icon-btn" onclick="Router.back()"><span class="material-symbols-rounded">arrow_back</span></button>
        <h3>Invite Found</h3>
        <div style="width:24px;"></div>
      </div>
      <div class="form-body">
        <div class="card partner-invite-card">
          <div class="avatar-large" style="background:#F97316; margin:0 auto;">D</div>
          <h4 class="mt-2">Dimas's Collab Space</h4>
          <p class="text-sm text-secondary mt-1">Join to share expenses, bills, and budget targets while keeping your personal balances completely private.</p>
        </div>
        <button class="btn btn-primary mt-6" onclick="Router.navigate('S12')">Accept & Connect</button>
      </div>
    </div>
  `;
};

Screens.renderS10 = function() {
  return `
    <div class="screen form-screen">
      <div class="screen-header">
        <h3>Add First Wallet</h3>
        <button class="btn-text" onclick="Router.navigate('S12')">Skip</button>
      </div>
      <div class="form-body">
        <label class="form-group">
          <span>Wallet Name</span>
          <input type="text" value="BCA Primary" />
        </label>
        <label class="form-group">
          <span>Initial Balance (Rp)</span>
          <input type="text" value="4.100.000" />
        </label>
        <button class="btn btn-primary mt-6" onclick="Router.navigate('S11')">Save & Continue</button>
      </div>
    </div>
  `;
};

Screens.renderS11 = function() {
  return `
    <div class="screen form-screen text-center">
      <div class="screen-header">
        <h3>Collab Space</h3>
        <button class="btn-text" onclick="Router.navigate('S12')">Later</button>
      </div>
      <div class="form-body">
        <span class="material-symbols-rounded feature-icon">share</span>
        <h4>Invite your partner</h4>
        <p class="text-sm text-secondary">Share your 6-digit code with Dimas so you can split transactions seamlessly.</p>
        <div class="code-box mt-3">K7M2QX</div>
        <button class="btn btn-primary mt-6" onclick="Router.navigate('S12')">Go to Dashboard</button>
      </div>
    </div>
  `;
};