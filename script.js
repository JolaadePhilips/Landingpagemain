document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginToggle = document.getElementById('loginToggle');
    const signupToggle = document.getElementById('signupToggle');
    const authContainer = document.querySelector('.auth-container');

    loginToggle.addEventListener('click', function() {
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        loginToggle.classList.add('active');
        signupToggle.classList.remove('active');
    });

    signupToggle.addEventListener('click', function() {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        loginToggle.classList.remove('active');
        signupToggle.classList.add('active');
    });

    // Password toggle functionality
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = '🙈';
            } else {
                input.type = 'password';
                this.textContent = '👁️';
            }
        });
    });

    // Ensure the same Firebase config is used
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
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // Set auth persistence to local storage
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    console.log('Firebase initialized:', firebase.app().name);

    // Add this function to handle successful login
    function handleSuccessfulLogin(user) {
      console.log('User logged in:', user.uid);
      // Send a message to the extension that the user has logged in
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          'fcemcgjjommnhebhhckgikgglhjndnoh', // Your extension ID
          { action: "setAuthState", isAuthenticated: true },
          function(response) {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError);
            } else {
              console.log("Auth state updated in extension", response);
            }
          }
        );
      }
      // Redirect to UserHome.html
      window.location.href = 'UserHome.html';
    }

    // Update the login functionality
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Login form submitted');
      const email = loginForm.querySelector('input[type="email"]').value;
      const password = loginForm.querySelector('input[type="password"]').value;

      auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          console.log('Login successful');
          handleSuccessfulLogin(userCredential.user);
        })
        .catch((error) => {
          console.error('Login error:', error);
          const errorCode = error.code;
          const errorMessage = error.message;
          let feedbackMessage = "An error occurred during login. Please try again.";
          
          if (errorCode === 'auth/user-not-found') {
            feedbackMessage = "No account found with this email. Please sign up.";
          } else if (errorCode === 'auth/wrong-password') {
            feedbackMessage = "Incorrect password. Please try again.";
          }
          
          alert(`Login error: ${feedbackMessage}`);
        });
    });

    // Signup functionality
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;
        const confirmPassword = signupForm.querySelector('input[placeholder="Confirm Password"]').value;

        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                alert('Signed up successfully!');
                // Redirect or update UI
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(`Signup error: ${errorMessage}`);
            });
    });

    // Google Sign-in functionality
    const googleButtons = document.querySelectorAll('.google-auth-button');

    googleButtons.forEach(button => {
      button.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
          .then((result) => {
            console.log('Google Sign-In successful');
            handleSuccessfulLogin(result.user);
          }).catch((error) => {
            console.error('Google Sign-In Error:', error);
            const errorCode = error.code;
            const errorMessage = error.message;
            let feedbackMessage = "An error occurred during Google sign-in. Please try again.";
            
            if (errorCode === 'auth/account-exists-with-different-credential') {
              feedbackMessage = "An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.";
            } else if (errorCode === 'auth/popup-closed-by-user') {
              feedbackMessage = "The sign-in popup was closed before completing the process. Please try again.";
            } else if (errorCode === 'auth/cancelled-popup-request') {
              feedbackMessage = "The sign-in process was cancelled. Please try again.";
            }
            
            alert(`Google sign-in error: ${feedbackMessage}`);
          });
      });
    });

    // Smooth scrolling for auth section and highlight effect
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                // Switch to the correct form
                if (targetId === 'signup') {
                    signupToggle.click();
                } else {
                    loginToggle.click();
                }

                // Add highlight effect
                authContainer.classList.add('highlight');
                setTimeout(() => {
                    authContainer.classList.remove('highlight');
                }, 1500); // Remove highlight after 1.5 seconds
            }
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Interactive background
    const particles = document.querySelectorAll('.particle');
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
    });

    function animateParticles() {
        particles.forEach((particle, index) => {
            const speed = 0.02 + (index * 0.005);
            const xOffset = (mouseX - 0.5) * speed * 100;
            const yOffset = (mouseY - 0.5) * speed * 100;
            particle.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });

        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // Interactive Bubble Background
    const canvas = document.getElementById('bubbleCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let bubbles = [];
    const colors = ['#3498db', '#9b59b6', '#e74c3c', '#f1c40f', '#1abc9c'];

    class Bubble {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 15 + 5; // Smaller bubbles
            this.speedX = Math.random() * 0.5 - 0.25; // Slower horizontal movement
            this.speedY = Math.random() * 0.5 - 0.25; // Slower vertical movement
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.3 + 0.1; // More transparent bubbles
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createBubbles() {
        for (let i = 0; i < 30; i++) { // Reduced number of bubbles
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            bubbles.push(new Bubble(x, y));
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bubbles.forEach(bubble => {
            bubble.update();
            bubble.draw();
        });
        requestAnimationFrame(animate);
    }

    canvas.addEventListener('mousemove', function(e) {
        for (let i = 0; i < 3; i++) {
            bubbles.push(new Bubble(e.x, e.y));
        }
    });

    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        bubbles = [];
        createBubbles();
    });

    createBubbles();
    animate();

    // Interactive background icons
    const icons = document.querySelectorAll('.icon');
    
    document.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        icons.forEach((icon, index) => {
            const speed = 0.05 + (index * 0.01);
            const xOffset = (mouseX - 0.5) * speed * 100;
            const yOffset = (mouseY - 0.5) * speed * 100;
            icon.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });

    // Add this to handle authentication state changes
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('User is signed in:', user.uid);
        // If the user is already signed in and we're on the landing page, redirect to UserHome.html
        if (window.location.pathname.endsWith('index.html')) {
          window.location.href = 'UserHome.html';
        }
      } else {
        console.log('No user signed in');
        // If the user is not signed in and we're on the UserHome page, redirect to the landing page
        if (window.location.pathname.endsWith('UserHome.html')) {
          window.location.href = 'index.html';
        }
      }
    });

    // After successful login
    function onSuccessfulAuth(user) {
      console.log('User logged in:', user.uid);
      // Send a message to the extension
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          'fcemcgjjommnhebhhckgikgglhjndnoh',
          { action: 'userLoggedIn' },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message to extension:', chrome.runtime.lastError);
            } else {
              console.log('Extension notified of login:', response);
            }
          }
        );
      }
      // Redirect to UserHome.html or perform other actions
      window.location.href = 'UserHome.html';
    }

    // After logout
    function onLogout() {
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          'fcemcgjjommnhebhhckgikgglhjndnoh',
          { action: "setAuthState", isAuthenticated: false },
          function(response) {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError);
            } else {
              console.log("Auth state updated in extension", response);
            }
          }
        );
      }
      // Redirect to login page or perform other actions
      window.location.href = 'index.html';
    }

    // Call this function when the page loads to check if the user is already authenticated
    function checkAuthState() {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          onSuccessfulAuth(user);
        }
      });
    }

    // Call checkAuthState when the page loads
    document.addEventListener('DOMContentLoaded', checkAuthState);
});
