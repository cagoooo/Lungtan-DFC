// ============================================================
// Firebase 設定
// ============================================================
// 取得方式：
//   1. 用 ipad@mail2.smes.tyc.edu.tw 登入 https://console.firebase.google.com
//   2. 建立專案：lungtan-dfc-2026（或讓 firebase CLI 自動建立）
//   3. 加入 Web App，複製 firebaseConfig 內容貼到下方 firebaseConfig
//   4. Console → Build → Authentication → Sign-in method → 開啟「電子郵件/密碼」
//   5. Console → Authentication → Users → 新增使用者（這就是後台管理員帳號）
//   6. Console → Build → Realtime Database → 建立資料庫（區域選 asia-southeast1）
//   7. Realtime Database → Rules 貼上 database.rules.json 的內容
// ============================================================

export const firebaseConfig = {
  apiKey: "AIzaSyA9jgvsT8--JfVrev2mQvtFyaH1ctO9TJM",
  authDomain: "lungtan-dfc-2026.firebaseapp.com",
  databaseURL: "https://lungtan-dfc-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lungtan-dfc-2026",
  storageBucket: "lungtan-dfc-2026.firebasestorage.app",
  messagingSenderId: "275660886202",
  appId: "1:275660886202:web:bdc7e7eb7a62e649b63283"
};

// ============================================================
// 預設 DFC 行動方案
// 首次部署或設定畫面按下「重置為預設值」時會用這份資料 seed 進 Firebase
// 照片相對於 repo 根目錄；以後改成 base64 dataURL 也可以
// ============================================================
export const DEFAULT_ACTIONS = [
  { id: 1, number: 1, className: "五年一班", name: "保健室小志工",           photo: "501.jpg", votes: 0 },
  { id: 2, number: 2, className: "五年二班", name: "失物招領瘦身操",         photo: "502.jpg", votes: 0 },
  { id: 3, number: 3, className: "503 班",   name: "遊樂器材區糾察隊",       photo: "503.jpg", votes: 0 },
  { id: 4, number: 4, className: "五年四班", name: "校園除「絲」機",         photo: "504.jpg", votes: 0 },
  { id: 5, number: 5, className: "505 班",   name: "名牌看得到，正義一定到", photo: "505.jpg", votes: 0 },
  { id: 6, number: 6, className: "506 班",   name: "玻璃磚轉角的活化基地",   photo: "506.jpg", votes: 0 },
];

export const DEFAULT_META = {
  title: "龍潭國小 第 123 屆 自治市小市長選舉",
  subtitle: "DFC 行動方案 · 投票實況",
  schoolName: "龍潭國小",
  locked: false,   // true 時 admin 也無法再加票（封存用）
};

// 判斷是否還是預設佔位設定 — viewer/admin 可用來顯示「請先完成 setup」訊息
export function isPlaceholderConfig() {
  return firebaseConfig.apiKey === "REPLACE_WITH_YOUR_API_KEY";
}
