# 童軍公仔設計台（Scout Doll Designer）

旅團個人化童軍卡通公仔**設計平台** —— 結構參考 [lnkiai/m3e-canvas](https://github.com/lnkiai/m3e-canvas)（原始參考紀錄見 `readme`）：它的零件是 UI 控件，我們的零件是**公仔部位**；它的畫布放手機螢幕，我們的畫布放公仔板。

## 介面結構（與參考專案對應）

```
┌─┬──────────┬──────────────────────────────┬─────────────┐
│LOGO       零件庫 │        無限畫布（平移/縮放）      │ ⊞ ⊟（分段鈕） │
│ 公仔      ·搜尋   │  ┌ 浮動工具列：選擇・手・＋・▶・↶┓ │ ·公仔名 chip  │
│ 圖層      ·分組1  │  │      公仔板（可拖曳、選取）  ┃ │ ·臉型/髮型…   │
│ 背景      ·分組2… │  └                          ┘ │ ·備註/提示詞  │
│ 文字（！）          │   縮放：− 140% ＋ 適合          │ ·複製提示詞   │
│ ──             │  （面板收合時角落出現 ⊞ 恢復鈕）      │             │
│ 匯出／分享        │                              │             │
└─┴──────────┴──────────────────────────────┴─────────────┘
```

| 參考專案 | 本專案 |
| --- | --- |
| 零件庫（Parts，可搜尋、分組、拖放） | 零件庫：**公仔**（可用）＋衣物／章／姿勢（佔位，依階段解鎖） |
| 無限畫布＋浮動工具列＋縮放列 | 同左（選擇／手掌、＋、預覽、復原重做；滾輪平移、Ctrl+滾輪縮放） |
| 圖層面板（z-order、鎖定） | 左欄切換的圖層視圖（顯示／隱藏、上下移、鎖定、刪除） |
| 主題面板 | 左欄切換的背景視圖（公仔卡底色） |
| 提示詞面板（名稱 chip → 備註 → prompt → 複製） | 右欄「提示詞」分頁，結構相同 |
| 面板可收合（畫布角落 ⊞ 恢復） | 同左：左欄＝再點一次同一顆圖示，右欄＝面板收合鈕；恢復鈕浮在畫布左上 |
| localStorage＋分享連結 | 同左（設計＝JSON，`#c=` 連結整張畫布帶走） |
| 預覽（▶ / P） | 同左（全螢幕乾淨預覽，Esc 退出） |

## 目前功能（骨架已就位，內容分階段填充）

- **公仔板**：多隻公仔放在同一張畫布（旅團列隊）、拖曳移動、選取、複製、刪除、鎖定、隱藏
- **角色創建器**（右欄屬性）：臉型 4・膚色 6・髮型 8・髮色 7・表情 4・體型 3
- **圖層／底色**：z-order 管理、公仔卡底色 6 款（畫布為固定淺灰底）
- **面板收合**：畫布空間最大化，角落一鍵恢復
- **提示詞**：每隻公仔可加專屬備註，自動生成通用中文生圖 prompt
- **存檔**：localStorage 自動存檔，免帳號
- **分享**：整張畫布編碼進連結（`#c=`），別人打開可「以此為底圖」
- **匯出**：整張畫布匯出 PNG（灰底＋公仔卡與名稱標籤）
- **復原／重做**：所有編輯都可 Ctrl+Z

## 發展路線

| 階段 | 內容 |
| --- | --- |
| ① ✓ 平台骨架 | 畫布、零件庫、圖層、屬性、提示詞、分享、匯出 |
| ② | **換衣物**（先一般衣物，香港童軍總會制服隨後） |
| ③ | **換章**：內建香港童軍章庫（團徽、級章、進階章） |
| ④ | **換姿勢**（每個姿勢需重畫全套衣服圖層，故最後） |
| ⑤ 可選 | 文字／裝飾零件、Supabase 全世界分享牆（無帳號） |

## 技術

- **Vite + React + TypeScript**，純前端、無後端、無資料庫
- 一份文件＝一份 JSON（`Doc { bg, elements[] }`），可存檔、可放 URL
- 公仔為程式繪製的分層 SVG（`src/character/Character.tsx`）
- `npm run build` 產靜態站（`base: './'`，可部署 GitHub Pages）

## 開發

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 產出 dist/
```

### 快捷鍵

| 按鍵 | 動作 |
| --- | --- |
| `V` / `H` | 選擇工具 / 手掌工具（按住空白鍵可暫時平移） |
| 滾輪 / `Ctrl`+滾輪 | 平移 / 以指標為中心縮放 |
| `+` `-` `0` | 放大 / 縮小 / 適合畫面 |
| `Ctrl+Z` / `Ctrl+Shift+Z` | 復原 / 重做 |
| `Ctrl+D` | 複製選取的公仔 |
| 方向鍵（`Shift`=8px） | 微調位置 |
| `Delete` | 刪除（鎖定的不可刪） |
| `P` / `Esc` | 預覽模式 / 退出預覽或取消選取 |

### 驗證工具（選配 devDependencies）

```bash
npm run sheet    # 造型型錄 preview-sheet.svg（SSR 渲染所有部位組合）
npm run shot     # 無頭瀏覽器截圖 shot-*.png（Linux 需 LD_LIBRARY_PATH，見腳本註解）
npm run smoke    # 功能冒煙測試：新增/復原/拖曳/刪除/面板收合/存檔/分享
```

## 素材地圖（給之後協作的人或 AI）

| 檔案 | 職責 |
| --- | --- |
| `src/App.tsx` | 編排整體：狀態、歷史（undo/redo）、鍵盤、持久化、分享匯出 |
| `src/components/CanvasStage.tsx` | 中央畫布：平移縮放、拖放、公仔板、浮動工具列 |
| `src/components/PartsPanel.tsx` | 零件庫（`DOLL_TEMPLATES` 加模板；`GROUPS` 加零件分組） |
| `src/components/LayersPanel.tsx` / `BgPanel.tsx` | 圖層 / 背景視圖 |
| `src/components/InspectorPanel.tsx` | 右欄：屬性 / 提示詞 |
| `src/components/OptionsPanel.tsx` | 屬性分節（部位選項縮圖） |
| `src/character/Character.tsx` | 公仔分層 SVG（影子→後髮→腿→短褲→身體→背心→手臂→脖→耳→臉→五官→前髮） |
| `src/lib/canvas.ts` | `Doc`／`DollElement` 格式、公仔板幾何、存檔（**改格式請相容 `normalizeDoc()`**） |
| `src/lib/` | 分享（`#c=`）、prompt、PNG 匯出 |
| `src/data/options.ts` | 部位選項（id ↔ 中文標籤 ↔ 顏色） |

## 參考

- [lnkiai/m3e-canvas](https://github.com/lnkiai/m3e-canvas) — Sketch Material 3 Expressive screens in the browser and turn them into vibe-coding prompts
- 香港童軍總會制服與章（第二、三階段素材依據）
