# 🗳️ 龍潭國小 第 123 屆 自治市小市長選舉 — DFC 投票系統

即時計票 + 即時監票的雙端系統，部署在 **GitHub Pages**，後端用 **Firebase Realtime Database** 同步資料、**Firebase Auth** 保護後台寫入。

> 模式參考自 [cagoooo/Little-Mayer](https://github.com/cagoooo/Little-Mayer)（石門國小自治市市長選舉計票系統）。

---

## 📐 三個畫面

| 頁面 | 用途 | 權限 |
|---|---|---|
| `index.html` | 入口分流（顯示即時總票數、在線教室數） | 公開 |
| `viewer.html` | 公開監票（全校教室同步觀看、排行榜、皇冠特效、領先變更撒彩帶） | 公開 |
| `admin.html` | 後台計票 / 方案設定（要 Firebase Auth 登入） | 管理員登入後可寫 |

**安全原則**：viewer 連結即使被學生拿到也只能看；admin 必須以管理員 email/密碼登入才能改票數，連結被拿到也無法亂動（Realtime DB rules 端把關）。

---

## 🚀 部署步驟（一次完成）

### 步驟 1：建立 Firebase 專案

用學校 Gmail（`ipad@mail2.smes.tyc.edu.tw`）登入 https://console.firebase.google.com，建立專案 `lungtan-dfc-2026`（也可換名稱）。建議**不啟用** Google Analytics（教學用途）。

### 步驟 2：啟用 Authentication 與 Realtime Database

1. **Authentication** → Sign-in method → 開啟「電子郵件/密碼」
2. **Authentication** → Users → 新增使用者（這就是後台管理員帳號，請設定強密碼）
3. **Realtime Database** → 建立資料庫 → 區域選 `asia-southeast1`（新加坡，台灣最近）→ 鎖定模式
4. **Realtime Database** → Rules 分頁 → 把 `database.rules.json` 內容貼上 → 發佈

### 步驟 3：取得 Firebase 設定並貼進 `firebase-config.js`

1. 專案概覽 → ⚙️ → 專案設定 → 一般 → 你的應用程式 → 加入「Web 應用程式」
2. 複製產生的 `firebaseConfig` 物件
3. 打開 `firebase-config.js`，把佔位字串（`REPLACE_WITH_YOUR_*`）整段替換成真正的 config

```js
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "lungtan-dfc-2026.firebaseapp.com",
  databaseURL: "https://lungtan-dfc-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lungtan-dfc-2026",
  storageBucket: "lungtan-dfc-2026.firebasestorage.app",
  messagingSenderId: "...",
  appId: "1:...:web:..."
};
```

### 步驟 4：本地測試（先確認連線成功）

```powershell
cd H:\DFC
python -m http.server 8765
```

打開 http://localhost:8765/ → 看到入口頁顯示「目前總票數 0」「連線中教室 0」就代表 Firebase 連線成功（如果還是顯示 `…` 或警示，請重看 config 是否貼對）。

→ 進 admin.html 登入管理員帳號 → 進入計票畫面，會自動 seed 6 個預設方案到 Firebase。

→ 在另一個分頁開 viewer.html，回 admin 按 `+` 加票，**監票畫面應該即時跳動**。

### 步驟 5：部署到 GitHub Pages

```powershell
cd H:\DFC
git init
git branch -M main
git add .
git commit -m "🎉 初始：DFC 投票系統 + Firebase 整合"
gh repo create cagoooo/Lungtan-DFC --public --source=. --remote=origin --push
```

到 GitHub → Settings → Pages → Source 選 `main` branch / `/ (root)` → 儲存。

幾分鐘後網站會出現在：`https://cagoooo.github.io/Lungtan-DFC/`

### 步驟 6：把 GitHub Pages 網域加進 Firebase Auth 授權網域

Firebase Console → Authentication → Settings → 「已授權的網域」→ 新增網域 `cagoooo.github.io`

> 沒做這步，admin.html 在 GitHub Pages 上會跳 `auth/unauthorized-domain` 錯誤無法登入。

### 步驟 7（建議但非必要）：限制 API Key

Google Cloud Console → API 與服務 → 憑證 → 找到 Firebase Browser API Key →
- **應用程式限制** → HTTP 引用網址 → 加入：
  - `https://cagoooo.github.io/*`
  - `http://localhost:*/*`（本地測試用）
  - `http://127.0.0.1:*/*`

這樣即使 API Key 被外人從原始碼複製出去也無法在其他網站使用。

---

## 🔄 日常更新流程

```powershell
# 改完程式碼後
git add .
git commit -m "✨ 加 XX 功能"
git push
```

GitHub Pages 自動部署，1~2 分鐘後生效。**Service Worker 沒設**，所以使用者重新整理就會看到最新版。

---

## 📊 資料結構

```
dfc/
├─ actions/                 ← 行動方案陣列
│  ├─ {id}/
│  │  ├─ id:        1
│  │  ├─ number:    1
│  │  ├─ className: "五年一班"
│  │  ├─ name:      "保健室小志工"
│  │  ├─ photo:     "501.jpg" 或 base64 dataURL
│  │  └─ votes:     0          ← 受保護的核心欄位
│  └─ ...
├─ meta/                    ← 活動資訊
│  ├─ title:      "龍潭國小 第 123 屆 自治市小市長選舉"
│  ├─ subtitle:   "DFC 行動方案 · 投票實況"
│  ├─ schoolName: "龍潭國小"
│  └─ locked:     false       ← true 時 admin 也無法加票
└─ presence/                ← 在線人數
   └─ {sid}/
      ├─ ts:   serverTimestamp()
      └─ role: "viewer" | "admin"
```

**加票邏輯**：用 `runTransaction` 對單一 `votes` 葉節點做 atomic 更新，多位開票員同時加票也不會吃掉彼此的票。

**在線教室數**：用 `push()` 給每個分頁產生 random key，搭配 `onDisconnect().remove()` 預掛斷線清除。關閉分頁時自動消失。

---

## 🌐 嵌入學校官網 (給校網管理員)

把以下程式碼貼進學校網站任何頁面，5 分鐘就能上線：

```html
<iframe src="https://cagoooo.github.io/Lungtan-DFC/viewer.html"
        width="100%" height="900"
        frameborder="0" allow="autoplay; fullscreen"
        style="border:0; border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,.1);">
</iframe>
```

各班級教室電腦的網址列直接打 `https://cagoooo.github.io/Lungtan-DFC/viewer.html` 開全螢幕即可。

---

## ⚠️ 重要安全提醒

1. **`firebaseConfig` 中的 apiKey 可以公開** — Firebase Web Key 是讓客戶端找到專案的，**真正的防線是 `database.rules.json`**（規則裡 `.write: "auth != null"` 才能擋住未登入寫入）
2. **GitHub repo 設 public 沒問題** — 程式碼即使公開，沒登入就改不到資料
3. **管理員帳號密碼一定要強** — 一旦這組帳密外流就能改票數
4. **API Key 限制 HTTP referrer** 是額外的一道保險（步驟 7），擋掉拿你 key 去其他網站偽造的情境

---

## 🛠️ 開發本機常用指令

```powershell
# 本地預覽
python -m http.server 8765

# 部署 Firebase 安全規則（需先 firebase login --account=ipad@mail2.smes.tyc.edu.tw）
firebase deploy --only database --account=ipad@mail2.smes.tyc.edu.tw

# 看 Firebase 專案列表
firebase projects:list --account=ipad@mail2.smes.tyc.edu.tw

# 推到 GitHub
git add .
git commit -m "..."
git push
```

---

Made with ❤️ by [阿凱老師](https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5)

---

<!-- BEGIN:PROJECT_GUIDE -->
## 專案導覽

龍潭國小 第123屆 自治市小市長選舉 DFC 行動方案即時投票系統

- 專案定位：校務／行政流程數位化專案
- Repository：`cagoooo/Lungtan-DFC`
- 可見性：公開
- 主要技術：HTML、Firebase
- 線上入口：未在 GitHub repository metadata 設定

### 可以怎麼應用

- 把紙本、試算表或人工通知流程轉成可追蹤的線上作業
- 依不同學校的欄位、角色與簽核方式進行客製化
- 作為校務系統、資料同步或自動通知整合的參考實作

這些是依目前專案定位整理的延伸方向，不代表所有情境都已內建完成；實作前請先確認現有功能與資料格式。

### 技術與專案結構

- `README.md`
- `apple-touch-icon.png`
- `firebase.json`
- `index.html`

檔案結構會隨版本演進；若本節與程式碼不一致，以目前預設分支的原始碼為準。

### 本機執行

這是可直接由瀏覽器載入的靜態網站。可用任一靜態檔案伺服器預覽，例如：
```bash
python -m http.server 8000
```
接著開啟 `http://localhost:8000`。請避免直接以 `file://` 測試需要模組、請求或 Service Worker 的功能。

### 給 AI Agent 的接手指南

1. 先閱讀本 README、`AGENTS.md`（若有）、套件腳本與部署設定。
2. 先畫出角色、資料流、權限與外部服務，再修改表單或資料結構。
3. 不得提交學生個資、憑證、API 金鑰或正式環境匯出資料。
4. 涉及 schema、驗證、權限或通知時，同步檢查前後端與部署設定。
5. 不要捏造尚未存在的功能；README 與實作有落差時，應同時更新文件。
6. 提交前只納入本次任務檔案，並記錄實際執行過的驗證。

### 安全與資料注意事項

- 不要提交 `.env`、服務帳號、API 金鑰、token、學生個資或正式環境匯出資料。
- 使用 Firebase、Supabase、Google API 或其他雲端服務時，請建立自己的測試專案並套用最小權限。
- 若要公開衍生作品，請先確認程式碼、圖片、音訊、字型與教材內容的授權。

### 貢獻與客製化

歡迎依教學現場、活動或工作流程需求進行 fork／客製化。建議在變更說明中交代使用情境、主要修改、測試方式，以及是否影響資料格式或部署設定。
<!-- END:PROJECT_GUIDE -->
