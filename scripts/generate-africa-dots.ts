import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoMercator, geoContains } from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/countries-110m.json'), 'utf8'));
const all: any = feature(topo, topo.objects.countries);

// ISO 3166-1 numeric codes of African countries present in the 110m dataset.
const AF = new Set([
  '012','024','204','072','854','108','120','140','148','174','178','180','384','262','818','226','232','748',
  '231','266','270','288','324','624','404','426','430','434','450','454','466','478','480','504','508','516',
  '562','566','646','678','686','690','694','706','710','728','729','834','768','788','800','894','716','732',
]);
const africa: any = { type: 'FeatureCollection', features: all.features.filter((f: any) => AF.has(String(f.id).padStart(3, '0'))) };

const W = 420, H = 470, STEP = 9;
const projection = geoMercator().fitSize([W, H], africa);
const nigeria = projection([8.1, 9.6])!;

const dots: string[] = [];
for (let row = 0, y = 4.5; y < H; y += STEP, row++) {
  for (let x = 4.5 + (row % 2 ? STEP / 2 : 0); x < W; x += STEP) {
    const ll = projection.invert!([x, y]);
    if (!ll || !geoContains(africa, ll as [number, number])) continue;
    const d = Math.hypot(x - nigeria[0], y - nigeria[1]);
    const op = (0.22 + 0.78 * Math.exp(-d / 170)).toFixed(2);
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.7" fill-opacity="${op}"/>`);
  }
}
writeFileSync('src/assets/africa-dots.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="#15E6A0">${dots.join('')}</svg>`);
writeFileSync('src/assets/africa-nigeria.json', JSON.stringify({ x: +nigeria[0].toFixed(1), y: +nigeria[1].toFixed(1), width: W, height: H }));
console.log(`dots: ${dots.length}`);
