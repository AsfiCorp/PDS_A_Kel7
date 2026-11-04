// DuoWallet Admin Control Center & Screen S46 (RBAC & Live Customizer)
window.Screens = window.Screens || {};

Screens.renderS46 = function() {
  const user = (window.DuoAuth && DuoAuth.getCurrentUser()) || (DuoState.data && DuoState.data.currentUser) || { role: 'super_admin', name: 'Admin' };
  const role = user.role || 'user';
  
  if (!['super_admin', 'admin_finance', 'admin_ai'].includes(role)) {
    return `
      <div class="screen form-screen">
        <div class="screen-header">
          <button class="icon-btn" onclick="Router.navigate('S12')"><span class="material-symbols-rounded">arrow_back</span></button>
          <h3>Akses Ditolak</h3>
          <div style="width:24px;"></div>
        </div>
        <div class="form-body text-center mt-6">
          <span class="material-symbols-rounded text-danger" style="font-size:56px;">block</span>
          <h4 class="mt-2">Hak Akses Tidak Mencukupi</h4>
          <p class="text-xs text-secondary mt-1">Halaman ini hanya dapat diakses oleh Administrator (Super Admin, Admin Keuangan, atau Admin AI).</p>
          <button class="btn btn-primary mt-4" onclick="Router.navigate('S12')">Kembali ke Dashboard Pengguna</button>
        </div>
      </div>
    `;
  }

  const isSuper = role === 'super_admin';
  const isFinance = role === 'admin_finance' || isSuper;
  const isAiAdmin = role === 'admin_ai' || isSuper;
  const currentTab = DuoState.adminTab || (isSuper ? 'overview' : (isFinance ? 'finance' : 'ai'));
  const site = (DuoState.data && DuoState.data.siteConfig) || {};
  const users = window.DuoAuth ? DuoAuth.getUsers() : [];

  return `
    <div class="screen feed-screen" style="max-width:1000px;margin:0 auto;padding-bottom:80px;">
      <div class="screen-header" style="background:var(--color-surface);border-bottom:1px solid var(--color-border);padding:14px 16px;">
        <div class="flex items-center gap-2">
          <button class="icon-btn" onclick="Router.navigate('S12')" title="Ke Tampilan Pengguna"><span class="material-symbols-rounded">arrow_back</span></button>
          <div>
            <h3 style="margin:0;font-size:17px;display:flex;align-items:center;gap:6px;">
              🛡️ Admin Dashboard
              <span class="badge" style="background:#FEE2E2;color:#B91C1C;font-size:11px;font-weight:700;">${Security.escapeHtml(user.roleLabel || role.toUpperCase())}</span>
            </h3>
            <span class="text-xs text-secondary">Logged in: ${Security.escapeHtml(user.name)} (${Security.escapeHtml(user.email)})</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-xs btn-outline" onclick="UI.exportAdminPdf()" style="display:inline-flex;align-items:center;gap:4px;font-weight:600;">
            <span class="material-symbols-rounded icon-xs">picture_as_pdf</span> Cetak PDF
          </button>
          <button class="btn-xs btn-danger" onclick="UI.logOut()">Keluar</button>
        </div>
      </div>

      <!-- Admin Tabs -->
      <div style="display:flex;gap:4px;padding:8px 16px;background:var(--color-surface);border-bottom:1px solid var(--color-border);overflow-x:auto;">
        ${isSuper ? `
          <button class="btn-xs ${currentTab === 'overview' ? 'btn-primary' : 'btn-outline'}" onclick="DuoState.adminTab='overview';Router.navigate('S46');">
            📊 Overview
          </button>
          <button class="btn-xs ${currentTab === 'ui' ? 'btn-primary' : 'btn-outline'}" onclick="DuoState.adminTab='ui';Router.navigate('S46');">
            🎨 UI Website Mod
          </button>
          <button class="btn-xs ${currentTab === 'users' ? 'btn-primary' : 'btn-outline'}" onclick="DuoState.adminTab='users';Router.navigate('S46');">
            👥 Pengguna & RBAC
          </button>
        ` : ''}
        ${isFinance ? `
          <button class="btn-xs ${currentTab === 'finance' ? 'btn-primary' : 'btn-outline'}" onclick="DuoState.adminTab='finance';Router.navigate('S46');">
            💰 Audit Keuangan (Fitur A)
          </button>
        ` : ''}
        ${isAiAdmin ? `
          <button class="btn-xs ${currentTab === 'ai' ? 'btn-primary' : 'btn-outline'}" onclick="DuoState.adminTab='ai';Router.navigate('S46');">
            🤖 DuoAI Copilot (Fitur B)
          </button>
        ` : ''}
      </div>
      </div>

      <div class="feed-body p-4" id="admin-panel-content">
        ${window.renderAdminTab ? window.renderAdminTab(currentTab, { user, role, isSuper, isFinance, isAiAdmin, site, users }) : ''}
      </div>
    </div>
  `;
};
window.renderAdminTab = function(tab, ctx) {
  if (tab === 'overview' && ctx.isSuper) {
    const txTotal = (DuoState.data.transactions || []).length;
    const pBal = DuoState.getPersonalBalance();
    const cBal = DuoState.getCollabBalance();
    const endpoint = localStorage.getItem('duoai_endpoint') || 'https://hughes-immunology-attached-penn.trycloudflare.com';
    return `
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;margin-bottom:16px;">
        <div class="card p-3">
          <div class="text-xs text-secondary font-semibold">TOTAL PENGGUNA TERDAFTAR</div>
          <div class="text-xl font-bold mt-1 text-indigo">${ctx.users.length} Akun</div>
          <span class="text-xs text-secondary">Super Admin, Fitur A, Fitur B, Regular</span>
        </div>
        <div class="card p-3">
          <div class="text-xs text-secondary font-semibold">TOTAL TRANSAKSI SISTEM</div>
          <div class="text-xl font-bold mt-1 text-teal">${txTotal} Entri</div>
          <span class="text-xs text-secondary">Ledger tersinkronisasi</span>
        </div>
        <div class="card p-3">
          <div class="text-xs text-secondary font-semibold">TOTAL LIKUIDITAS TERSIMPAN</div>
          <div class="text-xl font-bold mt-1 text-purple">${formatMoney(pBal + cBal)}</div>
          <span class="text-xs text-secondary">Pribadi: ${formatMoney(pBal)} | Bersama: ${formatMoney(cBal)}</span>
        </div>
        <div class="card p-3">
          <div class="text-xs text-secondary font-semibold">AI COPILOT RUNTIME</div>
          <div class="text-sm font-bold mt-1 text-emerald" style="word-break:break-all;">ONLINE (Cloudflare)</div>
          <span class="text-xs text-secondary">${Security.escapeHtml(endpoint)}</span>
        </div>
      </div>
      <div class="card p-4 mb-4">
        <h4 style="margin:0 0 8px 0;">Hierarki Hak Akses Administrator (RBAC Matrix)</h4>
        <div style="display:grid;gap:8px;">
          <div class="p-2" style="background:var(--color-surface);border-left:4px solid #DC2626;border-radius:4px;">
            <strong>👑 Super Admin</strong>: Akses 100% sistem, live UI website mod, manajemen akun, AI endpoint, audit keuangan, & cetak PDF.
          </div>
          <div class="p-2" style="background:var(--color-surface);border-left:4px solid #059669;border-radius:4px;">
            <strong>💰 Admin Fitur A (Keuangan)</strong>: Khusus audit mutasi keuangan, dompet pribadi & bersama, saldo likuiditas, dan ekspor laporan PDF.
          </div>
          <div class="p-2" style="background:var(--color-surface);border-left:4px solid #7C3AED;border-radius:4px;">
            <strong>🤖 Admin Fitur B (Copilot & AI)</strong>: Khusus konfigurasi Cloudflare tunnel Ollama, inferensi prompt, dan isolasi privasi.
          </div>
        </div>
      </div>
    `;
  }
  if (tab === 'ui' && ctx.isSuper) {
    const s = ctx.site || {};
    return `
      <div class="card p-4">
        <h4 style="margin:0 0 4px 0;">🎨 Modifikasi Tampilan Website (Live UI Engine)</h4>
        <p class="text-xs text-secondary mb-4">Ubah identitas brand website & modul secara langsung.</p>
        <form onsubmit="event.preventDefault(); UI.handleSaveSiteConfig();" style="display:grid;gap:12px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <label class="form-group">
              <span>Nama Brand / Aplikasi</span>
              <input type="text" id="cfg-app-name" value="${Security.escapeHtml(s.appName || 'DuoWallet')}" />
            </label>
            <label class="form-group">
              <span>Tagline / Slogan</span>
              <input type="text" id="cfg-tagline" value="${Security.escapeHtml(s.tagline || 'Your money. Together when you choose.')}" />
            </label>
          </div>
          <label class="form-group">
            <span>Banner Pengumuman (Global Announcement)</span>
            <input type="text" id="cfg-announcement" placeholder="Contoh: Pemeliharaan server pukul 00:00 WIB" value="${Security.escapeHtml(s.announcement || '')}" />
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <label class="form-group">
              <span>Warna Utama (Primary Color)</span>
              <input type="color" id="cfg-primary-color" value="${s.primaryColor || '#6366F1'}" style="height:40px;cursor:pointer;" />
            </label>
            <label class="form-group">
              <span>Warna Aksen (Accent Color)</span>
              <input type="color" id="cfg-accent-color" value="${s.accentColor || '#10B981'}" style="height:40px;cursor:pointer;" />
            </label>
          </div>
          <div class="flex gap-2 mt-3">
            <button type="submit" class="btn btn-primary"><span class="material-symbols-rounded">save</span> Terapkan Perubahan UI</button>
            <button type="button" class="btn btn-outline" onclick="UI.resetSiteConfig()">Kembalikan Default</button>
          </div>
        </form>
      </div>
    `;
  }
  return window.renderAdminTabPart2 ? window.renderAdminTabPart2(tab, ctx) : '';
};

window.renderAdminTabPart2 = function(tab, ctx) {
  if (tab === 'users' && ctx.isSuper) {
    return `
      <div class="card p-4">
        <h4 style="margin:0 0 8px 0;">👥 Manajemen Pengguna & Kredensial Demo</h4>
        <div style="overflow-x:auto;">
          <table style="width:100%;font-size:12px;border-collapse:collapse;text-align:left;">
            <thead>
              <tr style="border-bottom:2px solid var(--color-border);background:var(--color-surface);">
                <th style="padding:8px;">Nama Akun</th>
                <th style="padding:8px;">Email Terdaftar</th>
                <th style="padding:8px;">Password Dummy</th>
                <th style="padding:8px;">Role Akses</th>
                <th style="padding:8px;text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${ctx.users.map(u => `
                <tr style="border-bottom:1px solid var(--color-border);">
                  <td style="padding:8px;font-weight:600;">${Security.escapeHtml(u.name)}</td>
                  <td style="padding:8px;font-family:monospace;">${Security.escapeHtml(u.email)}</td>
                  <td style="padding:8px;font-family:monospace;color:var(--color-secondary);">${Security.escapeHtml(u.password || '••••••••')}</td>
                  <td style="padding:8px;">
                    <span class="badge" style="font-size:10px;padding:3px 6px;border-radius:4px;background:#EEF2FF;color:#4338CA;">
                      ${Security.escapeHtml(u.roleLabel || u.role)}
                    </span>
                  </td>
                  <td style="padding:8px;text-align:right;">
                    <button class="btn-xs btn-outline" onclick="UI.quickSwitchUser('${u.id}')">Beralih Akun</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'finance' && ctx.isFinance) {
    const txs = DuoState.data.transactions || [];
    return `
      <div class="card p-4">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h4 style="margin:0;">💰 Audit Finansial & Transaksi (Fitur A)</h4>
            <p class="text-xs text-secondary mt-1">Audit mutasi rekening pribadi dan split bill bersama.</p>
          </div>
          <button class="btn-xs btn-primary" onclick="UI.exportAdminPdf()">
            <span class="material-symbols-rounded icon-xs">picture_as_pdf</span> Cetak PDF
          </button>
        </div>
        <div style="overflow-x:auto;">
          <table style="width:100%;font-size:12px;border-collapse:collapse;text-align:left;">
            <thead>
              <tr style="border-bottom:2px solid var(--color-border);background:var(--color-surface);">
                <th style="padding:8px;">Tanggal</th>
                <th style="padding:8px;">Keterangan</th>
                <th style="padding:8px;">Kategori</th>
                <th style="padding:8px;">Scope</th>
                <th style="padding:8px;text-align:right;">Nominal</th>
              </tr>
            </thead>
            <tbody>
              ${txs.slice(0, 15).map(tx => `
                <tr style="border-bottom:1px solid var(--color-border);">
                  <td style="padding:8px;color:var(--color-secondary);">${Security.escapeHtml(tx.date || tx.displayTime || '')}</td>
                  <td style="padding:8px;font-weight:600;">${Security.escapeHtml(tx.merchant || tx.title || 'Transaksi')}</td>
                  <td style="padding:8px;">${Security.escapeHtml(tx.category || '-')}</td>
                  <td style="padding:8px;">
                    <span class="badge" style="font-size:10px;padding:2px 6px;border-radius:4px;background:${tx.shared ? '#FFEDD5' : '#E0E7FF'};color:${tx.shared ? '#C2410C' : '#3730A3'};">
                      ${tx.shared ? 'Collab Pool' : 'Personal (Private)'}
                    </span>
                  </td>
                  <td style="padding:8px;text-align:right;font-weight:700;color:${tx.type === 'income' ? '#059669' : '#DC2626'};">
                    ${tx.type === 'income' ? '+' : '−'} ${formatMoney(tx.amount)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return window.renderAdminTabPart3 ? window.renderAdminTabPart3(tab, ctx) : '';
};

window.renderAdminTabPart3 = function(tab, ctx) {
  if (tab === 'ai' && ctx.isAiAdmin) {
    const curEndpoint = localStorage.getItem('duoai_endpoint') || 'https://hughes-immunology-attached-penn.trycloudflare.com';
    return `
      <div class="card p-4">
        <h4 style="margin:0 0 4px 0;">🤖 Konfigurasi DuoAI Copilot (Fitur B)</h4>
        <p class="text-xs text-secondary mb-4">Pengaturan tunnel Cloudflare HTTPS dan isolasi data privasi per-user.</p>
        <form onsubmit="event.preventDefault(); UI.handleSaveAiConfig();" style="display:grid;gap:12px;">
          <label class="form-group">
            <span>Cloudflare HTTPS Tunnel Endpoint</span>
            <input type="text" id="admin-ai-endpoint" value="${Security.escapeHtml(curEndpoint)}" required />
            <span class="text-xs text-secondary mt-1">Default tunnel: <code>https://hughes-immunology-attached-penn.trycloudflare.com</code></span>
          </label>
          <div style="background:var(--color-surface);border:1px solid var(--color-border);padding:12px;border-radius:8px;">
            <div class="text-xs font-semibold text-secondary mb-1">STRICT PRIVACY ISOLATION POLICY:</div>
            <p class="text-xs text-secondary m-0">AI dilarang membocorkan data anggaran akun lain ke user yang tidak berhak. Non-admin dilarang mengubah URL endpoint AI.</p>
          </div>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="btn btn-primary"><span class="material-symbols-rounded">cloud_done</span> Simpan Endpoint</button>
            <button type="button" class="btn btn-outline" onclick="UI.testAiEndpointConnection()"><span class="material-symbols-rounded">wifi</span> Uji Sambungan AI</button>
          </div>
        </form>
      </div>
    `;
  }
  return `<div class="card p-4 text-center text-secondary">Silakan pilih menu tab di atas.</div>`;
};
