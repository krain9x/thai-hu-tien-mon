// ==================== THÁI HƯ TIÊN MÔN — FIREBASE & DEPLOYMENT CONFIG ====================
// 'auto': dùng Python server (nếu có) khi chạy local/VPS, tự chuyển sang Firebase Firestore khi host trên GitHub Pages / static host!
// Đổi thành 'firebase' nếu muốn test Firestore ngay trên localhost; đổi thành 'server' khi chạy thương mại VPS riêng.
window.TIENMON_ONLINE_MODE = 'auto';

window.TIENMON_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAUr-dTlecyjCUNsTQ6XeQFR7P8kypsNEU",
  authDomain: "tu-tien-idle.firebaseapp.com",
  projectId: "tu-tien-idle",
  storageBucket: "tu-tien-idle.firebasestorage.app",
  messagingSenderId: "132137892977",
  appId: "1:132137892977:web:a2087e7283fbc6188b6fd0"
};
