import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    orderBy, 
    onSnapshot,
    GeoPoint // ✅ Ensure GeoPoint is properly imported
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// ✅ Firebase Configuration (Replace with your actual details)
const firebaseConfig = {
    apiKey: "AIzaSyCQzCggLBwifNMui3rmnPrVG1FxbX62SS4",
    authDomain: "closet-connect-d9e02.firebaseapp.com",
    projectId: "closet-connect-d9e02",
    storageBucket: "closet-connect-d9e02.appspot.com", // ✅ Fixed storage URL
    messagingSenderId: "1046271828871",
    appId: "1:1046271828871:web:df950725896a0eedab2922",
    measurementId: "G-6139RRJBE6"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Authentication
export async function signUpUser(email, password) {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Signup Successful!");
        window.location.href = "middle.html";
    } catch (error) {
        alert(error.message);
    }
}

export async function loginUser(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login Successful!");
        window.location.href = "middle.html";
    } catch (error) {
        alert(error.message);
    }
}

export function logoutUser() {
    signOut(auth).then(() => {
        alert("Logged out successfully!");
        window.location.href = "auth.html";
    }).catch((error) => alert(error.message));
}

// ✅ Ensure users are logged in before accessing pages
export function checkAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "auth.html"; // Redirect to login if not authenticated
        }
    });
}

// ✅ Donation Function with Geolocation
export async function donateClothes(donorName, clothingType, address, clothingImages) {
    if (!donorName || !clothingType || !address || clothingImages.length === 0) {
        alert("Please fill in all fields and upload at least one image.");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const location = new GeoPoint(latitude, longitude); // ✅ Ensure proper GeoPoint usage

        try {
            const imageUrls = [];
            for (const image of clothingImages) {
                const storageRef = ref(storage, `clothing_images/${image.name}`);
                const snapshot = await uploadBytes(storageRef, image);
                const imageUrl = await getDownloadURL(snapshot.ref);
                imageUrls.push(imageUrl);
            }

            await addDoc(collection(db, "donations"), {
                donorName,
                clothingType,
                address,
                location, // ✅ Stores GeoPoint properly
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
