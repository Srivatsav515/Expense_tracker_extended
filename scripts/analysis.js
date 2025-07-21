class AnalysisManager {
  constructor(tracker) {
    this.tracker = tracker
  }

  updateAnalysis() {
    this.updateTodaysTransactions()
    this.updateTodaysExpenses()
    this.updateMonthlyAverageExpense()
    this.updateCurrentMonthExpense()
    this.updateTodaysTransactionsList()
    this.updateMonthlyBreakdown()
  }

  updateTodaysTransactions() {
    const today = new Date().toISOString().split("T")[0]
    const todayTransactions = this.tracker.transactions.filter((t) => t.date === today)

    document.getElementById("todayTransactionCount").textContent = todayTransactions.length
  }

  updateTodaysExpenses() {
    const today = new Date().toISOString().split("T")[0]
    const todayExpenses = this.tracker.transactions.filter((t) => t.date === today && t.type === "expense")
    const totalTodayExpenses = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    document.getElementById("todayExpenseAmount").textContent = this.formatCurrency(totalTodayExpenses)
  }

  updateMonthlyAverageExpense() {
    const expenses = this.tracker.transactions.filter((t) => t.type === "expense")

    if (expenses.length === 0) {
      document.getElementById("monthlyAverageExpense").textContent = "₹0.00"
      return
    }

    // Group expenses by month-year
    const monthlyTotals = {}
    expenses.forEach((expense) => {
      const date = new Date(expense.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + expense.amount
    })

    // Calculate average
    const monthlyAmounts = Object.values(monthlyTotals)
    const averageMonthlyExpense = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length

    document.getElementById("monthlyAverageExpense").textContent = this.formatCurrency(averageMonthlyExpense)
  }

  updateCurrentMonthExpense() {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const currentMonthExpenses = this.tracker.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return (
        transaction.type === "expense" &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      )
    })

    const totalCurrentMonthExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    document.getElementById("currentMonthExpense").textContent = this.formatCurrency(totalCurrentMonthExpenses)
  }

  updateTodaysTransactionsList() {
    const today = new Date().toISOString().split("T")[0]
    const todayTransactions = this.tracker.transactions.filter((t) => t.date === today)
    const container = document.getElementById("todayTransactionsList")

    if (todayTransactions.length === 0) {
      container.innerHTML = '<div class="no-data">No transactions today</div>'
      return
    }

    const transactionsHTML = todayTransactions
      .map(
        (transaction) => `
      <div class="today-transaction-item">
        <div class="transaction-details">
          <div class="transaction-name">${this.escapeHtml(transaction.title)}</div>
          <div class="transaction-category-badge">${this.capitalizeFirst(transaction.category)}</div>
        </div>
        <div class="transaction-amount-today ${transaction.type}">
          ${transaction.type === "income" ? "+" : "-"}${this.formatCurrency(transaction.amount)}
        </div>
      </div>
    `,
      )
      .join("")

    container.innerHTML = transactionsHTML
  }

  updateMonthlyBreakdown() {
    const expenses = this.tracker.transactions.filter((t) => t.type === "expense")
    const container = document.getElementById("monthlyBreakdown")

    if (expenses.length === 0) {
      container.innerHTML = '<div class="no-data">No expense data available</div>'
      return
    }

    // Group expenses by month-year
    const monthlyTotals = {}
    expenses.forEach((expense) => {
      const date = new Date(expense.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = this.getMonthName(date.getMonth())
      const year = date.getFullYear()

      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = {
          amount: 0,
          monthName,
          year,
          count: 0,
        }
      }
      monthlyTotals[monthYear].amount += expense.amount
      monthlyTotals[monthYear].count += 1
    })

    // Sort by month-year (most recent first)
    const sortedMonths = Object.entries(monthlyTotals)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 12) // Show last 12 months

    const monthlyHTML = sortedMonths
      .map(
        ([monthYear, data]) => `
      <div class="monthly-breakdown-item">
        <div class="month-details">
          <div class="month-name">${data.monthName} ${data.year}</div>
          <div class="month-year">${data.count} expense${data.count > 1 ? "s" : ""}</div>
        </div>
        <div class="month-amount">${this.formatCurrency(data.amount)}</div>
      </div>
    `,
      )
      .join("")

    container.innerHTML = monthlyHTML
  }

  // Utility functions
  formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  getMonthName(monthIndex) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[monthIndex]
  }
}
