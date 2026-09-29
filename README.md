# 人物設計台｜臉髮・香港童軍青少年制服

純前端的 Q 版角色編輯器。依目前工作次序：**臉與頭髮 → 青少年成員制服 → 畫風精修 → 動作**。正面自然站立是可用的起點；已有的六種姿勢與骨架是保留的草稿工具，不代表後兩階段已完成。

## 怎麼使用

1. 左側選人物起點，或按「新公仔」。點選畫布公仔，右側先開「臉與髮」。
2. 「臉部」分別選臉型、膚色、眼睛、眉型、嘴型、臉頰；「頭髮」選髮型、瀏海、髮色。選項與畫布共用 SVG 圖層，臉髮特寫不顯示制服帽，以便比較五官／瀏海。
3. 「制服」分類可切換**小童軍集會服裝、幼童軍，以及童軍／深資／樂行的陸、海、空款**。先選支部／類別，再選合適剪裁、戴帽／不戴帽、旅巾示意色；深資和樂行另可選特定場合的領帶。左側「青少年制服」圖庫亦可直接套用。體型及原有姿勢工具保持獨立。
4. 編輯會自動保存在瀏覽器；復原／重做、複製人物、分享畫布、匯出 PNG、提示詞都會反映目前的制服。**舊檔沒有制服欄位時保留原本米白色基礎衣物**，不誤稱為正式制服；新人物預設童軍陸裝。

## 臉髮與身體線條試版

[查看修改前／後的同角色對比圖](docs/line-art-comparison.png)：左邊是原版，右邊是目前的試畫；三位人物的設計資料與制服選擇完全相同，特寫暫不戴帽。試畫調整了臉頰至下巴的弧線、眼睛虹膜／亮點、短髮／長髮／捲髮的髮束走向，以及手臂、袖口、褲管和鞋子的輪廓。畫布、圖庫、臉髮特寫與 PNG 匯出仍共用一套 `Character` SVG，關節錨點沒有改動。

這是**原創 SVG 筆觸的畫風試驗**，參考 [Open Peeps](https://www.openpeeps.com/) 可換零件的思路，沒有複製或嵌入其圖像。保留原來的 Q 版比例，讓用家先比較再決定後續畫風；正式徽章與完整動作仍非本輪工作。執行 `npm run line:study` 可依目前程式重新輸出三位人物到忽略的 `shot-style-current.png`。

## 根據香港童軍總會的制服資料

總會的[青少年支部](https://www.scout.org.hk/tc/youth-members/sections.html)包括小童軍、幼童軍、童軍、深資童軍和樂行童軍；童軍及以上有陸、海、空類別。介面選項依總會[各支部資料](https://www.scout.org.hk/tc/youth-members/scouts/index.html?sid=2)、[《儀容與制服手冊》](https://uniform.scouting.org.hk/toc/)的文字規格整理，**不是總會提供的官方圖樣或色碼**。

| 支部／類別 | 恤衫與下身 | 帽與襪鞋 |
| --- | --- | --- |
| [小童軍](https://www.scout.org.hk/tc/youth-members/grasshopper-scouts/index.html?sid=2) | **不設正式制服**；整潔簡單服裝，可穿橙色活動服。此處的橙衫／單色褲只是集會服裝示例。 | 帽非必需，不沿用其他支部的制服帽／皮帶；宣誓後方佩戴旅巾及帽。 |
| [幼童軍](https://www.scout.org.hk/tc/youth-members/cub-scouts/index.html?sid=2) | 杏色短袖恤衫＋草青色短褲，或弓字褶裙褲。 | 深綠黃間條鴨舌帽／深綠有邊圓帽；深草青長襪及黑皮鞋。 |
| [童軍](https://www.scout.org.hk/tc/youth-members/scouts/index.html?sid=2) | 陸：杏衫＋草青下身；海：白衫＋深藍下身；空：淺藍衫＋深藍下身。短褲／裙褲；**長褲限旅長決定全團於冬季改穿**。 | 陸裝深綠軟帽，海裝白頂帽，空裝灰藍軟帽；陸配深草青長襪、海空配深藍長襪。 |
| [深資童軍](https://www.scout.org.hk/tc/youth-members/venture-scouts/index.html?sid=2)／[樂行童軍](https://www.scout.org.hk/tc/youth-members/rover-scouts/index.html?sid=2) | 陸／海／空的恤衫與下身配色同上；長褲或及膝無褶半截裙，裙配肉色襪褲。女性成員在動態活動可改穿長褲。 | 陸裝深資棗紅軟帽、樂行深綠軟帽；海白頂帽、空灰藍軟帽。特定典禮／會議可用領帶：陸裝深資棗紅、樂行深綠，海黑色、空深藍。 |

**使用界線：**上述顏色是總會的文字色名；程式內 HEX 僅為插畫近似值，並未量度或取得總會布料色碼。**旅巾顏色與樣式按所屬旅獲批設計，不存在全港統一配色**；兩個顏色輸入只用於視覺預覽。制服帽是否佩戴取決於活動、場地及宣誓狀態。徽章圖案及旅／地域／區等標識尚未繪製，也不會虛構所屬旅；需按總會手冊及實際所屬單位核對。特能童軍沒有另外編造一套獨立制服。

詳參：[青少年制服總則／宣誓前規定](https://uniform.scouting.org.hk/wp-content/uploads/2017/03/uniformhandbook_p26-27.pdf)、[幼童軍款](https://uniform.scouting.org.hk/wp-content/uploads/2017/03/uniformhandbook_p28-29.pdf)、[童軍及海空款](https://uniform.scouting.org.hk/wp-content/uploads/2017/03/uniformhandbook_p30-35.pdf)、[深資及海空款](https://uniform.scouting.org.hk/wp-content/uploads/2017/03/uniformhandbook_p36-41.pdf)、[樂行及海空款](https://uniform.scouting.org.hk/wp-content/uploads/2017/03/uniformhandbook_p42-47.pdf)、[領帶](https://uniform.scouting.org.hk/wp-content/uploads/2017/03/uniformhandbook_p48-49.pdf)、[基本徽章](https://uniform.scouting.org.hk/wp-content/uploads/2017/03/uniformhandbook_p92-95.pdf)、[旅巾](https://uniform.scouting.org.hk/wp-content/uploads/2017/03/uniformhandbook_p107-114.pdf)。

## 資料與渲染

| 模組 | 用途 |
| --- | --- |
| `src/types.ts`、`src/data/options.ts`、`src/data/templates.ts` | 造型型別、臉髮選項與預設人物。保留舊的 `face`、`hair` 等 ID，新增可分開調整的 `bangs`、`brows`、`mouth`、`cheeks` 及制服欄位。 |
| `src/data/uniforms.ts` | 12 個選項（11 個青少年樣式＋舊基礎衣物）、支部／類別、允許剪裁、插畫近似色、帽／領帶顏色、官方來源。 |
| `src/character/Face.tsx`、`Hair.tsx`、`Head.tsx` | 五官、後髮、髮束與瀏海分層；可組合、可隱藏帽作臉髮特寫。 |
| `src/character/UniformBody.tsx`、`UniformHat.tsx`、`LimbSkin.tsx`、`Character.tsx` | 短袖恤衫、領巾／領帶、皮帶、下身、襪鞋、共用的錐形手臂／袖口及分支帽 SVG；同一角色用於畫布、圖庫、全身預覽、姿勢範本及 PNG。 |
| `src/components/OptionsPanel.tsx`、`InspectorPanel.tsx`、`PartsPanel.tsx` | 臉／頭髮／制服／體型分類、即時比較、左側制服圖庫與目前套裝文字／來源。 |
| `src/lib/storage.ts`、`canvas.ts`、`share.ts` | 舊文件補欄位，驗證制服 ID／剪裁／色碼；`Doc.v = 1` 的舊檔、復原、分享仍能讀取。 |

### 已有的姿勢草稿

`src/character/pose.ts` 儲存六款姿勢範本和各關節角度；`rig.ts` 定義共用錨點；`Body.tsx` 和 `UniformBody.tsx` 依肩／肘、髖／膝骨架組合肢體。十個關節可拖曳、鏡像、用滑桿微調及復原；舊文件沒有 `pose` 時回站姿。本輪不增加動作種類。

### 參考與技術取捨

- [Godot Skeleton2D](https://github.com/godotengine/godot) 的父子骨骼／局部旋轉是既有姿勢骨架的概念參考；網站用 SVG transform，未引入遊戲引擎。
- [Rive](https://github.com/rive-app) 適用時間軸動畫，但網站目前不是動畫工具。
- [Inkscape](https://github.com/inkscape/inkscape) 與 [DiceBear](https://github.com/dicebear/dicebear) 分別啟發向量零件及組合頭像；角色 SVG 自行繪製，未使用其圖庫。
- [Konva](https://github.com/konvajs/konva)／[Fabric.js](https://github.com/fabricjs/fabric.js) 可擴充畫布互動；目前保留原生 SVG，避免增加額外執行依賴。

初版畫布／圖層操作結構參考 [lnkiai/m3e-canvas](https://github.com/lnkiai/m3e-canvas)。接下來依序是：**畫風統一與精修 → 動作深化**。

## 開發與驗證

```bash
npm ci
npm run dev              # Vite 開發伺服器，預設 http://localhost:5173/
npm run build            # TypeScript + 靜態網站
npm run lint
npm run sheet            # 產生 preview-sheet.svg，含五官、髮型、制服、姿勢
npm run shot             # 編輯、臉髮、制服、姿勢開發截圖
npm run line:study       # 三位角色的臉髮／全身線條試版圖
npm run face:smoke       # 臉髮組合、光頭、舊檔、復原、分享、PNG、手機
npm run uniform:smoke    # 陸海空／剪裁／帽／領帶／旅巾、舊檔、分享、PNG、手機
npm run smoke            # 畫布操作與既有功能
npm run pose:smoke       # 姿勢骨架回歸測試
```

瀏覽器測試須先啟動網站；使用 `@sparticuz/chromium`。若 Linux 缺少 Chromium 函式庫，可解壓 `node_modules/@sparticuz/chromium/bin/al2023.tar.br` 至 `/tmp/al2023libs`，以 `LD_LIBRARY_PATH=/tmp/al2023libs/lib npm run uniform:smoke`（其他瀏覽器指令同理）執行。截圖與預覽 SVG 已排除 Git；`npm run build` 的 `dist/` 可部署至靜態空間。

### 快捷鍵

| 按鍵 | 動作 |
| --- | --- |
| `V` / `H` | 選擇／手掌工具；按住空白鍵暫時平移。 |
| 滾輪 / `Ctrl`+滾輪 | 平移／以指標為中心縮放。 |
| `+` `-` `0` | 放大／縮小／適合畫面。 |
| `Ctrl+Z` / `Ctrl+Shift+Z` | 復原／重做；制服選項、骨架拖曳或滑桿操作一次算一筆。 |
| `Ctrl+D`、`Delete`、方向鍵 | 複製、刪除、微調選取公仔的位置。 |
| 聚焦骨架圓點後按方向鍵 | 每次微調關節 2°；按 `Shift` 改為 10°。 |
| `P` / `Esc` | 預覽／退出預覽或取消選取。 |
