// Import script Firebase SDK untuk Service Worker (Compat Version)
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Inisialisasi Firebase di background
firebase.initializeApp({
  apiKey: "AIzaSyDgegl7vymJ6X9CxKBkUrmWTJFYlGC_ULY",
  authDomain: "gudang-nuhsantara.firebaseapp.com",
  projectId: "gudang-nuhsantara",
  storageBucket: "gudang-nuhsantara.firebasestorage.app",
  messagingSenderId: "698331638433",
  appId: "1:698331638433:web:f49f1b4675c487aca7dee0"
});

const messaging = firebase.messaging();

// Menangani pesan masuk saat aplikasi tertutup / di background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Menerima pesan background: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png' // Pastikan ada file ikon di projectmu
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
