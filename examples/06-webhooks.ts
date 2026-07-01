/**
 * Webhooks: register an endpoint to receive real-time payment notifications,
 * then list, update, and clean up.
 */
import { client } from "./client";

async function main() {
  const created = await client.webhook.create({
    name: "Payment notifications",
    url: "https://myapp.com/webhooks/monime",
    events: ["payment.succeeded", "payout.succeeded"],
    enabled: true,
    alertEmails: ["ops@myapp.com"],
  });

  if (!created.success) {
    console.error("Could not create webhook:", created.error?.message);
    return;
  }

  const webhook = created.data!;
  console.log("Webhook ID:", webhook.id);
  console.log("Listening for:", webhook.events.join(", "));

  // Update the subscribed events.
  const updated = await client.webhook.update(webhook.id, {
    name: webhook.name,
    url: webhook.url,
    events: ["payment.succeeded"],
  });
  if (updated.success) {
    console.log("Updated events:", updated.data!.events.join(", "));
  }

  // List all webhooks.
  const all = await client.webhook.list();
  if (all.success) {
    console.log(`Total webhooks: ${all.data!.result.length}`);
  }

  // Delete it again to keep the example idempotent.
  const removed = await client.webhook.delete(webhook.id);
  console.log("Deleted webhook:", removed.success);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exitCode = 1;
});
