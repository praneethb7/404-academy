import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBUtBZVgLiWCQJaZgfVN8yhmyT6hro0VvU",
    authDomain: "academy-c39f4.firebaseapp.com",
    projectId: "academy-c39f4",
    storageBucket: "academy-c39f4.firebasestorage.app",
    messagingSenderId: "55363037232",
    appId: "1:55363037232:web:fa02e84dbbc1762eff25f5",
    measurementId: "G-7Y9QLJTX7S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Fetch user details function
async function fetchUserDetails(userID) {
    const userDoc = doc(db, "users", userID);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
        const userData = docSnap.data();
        document.querySelector("#user-name").innerText = userData.name;
        document.querySelector("#user-email").innerText = userData.email;
        document.querySelector("#user-type").innerText = userData.userType;

        if(userData.userType=="Mentor"){

        }
    } else {
        console.log("User not found!");
    }
}

// Check auth state and fetch user details
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchUserDetails(user.uid);
    } else {
        console.log("No user signed in.");
    }
});

const logoutBtn = document.querySelector('#logoutBtn');
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);

        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
});