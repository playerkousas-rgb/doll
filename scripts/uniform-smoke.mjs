/** 香港童軍總會青少年制服回歸：各支部配色、剪裁、帽／領帶、舊檔、分享／PNG。 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import chromium from '@sparticuz/chromium'
import { chromium as pw } from 'playwright-core'

const browser = await pw.launch({
  executablePath: await chromium.executablePath(), args: [...chromium.args, '--no-sandbox', '--disable-gpu'], headless: true,
})
const page = await browser.newPage({ viewport: { width: 1560, height: 960 }, acceptDownloads: true })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
const font = readFileSync('node_modules/@expo-google-fonts/noto-sans-tc/400Regular/NotoSansTC_400Regular.ttf')
const fontCss = `@font-face{font-family:'NotoTC';src:url(data:font/ttf;base64,${font.toString('base64')}) format('truetype')} body,button,input,textarea,h1,h2,h3,p,span{font-family:'NotoTC',sans-serif!important}`
const url = process.env.TEST_URL ?? 'http://localhost:5173/'
const board = page.locator('.board-art > svg[id^="doll-"]').first()
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('doll.canvas.v1')).elements[0])
const test = (name, ok) => { assert.ok(ok, name); console.log(`PASS  ${name}`) }
const waitDesign = (key, val) => page.waitForFunction(({ key, val }) =>
  JSON.parse(localStorage.getItem('doll.canvas.v1')).elements[0].design[key] === val, { key, val })
const select = async (id) => {
  await page.getByRole('combobox', { name: '支部制服' }).selectOption(id)
  await waitDesign('uniform', id)
}
const section = (name) => page.locator('.uniform-sections .section').filter({ has: page.getByRole('heading', { name, exact: true }) })
const png = async () => {
  const event = page.waitForEvent('download', { timeout: 12000 })
  await page.getByRole('button', { name: '匯出 PNG' }).click()
  return readFileSync(await (await event).path())
}

try {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.addStyleTag({ content: fontCss })
  const initial = (await state()).design
  test('新人物預設童軍陸裝、短褲、長襪和制服帽', initial.uniform === 'scout-land'
    && initial.uniformCut === 'shorts' && initial.uniformHat === 'on'
    && await board.locator('[data-layer="uniform-shirt"] > path').first().getAttribute('fill') === '#ead6b5'
    && await board.locator('[data-layer="uniform-hat"]').count() === 1)
  await page.getByRole('tab', { name: '制服' }).click()
  test('制服分類提供總會來源與五支部／海空款式', await page.locator('.uniform-tile').count() === 11
    && await page.locator('.uniform-summary a').getAttribute('href') === 'https://www.scout.org.hk/tc/youth-members/scouts/index.html?sid=2'
    && (await page.locator('.uniform-intro').innerText()).includes('小童軍只有集會服裝'))
  await page.screenshot({ path: 'shot-uniform.png' })

  const scoutPng = await png()
  test('童軍制服 PNG 非空', scoutPng.subarray(1, 4).toString() === 'PNG' && scoutPng.length > 5000)

  await select('scout-sea')
  test('海童軍換白衫／深藍短褲／白頂帽', (await state()).design.uniformCut === 'shorts'
    && await board.locator('[data-layer="uniform-shirt"] > path').first().getAttribute('fill') === '#faf9f5'
    && await board.locator('[data-layer="uniform-bottom"] > path').first().getAttribute('fill') === '#293e5a'
    && await board.locator('[data-layer="uniform-hat"] > path').first().getAttribute('fill') === '#f4f5f0')
  const seaPng = await png()
  test('海童軍 PNG 真正不同於陸童軍', !scoutPng.equals(seaPng))
  await page.screenshot({ path: 'shot-uniform-sea.png' })

  await select('scout-air')
  test('空童軍換淺藍衫／深藍褲／灰藍帽', await board.locator('[data-layer="uniform-shirt"] > path').first().getAttribute('fill') === '#c5d9e5'
    && await board.locator('[data-layer="uniform-hat"] > path').first().getAttribute('fill') === '#7189a0'
    && (await state()).design.uniformCut === 'shorts')

  await select('cub')
  const maleCap = await board.locator('[data-layer="uniform-hat"] > path').first().getAttribute('d')
  await section('下身剪裁').getByRole('button', { name: '裙褲' }).click()
  test('幼童軍裙褲連女款圓形有邊帽', (await state()).design.uniformCut === 'skort'
    && await board.locator('[data-layer="uniform-hat"] > path').first().getAttribute('d') !== maleCap
    && (await page.locator('.uniform-summary').innerText()).includes('草青色裙褲'))
  await page.screenshot({ path: 'shot-uniform-cub.png' })

  await select('scout-land')
  await section('下身剪裁').getByRole('button', { name: '長褲' }).click()
  test('童軍冬季全團長褲選項配黑短襪', (await state()).design.uniformCut === 'trousers'
    && (await page.locator('.uniform-summary').innerText()).includes('黑色短襪')
    && (await page.locator('.uniform-sections').innerText()).includes('旅長決定全團於冬季'))
  await select('venture-land')
  test('深資童軍保留合適的長褲，帽改棗紅', (await state()).design.uniformCut === 'trousers'
    && await board.locator('[data-layer="uniform-hat"] > path').first().getAttribute('fill') === '#913f4d')
  await section('領巾／領帶').getByRole('button', { name: '領帶 · 棗紅色' }).click()
  await section('下身剪裁').getByRole('button', { name: '及膝半截裙' }).click()
  test('深資可用及膝裙／襪褲／典禮棗紅領帶', (await state()).design.uniformCut === 'skirt'
    && (await state()).design.uniformNeckwear === 'tie'
    && await board.locator('[data-layer="uniform-tie"] path').count() > 0
    && await board.locator('[data-layer="travel-scarf"]').count() === 0)
  await page.screenshot({ path: 'shot-uniform-venture.png' })

  await select('rover-sea')
  test('樂行海童軍白衫深藍裙，領帶變黑色', (await state()).design.uniformCut === 'skirt'
    && await board.locator('[data-layer="uniform-shirt"] > path').first().getAttribute('fill') === '#faf9f5'
    && await board.locator('[data-layer="uniform-tie"] > path').nth(1).getAttribute('fill') === '#26282a')
  await page.screenshot({ path: 'shot-uniform-rover-sea.png' })
  await select('rover-air')
  test('樂行空童軍領帶深藍', await board.locator('[data-layer="uniform-tie"] > path').nth(1).getAttribute('fill') === '#243d5c')

  // 其餘深資／樂行陸、海、空：都須套用對應襯衫、下身、帽與領帶色。
  for (const [id, shirt, bottom, hat, tie] of [
    ['venture-sea', '#faf9f5', '#293e5a', '#f4f5f0', '#26282a'],
    ['venture-air', '#c5d9e5', '#293e5a', '#7189a0', '#243d5c'],
    ['rover-land', '#ead6b5', '#83965d', '#2d5443', '#2e5545'],
    ['rover-air', '#c5d9e5', '#293e5a', '#7189a0', '#243d5c'],
  ]) {
    await select(id)
    test(`${id} 衣、褲、帽、領帶四種配色相符`,
      await board.locator('[data-layer="uniform-shirt"] > path').first().getAttribute('fill') === shirt
      && await board.locator('[data-layer="uniform-bottom"] > path').first().getAttribute('fill') === bottom
      && await board.locator('[data-layer="uniform-hat"] > path').first().getAttribute('fill') === hat
      && await board.locator('[data-layer="uniform-tie"] > path').nth(1).getAttribute('fill') === tie)
  }

  await section('制服帽').getByRole('button', { name: '不戴帽' }).click()
  test('可以依活動安排暫時隱藏帽，其他制服保留', (await state()).design.uniformHat === 'off'
    && await board.locator('[data-layer="uniform-hat"]').count() === 0
    && await board.locator('[data-layer="uniform-tie"]').count() === 1)
  await page.keyboard.press('Control+z')
  test('制服配件可復原', (await state()).design.uniformHat === 'on')
  await page.keyboard.press('Control+Shift+z')
  test('制服配件可重做', (await state()).design.uniformHat === 'off')

  await select('scout-land')
  test('切回童軍自動回領巾與合適剪裁', (await state()).design.uniformNeckwear === 'scarf'
    && (await state()).design.uniformCut === 'shorts')
  await section('旅巾配色（示意）').getByLabel('旅巾底色').fill('#2255aa')
  await section('旅巾配色（示意）').getByLabel('旅巾邊色').fill('#f4c35d')
  test('旅巾可自訂示意色但不改官方制服主色', (await state()).design.scarfColor === '#2255aa'
    && (await state()).design.scarfTrim === '#f4c35d'
    && await board.locator('[data-layer="travel-scarf"] path').first().getAttribute('fill') === '#2255aa'
    && await board.locator('[data-layer="uniform-shirt"] > path').first().getAttribute('fill') === '#ead6b5')
  await page.getByRole('tab', { name: '提示詞' }).click()
  test('提示詞載有制服剪裁及旅巾並聲明示意', (await page.locator('.prompt-box').inputValue()).includes('草青色短褲')
    && (await page.locator('.prompt-box').inputValue()).includes('#2255aa'))

  await page.reload({ waitUntil: 'networkidle' })
  test('重新整理保留支部、褲型及旅巾顏色', (await state()).design.uniform === 'scout-land'
    && (await state()).design.uniformCut === 'shorts' && (await state()).design.scarfTrim === '#f4c35d')
  const shared = await page.evaluate(() => {
    const bytes = new TextEncoder().encode(localStorage.getItem('doll.canvas.v1'))
    let bin = ''
    for (const b of bytes) bin += String.fromCharCode(b)
    return `${location.origin}${location.pathname}#c=${btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`
  })
  await page.evaluate(() => localStorage.clear())
  await page.goto(shared, { waitUntil: 'networkidle' })
  await page.reload({ waitUntil: 'networkidle' })
  test('分享還原支部與雙色旅巾', (await state()).design.uniform === 'scout-land'
    && (await state()).design.scarfColor === '#2255aa')

  await page.evaluate(() => {
    const doc = JSON.parse(localStorage.getItem('doll.canvas.v1'))
    for (const key of ['uniform', 'uniformCut', 'uniformHat', 'uniformNeckwear', 'scarfColor', 'scarfTrim']) delete doc.elements[0].design[key]
    localStorage.setItem('doll.canvas.v1', JSON.stringify(doc))
  })
  await page.reload({ waitUntil: 'networkidle' })
  test('舊檔無制服欄位保留舊米白基礎衣物', (await state()).design.uniform === 'basic'
    && (await state()).design.uniformHat === 'off'
    && await board.locator('[data-layer="uniform-shirt"]').count() === 0
    && await board.locator('[data-layer="uniform-hat"]').count() === 0)
  await page.evaluate(() => {
    const doc = JSON.parse(localStorage.getItem('doll.canvas.v1'))
    Object.assign(doc.elements[0].design, {
      uniform: 'invalid', uniformCut: 'skirt', uniformHat: 'invalid', uniformNeckwear: 'tie',
      scarfColor: 'url(javascript:foo)', scarfTrim: '#abc',
    })
    localStorage.setItem('doll.canvas.v1', JSON.stringify(doc))
  })
  await page.reload({ waitUntil: 'networkidle' })
  test('無效制服 ID、剪裁及危險色碼安全回退', (await state()).design.uniform === 'scout-land'
    && (await state()).design.uniformCut === 'shorts' && (await state()).design.uniformHat === 'on'
    && (await state()).design.uniformNeckwear === 'scarf' && (await state()).design.scarfColor === '#b84648')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.addStyleTag({ content: fontCss })
  await page.getByRole('tab', { name: '制服' }).click()
  const layout = await page.evaluate(() => ({
    width: innerWidth, scroll: document.documentElement.scrollWidth,
    inspector: document.querySelector('.panel-right').getBoundingClientRect().top,
    library: document.querySelector('.panel-left').getBoundingClientRect().top,
  }))
  test('手機畫布下先見編輯器，再到圖庫，無水平溢位', await page.locator('.uniform-tile').count() === 11
    && await page.locator('.uniform-portrait svg').count() === 1
    && layout.inspector < layout.library && layout.scroll <= layout.width + 2)
  await page.locator('.uniform-portrait').scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'shot-uniform-mobile.png' })
  await page.locator('.parts-grid--uniform .part-uniform').filter({ hasText: '小童軍集會服裝' }).click()
  test('左側範本套用小童軍服裝並顯示非正式提醒', (await state()).design.uniform === 'grasshopper'
    && (await state()).design.uniformHat === 'off'
    && await board.locator('[data-layer="uniform-belt"]').count() === 0)
  test('沒有瀏覽器錯誤', errors.length === 0)
} finally {
  await browser.close()
}
