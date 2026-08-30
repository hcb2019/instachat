import { expect, test } from "@playwright/test";

test("searches and filters the public AI code directory", async ({ page }) => {
  await page.goto("/comandos-chatgpt");

  await expect(page.getByRole("heading", { name: /Seu próximo resultado começa/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /281 códigos/i })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Buscar códigos" });
  await search.fill("hdreal");
  await expect(page.getByText("/HDREAL", { exact: true })).toBeVisible();
  await expect(page.getByText("/PROSHOT", { exact: true })).toHaveCount(0);

  await search.fill("");
  await page.getByRole("button", { name: "Fundos e cenários" }).click();
  await search.fill("newbg");
  await expect(page.getByText("/NEWBG", { exact: true })).toBeVisible();
  await expect(page.getByText("/OUTFIT", { exact: true })).toHaveCount(0);
});
