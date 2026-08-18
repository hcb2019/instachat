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

export function getStudioGenerationError(error: unknown): string {
  const { status, code, type, name } = getOpenAIErrorDetails(error);

  if (status === 401 || code === "invalid_api_key") {
    return "A chave da OpenAI configurada no servidor é inválida. Crie uma chave API na plataforma da OpenAI, substitua OPENAI_API_KEY na Vercel e faça um novo deploy.";
  }

  if (code === "insufficient_quota") {
    return "A conta da OpenAI está sem saldo ou sem faturamento ativo. Confira a cobrança do projeto da API e tente novamente.";
  }

  if (code === "model_not_found") {
    return "O modelo configurado não está disponível para este projeto da OpenAI. Confira OPENAI_AUDIENCE_MODEL na Vercel.";
  }

  if (status === 429 || code === "rate_limit_exceeded") {
    return "A OpenAI atingiu um limite temporário de uso. Aguarde um instante e tente novamente.";
  }

  if (name === "APIConnectionTimeoutError" || name === "APIConnectionError") {
    return "A OpenAI demorou para responder. Seu texto foi mantido; tente gerar novamente em instantes.";
  }

  if (status === 400 || type === "invalid_request_error") {
    return "A OpenAI recusou a configuração desta geração. Confira o modelo configurado ou tente novamente após atualizar o aplicativo.";
  }

  return "Não foi possível gerar as ideias agora. Seus campos foram mantidos para você tentar novamente.";
}
