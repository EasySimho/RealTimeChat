var socket = io();
var chatInput = document.getElementById("chat-input");
var chatBox = document.getElementById("chat-box");
var loginButton = document.getElementById("login-button");
var passwordInput = document.getElementById("password");
var usernameInput = document.getElementById("username");
var loginForm = document.getElementById("login-form");
var registerForm = document.getElementById("register-form");
var toggleFormsButton = document.getElementById("toggle-forms");

toggleFormsButton.addEventListener("click", function () {
    if (loginForm.style.display === "none") {
        registerForm.style.display = "none";
        loginForm.style.display = "flex";
    } else {
        loginForm.style.display = "none";
        registerForm.style.display = "flex";
    }
});

loginButton.addEventListener("click", function () {
    var password = passwordInput.value;
    var username = usernameInput.value;
    socket.emit("user login", username, password);
  });

socket.on("login success", function () {
    chatInput.disabled = false;
    alert("Accesso effettuato con successo!");
    loginForm.style.display = "none";
});

socket.on("login failure", function () {
    alert("Codice di sicurezza errato!");
});

socket.on("login required", function () {
    alert("Devi effettuare l'accesso prima di inviare un messaggio.");
});

socket.on("load messages", function (messages) {
    messages.forEach(function (msg) {
        var p = document.createElement("p");
        var span = document.createElement("span");
        p.textContent = msg.message;
        span.textContent = msg.username;
        p.id = "chat-msg";
        span.id = "chat-username";
        p.style.backgroundColor = msg.color;
        chatBox.appendChild(p);
        p.appendChild(span);
    });
});

chatInput.addEventListener("keydown", function (event) {
    if (event.keyCode === 13 && event.target.value) {
        socket.emit("chat message", event.target.value);
        event.target.value = "";
        event.preventDefault();
    }
});

socket.on("chat message", function (msg) {
    var p = document.createElement("p");
    var span = document.createElement("span");
    p.textContent = msg.message;
    span.textContent = msg.username;
    p.id = "chat-msg";
    span.id = "chat-username";
    p.style.backgroundColor = msg.color;
    chatBox.appendChild(p);
    p.appendChild(span);
    window.scrollTo(0, document.body.scrollHeight);
});