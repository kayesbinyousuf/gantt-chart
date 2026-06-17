/* ============================================================
   FIREBASE CONFIG
   This connects the app to a shared Realtime Database so that
   edits made by anyone are visible to every visitor of the site.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyCGBsUlrud341uMISxxPCseWb-hSBF0JTQ",
  authDomain: "production-line-planner.firebaseapp.com",
  databaseURL: "https://production-line-planner-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "production-line-planner",
  storageBucket: "production-line-planner.firebasestorage.app",
  messagingSenderId: "230348352832",
  appId: "1:230348352832:web:a4ab60e9fe9effd95d1ea5"
};

firebase.initializeApp(firebaseConfig);

// Shared database reference — all visitors read/write this same node.
const FIREBASE_DB = firebase.database();
const FIREBASE_STATE_REF = FIREBASE_DB.ref("plp_state");
