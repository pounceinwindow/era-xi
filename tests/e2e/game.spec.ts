import { expect, test } from "@playwright/test";

test("starts a training draft and selects the first player", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/Твой ник/i).fill("playmaker");
  await page.getByRole("link", { name: /Тренировка/i }).click();
  await expect(page.getByRole("heading", { name: /Выбери систему/i })).toBeVisible();
  await page.getByRole("button", { name: /Начать драфт/i }).click();
  await expect(page.getByText(/Раунд 1 из 11/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Вратарь" })).toBeVisible();
  await expect(page.getByText("ВР", { exact: true })).toHaveCount(5);
  await page.getByRole("button", { name: /Выбрать/i }).first().click();
  await expect(page.getByText(/Раунд 2 из 11/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Левый защитник" })).toBeVisible();
});

test("finishes the position draft and goes straight to the tournament", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/Твой ник/i).fill("playmaker");
  await page.getByRole("link", { name: /Тренировка/i }).click();
  await page.getByRole("button", { name: /Начать драфт/i }).click();

  for (let round = 0; round < 11; round += 1) {
    await page.getByRole("button", { name: /Выбрать/i }).first().click();
  }

  await expect(page).toHaveURL(/#\/match/);
  await expect(page.getByText("Группа", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Играть матч/i })).toBeVisible();
  await expect(page.getByText(/поменять их местами/i)).toHaveCount(0);
});
