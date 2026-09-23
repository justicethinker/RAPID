import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const BASE = 'http://localhost:4173';
const results = [];
const check = (name, cond, detail = '') => {
  const line = `${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  :: ' + detail : ''}`;
  results.push(line);
  console.log(line);
};
const overlap = (a, b) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

await mkdir('docs/audit', { recursive: true });
const browser = await chromium.launch();

/* ================= DESKTOP 1440 ================= */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(800);

  // --- hero LCP image is eager + prioritised, logo uses webp, no .tsx preload ---
  const heroImg = await page.evaluate(() => {
    const img = document.querySelector('img[src*="hero-pitch"]');
    return img ? { loading: img.loading, fp: img.getAttribute('fetchpriority') } : null;
  });
  check('hero image eager + fetchpriority=high', heroImg?.loading === 'eager' && heroImg?.fp === 'high', JSON.stringify(heroImg));
  const webpUsed = await page.evaluate(() =>
    performance.getEntriesByType('resource').some((e) => e.name.includes('r-mark.webp'))
  );
  check('logo loads r-mark.webp', webpUsed);
  const badPreload = await page.evaluate(() => !!document.querySelector('link[rel="modulepreload"][href*=".tsx"], link[href*="/src/"]'));
  check('no source modulepreload in html', !badPreload);

  // --- hero connectors: main card → globe bounce → floating card ---
  await page.waitForTimeout(2500); // 0.9s delay + 1.2s draw + markers
  const hero = await page.evaluate(() => {
    const cont = [...document.querySelectorAll('div')].find(
      (d) => typeof d.className === 'string' && d.className.includes('w-[480px]') && d.className.includes('right-[-32px]')
    );
    if (!cont) return { error: 'no connector container' };
    const kids = [...cont.children];
    const svg = kids.find((el) => el.tagName.toLowerCase() === 'svg');
    const isSvgFirst = svg === kids[0];
    const cards = kids.filter((el) => el.tagName.toLowerCase() === 'div');
    const paths = svg ? [...svg.querySelectorAll('path')] : [];
    const sb = svg.getBoundingClientRect();
    const toPage = (x, y) => ({ x: sb.x + x * (sb.width / 480), y: sb.y + y * (sb.height / 560) });
    const ends = paths.map((p) => { const e = p.getPointAtLength(p.getTotalLength()); return toPage(e.x, e.y); });
    const starts = paths.map((p) => { const s = p.getPointAtLength(0); return toPage(s.x, s.y); });
    const ds = paths.map((p) => p.getAttribute('d') || '');
    const touches = ds.map((d) => {
      // SVG allows "L315" with no space after the command
      const parts = d.replace('M', '').split(/\s+L\s*/);
      if (!parts[1]) return null;
      const seg = parts[1].split(/\s+/).map(Number);
      return toPage(seg[0], seg[1]);
    });
    const cardRs = cards.map((c) => c.getBoundingClientRect());
    const endHits = ends.map((e) => cardRs.findIndex((r) => e.x >= r.x && e.x <= r.right && e.y >= r.y && e.y <= r.bottom));
    const mainCard = document.querySelector('[class*="shadow-elev-3-dark"]');
    const startBehindMainCard = starts.every((s) => {
      const el = document.elementFromPoint(s.x, s.y);
      return el && mainCard && (el === mainCard || mainCard.contains(el));
    });
    const touchDbg = [];
    const touchOpen = touches.map((t, i) => {
      if (!t) { touchDbg.push(`${i}:null-touch`); return false; }
      const el = document.elementFromPoint(t.x, t.y);
      if (!el) { touchDbg.push(`${i}:null-el@${Math.round(t.x)},${Math.round(t.y)}`); return false; }
      if (!mainCard) { touchDbg.push(`${i}:no-maincard`); return false; }
      const inMain = el === mainCard || mainCard.contains(el);
      const inFloat = cards.some((c) => el === c || c.contains(el));
      touchDbg.push(`${i}:${el.tagName}.${String(el.className).slice(0, 30)} inMain=${inMain} inFloat=${inFloat}`);
      return !inMain && !inFloat;
    });
    const circles = [...svg.querySelectorAll('circle')];
    const pulseCount = circles.filter((c) => (c.getAttribute('style') || '').includes('pulseRing')).length;
    const dash = paths.map((p) => getComputedStyle(p).strokeDashoffset);
    return { isSvgFirst, n: paths.length, ds, endHits, startBehindMainCard, touchOpen, touchDbg, pulseCount, dash };
  });
  if (hero.error) {
    check('hero connector container present', false, hero.error);
  } else {
    check('hero: svg renders before cards (lines behind them)', hero.isSvgFirst);
    check('hero: 3 connector trajectories', hero.n === 3, `n=${hero.n} ds=${JSON.stringify(hero.ds)}`);
    check('hero: every line starts behind the main card', hero.startBehindMainCard === true);
    check('hero: bounce nodes sit in open globe space (no card covers them)', (hero.touchOpen || []).every(Boolean), JSON.stringify(hero.touchDbg));
    check('hero: every line ends under its own floating card', (hero.endHits || []).join(',') === '0,1,2', JSON.stringify(hero.endHits));
    check('hero: bounce rings animate with pulseRing', hero.pulseCount === 3, String(hero.pulseCount));
    check('hero: line draw completed', (hero.dash || []).every((d) => d === '0' || d === '0px'), JSON.stringify(hero.dash));
    await page.locator('#top').screenshot({ path: 'docs/audit/hero-1440.png' });
  }

  // --- FindPeople desktop geometry ---
  const fp = page.locator('section:has-text("FIND RELEVANT PEOPLE")').first();
  await fp.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2600); // line draw: 0.6s delay + 1.2s duration

  const geo = await page.evaluate(() => {
    const stages = [...document.querySelectorAll('[role="img"][aria-label*="Example profiles"]')];
    const stage = stages.find((el) => el.offsetParent !== null);
    if (!stage) return { error: 'no visible stage' };
    const kids = [...stage.children];
    const svg = kids[0]?.tagName?.toLowerCase() === 'svg' ? kids[0] : stage.querySelector(':scope > svg');
    const cards = kids.filter((el) => el.querySelector('img'));
    const node = kids.find((el) => el !== svg && !el.querySelector('img'));
    const r = (el) => {
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom };
    };
    const paths = svg ? [...svg.querySelectorAll('path')] : [];
    const endpoints = paths.map((p) => {
      const L = p.getTotalLength();
      const s = p.getPointAtLength(0);
      const e = p.getPointAtLength(L);
      return { s: { x: s.x, y: s.y }, e: { x: e.x, y: e.y }, dash: getComputedStyle(p).strokeDashoffset };
    });
    return {
      stage: r(stage),
      node: node ? r(node) : null,
      cards: cards.map(r),
      cardEls: cards,
      svgFirst: svg === kids[0],
      endpoints,
      opacity: cards.map((c) => getComputedStyle(c).opacity),
      stageRect: stage.getBoundingClientRect(),
    };
  });

  if (geo.error) {
    check('desktop stage visible', false, geo.error);
  } else {
    check('desktop stage is 640×480', Math.abs(geo.stage.w - 640) < 2 && Math.abs(geo.stage.h - 480) < 2, `${geo.stage.w}x${geo.stage.h}`);
    check('svg paints first (behind cards)', geo.svgFirst);
    check('3 profile cards + node present', geo.cards.length === 3 && !!geo.node);

    const boxes = [...geo.cards, geo.node];
    let ov = '';
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++)
        if (overlap(boxes[i], boxes[j])) ov += `${i}x${j} `;
    check('no card/node overlaps on laptop', ov === '', ov);

    const outside = geo.cards.filter((c) => c.x < geo.stage.x - 1 || c.right > geo.stage.x + geo.stage.w + 1 || c.y < geo.stage.y - 1 || c.bottom > geo.stage.y + geo.stage.h + 1);
    check('all cards inside the stage', outside.length === 0, `${outside.length} outside`);

    // endpoints land INSIDE their card (behind it), in page coords
    const ep = geo.endpoints.map((p) => ({ x: geo.stage.x + p.e.x, y: geo.stage.y + p.e.y }));
    const hits = await page.evaluate((pts) => {
      const stages = [...document.querySelectorAll('[role="img"][aria-label*="Example profiles"]')];
      const stage = stages.find((el) => el.offsetParent !== null);
      const cards = [...stage.children].filter((el) => el.querySelector('img'));
      return pts.map((p) => {
        const el = document.elementFromPoint(p.x, p.y);
        const card = cards.findIndex((c) => c.contains(el) || el === c);
        return card;
      });
    }, ep);
    check('each line ends UNDER its card (line never covers the card)', hits.join(',') === '0,1,2', `hits=${hits.join(',')}`);
    check('line draw animation fired', geo.endpoints.every((p) => p.dash === '0' || p.dash === '0px'), geo.endpoints.map((p) => p.dash).join(','));
    check('cv-auto did not break in-view reveals', geo.opacity.every((o) => o === '1'), geo.opacity.join(','));

    await fp.screenshot({ path: 'docs/audit/find-people-1440.png' });
  }

  // --- Accordion (section 04): animated open AND close ---
  const acc = page.locator('section:has-text("LEARN FROM ACTIONS")').first();
  await acc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await acc.screenshot({ path: 'docs/audit/action-evidence-1440.png' });

  const sample = async (idx) => {
    // click + per-frame height sampling inside the page (rAF ≈ 60fps), so a
    // 300ms animation yields ~18 real intermediate heights
    await page.evaluate(
      (i) => {
        window.__h = [];
        const secs = [...document.querySelectorAll('section')].filter((s) => s.textContent.includes('LEARN FROM ACTIONS'));
        const btns = secs[0].querySelectorAll('button[aria-expanded]');
        // the Item box never unmounts: trigger > Header > Item
        const item = btns[i].parentElement.parentElement;
        btns[i].click();
        const t0 = performance.now();
        const tick = () => {
          window.__h.push(Math.round(item.getBoundingClientRect().height));
          if (performance.now() - t0 < 750) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      idx
    );
    await page.waitForTimeout(900);
    return page.evaluate(() => window.__h);
  };

  // trigger > Header > Item holds the content
  let openH = await page.evaluate(() => {
    const secs = [...document.querySelectorAll('section')].filter((s) => s.textContent.includes('LEARN FROM ACTIONS'));
    const btns = secs[0].querySelectorAll('button[aria-expanded]');
    const item = btns[0].parentElement.parentElement;
    const content = item.querySelector('[class*="accordionOpen"]');
    return content ? Math.round(content.getBoundingClientRect().height) : -1;
  });
  check('default accordion item open', openH > 20, `h=${openH}`);
  if (openH <= 20) openH = 200; // guard: keep later math sane

  // item box = header + content; watch it grow/shrink per frame
  const openSeq = await sample(1); // open item 1 (was closed)
  const lo = Math.min(...openSeq);
  const hi = Math.max(...openSeq);
  const openInter = new Set(openSeq.filter((h) => h > lo + 2 && h < hi - 2));
  check('accordion OPEN animates through heights (not instant)', hi - lo > 20 && openInter.size >= 6, `span=${hi - lo}px, ${openInter.size}/${openSeq.length} intermediate heights`);

  const closeSeq = await sample(1); // close it again
  const clo = Math.min(...closeSeq);
  const chi = Math.max(...closeSeq);
  const closeInter = new Set(closeSeq.filter((h) => h > clo + 2 && h < chi - 2));
  // a snap would produce 0 intermediates (one-frame 134→86 jump); the ease
  // curve spends only ~100ms in the mid band, so ≥3 still proves animation
  check('accordion CLOSE animates (no longer snaps)', chi - clo > 20 && closeInter.size >= 3, `span=${chi - clo}px, ${closeInter.size}/${closeSeq.length} intermediate heights; tail=${closeSeq.slice(-4).join('>')}`);

  const closed = await page.evaluate(() => {
    const secs = [...document.querySelectorAll('section')].filter((s) => s.textContent.includes('LEARN FROM ACTIONS'));
    const btns = secs[0].querySelectorAll('button[aria-expanded]');
    return btns[1].getAttribute('aria-expanded');
  });
  check('item fully closed after animation', closed === 'false', closed);

  // --- interactive role demo: every button must do something ---
  const rd = page.locator('section:has-text("works for you")').first();
  await rd.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  check('role demo: idle state prompts for an action', await rd.getByText('Preview what happens').isVisible());

  await rd.locator('button:has-text("Try it")').click();
  check('role demo: Try it opens the request preview', await rd.getByText('Preview how you could request early access').isVisible());
  await rd.locator('button:has-text("Preview request")').click();
  check('role demo: preview ends in success (nothing sent)', await rd.getByText('Request previewed — demo only').isVisible());
  await rd.locator('button:has-text("Try another")').click();

  await rd.locator('button:has-text("Book a call")').click();
  check('role demo: Book a call lists sample slots', await rd.locator('button:has-text("Wed")').first().isVisible());
  await rd.locator('button:has-text("Wed")').first().click();
  check('role demo: picking a slot ends in success (nothing booked)', await rd.getByText('Slot selected — demo only').isVisible());
  await rd.locator('button:has-text("Try another")').click();

  await rd.locator('button:has-text("Collaborate")').click();
  await rd.locator('button:has-text("Preview collab")').click();
  check('role demo: collab preview ends in success', await rd.getByText('Collaboration previewed — demo only').isVisible());
  await rd.locator('button:has-text("Try another")').click();
  check('role demo: Try another returns to the idle state', await rd.getByText('Preview what happens').isVisible());

  // founder tab: accept / undo / expandable report
  await rd.locator('button[role="tab"]:has-text("Founder")').click();
  await rd.locator('button[aria-label^="Accept:"]').first().click();
  check(
    'role demo: founder accept shows badge + counter',
    (await rd.getByText('Accepted', { exact: true }).isVisible()) && (await rd.getByText('1/3').isVisible())
  );
  await rd.locator('button[aria-label^="Undo decision"]').first().click();
  check('role demo: undo restores the action buttons', (await rd.locator('button[aria-label^="Accept:"]').count()) === 3);

  await rd.locator('button[aria-label^="Accept:"]').first().click();
  await rd.locator('button:has-text("Open sample report")').click();
  check('role demo: sample report expands', await rd.getByText('What worked').isVisible());
  await rd.screenshot({ path: 'docs/audit/role-demo-1440.png' });
  await rd.locator('button:has-text("Close")').click();
  check('role demo: report collapses again', !(await rd.getByText('What worked').isVisible()));
  await rd.locator('button[aria-label^="Undo decision"]').first().click();
  check('role demo: demo state fully resets', (await rd.locator('button[aria-label^="Accept:"]').count()) === 3);

  check('no console errors (desktop)', errors.length === 0, errors.join(' | '));
  await page.close();
}

/* ================= MOBILE 390 ================= */
{
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(BASE + '/?join=1', { waitUntil: 'load' });
  await page.waitForTimeout(700);

  const dialog = page.locator('[aria-label="Join the waitlist"]');
  const visible = await dialog.isVisible();
  check('deep link opens waitlist dialog', visible);
  if (visible) {
    const db = await dialog.boundingBox();
    check('dialog fits the mobile viewport', db && db.y >= -1 && db.y + db.height <= 845, JSON.stringify(db));
    const fontSizes = await page.evaluate(() =>
      ['#w-name', '#w-email'].map((s) => parseFloat(getComputedStyle(document.querySelector(s)).fontSize))
    );
    check('inputs are ≥16px on mobile (no iOS zoom)', fontSizes.every((f) => f >= 16), fontSizes.join(','));
    await dialog.screenshot({ path: 'docs/audit/waitlist-390.png' });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // --- FindPeople mobile layout ---
  const fp = page.locator('section:has-text("FIND RELEVANT PEOPLE")').first();
  await fp.scrollIntoViewIfNeeded();
  // centre the diagram so elementFromPoint works for every card
  await page.evaluate(() => {
    const stages = [...document.querySelectorAll('[role="img"][aria-label*="Example profiles"]')];
    const stage = stages.find((el) => el.offsetParent !== null);
    stage?.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(2600);

  const m = await page.evaluate(() => {
    const stages = [...document.querySelectorAll('[role="img"][aria-label*="Example profiles"]')];
    const stage = stages.find((el) => el.offsetParent !== null);
    if (!stage) return { error: 'no visible stage' };
    const group = stage.matches('div[class*="pl-[30px]"]') ? stage : stage.querySelector('[class*="pl-[30px]"]');
    const wrappers = [...(group?.querySelector(':scope > div')?.children ?? [])];
    const spine = group?.querySelector('span');
    const r = (el) => {
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right };
    };
    const elbows = wrappers.map((w) => w.querySelector('svg path'));
    const ends = elbows.map((p) => {
      if (!p) return null;
      const svg = p.ownerSVGElement;
      const L = p.getTotalLength();
      const pt = p.getPointAtLength(L);
      const sb = svg.getBoundingClientRect();
      return { x: sb.x + pt.x, y: sb.y + pt.y };
    });
    return {
      wrappers: wrappers.map(r),
      wrapperEls: wrappers,
      spineW: spine ? spine.getBoundingClientRect().width : 0,
      ends,
      opacity: wrappers.map((w) => getComputedStyle(w).opacity),
      desktopHidden: ![...stages].some((el) => el.offsetParent !== null && el.querySelector('svg')?.viewBox?.baseVal?.width === 640),
      vh: innerWidth,
    };
  });

  if (m.error) {
    check('mobile timeline stage visible', false, m.error);
  } else {
    check('mobile shows 3 cards + spine', m.wrappers.length === 3 && m.spineW > 0, `spine=${m.spineW}px`);
    check('desktop stage hidden on mobile', m.desktopHidden);
    const outside = m.wrappers.filter((c) => c.x < -0.5 || c.right > 390.5);
    check('all mobile cards fit the 390px viewport', outside.length === 0, JSON.stringify(outside));
    let ov = '';
    for (let i = 0; i < m.wrappers.length; i++)
      for (let j = i + 1; j < m.wrappers.length; j++)
        if (overlap(m.wrappers[i], m.wrappers[j])) ov += `${i}x${j} `;
    check('no mobile card overlaps', ov === '', ov);

    const hits = await page.evaluate((pts) => {
      const stages = [...document.querySelectorAll('[role="img"][aria-label*="Example profiles"]')];
      const stage = stages.find((el) => el.offsetParent !== null);
      const wrappers = [...stage.querySelector('[class*="pl-[30px]"] > div').children];
      return pts.map((p) => {
        if (!p) return -1;
        const el = document.elementFromPoint(p.x, p.y);
        return wrappers.findIndex((w) => w.contains(el) || el === w);
      });
    }, m.ends);
    check('each curve ends UNDER its card', hits.join(',') === '0,1,2', `hits=${hits.join(',')}`);
    check('mobile in-view reveals fired', m.opacity.every((o) => o === '1'), m.opacity.join(','));

    await fp.screenshot({ path: 'docs/audit/find-people-390.png' });
  }

  // --- accordion on mobile: open item 1, screenshot, close ---
  const acc = page.locator('section:has-text("LEARN FROM ACTIONS")').first();
  await acc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await acc.locator('button[aria-expanded]').nth(1).click();
  await page.waitForTimeout(500);
  await acc.screenshot({ path: 'docs/audit/action-evidence-390.png' });
  const mOpen = await acc.locator('button[aria-expanded]').nth(1).getAttribute('aria-expanded');
  check('mobile accordion opens on tap', mOpen === 'true', String(mOpen));

  check('no console errors (mobile)', errors.length === 0, errors.join(' | '));
  await page.close();
}

await browser.close();
console.log(results.join('\n'));
const fails = results.filter((r) => r.startsWith('FAIL')).length;
console.log(`\n${results.length - fails}/${results.length} checks passed`);
process.exit(fails ? 1 : 0);
