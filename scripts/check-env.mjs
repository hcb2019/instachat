const isDemo = process.env.DEMO_MODE === "true";
const errors = [];
const warnings = [];

function required(name, minimum = 1) {
  const value = process.env[name]?.trim() ?? "";
  if (value.length < minimum) {
    errors.push(`${name} deve ter pelo menos ${minimum} caracteres.`);
  }
  return value;
}

function validUrl(name, { https = false } = {}) {
  const value = required(name);
  if (!value) return;
  try {
    const url = new URL(value);
    if (https && url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) {
      errors.push(`${name} deve usar HTTPS fora do ambiente local.`);
    }
  } catch {
    errors.push(`${name} precisa ser uma URL válida.`);
  }
}

validUrl("APP_ORIGIN", { https: true });
const ownerEmail = required("OWNER_EMAIL");
if (ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
  errors.push("OWNER_EMAIL precisa ser um e-mail válido.");
}

if (!isDemo) {
  validUrl("NEXT_PUBLIC_SUPABASE_URL", { https: true });
  required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", 16);
  required("SUPABASE_SECRET_KEY", 24);
  required("META_APP_ID", 5);
  required("META_APP_SECRET", 24);
  required("META_WEBHOOK_APP_SECRET", 24);
  required("META_WEBHOOK_VERIFY_TOKEN", 24);
  required("WORKER_SECRET", 32);

  const encryptionKey = required("TOKEN_ENCRYPTION_KEY");
  if (encryptionKey) {
    try {
      if (Buffer.from(encryptionKey, "base64").length !== 32) {
        errors.push("TOKEN_ENCRYPTION_KEY deve representar exatamente 32 bytes em base64.");
      }
    } catch {
      errors.push("TOKEN_ENCRYPTION_KEY deve ser uma chave válida em base64.");
    }
  }
} else {
  warnings.push("DEMO_MODE=true: nenhuma chamada real será enviada ao Supabase, Meta ou OpenAI.");
}

if (process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_API_KEY.trim().length < 20) {
  errors.push("OPENAI_API_KEY parece incompleta.");
}

for (const warning of warnings) console.warn(`Aviso: ${warning}`);
if (errors.length) {
  console.error("Configuração inválida:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Configuração válida para o modo ${isDemo ? "demonstração" : "produção"}.`);
