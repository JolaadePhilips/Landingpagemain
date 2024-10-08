// Add this at the beginning of the file, right after the existing Firebase imports
const firebaseConfig = {
    apiKey: "AIzaSyBLSEXbsGlIK6Du0I5kLVT9wAoH9LWsbuI",
    authDomain: "resource-saver.firebaseapp.com",
    databaseURL: "https://resource-saver-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "resource-saver",
    storageBucket: "resource-saver.appspot.com",
    messagingSenderId: "453012134492",
    appId: "1:453012134492:web:1b5c5c7cf42dd337d5a499",
    measurementId: "G-ZT6LX952GT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get auth and firestore instances
const auth = firebase.auth();
const db = firebase.firestore();

// Add this at the beginning of the file
if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
  chrome.runtime.sendMessage({ action: 'checkAuth' }, function(response) {
    if (!response.isAuthenticated) {
      window.location.href = 'index.html';
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    
    // Check if user is logged in
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log('User is signed in:', user.uid);
            // User is signed in, fetch and display their data
            fetchUserData(user.uid);
        } else {
            console.log('No user signed in, redirecting to index.html');
            // No user is signed in, redirect to login page
            window.location.href = 'index.html';
        }
    });

    // Logout functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            console.log('Logout button clicked');
            firebase.auth().signOut().then(() => {
                console.log('User signed out successfully');
                if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
                    chrome.runtime.sendMessage({ action: 'userLoggedOut' });
                }
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error('Error signing out:', error);
            });
        });
    } else {
        console.error('Logout button not found');
    }

    // View Resource Bank functionality
    const viewResourceBankButton = document.getElementById('viewResourceBank');
    if (viewResourceBankButton) {
        viewResourceBankButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('View Resource Bank button clicked');
            // TODO: Implement navigation to Resource Bank
            alert('Navigating to Resource Bank... (Not implemented yet)');
        });
    } else {
        console.error('View Resource Bank button not found');
    }
});

function fetchUserData(userId) {
    console.log('Fetching user data for:', userId);
    
    // Fetch user's resources
    db.collection('users').doc(userId).collection('resources').get()
        .then((querySnapshot) => {
            const resourceCount = querySnapshot.size;  // Total number of resources
            document.getElementById('resourceCount').textContent = resourceCount;

            let favoriteCount = 0;
            const categories = {};
            const recentResources = [];

            querySnapshot.forEach((doc) => {
                const resource = doc.data();
                if (resource.favorite) favoriteCount++;  // Count of favorited resources
                if (resource.tags) {
                    resource.tags.forEach(tag => {
                        categories[tag] = (categories[tag] || 0) + 1;  // Count resources per tag
                    });
                }
                recentResources.push(resource);
            });

            document.getElementById('favoriteCount').textContent = favoriteCount;
            displayTopCategories(categories);
            displayRecentResources(recentResources);
        })
        .catch((error) => {
            console.error("Error fetching user data: ", error);
        });

    // Fetch user's collections
    db.collection('users').doc(userId).collection('collections').get()
        .then((querySnapshot) => {
            const collectionCount = querySnapshot.size;  // Total number of collections
            document.getElementById('collectionCount').textContent = collectionCount;
        })
        .catch((error) => {
            console.error("Error fetching collections: ", error);
        });
}

function displayTopCategories(categories) {
    const topCategoriesList = document.getElementById('topCategories');
    const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 3);

    topCategoriesList.innerHTML = sortedCategories.map(([category, count]) => 
        `<li>${category}: ${count} resources</li>`
    ).join('');
}

function displayRecentResources(resources) {
    const recentResourcesList = document.getElementById('recentResources');
    const sortedResources = resources.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
    recentResourcesList.innerHTML = sortedResources.map(resource => 
        `<li>${resource.title} - ${resource.type}</li>`
    ).join('');
}