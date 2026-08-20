type OpenAIErrorLike = {
  status?: unknown;
  code?: unknown;
  type?: unknown;
  name?: unknown;
};

export function hasValidOpenAIKeyShape(key: string | undefined): boolean {
  return Boolean(key && /^sk-[A-Za-z0-9_-]{20,}$/.test(key));
}

export function getOpenAIErrorDetails(error: unknown) {
  const value = error && typeof error === "object" ? error as OpenAIErrorLike : {};
  return {
    status: typeof value.status === "number" ? value.status : null,
    code: typeof value.code === "string" ? value.code : null,
    type: typeof value.type === "string" ? value.type : null,
    name: typeof value.name === "string" ? value.name : null,
  };
}

export type StudioGenerationErrorCode = "invalid_api_key" | "insufficient_quota" | "model_not_found" | "rate_limited" | "connection_failed" | "invalid_request" | "generation_failed";

export function getStudioGenerationErrorCode(error: unknown): StudioGenerationErrorCode {
  const { status, code, type, name } = getOpenAIErrorDetails(error);
  if (status === 401 || code === "invalid_api_key") return "invalid_api_key";
  if (code === "insufficient_quota") return "insufficient_quota";
  if (code === "model_not_found") return "model_not_found";
  if (status === 429 || code === "rate_limit_exceeded") return "rate_limited";
  if (name === "APIConnectionTimeoutError" || name === "APIConnectionError") return "connection_failed";
  if (status === 400 || type === "invalid_request_error") return "invalid_request";
  return "generation_failed";
}

export function getStudioGenerationError(error: unknown, stage = "ideias"): string {
  const code = getStudioGenerationErrorCode(error);

  if (code === "invalid_api_key") {
    return "A chave da OpenAI configurada no servidor é inválida. Crie uma chave API na plataforma da OpenAI, substitua OPENAI_API_KEY na Vercel e faça um novo deploy.";
  }

  if (code === "insufficient_quota") {
    return "A conta da OpenAI está sem saldo ou sem faturamento ativo. Confira a cobrança do projeto da API e tente novamente.";
  }

  if (code === "model_not_found") {
    return "O modelo configurado não está disponível para este projeto da OpenAI. Confira OPENAI_AUDIENCE_MODEL na Vercel.";
  }

  if (code === "rate_limited") {
    return "A OpenAI atingiu um limite temporário de uso. Aguarde um instante e tente novamente.";
  }

  if (code === "connection_failed") {
    return "A OpenAI demorou para responder. Seu texto foi mantido; tente gerar novamente em instantes.";
  }

  if (code === "invalid_request") {
    return "A OpenAI recusou a configuração desta geração. Confira o modelo configurado ou tente novamente após atualizar o aplicativo.";
  }

  return `Não foi possível gerar ${stage} agora. Seus campos foram mantidos para você tentar novamente.`;
}
