# 🔐 安全政策 Security Policy

## 關於 Firebase Web API Key 出現在前端 / GitHub Secret Scanning Alert

如果你在 GitHub Secret Scanning、其他安全掃描工具或手動檢視原始碼時，
看到形如 `AIzaSy...` 的 Google API Key 出現在 [`firebase-config.js`](./firebase-config.js)，
**這是 Firebase 的設計，不是資安漏洞，不需要 rotate / 刪歷史**。

## 官方依據

根據 [Firebase 官方文件](https://firebase.google.com/docs/projects/api-keys)：

> "Firebase API keys are different from typical API keys...
>  it is OK for these to be publicly exposed."

Firebase Web API Key 的角色等同於「**這個 Firebase 專案的 ID 名片**」，
不是用來授權任何敏感操作，純粹是讓客戶端 SDK 找到正確的 Firebase 專案。

---

## 本專案實際的保護層

### ① HTTP Referrer 限制（API Key 端）

`AIzaSyA9jgvsT8...` 已在 Google Cloud Console 設定 HTTP referrer restriction：

```
https://cagoooo.github.io/*
http://localhost:*/*
http://127.0.0.1:*/*
```

→ 即使外人把 key 複製出去貼到其他網站，瀏覽器 SDK 呼叫會被 GCP 用 referrer 擋掉。

驗證指令：
```bash
gcloud services api-keys describe 6c905631-6843-4631-bba7-9ddac5c315cc \
  --project=lungtan-dfc-2026 \
  --account=ipad@mail2.smes.tyc.edu.tw \
  --format='value(restrictions.browserKeyRestrictions.allowedReferrers)'
```

### ② Realtime Database Security Rules（資料端）

[`database.rules.json`](./database.rules.json) 的核心規則：

```
"dfc": {
  ".read": true,                          // 任何人可讀（公開監票）
  ".write": "auth != null",               // 只有 Firebase Auth 登入後才能寫
  ...
}
```

→ 即使有人拿到 API Key + 想用 REST 直接寫資料，沒登入 admin 帳號就完全寫不進去。
   `auth != null` 才能寫 = 任何 unauthorized API call 都 403。

### ③ Firebase Auth Authorized Domains（登入端）

Firebase Console → Authentication → Settings → Authorized Domains 限制：

```
localhost
lungtan-dfc-2026.firebaseapp.com
lungtan-dfc-2026.web.app
cagoooo.github.io
```

→ 即使有人複製整套程式碼部署到其他網域，Firebase Auth 登入會直接被擋。

### ④ 管理員帳號的安全責任

管理員 email + 密碼是**最敏感**的資產。建議：

- **強密碼**（12 字元以上，混合大小寫+數字+符號）
- **不分享、不寫進任何文件**
- 萬一懷疑外洩 → Firebase Console → Authentication → Users → 重設密碼

---

## 真正會出事的情境（已預防）

| 風險 | 防護 |
|---|---|
| 別人複製 API Key 貼到自己網站用 | ❌ Referrer restriction 擋掉 |
| 別人用 REST API 直接寫 RTDB 改票數 | ❌ `.write: auth != null` 擋掉 |
| 別人在其他網域偽造 Firebase Auth 登入 | ❌ Authorized Domains 擋掉 |
| 別人猜中管理員密碼 | ⚠️ 取決於密碼強度（責任在管理員） |
| API Key 被拿去打 Maps / Places / Translate 等付費 API | ❌ API target 限定，未啟用付費 API |

---

## 處理 GitHub Secret Scanning Alert 的 SOP

1. **不要 panic** — Firebase Web Key 的 Public leak alert 是已知誤報
2. **確認 GCP 端 restrictions 已就位**（上方 ① 驗證指令）
3. **Dismiss alert 為 `wont_fix`** + 註明設計如此：
   ```bash
   gh api -X PATCH repos/cagoooo/Lungtan-DFC/secret-scanning/alerts/<N> \
     -f state=resolved \
     -f resolution=wont_fix \
     -f resolution_comment="Firebase Web API Key is public by design (firebase.google.com/docs/projects/api-keys). See SECURITY.md."
   ```

---

## ❌ 絕對不要做

- **不要**用 `git filter-repo` / BFG 刪歷史 — key 早已被 GitHub / Google 索引，無意義且會破壞 collaborator clone
- **不要**改成「後端 proxy fetch Firebase」— 複雜度爆炸，業界沒人這樣做
- **不要**忽略不設 restrictions — **這才是真漏洞**（會被濫刷帳單）
- **不要**把管理員密碼寫進 commit / chat / email / line 訊息

---

## 回報安全問題

如果你發現本專案有真正的安全漏洞（**不是** Firebase Web Key Public leak），
請聯絡 [阿凱老師](https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5)。
