import { expect, test } from "@playwright/test";

test("navigates through the demo dashboard", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /Comentários que viram/ })).toBeVisible();
  await expect(page.getByRole("main").getByText("Modo demonstração", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /Nova automação/ }).first().click();
  await expect(page.getByRole("heading", { name: "Do comentário ao direct." })).toBeVisible();
  await expect(page.getByText("Correspondência exata", { exact: false })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("shows responsive navigation on a small viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/automations");
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Automações" })).toBeVisible();
});

test("explores Radar evidence and creates a reviewable draft", async ({ page }) => {
  await page.goto("/radar");
  await expect(page.getByRole("heading", { name: /O que sua audiência/ })).toBeVisible();
  await expect(page.getByText("Caixa de oportunidades", { exact: true })).toBeVisible();
  await page.getByText(/Ver \d+ evidências?/).first().click();
  await expect(page.locator(".evidence-list blockquote").first()).toBeVisible();
  await page.getByRole("button", { name: /Criar rascunho/ }).first().click();
  await expect(page.getByText(/Rascunho criado pelo Radar/)).toBeVisible();
  await expect(page.getByLabel("Palavra-chave")).not.toHaveValue("");
});

test("follows the Instagram connection guide and persists progress", async ({ page }) => {
  await page.goto("/connection-guide");
  await expect(page.getByRole("heading", { name: /Da conta profissional/ })).toBeVisible();
  await expect(page.getByText("8 etapas verificáveis", { exact: true })).toBeVisible();
  const ownAccountRoute = page.getByRole("button", { name: /Minha própria conta/ });
  await expect(ownAccountRoute).toHaveAttribute("aria-pressed", "false");
  await ownAccountRoute.click();
  await expect(ownAccountRoute).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/Caminho selecionado:/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir a criação de aplicativo na Meta" })).toHaveAttribute("href", "https://developers.facebook.com/apps/creation/");
  await expect(page.getByText("Gerenciar mensagens e conteúdo no Instagram", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Não use.*App ID e o App Secret genéricos/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Procure estes quatro blocos numerados" })).toBeVisible();
  await expect(page.getByText("Auxiliar de integração de API", { exact: true })).toBeVisible();
  await expect(page.getByText("Não use neste projeto", { exact: true })).toBeVisible();
  await expect(page.getByText("instagram_business_basic", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("ID do app do Instagram", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Crie seu META_WEBHOOK_VERIFY_TOKEN aqui" })).toBeVisible();
  await page.getByRole("button", { name: "Gerar token seguro" }).click();
  await expect(page.getByText("Seu token foi criado", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Copiar token:/ })).toBeVisible();
  await expect(page.getByText("URL de callback do webhook", { exact: true })).toBeVisible();
  await expect(page.getByText("Valid OAuth Redirect URI", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Marcar como concluída" }).first().click();
  await expect(page.getByRole("button", { name: "Etapa concluída" }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Etapa concluída" }).first()).toBeVisible();
  await expect(page.getByText("1 de 8 etapas", { exact: true })).toBeVisible();
});

test("unknown tracking tokens never redirect", async ({ request }) => {
  const response = await request.get("/r/AAAAAAAAAAAAAAAAAAAAAA", { maxRedirects: 0 });
  expect(response.status()).toBe(404);
  const head = await request.head("/r/AAAAAAAAAAAAAAAAAAAAAA");
  expect(head.status()).toBe(204);
});
