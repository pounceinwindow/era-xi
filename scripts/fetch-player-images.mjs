import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = await readFile(path.join(root, "src/data/football.ts"), "utf8");
const pattern = /\["([^"]+)","([^"]+)","[A-Z]{3}","[A-Z]+",\[[^\]]*\],\d+,"([^"]+)"\]/g;
const players = [...source.matchAll(pattern)].map((match) => ({ id: match[1], playerName: match[2], wikiTitle: match[3] }));
const outputDir = path.join(root, "public/players");
await mkdir(outputDir, { recursive: true });
const headers = { "User-Agent": "EraXI/1.0 (open-license image attribution; github.com/pounceinwindow/era-xi)" };
const attributionPath = path.join(root, "src/data/imageAttributions.json");
const existing = JSON.parse(await readFile(attributionPath, "utf8"));
const existingById = new Map(existing.map((item) => [item.playerId, item]));
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const stripHtml = (value = "") => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const acceptedLicense = (value = "") =>
  /^(CC BY|CC0|Public domain|PD)/i.test(value) && !/NC|ND/i.test(value);

async function request(url, attempts = 4) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetch(url, { headers });
    if (response.ok) return response;
    if (response.status !== 429 || attempt === attempts - 1) throw new Error(`${response.status} ${url}`);
    await sleep(Number(response.headers.get("retry-after") ?? 2) * 1000);
  }
  throw new Error(`Request failed: ${url}`);
}

async function fetchJson(url) {
  return (await request(url)).json();
}

async function processPlayer(player) {
  try {
    if (existingById.has(player.id)) {
      await access(path.join(outputDir, `${player.id}.webp`));
      return existingById.get(player.id);
    }
    const summary = await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(player.wikiTitle)}`);
    const imageUrl = summary.originalimage?.source;
    if (!imageUrl?.includes("upload.wikimedia.org")) return null;
    const filename = decodeURIComponent(new URL(imageUrl).pathname.split("/").at(-1));
    const api = new URL("https://commons.wikimedia.org/w/api.php");
    api.search = new URLSearchParams({
      action: "query", format: "json", origin: "*", prop: "imageinfo",
      titles: `File:${filename}`, iiprop: "url|extmetadata", iiurlwidth: "560"
    });
    await sleep(220);
    const data = await fetchJson(api);
    const page = Object.values(data.query?.pages ?? {})[0];
    const info = page?.imageinfo?.[0];
    const meta = info?.extmetadata ?? {};
    const license = stripHtml(meta.LicenseShortName?.value);
    if (!info?.thumburl || !acceptedLicense(license)) return null;
    await sleep(220);
    const response = await request(info.thumburl);
    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer).resize(480, 600, { fit: "cover", position: "north" }).webp({ quality: 78 }).toFile(path.join(outputDir, `${player.id}.webp`));
    return {
      playerId: player.id,
      playerName: player.playerName,
      author: stripHtml(meta.Artist?.value || meta.Credit?.value || "Wikimedia Commons contributor"),
      license,
      licenseUrl: stripHtml(meta.LicenseUrl?.value),
      sourcePage: info.descriptionurl
    };
  } catch (error) {
    process.stderr.write(`[skip] ${player.playerName}: ${error.message}\n`);
    return null;
  }
}

const attributions = [];
for (let index = 0; index < players.length; index += 2) {
  const batch = await Promise.all(players.slice(index, index + 2).map(processPlayer));
  attributions.push(...batch.filter(Boolean));
  await writeFile(attributionPath, `${JSON.stringify(attributions, null, 2)}\n`);
  process.stdout.write(`\rProcessed ${Math.min(index + 2, players.length)}/${players.length}; licensed photos ${attributions.length}`);
  await sleep(300);
}
process.stdout.write("\n");
await writeFile(attributionPath, `${JSON.stringify(attributions, null, 2)}\n`);
