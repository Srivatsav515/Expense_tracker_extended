class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme()
    this.applyTheme(this.currentTheme)
    this.initializeThemeToggle()
  }

  loadTheme() {
    return localStorage.getItem("expense_tracker_theme") || "dark"
  }

  saveTheme(theme) {
    localStorage.setItem("expense_tracker_theme", theme)
  }

  applyTheme(theme) {
    document.body.className = `${theme}-theme`
    this.updateThemeToggleIcon(theme)
  }

  updateThemeToggleIcon(theme) {
    const themeToggle = document.getElementById("themeToggle")
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙"
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark"
    this.applyTheme(this.currentTheme)
    this.saveTheme(this.currentTheme)
  }

  initializeThemeToggle() {
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme()
    })
  }
}

// Initialize theme manager
const themeManager = new ThemeManager()
