/**
 * Notification Service
 * Handles In-App notifications, plus mock/simulated dispatch for Email and SMS notifications.
 *
 * PRODUCTION BACKEND ARCHITECTURE NOTE:
 * In a real production environment, email & SMS dispatches would be handled asynchronously
 * via server-side task workers (e.g., BullMQ / Celery / AWS SQS) connecting to:
 * - Email: SendGrid / Amazon SES / Resend / Nodemailer
 * - SMS: Twilio / AWS SNS / MessageBird
 * - Push: Firebase Cloud Messaging (FCM) / Web Push API
 *
 * All API keys remain strictly server-side and are NEVER exposed to the frontend.
 */

import { saveNotification } from "./storage.js";

/**
 * Creates and stores an in-app notification in localStorage
 */
export function sendInAppNotification({
  userId,
  title,
  message,
  type = "info", // "match", "claim", "status", "info"
  relatedItemId = null,
  relatedMatchId = null,
  relatedClaimId = null,
  link = "/notifications"
}) {
  const notif = {
    userId,
    title,
    message,
    type,
    relatedItemId,
    relatedMatchId,
    relatedClaimId,
    link,
    read: false,
    createdAt: new Date().toISOString()
  };

  const saved = saveNotification(notif);
  return saved;
}

/**
 * Mock Email Notification Dispatcher
 * Logs queue dispatch to console without calling external paid APIs
 */
export function sendEmailNotification({ to, subject, body, itemDetails = null }) {
  console.info(
    `[Mock Email Service] Email notification queued for: ${to} | Subject: "${subject}"`
  );
  // Simulating async dispatch queue entry
  return {
    queued: true,
    recipient: to,
    subject,
    timestamp: new Date().toISOString(),
    status: "DISPATCHED_TO_QUEUE"
  };
}

/**
 * Mock SMS Notification Dispatcher
 * Logs queue dispatch to console without calling external paid APIs
 */
export function sendSMSNotification({ to, message }) {
  console.info(
    `[Mock SMS Gateway] SMS notification queued for: ${to} | Message: "${message}"`
  );
  return {
    queued: true,
    recipient: to,
    message,
    timestamp: new Date().toISOString(),
    status: "DISPATCHED_TO_GATEWAY"
  };
}

/**
 * High-level notification dispatcher when a match is found
 */
export function notifyOwnerOfMatch({ lostItem, foundItem, matchScore, matchReasons = [] }) {
  if (!lostItem) return;

  const title = "Good news! Your lost item may have been found.";
  const message = `Our AI detected a ${matchScore}% match for your "${lostItem.itemName || lostItem.title}" found at ${foundItem.locationFound || foundItem.location || "Campus"}.`;

  // 1. In-App Notification
  sendInAppNotification({
    userId: lostItem.userId,
    title,
    message,
    type: "match",
    relatedItemId: foundItem.id,
    link: "/matches"
  });

  // 2. Email dispatch architecture
  if (lostItem.contactEmail || lostItem.reporterEmail) {
    sendEmailNotification({
      to: lostItem.contactEmail || lostItem.reporterEmail,
      subject: `[SmartFind] Possible Match Found for ${lostItem.itemName || lostItem.title}`,
      body: `${title}\n\nItem: ${lostItem.itemName || lostItem.title}\nFound at: ${foundItem.locationFound || foundItem.location}\nMatch Confidence: ${matchScore}%\n\nPlease visit the SmartFind portal to verify ownership.`
    });
  }

  // 3. SMS dispatch architecture
  if (lostItem.contactPhone || lostItem.reporterPhone) {
    sendSMSNotification({
      to: lostItem.contactPhone || lostItem.reporterPhone,
      message: `[SmartFind] Good news! A possible match (${matchScore}%) for your lost item "${lostItem.itemName || lostItem.title}" has been turned in at ${foundItem.locationFound || foundItem.location}. Check your SmartFind portal.`
    });
  }
}

/**
 * High-level notification dispatcher when a claim is updated
 */
export function notifyClaimStatusChanged({ claimantId, claimId, itemTitle, newStatus, notes = "" }) {
  let title = "";
  let message = "";

  if (newStatus === "APPROVED" || newStatus === "Approved") {
    title = "Claim Approved! Coordinate Item Return";
    message = `Your claim for "${itemTitle}" was approved by Security. Please visit Campus Security with your student ID to retrieve your item.`;
  } else if (newStatus === "REJECTED" || newStatus === "Rejected") {
    title = "Claim Status Update";
    message = `Your claim for "${itemTitle}" was reviewed and could not be verified. ${notes ? `Note: ${notes}` : ""}`;
  } else {
    title = "Claim Status Updated";
    message = `Your claim for "${itemTitle}" is now marked as ${newStatus}.`;
  }

  sendInAppNotification({
    userId: claimantId,
    title,
    message,
    type: "claim",
    relatedClaimId: claimId,
    link: "/claims"
  });
}
