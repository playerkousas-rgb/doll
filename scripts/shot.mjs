/** 開發用：截取實際頁面截圖（用 @sparticuz/chromium 的無頭瀏覽器）
 *  用法：LD_LIBRARY_PATH=/tmp/al2023libs/lib node scripts/shot.mjs
 *  （需要先解壓 @sparticuz/chromium/bin/al2023.tar.br，見 README）
 */
import { readFileSync } from 'node:fs'
import chromium from '@sparticuz/chromium'
import { chromium as pw } from 'playwright-core'

// 無頭瀏覽器環境沒有系統字型，把 Noto Sans TC 用 data URL 注入
const font = readFileSync('node_modules/@expo-google-fonts/noto-sans-tc/400Regular/NotoSansTC_400Regular.ttf')
const fontCss = `@font-face{font-family:'NotoTC';src:url(data:font/ttf;base64,${font.toString('base64')}) format('truetype');}
  body, button, input, textarea, h1, h2, h3, p, span { font-family:'NotoTC', sans-serif !important; }`

const exe = await chromium.executablePath()
const browser = await pw.launch({
  executablePath: exe,
  args: [...chromium.args, '--no-sandbox', '--disable-gpu'],
  headless: true,
})
const page = await browser.newPage({ viewport: { width: 1560, height: 960 } })
const url = process.env.SHOT_URL ?? 'http://localhost:5173/'

const open = async () => {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: fontCss })
  await page.waitForTimeout(700)
}

// 1. 主編輯器（屬性分頁）
await open()
await page.screenshot({ path: 'shot-editor.png' })

// 2. 左側圖層面板
await open()
await page.getByRole('button', { name: '圖層', exact: true }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'shot-layers.png' })

// 3. 右側提示詞分頁（加一隻公仔再切）
await open()
await page.getByRole('tab', { name: '提示詞' }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'shot-prompt.png' })

// 4. 預覽模式（按 P）
await open()
await page.keyboard.press('p')
await page.waitForTimeout(600)
await page.screenshot({ path: 'shot-preview.png' })

console.log('screenshots done')
process.exit(0)
