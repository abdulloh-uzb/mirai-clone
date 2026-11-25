export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}
