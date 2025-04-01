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
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQzCggLBwifNMui3rmnPrVG1FxbX62SS4",
    authDomain: "closet-connect-d9e02.firebaseapp.com",
    projectId: "closet-connect-d9e02",
    storageBucket: "closet-connect-d9e02.appspot.com",
    messagingSenderId: "1046271828871",
    appId: "1:1046271828871:web:df950725896a0eedab2922",
    measurementId: "G-6139RRJBE6"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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
        window.location.href = "auth.html"; // ✅ Redirects properly
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

// ✅ Donation Function (without image upload)
export async function donateClothes(donorName, clothingType, address) {
    if (!donorName || !clothingType || !address || !contact) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        await addDoc(collection(db, "donations"), {
            donorName,
            clothingType,
            address,
            contact,
            timestamp: serverTimestamp()
        });

        alert("Donation submitted successfully!");
    } catch (error) {
        console.error("Error donating:", error);
        alert("Failed to submit donation.");
    }
}


// ✅ Donation Deletion Function (allow donors to delete their donations)
export async function deleteDonation(donationId) {
    try {
        // Delete the donation document from Firestore by its ID
        const docRef = doc(db, "donations", donationId);
        await deleteDoc(docRef);
        alert("Donation deleted successfully!");
    } catch (error) {
        console.error("Error deleting donation:", error);
        alert("Failed to delete donation.");
    }
}

// ✅ Update Donation List (Add delete button for each donation)
export function updateDonationList() {
    const donationListElem = document.getElementById("donation-list");

    // Get donations from Firestore
    const q = query(collection(db, "donations"), orderBy("timestamp", "desc"));
    onSnapshot(q, (querySnapshot) => {
        donationListElem.innerHTML = ""; // Clear the current list

        querySnapshot.forEach((doc) => {
            const donation = doc.data();
            const row = document.createElement("tr");

            // Add donation data to row
            row.innerHTML = `
                <td>${donation.donorName}</td>
                <td>${donation.clothingType}</td>
                <td>${donation.address}</td>
                <td>${donation.contact}</td>
                <td><button class="delete-btn" data-id="${doc.id}">Delete</button></td>
            `;

            donationListElem.appendChild(row);

            // Add event listener to the delete button
            row.querySelector(".delete-btn").addEventListener("click", () => {
                const donationId = doc.id;
                const confirmation = confirm("Are you sure you want to delete this donation?");
                if (confirmation) {
                    deleteDonation(donationId);
                }
            });
        });
    });
}
