# 🛣️ 龍潭國小 DFC 投票系統 — 路線圖

> 紀錄已完成的功能 + 未來可優化的方向，供使用者後續開發參考。

---

## ✅ 已完成版本

### 🟢 v1.0.0 — 初版上線（2026-05-13）

**核心架構**
- ✅ 三畫面分離：`index.html`（入口）/ `viewer.html`（公開監票）/ `admin.html`（需登入後台）
- ✅ Firebase Realtime Database 即時同步（asia-southeast1）
- ✅ Firebase Auth 管理員 Email/Password 登入（rules `auth != null` 才能寫）
- ✅ `runTransaction` 防併發加票（多人同時開票不會吃掉彼此的票）
- ✅ `presence` 機制 + `onDisconnect().remove()` 顯示在線教室數
- ✅ 跨教室即時同步（admin 加票 → 監票畫面 60ms 內跳動）

**開發 / 部署基礎**
- ✅ GitHub Repo [cagoooo/Lungtan-DFC](https://github.com/cagoooo/Lungtan-DFC) public
- ✅ GitHub Pages 自動部署（main / root）
- ✅ Firebase Auth 授權網域 `cagoooo.github.io` 已加
- ✅ API Key referrer 限制（cagoooo.github.io + localhost only）
- ✅ Service Worker + version.json 輪詢 → 推播「有新版」浮動 banner
- ✅ `bump-version.ps1` 一鍵升版腳本

**安全 / 運維**
- ✅ `SECURITY.md` 文件化 Firebase Web Key 公開政策
- ✅ GitHub Secret Scanning Alert dismissed as wont_fix
- ✅ RTDB Security Rules 全欄位有 `.validate` 限制

---

### 🟢 v1.1.0 — 重大功能更新（2026-05-13）

**互動體驗**
- ✅ 聲效系統 `sound.js`（Web Audio API 合成，零外部 mp3 依賴）
  - 加票音、領先變動 fanfare、同票音、減票音、登入音、重設音
  - M 鍵 / 按鈕一鍵切換、狀態存 localStorage
- ✅ viewer 全螢幕模式（F 鍵 + 按鈕，字級自動放大）
- ✅ viewer 加票特效：整列光暈 + 12 顆粒子噴發 + 票數彈跳
- ✅ viewer 領先變動 toast「👑 五年X班 領先！」+ 撒彩帶 + fanfare 音
- ✅ admin 加票特效：ripple + 飛字「+1」+ 粒子 + 整卡光暈

**同票呈現**
- ✅ 並列名次徽章（多人並列第一不分金銀銅顏色）
- ✅ 同票警示橫幅（黃色，列出並列方案）
- ✅ 🤝 圖示取代 👑（同票期間）
- ✅ 進入同票狀態時的提示音

**UI / Layout**
- ✅ admin 改緊湊 3 欄 layout（一螢幕 6 方案，不用滾動）
- ✅ 海報尺寸縮小、卡片內容更密集、響應式 fallback 維持

**匯出 / 列印**
- ✅ CSV 匯出（含 BOM 中文不亂碼，可直接開 Excel）
- ✅ 純文字匯出（含並列名次標記）
- ✅ 列印報告（`@media print` 自動隱藏按鈕、特效）

**品牌 / 分享**
- ✅ Favicon (favicon.svg DFC 紅底白字 + 金色 ✓)
- ✅ OG 預覽圖 (1200×630, Python + Pillow 自動生成)
- ✅ 三個 HTML 完整 OG / Twitter Card meta tags

**修補**
- ✅ `bump-version.ps1` 改 ASCII-only（避開 PS 5.1 cp950 讀 UTF-8 中文 parse error）

---

## 🚀 未來建議優化（按優先級 + 主題分類）

### 🎯 短期：1-2 小時可完成的高 ROI 項目

#### 1. PWA 安裝（讓 viewer 可加到桌面像 app）
- **價值**：每班導師把 viewer 加到 iPad / Chromebook 桌面，一鍵全螢幕，免開瀏覽器
- **做法**：
  - 新增 `manifest.json`（含 name, short_name, icons 192x192 / 512x512, display: standalone, theme_color）
  - 三個 HTML head 加 `<link rel="manifest" href="./manifest.json?v=X">`
  - 用 Pillow 生成 192/512 PNG icons
- **預估**：30 分鐘
- **相依**：已有的 SW 與 favicon

#### 2. 倒數計時器 / 投票時段控制
- **價值**：選舉有明確開始 / 結束時間，自動 lock 不用手動操作
- **做法**：
  - RTDB `dfc/meta` 加 `openAt` / `closeAt` 欄位（ISO timestamp）
  - viewer banner 顯示「距結束剩 X:XX」倒數
  - 到時自動把 `locked: true`，全教室同步看到「投票已結束」
- **預估**：1 小時

#### 3. 操作日誌 / 唱票時間軸
- **價值**：開票過程留下稽核軌跡，可回溯每張票何時加 / 由誰加
- **做法**：
  - RTDB `dfc/log/{pushId}` 加每筆 { ts, actionId, delta, adminUid, adminEmail }
  - admin 加票時 `push()` 寫入
  - 設定頁加「📜 唱票時間軸」分頁，列出所有操作
- **預估**：1.5 小時

#### 4. 多輪 / 多階段選舉支援
- **價值**：第一輪 → 二輪複選，或不同題目多次投票
- **做法**：
  - RTDB 改 `dfc/rounds/{roundId}/actions`、`dfc/rounds/{roundId}/meta`
  - admin 加「📦 封存目前結果並開始新一輪」按鈕
  - viewer 可選看歷史輪次
- **預估**：2 小時

#### 5. 音效音量調整（不是只切換）
- **價值**：教室 / 投影喇叭 / 個人耳機需要不同音量
- **做法**：sound.js 加 `setVolume(0~1)`，header 音效按鈕改 popover 含 slider
- **預估**：20 分鐘

#### 6. 監票排序模式切換
- **價值**：依票數（預設）vs 依編號（給某些教學情境）
- **做法**：viewer header 加切換鈕，URL hash 持久化（`#order=number`）
- **預估**：20 分鐘

#### 7. 截圖功能（畫面存檔）
- **價值**：老師存某時刻的排行榜畫面當紀念 / 公告
- **做法**：用 `html-to-image` 函式庫，按鈕點擊後下載 PNG
- **預估**：30 分鐘
- **注意**：之前 skill 提醒過 html2canvas 對中文字型有風險，建議改用瀏覽器內建 print → 存 PDF 已經夠用，這項可選

#### 8. 投票完成「最終結果」儀式畫面
- **價值**：投票結束 lock 後，viewer 切到隆重的「當選名單」全頁畫面
- **做法**：偵測 meta.locked = true 時，viewer 切換 layout 顯示得票第一名大照片 + 「✨ 當選 ✨」+ 持續彩帶 + 慶祝音樂
- **預估**：1 小時

---

### 🌟 中期：半天 ~ 1 天的功能擴充

#### 9. OBS 直播浮層 `overlay.html`
- **價值**：學校直播開票時嵌進畫面當浮層字幕
- **做法**：透明背景版的 viewer，只顯示前 3 名 + 總票數，無框架
- **參考**：Little-Mayer 同名檔
- **預估**：2-3 小時

#### 10. A4 開票報告 `report.html`
- **價值**：選後印一份正式報告留校存查
- **做法**：A4 直式 layout、含學校 LOGO、所有方案列表、簽核欄位、`@media print`
- **預估**：2-3 小時

#### 11. 當選海報 `poster.html`（1080×1920）
- **價值**：選後生成可貼 IG / FB / LINE 個版的直式海報
- **做法**：用 `html-to-image` 把預先 layout 好的 1080×1920 div 轉 PNG 下載
- **預估**：3 小時

#### 12. 語音播報結果
- **價值**：增加儀式感，視障同學也能參與
- **做法**：Web Speech API `speechSynthesis.speak()`，每次加票念出「五年一班 加一票，目前五票」
- **預估**：1 小時
- **注意**：Chrome / Edge 內建中文 TTS 品質可用，可選擇開關

#### 13. 方案詳細介紹頁
- **價值**：學生家長想了解某個方案的背景、政見、影片
- **做法**：
  - admin 設定頁加「政見內容 / 影片連結」欄位
  - viewer 卡片點擊展開 modal，顯示完整內容
  - 海報點擊放大全螢幕
- **預估**：3 小時

#### 14. 直播鏡頭嵌入
- **價值**：viewer 上方放 YouTube live 嵌入，邊看直播邊看票數
- **做法**：admin 設定頁加 `liveVideoUrl`，viewer 動態嵌入 iframe
- **預估**：1 小時

#### 15. 觀眾彈幕 / 留言（rate-limited）
- **價值**：跨教室互動感，類似直播留言
- **做法**：
  - RTDB `dfc/comments/{pushId}` 公開寫（但設 throttle，每分鐘限 N 筆）
  - viewer 浮動顯示飄過的留言
  - 可選的關鍵字過濾 / 老師審核
- **預估**：4 小時
- **風險**：開放寫入有濫用風險，要搭配 Cloudflare Turnstile 或 App Check

#### 16. 多語言 i18n
- **價值**：英文版 / 簡中版 / 客語 / 原住民語給多元學生家庭
- **做法**：抽出所有 string 到 `i18n/{zh-Hant,en,...}.js`，viewer header 加語言切換
- **預估**：4 小時

#### 17. 黑暗模式
- **價值**：教室燈光暗時投影更舒服
- **做法**：CSS variables + `data-theme="dark"` body class，header 切換
- **預估**：1 小時

---

### 🏆 長期：多日 / 結構性變化

#### 18. Firebase App Check（防濫用進階防線）
- **價值**：防止有人寫腳本繞過 referrer 限制刷 RTDB
- **做法**：reCAPTCHA Enterprise 整合，先 Unenforced 觀察 1-2 天再 Enforce
- **預估**：1 天
- **參考 skill**：`firebase-ci-troubleshooter` Fix #12

#### 19. 學生掃 QR Code 自助投票（真實匿名投票模式）
- **價值**：脫離「老師代為唱票」，學生用個人帳號掃 QR 投票
- **做法**：
  - 學生用學號 + 預設密碼登入（或 firebase anonymous auth）
  - 每人每場限投一次（用 UID 紀錄）
  - admin 從「唱票」變成「監看投票進度」
  - 完全不同的架構，要新開 page `vote.html`
- **預估**：3-5 天（含測試）
- **風險**：學生帳號管理麻煩，要跟學校總帳號系統整合

#### 20. 歷史活動歸檔系統
- **價值**：保留歷年選舉資料供比較與展示
- **做法**：
  - admin 加「📦 歸檔本次活動」→ 寫到 `dfc/archives/{year-term}`
  - 新建 `archive.html` 列出歷年活動
  - 點進去看當年完整結果
- **預估**：2 天

#### 21. 管理員權限分級
- **價值**：主裁判（可改設定）/ 副裁判（只能加票）/ 觀察者（只能看）
- **做法**：
  - 用 Firebase Auth Custom Claims 加 `role`
  - rules 內檢查 `auth.token.role`
  - 用 Cloud Functions 提供「指派 role」API（admin SDK setCustomUserClaims）
- **預估**：2 天

#### 22. 離線票數補登
- **價值**：網路斷線時仍可記票，恢復後自動同步
- **做法**：
  - admin localStorage 暫存待寫入 queue
  - SW 偵測 online 時 flush queue 到 RTDB
  - UI 顯示「離線中，已暫存 X 票」
- **預估**：2 天

#### 23. 多校 / 多活動支援（SaaS 化）
- **價值**：其他學校也能用這套系統，不用各自部署
- **做法**：
  - 改 `dfc/{schoolId}/{eventId}/actions`
  - 加學校管理頁面、計費（如有）
  - 重大架構變動
- **預估**：1-2 週

---

### 🛠️ 技術債 / 維運

#### 24. Lighthouse 優化
- **價值**：Performance / Accessibility / SEO 分數提升
- **做法**：跑 Lighthouse 找 N 個 issue → 一一修
- **預估**：1-2 小時

#### 25. 單元測試（RTDB rules）
- **價值**：改 rules 不會手滑誤改
- **做法**：`firebase emulators:exec` + Vitest 寫 rules 測試
- **預估**：3 小時
- **參考 skill**：`firebase-ci-troubleshooter` Fix #7

#### 26. CI/CD（GitHub Actions 自動部署）
- **價值**：push 自動 deploy RTDB rules（目前還是手動 `firebase deploy`）
- **做法**：
  - 建 service account JSON 存 GitHub Secrets
  - workflow `.github/workflows/deploy-rules.yml`
- **預估**：1 小時
- **參考 skill**：`firebase-ci-troubleshooter` Fix #15

#### 27. Sentry / 錯誤監控
- **價值**：使用者遇到 JS error 自動回報，老師不用截圖描述
- **做法**：Sentry SDK 整合，免費方案足夠
- **預估**：30 分鐘

#### 28. Cloudflare Turnstile（人機驗證）
- **價值**：防 bot 寫腳本攻擊 Firebase Auth 登入 endpoint
- **做法**：admin 登入框前加 Turnstile widget
- **預估**：1 小時
- **參考 skill**：`cloudflare-turnstile-integration`

---

## 📊 投入產出建議排序

如果你要選一個**高 ROI 立即就做**的，推薦順序：

1. **第 1 項 PWA 安裝** — 30 分鐘換來各班 iPad 一鍵全螢幕，價值極高
2. **第 2 項 倒數計時器** — 1 小時換來儀式感與自動化
3. **第 8 項 投票完成儀式畫面** — 1 小時換來高潮收尾
4. **第 10 項 A4 開票報告** — 半天換來正式存查文件
5. **第 9 項 OBS 直播浮層** — 半天換來直播附加價值

如果你要**選舉前最後上一波**（活動還沒到），建議專注：1 + 2 + 8 + 10。

---

## 🎓 學習價值角度

如果這是阿凱老師的「教學專案」想讓學生學些什麼，這些功能順著做下來，可以教到：

- 第 1-7 項：HTML/CSS/JS 進階、PWA、SW、Web API
- 第 8-17 項：UI/UX 設計、響應式、動畫、繁中字型、無障礙
- 第 18-23 項：Firebase 進階、安全設計、Cloud Functions、SaaS 架構
- 第 24-28 項：DevOps、CI/CD、測試、監控、防護

整套做下來等同於 **一門完整的 Web 全端工程課程**。

---

Made with ❤️ by [阿凱老師](https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5)
