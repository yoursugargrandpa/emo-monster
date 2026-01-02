# init 功能規格（簡潔版）

目的 (Purpose)

本功能提供一個專案初始化指令，讓新建立或複製的前端靜態網站專案能在第一次設定時快速建立必要的檔案與基本設定，減少手動步驟並確保一致性，便於後續部署到 GitHub Pages。

範圍 (Scope)

- 在新環境執行一次「init」程序，建立或更新下列項目：README、tasks.md 條目、基本規格檔（spec.md）、Git repository（如尚未初始化）、必要的 .gitignore（如適用）。
- 不包含套件安裝或第三方金鑰設定、不做複雜 CI/CD 設定。

使用者故事 (User Stories)

1. 身為開發者，我希望執行一次 init 指令後，專案已有基本說明檔與任務條目，這樣我可以馬上開始開發。  
2. 身為專案維護者，我希望 init 能在 repo 未初始化時自動建立 Git repo，減少手動設定。  
3. 身為新加入成員，我希望能看到一份簡易規格與初始化步驟，讓我快速理解專案結構與待辦事項。

主要行為流程 (Step-by-step)

前提：使用者在專案根目錄執行 init 指令（例如 npm run init、腳本或命令列指令）。

1. 檢查是否位於專案根目錄（尋找 package.json 或 index.html）。
2. 檢查是否已有 Git repository（檢查 .git 資料夾）：
   - 若無，執行 git init 並建立初始 commit（包含必要檔案）。
3. 檢查 README.md：
   - 若不存在，建立基本 README.md（包含專案名稱、簡短說明、快速啟動）。
   - 若存在，保留但不覆寫；可在 README 增加一行「已執行 init」註記（可選）。
4. 檢查 tasks.md：
   - 若存在，新增一條已建立的待辦：- [ ] init：建立專案基礎檔案（或標記為完成，視實作而定）。
   - 若不存在，建立 tasks.md 並加上上述條目。
5. 建立或更新規格檔（spec.md 或 spec/init.md）：
   - 新增一份簡短的 init 功能規格（本檔）。若已有，則不覆寫原始內容，而是在檔案尾新增註記與日期。
6. 檢查 .gitignore：若不存在，建立包含常見靜態網站可忽略項目的最小範本（node_modules、dist、.env 等）。
7. 最後產生一個簡短的執行報告，列出已建立或更新的檔案與操作（輸出到終端）。

輸入與輸出（包括檔案與命令）

輸入（命令）

- init 指令（例如：npm run init 或 ./scripts/init.sh）
- 使用者互動：若發現衝突，提示是否覆寫（預設：不覆寫）

輸入（專案檔案檢查）

- package.json
- index.html
- README.md
- tasks.md
- .git 資料夾

輸出（檔案與操作）

- 可能建立或更新的檔案：README.md、tasks.md、spec.md（或 spec/init.md）、.gitignore
- 可能執行的 Git 操作：git init、git add、git commit（初始 commit）
- 終端輸出：操作摘要（例如："README.md created", "tasks.md updated", "git initialized"）

成功條件與驗收標準（明確、可測）

Acceptance Criteria（至少符合下列所有項目）

1. 當在空白或未初始化的專案根目錄執行 init：
   - repo 內出現 .git 目錄（代表已執行 git init）或在既有 repo 中不造成破壞。
   - README.md 存在且檔案大小 > 20 bytes（代表填入基本內容）。
   - tasks.md 存在，且包含一行含文字 "init" 的待辦條目（未完成或已完成皆可，但必須存在）。
   - spec.md（本規格）已建立在專案根目錄，檔案大小 > 200 bytes，或已在現有規格添加註記與時間戳。
   - 終端輸出列出了至少一個建立或更新的檔案名。

2. 當在已初始化 repo 執行 init：
   - 不會覆寫使用者現有的 README.md 或 spec.md（除非使用者明確給予覆寫參數）。
   - 終端輸出會說明哪些檔案已存在並被保留。

3. 錯誤處理：
   - 若檔案寫入失敗或權限不足，init 回傳非零退出碼並在終端顯示錯誤訊息與建議操作。

最小可行實作要點（Implementation Notes）

- 指令介面：提供一個單一可被呼叫的腳本（例如 npm script: "init"）或簡單 shell 腳本，非交互式或僅提供必要確認提示。
- 檔案建立策略：採用「不覆寫預設」策略；若檔案已存在，採用附加註記或跳過並在輸出中通知。若提供 --force 選項，則可以覆寫。
- Git 操作：若執行 git init，需自動 git add 主要檔案並建立一個含說明的初始 commit，避免提交使用者可能不希望納入的檔案。
- 可擴充性：腳本應將所有可變項（例如 README 範本內容、tasks 條目文本）集中在頂部變數或模板檔，便於未來調整。
- 日誌/回報：終端輸出應列出每一步的結果（建立/跳過/錯誤）。

必要的檔案修改或新增（最少）

- 新增: spec.md（本檔）放在專案根目錄。路徑建議：./spec.md
- 新增或更新: README.md（若不存在則建立）
- 新增或更新: tasks.md（新增 init 條目）
- 新增: .gitignore（若不存在則建立最小範本）
- 新增: scripts/init.sh 或 npm script "init"（選項，視實作者偏好）

限制與排除（Scope exclusions）

- 不負責安裝 npm 套件、設定 CI/CD 服務、建立 GitHub repository 或處理密鑰／憑證。

假設（Assumptions）

- 專案為前端靜態網站，已包含 index.html 與 package.json（有時其中一項可能缺失，但可用來判斷專案根目錄）。
- 使用者具備在系統上執行 Git 的權限與基礎命令列使用能力。
- 預設行為為不覆寫現有檔案，除非提供 --force。

建議規格檔放置路徑

- 建議將此文件置於專案根目錄，檔名：spec.md（路徑：./spec.md）。

---

若需我把此規格寫入專案檔案（./spec.md），我可以立即建立；或改為放在 spec/init.md（需先建立 spec/ 資料夾）。