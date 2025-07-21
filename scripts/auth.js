class AuthManager {
  constructor() {
    this.currentUser = null
    this.initializeAuth()
  }

  initializeAuth() {
    // Check if we're on the login page
    if (window.location.pathname.includes("login.html")) {
      this.initializeLoginPage()
    } else if (window.location.pathname.includes("signup.html")) {
      this.initializeSignupPage()
    } else {
      this.checkAuthentication()
    }
  }

  initializeLoginPage() {
    const loginForm = document.getElementById("loginForm")

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        this.handleLogin(e)
      })
    }

    // Check if user is already logged in
    if (this.isAuthenticated()) {
      window.location.href = "index.html"
    }
  }

  initializeSignupPage() {
    const signupForm = document.getElementById("signupForm")

    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        this.handleSignup(e)
      })
    }

    // Check if user is already logged in
    if (this.isAuthenticated()) {
      window.location.href = "index.html"
    }
  }

  checkAuthentication() {
    if (!this.isAuthenticated()) {
      this.redirectToLogin()
    } else {
      this.currentUser = this.getCurrentUser()
      this.showApp()
      this.displayUserInfo()
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem("expense_tracker_token")
    const user = localStorage.getItem("expense_tracker_user")
    return token && user
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("expense_tracker_user")
    return userStr ? JSON.parse(userStr) : null
  }

  handleLogin(e) {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const loginBtn = document.getElementById("loginBtn")
    const loginError = document.getElementById("loginError")

    // Show loading state
    loginBtn.disabled = true
    loginBtn.textContent = "Signing in..."
    loginError.style.display = "none"

    // Simulate API call
    setTimeout(() => {
      if (this.validateCredentials(email, password)) {
        // Successful login
        const user = this.getUserByEmail(email)

        const token = this.generateToken()

        localStorage.setItem("expense_tracker_token", token)
        localStorage.setItem("expense_tracker_user", JSON.stringify(user))

        window.location.href = "index.html"
      } else {
        // Failed login
        loginError.style.display = "block"
        loginBtn.disabled = false
        loginBtn.textContent = "Sign In"
      }
    }, 1000)
  }

  handleSignup(e) {
    e.preventDefault()

    const fullName = document.getElementById("fullName").value.trim()
    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const signupBtn = document.getElementById("signupBtn")
    const signupError = document.getElementById("signupError")

    // Reset error state
    signupError.style.display = "none"

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      this.showSignupError("Please fill in all fields.")
      return
    }

    if (password !== confirmPassword) {
      this.showSignupError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      this.showSignupError("Password must be at least 6 characters long.")
      return
    }

    if (this.emailExists(email)) {
      this.showSignupError("An account with this email already exists.")
      return
    }

    // Show loading state
    signupBtn.disabled = true
    signupBtn.textContent = "Creating Account..."

    // Simulate API call
    setTimeout(() => {
      try {
        // Create new user
        const newUser = {
          id: Date.now().toString(),
          fullName: fullName,
          email: email,
          password: password, // In real app, this would be hashed
          createdAt: new Date().toISOString(),
        }

        // Save user to localStorage (in real app, this would be sent to server)
        this.saveUser(newUser)

        // Generate token and log user in
        const token = this.generateToken()
        const userForSession = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.fullName,
          loginTime: new Date().toISOString(),
        }

        localStorage.setItem("expense_tracker_token", token)
        localStorage.setItem("expense_tracker_user", JSON.stringify(userForSession))

        // Redirect to main app
        window.location.href = "index.html"
      } catch (error) {
        this.showSignupError("Failed to create account. Please try again.")
        signupBtn.disabled = false
        signupBtn.textContent = "Create Account"
      }
    }, 1000)
  }

  showSignupError(message) {
    const signupError = document.getElementById("signupError")
    signupError.textContent = message
    signupError.style.display = "block"
  }

  emailExists(email) {
    const users = this.getStoredUsers()
    return users.some((user) => user.email.toLowerCase() === email.toLowerCase())
  }

  saveUser(user) {
    const users = this.getStoredUsers()
    users.push(user)
    localStorage.setItem("expense_tracker_users", JSON.stringify(users))
  }

  getStoredUsers() {
    const usersStr = localStorage.getItem("expense_tracker_users")
    return usersStr ? JSON.parse(usersStr) : this.getDefaultUsers()
  }

  getDefaultUsers() {
    // Default demo users
    return [
      {
        id: "demo1",
        fullName: "Demo User",
        email: "demo@example.com",
        password: "demo123",
        createdAt: new Date().toISOString(),
      },
    ]
  }

  getUserByEmail(email) {
    const users = this.getStoredUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    return user
      ? {
          id: user.id,
          email: user.email,
          name: user.fullName,
          loginTime: new Date().toISOString(),
        }
      : null
  }

  validateCredentials(email, password) {
    const users = this.getStoredUsers()
    return users.some((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password)
  }

  generateToken() {
    return "token_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
  }

  logout() {
    localStorage.removeItem("expense_tracker_token")
    localStorage.removeItem("expense_tracker_user")
    // Note: We keep user accounts and transactions for demo purposes
    window.location.href = "login.html"
  }

  redirectToLogin() {
    window.location.href = "login.html"
  }

  showApp() {
    // App is shown by default, just ensure auth check is hidden
    const authCheck = document.getElementById("authCheck")
    if (authCheck) {
      authCheck.classList.add("app-hidden")
    }
  }

  displayUserInfo() {
    const userNameElement = document.getElementById("userName")
    if (userNameElement && this.currentUser) {
      userNameElement.textContent = `Welcome, ${this.currentUser.name}!`
    }
  }

  // Method to get user info for display
  getUserInfo() {
    return this.currentUser
  }
}

// Initialize auth manager
const authManager = new AuthManager()

// Make logout function available globally
window.authManagerLogout = () => authManager.logout()
