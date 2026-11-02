
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");

const message = document.getElementById("message");


// SWITCH TO LOGIN

loginTab.addEventListener("click", function () {

    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");

    loginTab.classList.add("active");
    signupTab.classList.remove("active");

    message.textContent = "";

});


// SWITCH TO REGISTRATION

signupTab.addEventListener("click", function () {

    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    signupTab.classList.add("active");
    loginTab.classList.remove("active");

    message.textContent = "";

});


// CREATE ACCOUNT

signupForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();

    const email = document.getElementById("signup-email").value.trim().toLowerCase();

    const password = document.getElementById("signup-password").value;


    let users = JSON.parse(localStorage.getItem("students")) || [];


    const existingUser = users.find(function (user) {

        return user.email === email;

    });


    if (existingUser) {

        message.textContent = "This email is already registered.";

        return;

    }


    const newUser = {

        name: name,
        email: email,
        password: password

    };


    users.push(newUser);


    localStorage.setItem("students", JSON.stringify(users));


    message.textContent = "Account created successfully! Please log in.";


    signupForm.reset();


    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");

    signupTab.classList.remove("active");
    loginTab.classList.add("active");

});


// LOGIN

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const email = document.getElementById("login-email").value.trim().toLowerCase();

    const password = document.getElementById("login-password").value;


    const users = JSON.parse(localStorage.getItem("students")) || [];


    const user = users.find(function (student) {

        return student.email === email && student.password === password;

    });


    if (user) {

        const loggedInStudent = {

            name: user.name,
            email: user.email

        };


        localStorage.setItem(
            "loggedInStudent",
            JSON.stringify(loggedInStudent)
        );


        window.location.href = "dashboard.html";

    } else {

        message.textContent = "Incorrect email or password. Please try again.";

    }

});
