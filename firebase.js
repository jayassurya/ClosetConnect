// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    GeoPoint
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase Configuration (Replace with your actual Firebase details)
const firebaseConfig = {
    apiKey: "AIzaSyCQzCggLBwifNMui3rmnPrVG1FxbX62SS4",
    authDomain: "closet-connect-d9e02.firebaseapp.com",
    projectId: "closet-connect-d9e02",
    storageBucket: "closet-connect-d9e02.firebasestorage.app",
    messagingSenderId: "1046271828871",
    appId: "1:1046271828871:web:df950725896a0eedab2922",
    measurementId: "G-6139RRJBE6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication Functions
export async function signUpUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert("Signup Successful!");
        window.location.href = "middle.html"; // Replace with your desired page
        return userCredential.user;
    } catch (error) {
        alert(error.message);
    }
}

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert("Login Successful!");
        window.location.href = "middle.html"; // Replace with your desired page
        return userCredential.user;
    } catch (error) {
        alert(error.message);
    }
}

export function logoutUser() {
    signOut(auth).then(() => {
        alert("Logged out successfully!");
        window.location.href = "auth.html"; // Replace with your login page
    }).catch((error) => {
        alert(error.message);
    });
}

// Donation Function with Geolocation
export async function donateClothes(donorName, clothingType, address, clothingImages) {
    if (!donorName || !clothingType || !address || clothingImages.length === 0) {
        alert("Please fill in all fields and upload at least one image.");
        return;
    }

    // Get user's current position
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const location = new GeoPoint(latitude, longitude);

        try {
            // Upload images and get their URLs
            const imageUrls = [];
            for (const image of clothingImages) {
                const storageRef = ref(storage, `clothing_images/${image.name}`);
                const snapshot = await uploadBytes(storageRef, image);
                const imageUrl = await getDownloadURL(snapshot.ref);
                imageUrls.push(imageUrl);
            }

            // Add donation details to Firestore
            await addDoc(collection(db, "donations"), {
                donorName,
                clothingType,
                address,
                location, // Store GeoPoint
                imageUrls,
                timestamp: serverTimestamp()
            });

            alert("Donation submitted successfully!");
        } catch (error) {
            console.error("Error donating:", error);
            alert("Failed to submit donation.");
        }
    }, (error) => {
        console.error("Error obtaining location:", error);
        alert("Failed to obtain location.");
    });
}

// Messaging Functions
export async function sendMessage(sender, recipient, text) {
    if (!sender || !recipient || !text) {
        alert("All fields are required!");
        return;
    }

    try {
        await addDoc(collection(db, "messages"), {
            sender,
            recipient,
            text,
            timestamp: serverTimestamp()
        });

        console.log("Message sent successfully!");
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message.");
    }
}

export function listenForMessages(callback) {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
        let messages = [];
        snapshot.forEach((doc) => messages.push(doc.data()));
        callback(messages);
    });
}

// Ensure the DOM is fully loaded before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
    const donationForm = document.getElementById("donation-form");
    if (donationForm) {
        donationForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const donorName = document.getElementById("donor-name").value;
            const clothingType = document.getElementById("clothing-type").value;
            const address = document.getElementById("address").value;
            const clothingImages = document.getElementById("clothing-images").files;

            await donateClothes(donorName, clothingType, address, clothingImages);
        });
    } else {
        console.error("Element with ID 'donation-form' not found.");
    }
});
