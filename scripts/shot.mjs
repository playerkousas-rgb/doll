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
  body, button, input, textarea, h1, h2, p, span { font-family:'NotoTC', sans-serif !important; }`

const exe = await chromium.executablePath()
const browser = await pw.launch({
  executablePath: exe,
  args: [...chromium.args, '--no-sandbox', '--disable-gpu'],
  headless: true,
})

// 注意：sparticuz 以 --single-process 運行，關掉 page 會連瀏覽器一起終結 → 全程重用同一頁
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } })
const url = process.env.SHOT_URL ?? 'http://localhost:5173/'

await page.goto(url, { waitUntil: 'networkidle' })
await page.addStyleTag({ content: fontCss })
await page.waitForTimeout(500)
await page.screenshot({ path: 'app-screenshot.png' })

// 第二張：換個造型＋切到分享分頁（順便驗證 localStorage 讀回）
await page.evaluate(() => {
  localStorage.setItem(
    'doll.current.v1',
    JSON.stringify({ skin: 'wheat', face: 'heart', hair: 'twintail', hairColor: 'gold', eyes: 'wink', body: 'normal' }),
  )
})
await page.reload({ waitUntil: 'networkidle' })
await page.addStyleTag({ content: fontCss })
const tabs = page.getByRole('tab')
if ((await tabs.count()) >= 3) await tabs.nth(2).click()
await page.waitForTimeout(400)
await page.screenshot({ path: 'app-screenshot-2.png' })

console.log('screenshots done')
process.exit(0)
