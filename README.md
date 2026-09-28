# 童軍公仔設計台（Scout Doll Designer）

旅團個人化童軍卡通公仔設計工具 —— 像 Online Game 角色創建器一樣，組裝出屬於自己旅團的 Q 版童軍公仔。

參考 [lnkiai/m3e-canvas](https://github.com/lnkiai/m3e-canvas) 的「零件庫 → 畫布 → 輸出」模式：它的零件是 UI 控件，我們的零件是**公仔部位**。（原始參考紀錄見 `readme`）

## 目前功能（MVP · 第一階段：穿內衣的完整人）

- **角色創建器**：臉型 4 種・膚色 6 種・髮型 8 種・髮色 7 種・表情 4 種・體型 3 種
- **即時預覽**：分層 SVG 疊圖、可縮放，選項縮圖即時反映目前造型
- **匯出 PNG**：3 倍解析度高清下載
- **生圖提示詞**：自動產生通用中文 prompt，可自行修改後貼給 ChatGPT／Gemini 生成更精緻的版本
- **存檔**：localStorage 瀏覽器本機存檔，免帳號（私密）
- **分享**：設計 JSON 編碼進分享連結，任何人打開可「以此為底圖」繼續改（零後端）
- **介面**：繁體中文（香港用字）

## 發展路線

| 階段 | 內容 |
| --- | --- |
| ① 完成 | 角色創建器：臉型、髮型、膚色……（穿內衣的完整人） |
| ② | 換衣物（先一般衣物，**香港童軍總會制服**隨後） |
| ③ | 換章：內建香港童軍章庫（團徽、級章、進階章）＋名字／級數 |
| ④ | 換姿勢（每個姿勢都需重畫全套衣服圖層，故放最後） |
| ⑤ 可選 | Supabase「全世界分享牆」：無帳號、公開設計互相取用 |

## 技術

- **Vite + React + TypeScript**，純前端、無後端、無資料庫
- 一份設計就是一份 JSON（`{face, skin, hair, hairColor, eyes, body}`），可存檔、可放 URL
- 公仔為程式繪製的分層 SVG 素材，換部位＝換圖層
- `npm run build` 產靜態站，`base: './'` 可直接部署 GitHub Pages

## 開發

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 產出 dist/
```

## 素材地圖（給之後協作的人或 AI）

| 檔案 | 職責 |
| --- | --- |
| `src/character/Character.tsx` | 公仔分層 SVG。圖層順序：影子 → 後髮 → 腿 → 短褲 → 身體 → 背心 → 手臂 → 脖 → 耳 → 臉 → 五官 → 前髮 |
| `src/data/options.ts` | 部位選項（id ↔ 中文標籤 ↔ 顏色） |
| `src/types.ts` | `Design` JSON 格式（改格式請相容 `lib/storage.ts` 的 `normalize()`） |
| `src/lib/` | 存檔、分享連結、prompt 產生、PNG 匯出 |
| `src/components/` | 左側選項面板、右側輸出面板 |

## 開發驗證工具（選配）

畫風與 UI 的本地驗證腳本（`devDependencies` 中的重型工具僅供開發用）：

```bash
npm run sheet    # 產生 preview-sheet.svg：所有部位組合的型錄
# 轉 PNG 檢查：node -e "..."（用 @resvg/resvg-js，見 git 歷史）

npm run shot     # 無頭瀏覽器截圖 app-screenshot.png
# Linux 需先解壓系統函式庫並設定 LD_LIBRARY_PATH，詳見 scripts/shot.mjs 註解
```

## 參考

- [lnkiai/m3e-canvas](https://github.com/lnkiai/m3e-canvas) — Sketch Material 3 Expressive screens in the browser and turn them into vibe-coding prompts
- 香港童軍總會制服與章（第二、三階段素材依據）
