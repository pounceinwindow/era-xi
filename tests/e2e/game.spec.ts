import { expect, test } from "@playwright/test";

test("starts a training draft and selects the first player", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/Твой ник/i).fill("playmaker");
  await page.getByRole("link", { name: /Тренировка/i }).click();
  await expect(page.getByRole("heading", { name: /Выбери систему/i })).toBeVisible();
  await page.getByRole("button", { name: /Начать драфт/i }).click();
  await expect(page.getByText(/Раунд 1 из 11/i)).toBeVisible();
  await page.getByRole("button", { name: /Выбрать/i }).first().click();
  await expect(page.getByText(/Раунд 2 из 11/i)).toBeVisible();
});

test("finishes the draft with readable portraits and a clean squad layout", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/Твой ник/i).fill("playmaker");
  await page.getByRole("link", { name: /Тренировка/i }).click();
  await page.getByRole("button", { name: /Начать драфт/i }).click();

  for (let round = 0; round < 11; round += 1) {
    await page.getByRole("button", { name: /Выбрать/i }).first().click();
  }

  await expect(page).toHaveURL(/#\/squad/);
  await expect(page.locator(".pitch-player")).toHaveCount(11);
  await expect(page.locator(".pitch-player b")).toHaveCount(11);

  await page.waitForFunction(() =>
    [...document.querySelectorAll<HTMLImageElement>(".pitch-player img")]
      .every((image) => image.complete && image.naturalWidth > 0),
  );

  const audit = await page.locator(".pitch-player").evaluateAll((cards) => {
    const rectangles = cards.map((card) => card.getBoundingClientRect());
    const overlaps: string[] = [];

    for (let first = 0; first < rectangles.length; first += 1) {
      for (let second = first + 1; second < rectangles.length; second += 1) {
        const a = rectangles[first];
        const b = rectangles[second];
        if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) {
          overlaps.push(`${first}-${second}`);
        }
      }
    }

    return {
      overlaps,
      hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
      names: cards.map((card) => card.querySelector("b")?.textContent?.trim() ?? ""),
    };
  });

  expect(audit.overlaps).toEqual([]);
  expect(audit.hasHorizontalScroll).toBe(false);
  expect(audit.names).toHaveLength(11);
  expect(audit.names.every((name) => name.length > 1 && !name.includes("…"))).toBe(true);
});
