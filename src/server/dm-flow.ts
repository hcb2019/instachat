import "server-only";
import {
  DEFAULT_FINAL_FLOW_MESSAGE,
  appendVortexUtm,
  readConversationFlow,
  type AutomationConversationFlow,
  type AutomationFlowButton,
  type AutomationFlowStep,
} from "@/lib/domain";

const FLOW_PAYLOAD_PREFIX = "vortex:flow:";

export function buildConversationPayload(runId: string, stepId: string, buttonId: string) {
  return `${FLOW_PAYLOAD_PREFIX}${runId}:${stepId}:${buttonId}`;
}

export function parseConversationPayload(payload: string | null | undefined) {
  if (!payload?.startsWith(FLOW_PAYLOAD_PREFIX)) return null;
  const [runId, stepId, buttonId] = payload.slice(FLOW_PAYLOAD_PREFIX.length).split(":");
  return runId && stepId && buttonId ? { runId, stepId, buttonId } : null;
}

export function getConversationFlowSnapshot(value: unknown) {
  return readConversationFlow(value);
}

export function getStep(flow: AutomationConversationFlow, stepId: string | null | undefined) {
  return flow.steps.find((step) => step.id === stepId) ?? null;
}

export function firstConversationStep(flow: AutomationConversationFlow) {
  return flow.steps[0] ?? null;
}

export function isUrlStep(step: AutomationFlowStep) {
  return step.buttons.length > 0 && step.buttons.every((button) => Boolean(button.url));
}

export function findStepButton(step: AutomationFlowStep, buttonId: string) {
  return step.buttons.find((button) => button.id === buttonId) ?? null;
}

export function buildQuickReplies(runId: string, step: AutomationFlowStep) {
  return step.buttons
    .filter((button) => button.nextStepId || button.url)
    .map((button) => ({
      title: button.label,
      payload: buildConversationPayload(runId, step.id, button.id),
    }));
}

export function buildQuickReplyFallbackMessage(message: string, buttons: AutomationFlowButton[]) {
  const labels = buttons.map((button) => button.label.trim()).filter(Boolean);
  return labels.length ? `${message}\n\nResponda com uma destas opções: ${labels.join(", ")}.` : message;
}

export function buildTrackedUrlButtons(
  buttons: AutomationFlowButton[],
  automationId: string,
  appendUtm: boolean,
) {
  const usableButtons = buttons.filter((button) => button.url);
  return usableButtons.map((button) => ({
    type: "web_url" as const,
    title: button.label,
    url: appendVortexUtm(button.url ?? "", automationId, appendUtm),
  }));
}

export function buildDirectUrlStep(button: AutomationFlowButton): AutomationFlowStep {
  return {
    id: "direct-url",
    text: DEFAULT_FINAL_FLOW_MESSAGE,
    buttons: [button],
  };
}
