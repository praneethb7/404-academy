import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, deleteDoc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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


//Correct page based on userType
onAuthStateChanged(auth, async (user) => {
    if (user) {

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userType = userDoc.data().userType;
                if (userType === "Mentor") {
                    document.querySelector(".admin-page").style.display = "grid";
                    fetchAdminCourses(user.uid);
                } else if (userType === "Learner") {
                    document.querySelector("#user-page").style.display = "grid";
                }
            } else {
                console.error("No such user document found!");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
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

// Restrict price and duration input to numeric values
const priceInput = document.getElementById('course-price');
const durationInput = document.getElementById('course-duration');
priceInput.addEventListener('input', (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) {
        e.target.value = value.slice(0, -1);
    }
});
durationInput.addEventListener('input', (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) {
        e.target.value = value.slice(0, -1);
    }
});

//Admin Page creating courses 
document.querySelector("#course-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("course-title").value;
    const description = document.getElementById("course-description").value;
    const price = document.getElementById("course-price").value;
    const duration = document.getElementById("course-duration").value;
    const imageUrl = document.getElementById("imageurl").value;
    const videoUrl = document.getElementById("course-video").value;

    try {
        const user = auth.currentUser;
        if (user) {
            const newCourse = {
                title,
                description,
                price,
                duration,
                imageUrl,
                videoUrl,
                adminId: user.uid,
            };


            await addDoc(collection(db, "courses"), newCourse);
            document.getElementById("message").innerText = "Course created successfully!";
            fetchAdminCourses(user.uid);
        }
    } catch (error) {
        console.error("Error creating course:", error);
    }
});

// Fetch courses created by the admin
async function fetchAdminCourses(adminId) {
    const q = query(collection(db, "courses"), where("adminId", "==", adminId));
    const querySnapshot = await getDocs(q);

    const adminCoursesContainer = document.querySelector("#admin-courses-title");
    adminCoursesContainer.innerHTML = "<h1>Your Courses:</h1>";

    querySnapshot.forEach((doc) => {
        const course = doc.data();
        const courseCard = `
            <div class="course-card">
                <img src="${course.imageUrl}" alt="${course.title}" width=450/>
                <div>
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <p>Price: ₹${course.price}</p>
                <p>Duration: ${course.duration} hours</p>
                <button data-id="${doc.id}"class="destroy" type="submit">Prevent Further Enrolls</button>
                </div>
            </div>
        `;
        adminCoursesContainer.innerHTML += courseCard;
    });
    attachDelete();
}
//enrolled courses user
async function displayEnrolledCourses(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const enrolledCourses = userDoc.data().enrolledCourses || [];
            const userPage = document.querySelector("#user-page");

            if (enrolledCourses.length > 0) {
                enrolledCourses.forEach((course) => {
                    const courseCard = `
                        <div class="course-card">
                            <img src="${course.imageUrl}" alt="${course.title}" width="450"/>
                            <div>
                                <h3>${course.title}</h3>
                                <p>${course.description}</p>
                                <p>Price: ₹${course.price}</p>
                                <p>Duration: ${course.duration} hours</p>
                                <button vid-url="${course.videoUrl}" class="learn-btn" type="submit">Start Learning</button>
                            </div>
                        </div>
                    `;

                    userPage.innerHTML += courseCard;
                    attachLearn();
                });
            } else {
                userPage.querySelector("h1").innerText = "No Courses Enrolled";
            }
        } else {
            console.error("User document does not exist.");
        }
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
    }
}

//delete course 
function attachDelete() {
    const deleteall = document.querySelectorAll(".destroy")
    deleteall.forEach((deletebtn) => {
        deletebtn.addEventListener("click", async (e) => {
            if (confirm("Click OK to delete this course permanently")) {
                const courseID = e.target.getAttribute("data-id");
                await deleteCourse(courseID);
            }
        })
    })
}
async function deleteCourse(courseID) {
    try {
        await deleteDoc(doc(db, "courses", courseID));
        fetchAdminCourses(auth.currentUser.uid);
    }
    catch (error) {
        console.error("Error occured:", error);
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().userType === "Learner") {
            displayEnrolledCourses(user.uid);
        }
    }
});

//Start Learning on YT
function attachLearn() {
    const learnAll = document.querySelectorAll(".learn-btn");
    learnAll.forEach((learn) => {
        learn.addEventListener("click", async (e) => {
            let vidUrl = e.currentTarget.getAttribute("vid-url");
            await openYT(vidUrl);
        })
    })
}

async function openYT(vidUrl) {
    try {
        let videoId = vidUrl.split("v=")[1]?.split("&")[0];
        let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

        document.getElementById("videoFrame").src = embedUrl;
        document.getElementById("videoModal").style.display = "flex";
    }
    catch (err) {
        console.log("Cannot open video!");
    }
}

document.querySelector(".close").addEventListener("click", closeModal);
document.getElementById("videoModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("videoModal")) {
        closeModal();
    }
});

function closeModal() {
    document.getElementById("videoModal").style.display = "none";
    document.getElementById("videoFrame").src = "";
}

