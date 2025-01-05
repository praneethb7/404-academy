import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

let currentUser = null;

// Track user authentication state
onAuthStateChanged(auth, (user) => {
    currentUser = user; 
});

// Fetch all courses
async function fetchCourses() {
    const querySnapshot = await getDocs(collection(db, "courses"));
    const courseCatalog = document.querySelector("#course-catalog");

    querySnapshot.forEach((doc) => {
        const course = { id: doc.id, ...doc.data() };

        const courseCard = `
            <div class="course-card">
                <img src="${course.imageUrl}" alt="${course.title}" width="450"/>
                <div>
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <p>Price: ₹${course.price}</p>
                    <p>Duration: ${course.duration} hours</p>
                    <button class="enroll" type="button">Enroll</button>
                    <div class="enroll-status" style="display: none; color: green; font-weight: bold;"></div>
                </div>
            </div>
        `;

        courseCatalog.innerHTML += courseCard;
    });

    
    const enrollAll = document.querySelectorAll(".enroll");
    enrollAll.forEach((enroll,index) => {
        enroll.addEventListener("click", async (e) => {
            e.preventDefault();
            const course = querySnapshot.docs[index].data();
            course.id = querySnapshot.docs[index].id; 

            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const userType = userDoc.data().userType;
                        const para = enroll.nextElementSibling; 

                        if (userType === "Mentor") {
                            para.innerText = "You need a Learner account to enroll in courses.";
                            para.style.color = "red"; 
                            para.style.display = "block";
                            setTimeout(() => {
                                para.style.display = "none";
                            }, 5000);
                        } else {
                            // For Learners
                            para.innerText = "Successfully enrolled in this course!";
                            para.style.color = "green"; 
                            para.style.display = "block";

                            // Add course to enrolled courses
                            await enrollCourse(course);

                            setTimeout(() => {
                                para.style.display = "none";
                            }, 5000);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                alert("Please log in to enroll in courses.");
            }
        });
    });
}

//enroll course and update Firestore
async function enrollCourse(course) {
    if (currentUser) {
        try {
            const userRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                let enrolledCourses = userDoc.data().enrolledCourses || [];

                //  if already enrolled
                if (!enrolledCourses.some((c) => c.id === course.id)) {
                    enrolledCourses.push(course);

                    // Update Firestore with new enrolled courses
                    await setDoc(userRef, { enrolledCourses }, { merge: true });
                }
            }
        } catch (error) {
            console.error("Error enrolling in course:", error);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchCourses();
});

// Logout functionality
const logoutBtn = document.querySelector("#logoutBtn");
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error signing out:", error);
    }
});
