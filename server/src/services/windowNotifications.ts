import type { WindowCommand } from "./mqtt.js";

export type WindowNotification = {
  id: number;
  command: WindowCommand["command"];
  reason: string;
  sentAt: string;
};

const maxNotifications = 50;
const notifications: WindowNotification[] = [];
let nextNotificationId = 1;

export function recordWindowNotification(
  command: WindowCommand["command"],
  reason: string,
  sentAt: string,
): WindowNotification {
  const notification = { id: nextNotificationId++, command, reason, sentAt };
  notifications.push(notification);
  if (notifications.length > maxNotifications) notifications.shift();
  return notification;
}

export function getWindowNotifications(afterId?: number): WindowNotification[] {
  if (afterId !== undefined) {
    return notifications.filter((notification) => notification.id > afterId);
  }
  return notifications.slice(-20);
}

export function deleteWindowNotification(id: number): boolean {
  const index = notifications.findIndex((notification) => notification.id === id);
  if (index === -1) return false;
  notifications.splice(index, 1);
  return true;
}

export function clearWindowNotifications(): number {
  const deletedCount = notifications.length;
  notifications.length = 0;
  return deletedCount;
}