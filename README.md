# emo-monster

簡短使用說明

- 開發與執行：
  - npm run dev（使用 Vite）
  - npm run build / npm run preview
- 初始化：npm run init（可加 --force 覆寫既有檔案）

操作說明

- 在畫布上拖放情緒素材，或直接點擊素材以加入（支援手機觸控）。
- 點擊「獲得情緒蛋」可模擬取得情緒蛋；情緒蛋會顯示於畫布旁。
- 使用「孵化情緒蛋」或「孵化全部」可逐顆孵化，孵化包含動畫、粒子與音效效果。
- 可匯出當前合成為 PNG / SVG，或匯出 JSON 與包含 metadata 的 Bundle。

設定

- 在右側 Controls（醒目區）可調整粒子數量、粒子大小與音量，設定會儲存在 localStorage（key: emo_settings）。

資料儲存鍵

- emo_eggs：情緒蛋列表
- emo_monsters：已收集怪獸
- emo_settings：使用者視覺/音效設定

貢獻

- 歡迎透過 GitHub Issues 或 Pull Requests 提供回饋與修正。
