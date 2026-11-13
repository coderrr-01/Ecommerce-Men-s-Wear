export interface SmsMessage {
  to: string;
  body: string;
}

export interface SmsSendResult {
  id: string;
}

/** SMS boundary. Add an MSG91/Twilio adapter without changing business logic. */
export interface SmsProvider {
  readonly id: "console";
  send(message: SmsMessage): Promise<SmsSendResult>;
}
