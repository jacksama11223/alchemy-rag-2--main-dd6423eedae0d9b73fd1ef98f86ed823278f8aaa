import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import axios from 'axios';

const usePushNotifications = (user: any) => {
  useEffect(() => {
    if (!user) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Register Service Worker if not already registered (Vite handles this usually, but messaging needs it)
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

          const token = await getToken(messaging, {
            vapidKey: 'BNNxEsj1P2xW7dobG_UqKBI9ffLkAjAEHSmGYrWGrq_EIWprBtcf58h8WJEn9_DW4bGP6zl5Z3gE5pzX22tpWIc', // Placeholder: User needs to replace this
            serviceWorkerRegistration: registration,
          });

          if (token) {
            console.log('FCM Token:', token);
            // Save token to backend
            await axios.post('/api/users/push-token',
              { token, platform: 'web' },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
          }
        }
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    };

    requestPermission();

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      // You can show a custom toast or notification here
      if (payload.notification) {
        new Notification(payload.notification.title || 'New Notification', {
          body: payload.notification.body,
          icon: '/logo192.png'
        });
      }
    });

    return () => unsubscribe();
  }, [user]);
};

export default usePushNotifications;
