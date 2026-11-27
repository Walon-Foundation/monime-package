/**
 * Webhooks: register an endpoint to receive real-time payment notifications,
 * then list, update, and clean up. `handleDelivery` shows how to verify a
 * delivery before acting on it.
 */
import { parseWebhookEvent } from "monime-package";
import { client } from "./client";

/**
 * Call this from your HTTP handler with the raw body (not re-serialised JSON)
 * and the Monime-Signature header. Answer 401 when it fails.
 */
export function handleDelivery(rawBody: string, signatureHeader: string) {
  const event = parseWebhookEvent({
    payload: rawBody,
    header: signatureHeader,
    secret: process.env.MONIME_WEBHOOK_SECRET ?? "",
  });
  if (!event.success) {
    return { status: 401, reason: event.error?.message };
  }

  // De-duplicate on event.id; fetch the full object by object.id if needed.
  console.log("Event:", event.data!.event.name, event.data!.object.id);
  return { status: 200 };
}

async function main() {
  const created = await client.webhook.create({
    name: "Payment notifications",
    url: "https://myapp.com/webhooks/monime",
    events: ["payment.processing_completed", "payout.completed", "payout.failed"],
    enabled: true,
    alertEmails: ["ops@myapp.com"],
    // A secret of 32-256 characters; or { type: "ES256" } for a key pair.
    verificationMethod: {
      type: "HS256",
      secret: process.env.MONIME_WEBHOOK_SECRET ?? "",
    },
  });

  if (!created.success) {
    console.error("Could not create webhook:", created.error?.message);
    return;
  }

  const webhook = created.data!;
  console.log("Webhook ID:", webhook.id);
  console.log("Listening for:", webhook.events?.join(", "));

  // Update the subscribed events.
  const updated = await client.webhook.update(webhook.id, {
    name: webhook.name,
    url: webhook.url,
    events: ["payment.processing_completed"],
  });
  if (updated.success) {
    console.log("Updated events:", updated.data!.events?.join(", "));
  }

  // List all webhooks.
  const all = await client.webhook.list();
  if (all.success) {
    console.log(`Total webhooks: ${all.data!.length}`);
  }

  // Delete it again to keep the example idempotent.
  const removed = await client.webhook.delete(webhook.id);
  console.log("Deleted webhook:", removed.success);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exitCode = 1;
});
