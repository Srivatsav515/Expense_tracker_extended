class FilterManager {
  constructor(tracker) {
    this.tracker = tracker
    this.initializeFilters()
  }

  initializeFilters() {
    // Category filter
    document.getElementById("categoryFilter")?.addEventListener("change", () => {
      this.tracker.applyFilters()
    })

    // Date filters
    document.getElementById("fromDate")?.addEventListener("change", () => {
      this.tracker.applyFilters()
    })

    document.getElementById("toDate")?.addEventListener("change", () => {
      this.tracker.applyFilters()
    })

    // Amount filters
    document.getElementById("minAmount")?.addEventListener("input", () => {
      this.debounce(() => this.tracker.applyFilters(), 500)()
    })

    document.getElementById("maxAmount")?.addEventListener("input", () => {
      this.debounce(() => this.tracker.applyFilters(), 500)()
    })
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

  clearFilters() {
    document.getElementById("categoryFilter").value = ""
    document.getElementById("fromDate").value = ""
    document.getElementById("toDate").value = ""
    document.getElementById("minAmount").value = ""
    document.getElementById("maxAmount").value = ""
    this.tracker.applyFilters()
  }
}

// Initialize filter manager after tracker is ready
document.addEventListener("DOMContentLoaded", () => {
  if (window.tracker) {
    const filterManager = new FilterManager(window.tracker)
  }
})
