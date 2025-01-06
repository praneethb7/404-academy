//firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBUtBZVgLiWCQJaZgfVN8yhmyT6hro0VvU",
    authDomain: "academy-c39f4.firebaseapp.com",
    projectId: "academy-c39f4",
    storageBucket: "academy-c39f4.firebasestorage.app",
    messagingSenderId: "55363037232",
    appId: "1:55363037232:web:fa02e84dbbc1762eff25f5",
    measurementId: "G-7Y9QLJTX7S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const signupSuccess = document.querySelector("#signup-message");
    const loginSuccess = document.querySelector("#login-message");

    // Toggle between login and signup forms
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector("title").innerText = "SignUp Page - 404 academy";
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        document.querySelector("title").innerText = "Login Page - 404 academy";
        loginForm.classList.remove('hidden');
    });
    // Signup functionality
    signupForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const name = signupForm.querySelector("input[type='text']").value;
        const email = signupForm.querySelector("input[type='email']").value;
        const password = signupForm.querySelector("input[type='password']").value;
        const confirmpassword = signupForm.querySelector("#confirmPassword").value;
        const userType = signupForm.querySelector('input[name="type"]:checked')?.value;

        if (!userType) {
            alert("Please select a role (Mentor or Learner).");
            return;
        }
        if(password != confirmpassword){
            alert("Passwords do not match");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save additional user info to Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                userType: userType,
            });
            //send welcome mail
            await sendWelcomeEmail(email, name, userType);

            signupSuccess.textContent = 'Welcome Email Sent. Account Creation Successful!';
            signupSuccess.style.display = 'block';
                
                setTimeout(() => {
                    signupForm.reset();
                    switchToLogin.click();
                }, 2000);
        } catch (error) {
            alert("Error during signup: " + error.message);
        }
    });

    // Login functionality
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const email = loginForm.querySelector("input[type='email']").value;
        const password = loginForm.querySelector("input[type='password']").value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            loginSuccess.textContent = 'Login successful!';
                loginSuccess.style.display = 'block';
                 
            setTimeout(() => {
                loginForm.reset();
                window.location.href = "main.html";
            }, 2000);
            
        } catch (error) {
            alert("Error during login: " + error.message);
        }
    });
});
//send wlcm mail
async function sendWelcomeEmail(userEmail, userName, userType) {
    const apiUrl = "/api/server"; 

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: userEmail,
                name: userName,
                userType: userType,
            }),
        });

        if (!response.ok) {
            console.error("Error sending email:", await response.text());
            alert("Failed to send welcome email.");
        } else {
            console.log("Welcome email sent successfully!");
        }
    } catch (error) {
        console.error("Error in sending email:", error);
    }
}