/**
 * Tutorial Steps Configuration
 * Data-driven config for easy A/B testing and iteration
 */

export interface TutorialStepConfig {
  id: string;
  headline: string;
  subhead: string;
  analyticsKey: string;
  showBackButton: boolean;
  confirmSkip?: boolean;
  autoAdvanceMs?: number;
}

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
  {
    id: 'aha_voice',
    headline: 'Say it. Done.',
    subhead: 'Voice in. Invoice out.',
    analyticsKey: 'tutorial_step1',
    autoAdvanceMs: 1200,
    showBackButton: false,
    confirmSkip: true,
  },
  {
    id: 'send_paid',
    headline: 'Send it. Get paid.',
    subhead: 'Professional invoice + pay link in one tap.',
    analyticsKey: 'tutorial_step2',
    showBackButton: true,
  },
  {
    id: 'bad_cop',
    headline: 'Never chase payments again.',
    subhead: '73% of late invoices get paid after just one reminder.',
    analyticsKey: 'tutorial_step3',
    showBackButton: true,
  },
  {
    id: 'ready',
    headline: 'Ready when you are.',
    subhead: 'Your first invoice is one voice note away.',
    analyticsKey: 'tutorial_step4',
    showBackButton: true,
  },
];

// Analytics event keys
export const TUTORIAL_EVENTS = {
  tutorial_viewed: 'tutorial_viewed',
  tutorial_step_viewed: 'tutorial_step_viewed',
  tutorial_step1_mic_tapped: 'tutorial_step1_mic_tapped',
  tutorial_step1_invoice_shown: 'tutorial_step1_invoice_shown',
  tutorial_step1_auto_advanced: 'tutorial_step1_auto_advanced',
  tutorial_step1_skipped: 'tutorial_step1_skipped',
  tutorial_step2_send_tapped: 'tutorial_step2_send_tapped',
  tutorial_step3_badcop_toggled: 'tutorial_step3_badcop_toggled',
  tutorial_completed: 'tutorial_completed',
  tutorial_skipped: 'tutorial_skipped',
  tutorial_cta_create_invoice: 'tutorial_cta_create_invoice',
  tutorial_cta_send_to_self: 'tutorial_cta_send_to_self',
} as const;
