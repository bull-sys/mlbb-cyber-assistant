import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getOptionalUser } from "../server/auth.js";

test("guest requests without an authorization header stay unauthenticated", () => {
  assert.equal(getOptionalUser(undefined, () => ({ id: 1 })), null);
  assert.equal(getOptionalUser("", () => ({ id: 1 })), null);
});

test("a valid bearer token resolves to its user", () => {
  const user = { id: 42, nickname: "DraftTester" };
  assert.deepEqual(
    getOptionalUser("Bearer valid-token", token => {
      assert.equal(token, "valid-token");
      return user;
    }),
    user
  );
});

test("invalid bearer tokens safely fall back to guest mode", () => {
  assert.equal(getOptionalUser("Bearer expired-token", () => {
    throw new Error("invalid token");
  }), null);
});

test("malformed bearer headers do not invoke token verification", () => {
  let called = false;
  assert.equal(getOptionalUser("Basic abc", () => {
    called = true;
    return { id: 1 };
  }), null);
  assert.equal(called, false);
});

test("draft endpoint is guest-accessible but rate-limited, and AI calls require authentication", async () => {
  const source = await readFile(new URL("../server/index.js", import.meta.url), "utf8");
  assert.match(source, /app\.post\("\/api\/ai\/draft",guestDraftRateLimit,optionalAuth,/);
  assert.match(source, /if\(openai&&req\.user\)/);
});
