# 初始化（init）功能規格

目的
------
建立一個簡潔的專案初始化指令，讓新環境能快速準備成為可開發與部署到 GitHub Pages 的前端靜態網站專案。

範圍
------
- 在尚未初始化的專案資料夾內執行一次，建立必要的檔案與基本設定。
- 不包含：依賴套件安裝（例如 npm install）、CI/CD 設定、或進階專案模板的套用。

使用者故事
---------
1. 作為一個開發者，我希望執行一個單一指令來初始化專案，這樣我可以立即開始開發。
2. 作為一個專案管理者，我希望初始化程序能建立基本的專案說明與待辦，讓團隊成員了解專案狀態。
3. 作為一個貢獻者，我希望初始化能確保 Git 已正確初始化並建立初始提交，方便後續分支與 PR 流程。

主要行為流程（step-by-step）
-------------------------
1. 使用者在空目錄或專案根目錄執行指令（例如：npm run init 或 ./scripts/init.sh）。
2. 指令檢查是否已存在 .git 目錄；若不存在執行 git init。
3. 若不存在 tasks.md，建立或更新 tasks.md 並加入「init」項目（狀態為未完成），寫入簡短描述與建立者。
4. 若不存在 README.md，建立基本 README（含專案名稱與簡短說明）；若已存在，則在 README 頂端附加「初始化」更新紀錄。
5. 若不存在 spec/init.md（或專案指定的規格路徑），建立 spec/init.md 並填入本次初始化規格摘要（供日後追蹤）。
6. 建立 .gitignore 基本範本（若不存在）。
7. 將新增/修改的檔案加入 Git 並建立初始提交（commit message 範例："chore(init): project initialization"）。
8. 顯示執行結果摘要與下一步建議（例如：執行 npm install、建立分支、或設定 GitHub Pages）。

輸入與輸出（包括檔案與命令）
-----------------------------
輸入（命令）
- 指令範例： npm run init
- 或： ./scripts/init.sh

輸入（互動）
- 可選：使用者提供專案名稱（若 README 需要），或接受預設值（目前目錄名稱）。

輸出（檔案）
- README.md  （新增或更新）
- tasks.md   （新增或更新，新增 init 條目）
- spec/init.md （新增，包含本次初始化規格）
- .gitignore （新增，若不存在）
- （選項）.specify/ 或其他專案定義檔，視需要保留或建立簡易模板

輸出（終端顯示）
- 執行摘要（已建立的檔案清單、是否已 git init、commit hash 或訊息）

成功條件與驗收標準（明確、可測）
--------------------------------
1. 在乾淨的目錄執行 init 指令後，檔案系統包含：README.md、tasks.md、spec/init.md 與 .gitignore（若原先不存在）。
   - 可測：檢查這些檔案是否存在。
2. 若專案尚未初始化 Git，執行後應產生 .git 目錄並產生至少一個 commit，commit 訊息包含 "chore(init)"。
   - 可測：執行 git rev-parse --is-inside-work-tree 回傳 true，git log -1 顯示 commit 訊息包含關鍵字。
3. tasks.md 包含一條標題為 "init" 的項目，描述初始化內容並標示狀態（todo / 未完成）。
   - 可測：在 tasks.md 中搜尋 "init" 條目存在且狀態為未完成。
4. 執行輸出在終端列出已建立/更新的檔案清單並提供下一步建議（至少一條）。
   - 可測：標準輸出含有 "Created:" 或 "Updated:" 與檔案名稱。

最小可行實作要點（implementation notes）
---------------------------------
- 指令入口：提供一個簡單腳本（./scripts/init.sh）或 package.json 的 npm script（"init": "sh ./scripts/init.sh"）。
- 腳本流程（最小）：
  1. 檢查並建立 spec/ 目錄與 spec/init.md（將本文件或摘要寫入）。
  2. 檢查並建立 README.md（使用當前資料夾名稱作為專案名稱）。
  3. 檢查並建立 tasks.md，新增 "- [ ] init: 初始化專案"。
  4. 若不存在 .git，執行 git init && git add . && git commit -m "chore(init): project initialization"。
  5. 列印結果摘要。
- 必要檔案修改或新增：
  - scripts/init.sh（新增）
  - spec/init.md（新增）
  - 若需要，更新 package.json scripts 加入 "init" 指令。

備註與假設（Assumptions）
-------------------------
- 假設使用者環境已安裝 Git 並可於命令列執行 git 指令。
- 假設專案為前端靜態網站，且不在此階段安裝第三方套件。
- 若 README.md / tasks.md 已存在，腳本會採「保守附加」策略：不覆蓋既有內容，只在頂端或適當區塊加入初始化註記或條目。
- 若需要支援互動輸入（如專案名稱），腳本應允許帶參數或在執行時提示使用者。

建議檔案路徑
-----------
將規格檔放置於： spec/init.md

