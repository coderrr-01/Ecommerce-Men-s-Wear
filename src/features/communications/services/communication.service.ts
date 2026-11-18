import "server-only";

import {
  createContactMessage,
  listContactMessages,
  listNewsletterSubscriptions,
  subscribeNewsletter,
} from "@/features/communications/repositories/communication.repository";
import { ValidationError } from "@/lib/errors";

function clean(value: string, maximum: number) {
  const result = value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (result.length > maximum) throw new ValidationError("One or more fields are too long.");
  return result;
}

export async function enrollNewsletter(email: string, userId: string | null) {
  return subscribeNewsletter(email.trim().toLowerCase(), userId);
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  userId: string | null;
}) {
  const message = clean(input.message, 5000);
  if (message.length < 10)
    throw new ValidationError("Please enter a message of at least 10 characters.");
  return createContactMessage({
    name: clean(input.name, 120),
    email: input.email.trim().toLowerCase(),
    phone: clean(input.phone, 20) || null,
    subject: clean(input.subject, 160),
    message,
    userId: input.userId,
  });
}

export async function getCommunicationLists() {
  const [subscriptions, messages] = await Promise.all([
    listNewsletterSubscriptions(),
    listContactMessages(),
  ]);
  return { subscriptions, messages };
}
