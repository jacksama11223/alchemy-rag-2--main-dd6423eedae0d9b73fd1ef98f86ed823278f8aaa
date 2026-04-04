const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
let expo = new Expo();

/**
 * Send push notifications to a user across all their registered devices
 * @param {Object} user - The user document from MongoDB
 * @param {Object} payload - Notification payload { title, body, data }
 */
const sendPushNotification = async (user, payload) => {
  if (!user || !user.pushTokens || user.pushTokens.length === 0) {
    return;
  }

  const fcmTokens = [];
  const expoTokens = [];

  user.pushTokens.forEach(item => {
    if (item.platform === 'web' || item.platform === 'android' || item.platform === 'ios') {
      fcmTokens.push(item.token);
    } else if (item.platform === 'expo') {
      if (Expo.isExpoPushToken(item.token)) {
        expoTokens.push(item.token);
      }
    }
  });

  // 1. Handle FCM Notifications (Web/Native)
  if (fcmTokens.length > 0) {
    const fcmPayload = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      tokens: fcmTokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(fcmPayload);
      console.log(`Successfully sent ${response.successCount} FCM messages; ${response.failureCount} failed.`);
      
      // Cleanup expired tokens if needed (response.responses contains errors)
      if (response.failureCount > 0) {
        // Logic to remove invalid tokens could go here
      }
    } catch (error) {
      console.error('Error sending FCM messages:', error);
    }
  }

  // 2. Handle Expo Push Notifications (Mobile)
  if (expoTokens.length > 0) {
    let messages = [];
    for (let pushToken of expoTokens) {
      messages.push({
        to: pushToken,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending Expo notifications:', error);
        }
      }
    })();
  }
};

module.exports = { sendPushNotification };
