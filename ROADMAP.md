# 🛣️ 龍潭國小 DFC 投票系統 — 路線圖

> 紀錄已完成的功能 + 未來可優化的方向，供使用者後續開發參考。
> **目前進度：v1.6.2（共完成 8 / 28 個 ROADMAP 項目 + 7 個 hotfix/小優化）**

---

## ✅ 已完成版本（按版本號）

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

### 🟢 v1.1.0 — 重大互動 + 視覺升級
- ✅ 聲效系統（Web Audio 合成 6 種音效）
- ✅ viewer 全螢幕模式（F 鍵）
- ✅ 同票呈現（並列徽章 / 黃色橫幅 / 🤝 圖示）
- ✅ 加票特效（光暈、粒子、撒彩帶、領先 toast）
- ✅ admin 緊湊 3 欄 layout
- ✅ CSV 匯出 + 列印報告 + 純文字匯出
- ✅ Favicon (SVG) + OG 預覽圖 (1200×630)

### 🟢 v1.2.0 — PWA / 時間軸 / 排序 / 截圖 / 儀式
- ✅ PWA 安裝（manifest.json + 三種 icon）
- ✅ 唱票時間軸（dfc/log + 100 筆 onValue + CSV 匯出）
- ✅ 監票排序切換（票數 / 編號）
- ✅ 截圖功能（html-to-image lazy-load）
- ✅ 投票完成儀式畫面（meta.locked = true 觸發）

### 🟢 v1.3.0 ~ v1.3.1 — 互動升級 + 大電腦 RWD
- ✅ 海報 Lightbox（點縮圖放大、左右切換、ESC 關閉）
- ✅ 卡片進場 stagger 動畫
- ✅ 領先差距 chip「領先 +N」/「落後 N」
- ✅ 最新得票相對時間（每秒更新）
- ✅ admin 後台大電腦端尺寸大升級（海報 90→160px、票數字 34→56px、+鈕 52→76px）

### 🟢 v1.4.0 ~ v1.4.6 — viewer 卡片化 + 多個修正
- ✅ viewer 改 3 欄卡片格子（跟 admin 一致）
- ✅ 名次徽章 pill（金/銀/銅）+ 獎牌 emoji（🥇🥈🥉）
- ✅ 「全 0 票顯示第 1 名」邏輯修正（改顯示「⏳ 待開票」灰色徽章）
- ✅ TDZ bug hotfix（dataRank 在宣告前被使用）
- ✅ lightbox 同步「待開票」狀態 + 隱藏 0% 雜訊
- ✅ lightbox dots 移到圖片下方 + 現代橫條風格
- ✅ 全螢幕無法滾動修正（overflow-y: auto !important）
- ✅ admin 一鍵結束開票按鈕（金色 finale btn）

### 🟢 v1.5.0 — 方案詳細介紹 + YouTube 影片
- ✅ 資料層加 `description` / `videoUrl` 欄位（含 RTDB validate）
- ✅ admin 設定頁加多行文字 + URL 輸入欄
- ✅ viewer lightbox 加「🖼️ 海報 / 📖 政見內容 / 🎬 影片」三 tab pill
- ✅ YouTube URL 解析支援 4 種格式 + autoplay + 關閉時自動停播

### 🟢 v1.6.0 ~ v1.6.2 — 開票報告 + RWD 完善
- ✅ A4 開票報告 `report.html`（window.print() + @media print）
- ✅ 含學校頁眉、表格、當選通告、簽核欄位、印章 footer
- ✅ 同票時自動切「並列當選」格式
- ✅ admin 與 viewer 都加 max-height: 1000 中等壓縮 breakpoint
- ✅ 三段高度 RWD：> 1000 氣派 / ≤ 1000 中等 / ≤ 820 緊湊

---

## 📊 ROADMAP 28 項清單（已完成 / 待開發）

| # | 項目 | 預估 | 狀態 |
|---|---|---|---|
| 1 | PWA 安裝 | 30 分 | ✅ v1.2.0 |
| 2 | 倒數計時器 / 投票時段 | 1 小時 | 🔵 待開發 |
| 3 | 操作日誌 / 唱票時間軸 | 1.5 小時 | ✅ v1.2.0 |
| 4 | 多輪選舉支援 | 2 小時 | 🔵 待開發 |
| 5 | 音效音量 slider | 20 分 | 🔵 待開發 |
| 6 | 監票排序切換 | 20 分 | ✅ v1.2.0 |
| 7 | 截圖功能 | 30 分 | ✅ v1.2.0 |
| 8 | 投票完成儀式畫面 | 1 小時 | ✅ v1.2.0 |
| 9 | OBS 直播浮層 `overlay.html` | 2-3 小時 | 🔵 待開發 |
| 10 | A4 開票報告 | 2-3 小時 | ✅ v1.6.0 |
| 11 | 1080×1920 當選海報 | 3 小時 | 🔵 待開發 |
| 12 | 語音播報結果 | 1 小時 | 🔵 待開發 |
| 13 | 方案詳細介紹 + 影片 | 3 小時 | ✅ v1.5.0 |
| 14 | 直播鏡頭嵌入 | 1 小時 | 🔵 待開發 |
| 15 | 觀眾彈幕留言 | 4 小時 | 🔵 待開發 |
| 16 | 多語言 i18n | 4 小時 | 🔵 待開發 |
| 17 | 黑暗模式 | 1.5 小時 | 🔵 待開發 |
| 18 | Firebase App Check | 1 天 | 🔵 待開發 |
| 19 | 學生掃 QR 自助投票 | 3-5 天 | 🔵 待開發 |
| 20 | 歷史活動歸檔 | 2 天 | 🔵 待開發 |
| 21 | 管理員權限分級 | 2 天 | 🔵 待開發 |
| 22 | 離線票數補登 | 2 天 | 🔵 待開發 |
| 23 | 多校 SaaS 化 | 1-2 週 | 🔵 待開發 |
| 24 | Lighthouse 優化 | 1-2 小時 | 🔵 待開發 |
| 25 | RTDB rules 單元測試 | 3 小時 | 🔵 待開發 |
| 26 | GitHub Actions 自動 deploy | 1 小時 | 🔵 待開發 |
| 27 | Sentry 錯誤監控 | 30 分 | 🔵 待開發 |
| 28 | Cloudflare Turnstile 防 bot | 1 小時 | 🔵 待開發 |

**進度**：8/28 完成 ＝ 約 29%（但涵蓋所有「短期高 ROI」項目，剩下都是中長期）

---

## 🎁 額外的優化（不在原 ROADMAP，但實際做了）

| 項目 | 版本 |
|---|---|
| admin 「📄 開票報告」按鈕（連到 report.html） | v1.6.0 |
| admin 「🎉 結束開票」一鍵切換 finale 按鈕 | v1.4.6 |
| admin 大電腦端 RWD 升級（海報 160px、票數 56px、+ 鈕 76px） | v1.3.1 |
| admin + viewer 加 max-height: 1000 中等壓縮 breakpoint | v1.6.1 / v1.6.2 |
| 名次徽章 pill（金/銀/銅 + 獎牌 emoji） | v1.4.0 |
| 「⏳ 待開票」狀態徽章（總票數=0 / 該方案=0） | v1.4.1 |
| 全螢幕模式 overflow-y: auto 修正 | v1.4.5 |
| 「最新得票 X 秒前」相對時間 chip | v1.3.0 |
| YouTube URL 4 種格式解析（含 shorts） | v1.5.0 |
| bump-version.ps1 ASCII-only（避開 PS 5.1 cp950 雷） | v1.1.x |

---

## 🚀 推薦下一波開發方向（依優先級排序）

### 🥇 第一推薦：選舉日「儀式感大爆發」套組（總計 ~3 小時）

| # | 項目 | 預估 | 為什麼 |
|---|---|---|---|
| #12 | 🎙️ **語音播報結果** | 1 小時 | 加票時 TTS 念「五年X班 +1，目前 5 票」+ 領先變動「五年X班 領先了！」**最戲劇張力**。Web Speech API 內建免費。視障同學也能參與。 |
| #2 | ⏱️ **倒數計時器** | 1 小時 | viewer 顯示「距投票截止 02:35」+ 到時自動 lock 進儀式畫面。**讓選舉有明確節奏感**。 |
| #11 | 🖼️ **1080×1920 當選海報** | 3 小時 | 用 html-to-image 一鍵下載「當選宣告」直版海報（給班級 FB / IG / LINE 群組分享）。**家長最愛轉發** |

完成這 3 項，整個系統會從「投票工具」升級成「**完整選舉儀式平台**」。

---

### 🥈 第二推薦：UI/UX 細節升級（總計 ~2.5 小時）

| # | 項目 | 預估 | 為什麼 |
|---|---|---|---|
| #17 | 🌙 **黑暗模式** | 1.5 小時 | 教室燈光暗投影時更舒服，data-theme 切換 + localStorage 持久化 |
| #5 | 🔊 **音效音量 slider** | 20 分 | 不只開 / 關，提供 0~100% 漸調，不同教室喇叭音量需求不同 |
| #14 | 📺 **直播鏡頭嵌入** | 1 小時 | viewer 上方放 YouTube live 嵌入，邊看直播邊看票數 |

---

### 🥉 第三推薦：正式典禮加強（總計 ~5-6 小時）

| # | 項目 | 預估 | 為什麼 |
|---|---|---|---|
| #9 | 🎬 **OBS 直播浮層** `overlay.html` | 2-3 小時 | 透明背景版 viewer，學校直播時嵌進畫面當「跑馬燈式字幕」顯示前 3 名 + 總票數 |
| #4 | 🔄 **多輪選舉支援** | 2 小時 | 第一輪 → 二輪複選，封存歷史輪次資料，可比較不同輪結果 |

---

### 🏆 第四推薦：長期延伸（適合下學期）

| # | 項目 | 預估 | 為什麼 |
|---|---|---|---|
| #20 | 📦 **歷史活動歸檔** | 2 天 | 把每年每屆選舉資料封存到 `dfc/archives/{year-term}`，建 `archive.html` 列歷年活動 |
| #19 | 📱 **學生掃 QR 自助投票** | 3-5 天 | 真正的匿名投票（每人一票）— 教學情境延伸：升級成「全校真實投票」 |
| #15 | 💬 **觀眾彈幕留言** | 4 小時 | 跨教室即時互動，類似直播留言飄過畫面（需配 Cloudflare Turnstile 防灌爆） |
| #16 | 🌐 **多語言 i18n** | 4 小時 | 英文 / 簡中版（教學情境延伸） |

---

### 🛠️ 技術債維運（不急，但長期值得做）

| # | 項目 | 預估 | 為什麼 |
|---|---|---|---|
| #24 | 🚦 Lighthouse 優化 | 1-2 小時 | PWA / Performance / Accessibility / SEO 分數 |
| #25 | 🧪 RTDB rules 單元測試 | 3 小時 | firebase emulators:exec + Vitest 寫 rules 測試 |
| #26 | 🤖 GitHub Actions 自動 deploy rules | 1 小時 | 改 `database.rules.json` 後自動 deploy 不用手動 `firebase deploy` |
| #27 | 🐛 Sentry 錯誤監控 | 30 分 | 使用者遇到 JS error 自動回報 |
| #28 | 🛡️ Cloudflare Turnstile 防 bot | 1 小時 | 防腳本暴力嘗試 admin 登入 |
| #18 | 🔐 Firebase App Check | 1 天 | reCAPTCHA Enterprise 整合，防 API 濫用 |

---

## 💡 新發想（不在原 ROADMAP，但實戰中浮現）

### 🆕 A. 數位簽章報告（適合配合 #10 A4 報告升級）
- **價值**：A4 開票報告右下三個簽核欄位現在是空白要手簽。升級成「畫面上手寫簽名 → 直接列印含簽名版」
- **做法**：用 HTML5 `<canvas>` + `pointer events` 收集簽名 → toDataURL 嵌進 SVG → 進入 print
- **預估**：3 小時

### 🆕 B. LINE 群組推播開票結果
- **價值**：選舉結束 admin 點「📲 推送到 LINE」→ 主任 / 校長 / 家長會的 LINE 群組立刻收到結果摘要 + 開票報告 URL
- **做法**：Firebase Cloud Functions + LINE Messaging API（參考 `line-messaging-firebase` skill）
- **預估**：4 小時（含 LINE Bot 註冊 + Functions 部署）
- **注意**：Firebase Blaze 計費方案才能用 Cloud Functions

### 🆕 C. 即時長條圖視覺化（chart.js）
- **價值**：viewer 監票畫面下方加一個動態長條圖（每個方案一根長條 + 即時動畫），跟現有卡片並存
- **做法**：chart.js CDN + Firebase RTDB 訂閱即時更新
- **預估**：1.5 小時

### 🆕 D. 投票過程錄影（screen recording）
- **價值**：自動錄製整個開票過程 webm 供事後復盤
- **做法**：MediaRecorder API + `getDisplayMedia()`
- **預估**：2 小時
- **限制**：需要使用者授權螢幕錄影

### 🆕 E. 每方案隨機呼吸動畫
- **價值**：監票畫面更「有生命力」，6 個卡片各以不同節奏淡淡呼吸（scale 1.0 ↔ 1.005）
- **做法**：CSS animation + 各卡 random animation-delay
- **預估**：30 分鐘
- **副作用**：可能讓觀眾覺得「畫面有事在動」分心

### 🆕 F. 自動備份到 NAS / Google Drive
- **價值**：每 5 分鐘自動截圖 / 匯出 CSV 到雲端，意外當機也不丟資料
- **做法**：Cloud Functions 排程 + Drive API
- **預估**：3 小時
- **限制**：需要 Firebase Blaze

### 🆕 G. 選舉「彩排模式」
- **價值**：選舉前一天讓主持人「彩排」一次完整流程（加票、儀式、退出儀式、重設），但不影響正式 RTDB 資料
- **做法**：URL 加 `?dryrun=1` → admin 操作只寫 localStorage 不寫 RTDB
- **預估**：2 小時

---

## 🎯 建議的「下一波最快出效果組合」

如果你選舉日**還沒到**，建議按這個順序做：

1. **#12 語音播報**（1 小時）— 立刻有戲劇張力
2. **#2 倒數計時器**（1 小時）— 自動化收尾
3. **🆕 G. 彩排模式**（2 小時）— 讓你主持人選前能練習
4. **#11 1080×1920 當選海報**（3 小時）— 選後家長最愛轉發

如果**選舉日已過**，建議按這個順序：

1. **#20 歷史活動歸檔**（2 天）— 為下屆選舉做準備
2. **🆕 D. 投票過程錄影**（2 小時）— 為下屆留下教學素材
3. **#17 黑暗模式**（1.5 小時）— 漸進式美化

---

## 📚 學習價值（教學專案視角）

從 v1.0 → v1.6.2 已涵蓋的技術主題：
- ✅ Firebase Realtime Database 即時同步
- ✅ Firebase Auth + Security Rules
- ✅ runTransaction 防併發
- ✅ Service Worker / PWA
- ✅ 版本檢查 + 自動更新 banner
- ✅ Web Audio API 合成音效
- ✅ Fullscreen API
- ✅ html-to-image 截圖
- ✅ Web Print API + @media print（A4 報告）
- ✅ YouTube iframe 嵌入
- ✅ CSS Grid + 響應式 RWD（4 段斷點）
- ✅ Lightbox modal 設計
- ✅ 粒子動畫 / 撒彩帶
- ✅ presence 在線狀態
- ✅ 跨分頁 storage event 同步

剩餘的 28-8 = 20 項做完，可以涵蓋更多技術主題（i18n、暗黑模式、TTS、QR Code、雲端 Functions、CI/CD 等），整套系統等同於一門完整的 **Web 全端工程入門課程**。

---

Made with ❤️ by [阿凱老師](https://www.smes.tyc.edu.tw/modules/school/index.php?department_id=2&zone_id=0&page_id=2&content_id=11&type=news&from_op=all_news#a5)
