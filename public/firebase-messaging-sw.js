importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA61PAlXCaUhoMfPZ0wYfrlwFhtQm9vpeI",
  authDomain: "the-delight-473201-h0.firebaseapp.com",
  projectId: "the-delight-473201-h0",
  storageBucket: "the-delight-473201-h0.firebasestorage.app",
  messagingSenderId: "132639860431",
  appId: "1:132639860431:web:1c3f8641c2a1afc90af9ba"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
