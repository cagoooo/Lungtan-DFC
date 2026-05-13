// 版本檢查 + Service Worker 註冊
// 在每個頁面 <body> 結束前載入：<script defer src="version-check.js?v=1.0.0"></script>

(function () {
  const APP_VERSION = '1.0.0';              // ← 部署時由 bump-version.ps1 自動更新
  const CHECK_INTERVAL_MS = 60 * 1000;      // 每 60 秒查一次新版

  // ---------- 1. 註冊 Service Worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('[Version] SW 已註冊，目前版本 v' + APP_VERSION);

        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner('檢測到新版本');
            }
          });
        });

        reg.update();
      }).catch(err => console.warn('[Version] SW 註冊失敗', err));

      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        location.reload();
      });
    });
  }

  // ---------- 2. 每 60 秒輪詢 version.json ----------
  async function pollVersion() {
    try {
      const r = await fetch('./version.json?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      console.log(`[Version] poll: local=${APP_VERSION}, remote=${data.version}`);
      if (data.version && data.version !== APP_VERSION) {
        showUpdateBanner('已發布新版 v' + data.version, data.notes || '');
      }
    } catch (e) {
      console.warn('[Version] poll failed', e);
    }
  }
  setTimeout(pollVersion, 5000);
  setInterval(pollVersion, CHECK_INTERVAL_MS);

  // ---------- 3. 浮動更新提示 ----------
  let bannerShown = false;
  function showUpdateBanner(title, notes) {
    if (bannerShown) return;
    bannerShown = true;
    console.log('[Version] 顯示更新 banner:', title);

    const css = `
      .dfc-update-banner {
        position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
        z-index: 99999; min-width: 280px; max-width: 92vw;
        background: linear-gradient(135deg, #c0392b, #962d22);
        color: #fff; padding: 14px 18px; border-radius: 14px;
        box-shadow: 0 12px 32px rgba(0,0,0,.25);
        font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;
        display: flex; align-items: center; gap: 14px;
        animation: dfc-slide-up .4s cubic-bezier(.4,0,.2,1);
      }
      .dfc-update-banner__icon { font-size: 22px; flex-shrink: 0; }
      .dfc-update-banner__text { font-size: 14px; line-height: 1.4; flex-grow: 1; }
      .dfc-update-banner__title { font-weight: 700; }
      .dfc-update-banner__notes { opacity: .85; font-size: 12px; margin-top: 2px; }
      .dfc-update-banner__btn {
        background: #ffe0a0; color: #962d22; border: 0;
        padding: 8px 16px; border-radius: 8px; font-weight: 700;
        cursor: pointer; font-size: 13px; flex-shrink: 0;
        transition: transform .15s, background .15s;
      }
      .dfc-update-banner__btn:hover { background: #fff; transform: scale(1.05); }
      .dfc-update-banner__close {
        background: transparent; border: 0; color: #fff; cursor: pointer;
        font-size: 18px; opacity: .7; padding: 0 4px; line-height: 1;
      }
      .dfc-update-banner__close:hover { opacity: 1; }
      @keyframes dfc-slide-up {
        from { transform: translate(-50%, 80px); opacity: 0; }
        to   { transform: translate(-50%, 0);     opacity: 1; }
      }
    `;
    if (!document.getElementById('dfc-update-style')) {
      const style = document.createElement('style');
      style.id = 'dfc-update-style';
      style.textContent = css;
      document.head.appendChild(style);
    }

    const bar = document.createElement('div');
    bar.className = 'dfc-update-banner';
    bar.innerHTML = `
      <span class="dfc-update-banner__icon">🚀</span>
      <div class="dfc-update-banner__text">
        <div class="dfc-update-banner__title">${title}</div>
        ${notes ? `<div class="dfc-update-banner__notes">${notes}</div>` : ''}
      </div>
      <button class="dfc-update-banner__btn">立刻更新</button>
      <button class="dfc-update-banner__close" title="稍後">×</button>
    `;
    document.body.appendChild(bar);

    bar.querySelector('.dfc-update-banner__btn').addEventListener('click', async () => {
      try {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            return; // controllerchange 會自動 reload
          }
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        location.reload();
      } catch (e) {
        location.reload();
      }
    });
    bar.querySelector('.dfc-update-banner__close').addEventListener('click', () => {
      bar.remove();
      bannerShown = false;
    });
  }

  // ---------- 4. 右下角小版本號 ----------
  window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dfc-version-tag')) return;
    const tag = document.createElement('div');
    tag.id = 'dfc-version-tag';
    tag.textContent = 'v' + APP_VERSION;
    tag.style.cssText = `
      position: fixed; right: 8px; bottom: 6px; z-index: 9998;
      font-size: 10px; color: rgba(100,116,139,.55);
      font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
      pointer-events: none; user-select: none;
    `;
    document.body.appendChild(tag);
  });
})();
