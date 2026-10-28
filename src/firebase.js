import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBC1MX_DRvNgdnCZCVhtvCc89MOkJUPBMo",
  authDomain: "thachkhedata.firebaseapp.com",
  databaseURL: "https://thachkhedata-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thachkhedata",
  storageBucket: "thachkhedata.appspot.com",
  messagingSenderId: "589138851083",
  appId: "1:589138851083:web:84d42ac27101886d10de0e"
};

const app = initializeApp(firebaseConfig); // hoặc initializeApp(firebaseConfig)

export const db = getFirestore(app);
export const storage = getStorage(app); // 2. Thêm dòng xuất storage này