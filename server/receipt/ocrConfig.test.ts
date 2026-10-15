import test from "node:test";
import assert from "node:assert";
import { readOcrConfig } from "./ocrConfig.js";

test("正常: 有効な https URL と apiKey が読み取れること", () => {
  const result = readOcrConfig({
    OCR_API_URL: "https://api.example.com/ocr",
    OCR_API_KEY: "test-api-key-123",
  });
  assert.deepStrictEqual(result, {
    ok: true,
    url: "https://api.example.com/ocr",
    apiKey: "test-api-key-123",
  });
});

test("url 未設定: OCR_API_URL が undefined の場合", () => {
  const result = readOcrConfig({
    OCR_API_KEY: "test-api-key-123",
  });
  assert.deepStrictEqual(result, {
    ok: false,
    reason: "missing_url",
  });
});

test("key 未設定: OCR_API_KEY が undefined の場合", () => {
  const result = readOcrConfig({
    OCR_API_URL: "https://api.example.com/ocr",
  });
  assert.deepStrictEqual(result, {
    ok: false,
    reason: "missing_key",
  });
});

test("空白のみ: OCR_API_URL が空白のみの場合", () => {
  const result = readOcrConfig({
    OCR_API_URL: "   ",
    OCR_API_KEY: "test-api-key-123",
  });
  assert.deepStrictEqual(result, {
    ok: false,
    reason: "missing_url",
  });
});

test("空白のみ: OCR_API_KEY が空白のみの場合", () => {
  const result = readOcrConfig({
    OCR_API_URL: "https://api.example.com/ocr",
    OCR_API_KEY: "   ",
  });
  assert.deepStrictEqual(result, {
    ok: false,
    reason: "missing_key",
  });
});

test("http のみの URL: http:// で始まる URL は拒否されること", () => {
  const result = readOcrConfig({
    OCR_API_URL: "http://api.example.com/ocr",
    OCR_API_KEY: "test-api-key-123",
  });
  assert.deepStrictEqual(result, {
    ok: false,
    reason: "invalid_url",
  });
});

test("不正な URL: URL として不正な形式の場合", () => {
  const result = readOcrConfig({
    OCR_API_URL: "https://",
    OCR_API_KEY: "test-api-key-123",
  });
  assert.deepStrictEqual(result, {
    ok: false,
    reason: "invalid_url",
  });
});

test("不正な URL: スキームのみや空白混じりの不正 URL", () => {
  const result = readOcrConfig({
    OCR_API_URL: "https://foo bar",
    OCR_API_KEY: "test-api-key-123",
  });
  assert.deepStrictEqual(result, {
    ok: false,
    reason: "invalid_url",
  });
});

test("失敗時の戻り値に入力値が入らないこと", () => {
  const secretUrl = "https://secret.example.com/ocr?token=confidential";
  const secretKey = "super-secret-api-key";
  const result = readOcrConfig({
    OCR_API_URL: secretUrl,
    OCR_API_KEY: "   ",
  });
  assert.deepStrictEqual(result, {
    ok: false,
    reason: "missing_key",
  });
  const resultJson = JSON.stringify(result);
  assert.strictEqual(resultJson.includes(secretUrl), false);
  assert.strictEqual(resultJson.includes(secretKey), false);
});
