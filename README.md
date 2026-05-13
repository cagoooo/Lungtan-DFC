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
