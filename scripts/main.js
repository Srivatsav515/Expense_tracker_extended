class ExpenseTracker {
  constructor() {
    // Check authentication first
    if (!this.checkAuth()) {
      return
    }

    this.transactions = this.loadTransactions()
    this.filteredTransactions = [...this.transactions]

    this.initializeEventListeners()
    this.setTodayDate()
    this.renderTransactions()
    this.updateSummary()
    this.updateRadioButtons()
    this.displayUserInfo()
  }

  initializeEventListeners() {
    // Form submission
    document.getElementById("transactionForm").addEventListener("submit", (e) => {
      this.handleAddTransaction(e)
    })

    // Transaction type radio buttons
    document.querySelectorAll('input[name="type"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.updateCategoryOptions(e.target.value)
      })
    })

    // Filter inputs
    document.getElementById("categoryFilter").addEventListener("change", () => {
      this.applyFilters()
    })

    document.getElementById("fromDate").addEventListener("change", () => {
      this.applyFilters()
    })

    document.getElementById("toDate").addEventListener("change", () => {
      this.applyFilters()
    })

    document.getElementById("minAmount").addEventListener("input", () => {
      this.debounce(() => this.applyFilters(), 500)()
    })

    document.getElementById("maxAmount").addEventListener("input", () => {
      this.debounce(() => this.applyFilters(), 500)()
    })

    // Clear filters button
    document.getElementById("clearFiltersBtn").addEventListener("click", () => {
      this.clearFilters()
    })

    // Export button
    document.getElementById("exportBtn").addEventListener("click", () => {
      this.exportToCSV()
    })

    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", () => {
      this.logout()
    })
  }

  loadTransactions() {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return []

    const stored = localStorage.getItem(`expense_tracker_transactions_${currentUser.id}`)
    return stored ? JSON.parse(stored) : []
  }

  saveTransactions() {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return

    localStorage.setItem(`expense_tracker_transactions_${currentUser.id}`, JSON.stringify(this.transactions))
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("expense_tracker_user")
    return userStr ? JSON.parse(userStr) : null
  }

  displayUserInfo() {
    const currentUser = this.getCurrentUser()
    const userNameElement = document.getElementById("userName")
    if (userNameElement && currentUser) {
      userNameElement.textContent = `Welcome, ${currentUser.name}!`
    }
  }

  setTodayDate() {
    const today = new Date().toISOString().split("T")[0]
    document.getElementById("date").value = today
  }

  resetForm() {
    document.getElementById("transactionForm").reset()
    this.setTodayDate()
    document.querySelector('input[name="type"][value="expense"]').checked = true
    this.updateCategoryOptions("expense")
    this.updateRadioButtons()
  }

  updateCategoryOptions(type) {
    const categorySelect = document.getElementById("category")
    const incomeCategories = [
      { value: "salary", text: "Salary" },
      { value: "freelance", text: "Freelance" },
      { value: "investment", text: "Investment" },
      { value: "business", text: "Business" },
      { value: "other", text: "Other" },
    ]

    const expenseCategories = [
      { value: "food", text: "Food" },
      { value: "transport", text: "Transport" },
      { value: "entertainment", text: "Entertainment" },
      { value: "utilities", text: "Utilities" },
      { value: "shopping", text: "Shopping" },
      { value: "healthcare", text: "Healthcare" },
      { value: "other", text: "Other" },
    ]

    const categories = type === "income" ? incomeCategories : expenseCategories

    categorySelect.innerHTML = '<option value="">Select a category</option>'
    categories.forEach((cat) => {
      const option = document.createElement("option")
      option.value = cat.value
      option.textContent = cat.text
      categorySelect.appendChild(option)
    })
  }

  handleAddTransaction(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const type = formData.get("type")
    const title = formData.get("title")?.trim()
    const amount = Number.parseFloat(formData.get("amount"))
    const category = formData.get("category")
    const date = formData.get("date")
    const notes = formData.get("notes")?.trim()

    // Validation
    if (!type || !title || !amount || !category || !date) {
      this.showToast("Please fill in all required fields", "error")
      return
    }

    if (amount <= 0) {
      this.showToast("Amount must be greater than 0", "error")
      return
    }

    // Create transaction
    const transaction = {
      id: Date.now().toString(),
      type,
      title,
      amount,
      category,
      date,
      notes: notes || "",
      timestamp: new Date().toISOString(),
    }

    // Add to transactions
    this.transactions.unshift(transaction)
    this.saveTransactions()

    // Update UI
    this.applyFilters()
    this.updateSummary()
    this.resetForm()

    this.showToast("Transaction added successfully!", "success")
  }

  deleteTransaction(id) {
    if (confirm("Are you sure you want to delete this transaction?")) {
      this.transactions = this.transactions.filter((t) => t.id !== id)
      this.saveTransactions()
      this.applyFilters()
      this.updateSummary()

      this.showToast("Transaction deleted successfully!", "success")
    }
  }

  applyFilters() {
    const categoryFilter = document.getElementById("categoryFilter").value
    const fromDate = document.getElementById("fromDate").value
    const toDate = document.getElementById("toDate").value
    const minAmount = Number.parseFloat(document.getElementById("minAmount").value) || 0
    const maxAmount = Number.parseFloat(document.getElementById("maxAmount").value) || Number.POSITIVE_INFINITY

    this.filteredTransactions = this.transactions.filter((transaction) => {
      const matchesCategory = !categoryFilter || transaction.category === categoryFilter
      const matchesFromDate = !fromDate || transaction.date >= fromDate
      const matchesToDate = !toDate || transaction.date <= toDate
      const matchesMinAmount = transaction.amount >= minAmount
      const matchesMaxAmount = transaction.amount <= maxAmount

      return matchesCategory && matchesFromDate && matchesToDate && matchesMinAmount && matchesMaxAmount
    })

    this.renderTransactions()
  }

  clearFilters() {
    document.getElementById("categoryFilter").value = ""
    document.getElementById("fromDate").value = ""
    document.getElementById("toDate").value = ""
    document.getElementById("minAmount").value = ""
    document.getElementById("maxAmount").value = ""
    this.applyFilters()
  }

  renderTransactions() {
    const transactionsList = document.getElementById("transactionsList")

    if (this.filteredTransactions.length === 0) {
      transactionsList.innerHTML = `
                <div class="no-transactions">
                    <div class="no-transactions-icon">📄</div>
                    <h3>No transactions found</h3>
                    <p>Add your first transaction to get started</p>
                </div>
            `
      return
    }

    const transactionsHTML = this.filteredTransactions
      .map(
        (transaction) => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-title">${this.escapeHtml(transaction.title)}</div>
                    <div class="transaction-meta">
                        <span class="transaction-date">${this.formatDate(transaction.date)}</span>
                        <span class="transaction-category">${transaction.category}</span>
                        ${transaction.notes ? `<span class="transaction-notes">${this.escapeHtml(transaction.notes)}</span>` : ""}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === "income" ? "+" : "-"}${this.formatCurrency(transaction.amount)}
                </div>
                <button class="delete-btn" onclick="tracker.deleteTransaction('${transaction.id}')">
                    Delete
                </button>
            </div>
        `,
      )
      .join("")

    transactionsList.innerHTML = transactionsHTML
  }

  updateSummary() {
    const income = this.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expenses = this.transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expenses

    document.getElementById("totalIncome").textContent = this.formatCurrency(income)
    document.getElementById("totalExpenses").textContent = this.formatCurrency(expenses)
    document.getElementById("netBalance").textContent = this.formatCurrency(balance)
  }

  exportToCSV() {
    if (this.transactions.length === 0) {
      this.showToast("No transactions to export", "error")
      return
    }

    const headers = ["Date", "Type", "Title", "Category", "Amount", "Notes"]
    const csvContent = [
      headers.join(","),
      ...this.transactions.map((t) => [t.date, t.type, `"${t.title}"`, t.category, t.amount, `"${t.notes}"`].join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expense-tracker-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    this.showToast("Data exported successfully!", "success")
  }

  logout() {
    if (confirm("Are you sure you want to logout?")) {
      // Clear session data but keep user accounts
      localStorage.removeItem("expense_tracker_token")
      localStorage.removeItem("expense_tracker_user")

      // Redirect to login page
      window.location.href = "login.html"
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  showToast(message, type = "success") {
    const toast = document.getElementById("toast")
    const toastIcon = document.getElementById("toastIcon")
    const toastMessage = document.getElementById("toastMessage")

    toastIcon.textContent = type === "success" ? "✓" : "⚠️"
    toastMessage.textContent = message
    toast.className = `toast ${type}`
    toast.classList.add("show")

    setTimeout(() => {
      toast.classList.remove("show")
    }, 3000)
  }

  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  updateRadioButtons() {
    const radioOptions = document.querySelectorAll(".radio-option")
    const radioInputs = document.querySelectorAll('input[name="type"]')

    radioInputs.forEach((input) => {
      input.addEventListener("change", () => {
        radioOptions.forEach((option) => {
          option.classList.remove("selected")
        })

        if (input.checked) {
          input.closest(".radio-option").classList.add("selected")
        }
      })
    })

    // Set initial state
    const checkedInput = document.querySelector('input[name="type"]:checked')
    if (checkedInput) {
      checkedInput.closest(".radio-option").classList.add("selected")
    }
  }

  checkAuth() {
    const token = localStorage.getItem("expense_tracker_token")
    if (!token) {
      window.location.href = "login.html"
      return false
    }
    return true
  }
}

// Initialize the tracker
const tracker = new ExpenseTracker()

// Initialize category options
tracker.updateCategoryOptions("expense")

// Make logout function available globally for the header button
window.logout = () => {
  if (tracker) {
    tracker.logout()
  }
}
