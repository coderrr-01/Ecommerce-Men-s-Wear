export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface EmailSendResult {
  id: string;
}

/** Transactional email boundary. Business logic never imports Resend directly. */
export interface EmailProvider {
  readonly id: "resend" | "console";
  send(message: EmailMessage): Promise<EmailSendResult>;
}
