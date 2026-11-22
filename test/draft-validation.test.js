import assert from "node:assert/strict";
import test from "node:test";
import { isValidDraftRequest } from "../server/draft-validation.js";

const roles = ["Лес", "Золото", "Опыт", "Мид", "Роум"];
const isHeroName = name => ["Эудора", "Тигрил", "Линг", "Ангела", "Хелкарт"].includes(name);
const valid = {
  lane: "Лес",
  enemies: ["Эудора", "Тигрил"],
  allies: ["Ангела"],
  myHero: "Хелкарт"
};

test("validates a complete draft payload", () => {
  assert.equal(isValidDraftRequest(valid, roles, isHeroName), true);
});

test("allows omitted allies and selected hero for a minimal guest draft", () => {
  assert.equal(isValidDraftRequest({ lane: "Мид", enemies: ["Эудора"] }, roles, isHeroName), true);
});

test("rejects malformed payloads, lanes, and unknown hero names", () => {
  for (const body of [null, [], "draft", {}, { ...valid, lane: "Неизвестно" }, { ...valid, enemies: ["Нет такого героя"] }, { ...valid, myHero: "Нет такого героя" }]) {
    assert.equal(isValidDraftRequest(body, roles, isHeroName), false);
  }
});

test("rejects more than five picks and duplicate picks", () => {
  assert.equal(isValidDraftRequest({ ...valid, enemies: Array(6).fill("Эудора") }, roles, isHeroName), false);
  assert.equal(isValidDraftRequest({ ...valid, enemies: ["Эудора", "Эудора"] }, roles, isHeroName), false);
  assert.equal(isValidDraftRequest({ ...valid, allies: ["Ангела", "Ангела"] }, roles, isHeroName), false);
});

test("rejects non-array allies", () => {
  assert.equal(isValidDraftRequest({ ...valid, allies: "Ангела" }, roles, isHeroName), false);
});

test("draft route uses shared validation before analysis", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../server/index.js", import.meta.url), "utf8");
  assert.match(source, /if\(!isValidDraftRequest\(b,roles,isLegacyHeroName\)\)/);
});
