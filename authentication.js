// Roles (Enum)

const Role = {
  Admin: "Admin",
  User: "User",
};

// User Class

class User {
  constructor(username, password, role) {
    this.username = username;
    this.password = password;
    this.role = role;

    this.failedAttempts = 0;
    this.lockUntil = null;
  }
}

// User Database

class UserDatabase {
  static users = [];

  static currentUser = null;
}

// save user

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(UserDatabase.users));
}

// load user

function loadUsers() {
  const data = localStorage.getItem("users");

  if (!data) return;

  const users = JSON.parse(data);

  UserDatabase.users = users.map(
    (user) => new User(user.username, user.password, user.role),
  );
}

// Authentication Service

class AuthenticationService {
  // Login

  static login(username, password) {
    const user = UserDatabase.users.find((u) => u.username === username);

    if (!user) {
      return "User not found!";
    }

    if (user.lockUntil && Date.now() < user.lockUntil) {
      return "Account is temporarily locked.";
    }

    if (user.password !== password) {
      user.failedAttempts++;

      if (user.failedAttempts >= 5) {
        user.lockUntil = Date.now() + 5 * 60 * 1000;

        return "Too many failed attempts. Account locked for 5 minutes.";
      }

      return "Wrong password or user name.";
    }

    user.failedAttempts = 0;
    user.lockUntil = null;

    UserDatabase.currentUser = user;

    return "Login successful.";
  }

  // Change Password

  static changePassword(oldPassword, newPassword) {
    const user = UserDatabase.currentUser;

    if (!user) {
      return "Please login first.";
    }

    if (user.password !== oldPassword) {
      return "Current password is incorrect.";
    }

    user.password = newPassword;

    return "Password changed.";
  }
}

// Permission Service

class PermissionService {
  static hasPermission(action) {
    const user = UserDatabase.currentUser;

    if (!user) {
      return false;
    }

    if (user.role === Role.Admin) {
      return true;
    }

    switch (action) {
      case "changePassword":
      case "showProfile":
        return true;

      case "showUsers":
        return false;

      default:
        return false;
    }
  }
}

// load users

loadUsers();

if (UserDatabase.users.length === 0) {
  UserDatabase.users.push(
    new User("admin", "Admin123!", Role.Admin),

    new User("ali", "Ali123!", Role.User),

    new User("sara", "Sara123!", Role.User),

    new User("amir", "Amir123!", Role.User),

    new User("zahra", "Zahra123!", Role.User),
  );

  saveUsers();
}

// Initial Users

UserDatabase.users.push(
  new User("admin", "Admin123!", Role.Admin),

  new User("ali", "Ali123!", Role.User),

  new User("sara", "Sara123!", Role.User),

  new User("amir", "Amir123!", Role.User),

  new User("zahra", "Zahra123!", Role.User),
);

// Elements

const loginBtn = document.querySelector("#loginBtn");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const loginPage = document.querySelector("#loginPage");
const dashboard = document.querySelector("#dashboard");
const welcome = document.querySelector("#welcome");
const message = document.querySelector(".message");
const showProfileBtn = document.querySelector("#showProfileBtn");
const showUsersBtn = document.querySelector("#showUsersBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const profile = document.querySelector("#profile");
const changePasswordPage = document.querySelector("#changePasswordPage");
const changePasswordPageBtn = document.querySelector("#changePasswordPageBtn");
const changePasswordBtn = document.querySelector("#changePasswordBtn");
const backBtn = document.querySelector("#backBtn");
const oldPasswordInput = document.querySelector("#oldPassword");
const newPasswordInput = document.querySelector("#newPassword");

// showing password

const togglePassword = document.querySelector("#togglePassword");

togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";

  passwordInput.type = isHidden ? "text" : "password";

  togglePassword.textContent = isHidden ? "🙈" : "👁";
});

// login event

loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  // Validation

  if (username === "" || password === "") {
    message.textContent = "Please fill all fields.";

    return;
  }

  const result = AuthenticationService.login(username, password);

  if (result !== "Login successful.") {
    message.textContent = result;

    return;
  }

  message.textContent = "";

  loginPage.classList.add("hidden");
  dashboard.classList.remove("hidden");

  welcome.textContent = `Welcome ${UserDatabase.currentUser.username}`;
});

// show profile event

showProfileBtn.addEventListener("click", () => {
  if (!PermissionService.hasPermission("showProfile")) {
    alert("Access Denied!");

    return;
  }

  const user = UserDatabase.currentUser;

  profile.innerHTML = `
        <h3>Profile</h3>

        <p><strong>Username:</strong> ${user.username}</p>

        <p><strong>Role:</strong> ${user.role}</p>
    `;
});

// show users (admin only)

showUsersBtn.addEventListener("click", () => {
  if (!PermissionService.hasPermission("showUsers")) {
    alert("Only admin can see all users.");

    return;
  }

  let html = "<h3>Users</h3>";

  UserDatabase.users.forEach((user) => {
    html += `
            <p>
                ${user.username}
                (${user.role})
            </p>
        `;
  });

  profile.innerHTML = html;
});

// log out event

logoutBtn.addEventListener("click", () => {
  UserDatabase.currentUser = null;

  dashboard.classList.add("hidden");

  loginPage.classList.remove("hidden");

  usernameInput.value = "";
  passwordInput.value = "";

  profile.innerHTML = "";

  message.textContent = "";
});

// password

// going to the password changin page

changePasswordPageBtn.addEventListener("click", () => {
  dashboard.classList.add("hidden");

  changePasswordPage.classList.remove("hidden");

  message.textContent = "";
});

// back

backBtn.addEventListener("click", () => {
  changePasswordPage.classList.add("hidden");

  dashboard.classList.remove("hidden");

  oldPasswordInput.value = "";
  newPasswordInput.value = "";

  message.textContent = "";
});

// password requirements

function isStrongPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  return regex.test(password);
}

// change password

changePasswordBtn.addEventListener("click", () => {
  const oldPassword = oldPasswordInput.value;

  const newPassword = newPasswordInput.value;

  if (oldPassword === "" || newPassword === "") {
    message.textContent = "Please fill all fields.";

    return;
  }

  if (!isStrongPassword(newPassword)) {
    message.textContent =
      "Password must contain uppercase, lowercase, number and special character.";

    return;
  }

  const result = AuthenticationService.changePassword(oldPassword, newPassword);

  if (result !== "Continue") {
    message.textContent = result;

    return;
  }

  UserDatabase.currentUser.password = newPassword;

  message.textContent = "✅ Password changed successfully.";

  oldPasswordInput.value = "";
  newPasswordInput.value = "";
  saveUsers();
});
