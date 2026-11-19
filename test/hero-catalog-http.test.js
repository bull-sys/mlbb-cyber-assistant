import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { copyFile, mkdtemp, mkdir, readFile, readdir, rm, symlink } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { createHmac } from "node:crypto";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { heroes } from "../server/data.js";
import { heroCatalog } from "../server/hero-catalog.js";
import { validateHeroCatalog } from "../server/hero-catalog-validation.js";
import { heroLegacyBaseline } from "./fixtures/hero-legacy-baseline.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jwtSecret = "hero-catalog-http-test-secret";
const catalogDisplayNames = [
  ...new Set(heroCatalog.flatMap(hero => [hero.nameEn, hero.displayNameRu]))
].filter(name => !heroes.some(hero => hero.name === name));

let server;
let serverRoot;
let baseUrl;
let serverOutput = "";

function createToken(id) {
  const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ id });
  const signature = createHmac("sha256", jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

async function findAvailablePort() {
  const listener = net.createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const { port } = listener.address();
  await new Promise((resolve, reject) =>
    listener.close(error => error ? reject(error) : resolve())
  );
  return port;
}

async function request(pathname, { method = "GET", body, token } = {}) {
  return fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: "Bearer " + token } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
}

before(async () => {
  serverRoot = await mkdtemp(path.join(os.tmpdir(), "mlbb-hero-api-"));
  const isolatedServerDir = path.join(serverRoot, "server");
  await mkdir(isolatedServerDir);
  await copyFile(path.join(repoRoot, "package.json"), path.join(serverRoot, "package.json"));

  for (const filename of await readdir(path.join(repoRoot, "server"))) {
    if (filename.endsWith(".js")) {
      await copyFile(
        path.join(repoRoot, "server", filename),
        path.join(isolatedServerDir, filename)
      );
    }
  }

  await symlink(path.join(repoRoot, "node_modules"), path.join(serverRoot, "node_modules"), "dir");
  const port = await findAvailablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ["server/index.js"], {
    cwd: serverRoot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(port),
      JWT_SECRET: jwtSecret,
      OPENAI_API_KEY: ""
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stdout.setEncoding("utf8").on("data", chunk => {
    serverOutput += chunk;
  });
  server.stderr.setEncoding("utf8").on("data", chunk => {
    serverOutput += chunk;
  });

  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Test server exited with code ${server.exitCode}:\n${serverOutput}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`, {
        signal: AbortSignal.timeout(300)
      });
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  throw new Error(`Test server did not become ready:\n${serverOutput}`);
});

after(async () => {
  if (server && server.exitCode === null) {
    const closed = once(server, "close");
    server.kill("SIGTERM");
    await closed;
  }
  if (serverRoot) await rm(serverRoot, { recursive: true, force: true });
});

test("GET /api/data preserves legacy heroes and exposes only verified catalog mappings", async () => {
  const response = await request("/api/data");
  assert.equal(response.status, 200);
  const data = await response.json();

  assert.deepEqual(data.heroes, heroes);
  assert.deepEqual(data.heroes, heroLegacyBaseline);
  assert.deepEqual(data.heroCatalog, heroCatalog);
  assert.equal(data.heroCatalogRosterStatus, "incomplete");
  assert.deepEqual(data.heroCatalogValidation, validateHeroCatalog(heroCatalog));
  assert.deepEqual(data.heroCatalogLegacyMappings, [
    { id: "jawhead", legacyName: "Кусака" },
    { id: "dyrroth", legacyName: "Диррот" }
  ]);

  for (const mapping of data.heroCatalogLegacyMappings) {
    const catalogMatches = data.heroCatalog.filter(hero => hero.id === mapping.id);
    const legacyMatches = data.heroes.filter(hero => hero.name === mapping.legacyName);
    assert.equal(catalogMatches.length, 1);
    assert.equal(legacyMatches.length, 1);
    assert.ok(["user_confirmed", "source_verified"].includes(catalogMatches[0].identity.status));
  }
});

test("profile and draft HTTP validation reject catalog display names absent from the legacy catalog", async () => {
  assert.ok(catalogDisplayNames.length > 0);
  const token = createToken(1);

  for (const name of catalogDisplayNames) {
    const profileResponse = await request("/api/profile", {
      method: "PUT",
      token,
      body: {
        hero: name,
        role: "Лес",
        rank: "Легенда",
        style: "Поднятие рейтинга"
      }
    });
    assert.equal(profileResponse.status, 400, `profile accepted ${name}`);

    const draftResponse = await request("/api/ai/draft", {
      method: "POST",
      token,
      body: { lane: "Лес", enemies: [name] }
    });
    assert.equal(draftResponse.status, 400, `draft accepted ${name}`);
  }

  const legacyProfileResponse = await request("/api/profile", {
    method: "PUT",
    token,
    body: {
      hero: "Кусака",
      role: "Лес",
      rank: "Легенда",
      style: "Поднятие рейтинга"
    }
  });
  assert.equal(legacyProfileResponse.status, 200);
});

test("draft HTTP analysis still receives legacy catalog inputs and returns existing results", async () => {
  const response = await request("/api/ai/draft", {
    method: "POST",
    token: createToken(1),
    body: { lane: "Золото", enemies: ["Эудора"] }
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.counters.map(({ name, score }) => ({ name, score })), [
    { name: "Бруно", score: 4 },
    { name: "Грейнджер", score: 4 }
  ]);
});

test("OCR candidate construction still receives the legacy hero names from /api/data", async () => {
  const response = await request("/api/data");
  const data = await response.json();
  const appSource = await readFile(
    new URL("../public/app.js", import.meta.url),
    "utf8"
  );

  assert.match(appSource, /data=await \$api\("\/data"\)/);
  assert.match(appSource, /options\(\$\(id\),data\.heroes\)/);
  assert.match(appSource, /data\.heroes\.map\(h=>h\.name\)/);
  assert.deepEqual(data.heroes.map(hero => hero.name), heroLegacyBaseline.map(hero => hero.name));
  assert.deepEqual(data.heroes, heroLegacyBaseline);
});
