export function normalizeRegistration(body = {}) {
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const nickname = String(body.nickname ?? "").trim();

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Укажи корректный email" };
  }
  if (password.length < 10 || password.length > 128) {
    return { ok: false, error: "Пароль должен содержать от 10 до 128 символов" };
  }
  if (nickname.length < 2 || nickname.length > 24) {
    return { ok: false, error: "Никнейм должен содержать от 2 до 24 символов" };
  }

  return { ok: true, email, password, nickname };
}
