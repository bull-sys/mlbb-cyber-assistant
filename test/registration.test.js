import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRegistration } from "../server/registration.js";

test("registration normalizes email and trims nickname", () => {
  assert.deepEqual(
    normalizeRegistration({
      email: "  Player@Example.COM ",
      password: "long-enough-password",
      nickname: "  Player One  "
    }),
    {
      ok: true,
      email: "player@example.com",
      password: "long-enough-password",
      nickname: "Player One"
    }
  );
});

test("registration rejects malformed and oversized email addresses", () => {
  for (const email of ["", "missing-at.example.com", "a@b", "two@@example.com", "x".repeat(250)+"@a.com"]) {
    assert.equal(normalizeRegistration({ email, password: "long-enough-password", nickname: "Player" }).ok, false, email);
  }
});

test("registration requires a password between 10 and 128 characters", () => {
  for (const password of ["", "123456789", "p".repeat(129)]) {
    assert.equal(normalizeRegistration({ email: "player@example.com", password, nickname: "Player" }).ok, false);
  }
  assert.equal(normalizeRegistration({ email: "player@example.com", password: "p".repeat(10), nickname: "Player" }).ok, true);
  assert.equal(normalizeRegistration({ email: "player@example.com", password: "p".repeat(128), nickname: "Player" }).ok, true);
});

test("registration requires a nickname between 2 and 24 characters", () => {
  for (const nickname of ["", " ", "x", "n".repeat(25)]) {
    assert.equal(normalizeRegistration({ email: "player@example.com", password: "long-enough-password", nickname }).ok, false);
  }
  assert.equal(normalizeRegistration({ email: "player@example.com", password: "long-enough-password", nickname: "xy" }).ok, true);
  assert.equal(normalizeRegistration({ email: "player@example.com", password: "long-enough-password", nickname: "n".repeat(24) }).ok, true);
});

test("registration rejects missing or non-object input safely", () => {
  assert.equal(normalizeRegistration().ok, false);
  assert.equal(normalizeRegistration(null).ok, false);
  assert.equal(normalizeRegistration("not-an-object").ok, false);
});
