/**
 * MyanLawLexicon - JavaScript Application
 * A modern, responsive Myanmar-English law dictionary web app
 */

// Global variables
let dictionaryData = [];
let filteredData = [];
let currentFilter = 'all';
let isAuthenticated = false;
let currentEditingIndex = -1;
let searchTimeout;
let visitorCount = 0;

// Password hash for authentication (admin123)
const PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

// DOM elements
const elements = {
    loadingSpinner: document.getElementById('loadingSpinner'),
    termsGrid: document.getElementById('termsGrid'),
    emptyState: document.getElementById('emptyState'),
    resultsInfo: document.getElementById('resultsInfo'),
    resultsCount: document.getElementById('resultsCount'),
    searchInput: document.getElementById('searchInput'),
    searchInputMobile: document.getElementById('searchInputMobile'),
    clearSearch: document.getElementById('clearSearch'),
    clearSearchMobile: document.getElementById('clearSearchMobile'),
    resetFilters: document.getElementById('resetFilters'),
    searchSuggestions: document.getElementById('searchSuggestions'),
    searchSuggestionsMobile: document.getElementById('searchSuggestionsMobile'),
    themeToggle: document.getElementById('themeToggle'),
    visitorCount: document.getElementById('visitorCount'),
    termDetailModal: document.getElementById('termDetailModal'),
    passwordModal: document.getElementById('passwordModal'),
    editTermModal: document.getElementById('editTermModal'),
    
    // Modal elements
    termDetailTitle: document.getElementById('termDetailTitle'),
    termDetailEnglish: document.getElementById('termDetailEnglish'),
    termDetailMyanmar: document.getElementById('termDetailMyanmar'),
    termDetailType: document.getElementById('termDetailType'),
    termDetailDirection: document.getElementById('termDetailDirection'),
    termDetailDefinition: document.getElementById('termDetailDefinition'),
    termDetailExample: document.getElementById('termDetailExample'),
    termDetailExampleText: document.getElementById('termDetailExampleText'),
    
    // Password modal
    passwordInput: document.getElementById('passwordInput'),
    passwordError: document.getElementById('passwordError'),
    authenticateBtn: document.getElementById('authenticateBtn'),
    
    // Edit modal
    editModalTitle: document.getElementById('editModalTitle'),
    editTermForm: document.getElementById('editTermForm'),
    editEnglish: document.getElementById('editEnglish'),
    editMyanmar: document.getElementById('editMyanmar'),
    editType: document.getElementById('editType'),
    editDirection: document.getElementById('editDirection'),
    editDefinition: document.getElementById('editDefinition'),
    editExample: document.getElementById('editExample'),
    saveTermBtn: document.getElementById('saveTermBtn'),
    deleteTermBtn: document.getElementById('deleteTermBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    addTermBtn: document.getElementById('addTermBtn'),
};

/**
 * Initialize the application
 */
$(document).ready(function() {
    // Wait a bit for CryptoJS to load
    setTimeout(function() {
        initializeApp();
    }, 100);
});

/**
 * Initialize all app functionality
 */
function initializeApp() {
    loadDictionaryData();
    setupEventListeners();
    setupThemeToggle();
    initializeVisitorCounter();
    console.log('MyanLawLexicon initialized successfully');
}

/**
 * Load dictionary data from JSON file
 */
async function loadDictionaryData() {
    try {
        showLoading(true);
        elements.termsGrid.style.display = 'block';
        
        // Show skeleton loading
        showSkeletonLoading();
        
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const response = await fetch('MyanmarEnglishLawDictionary.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        dictionaryData = await response.json();
        filteredData = [...dictionaryData];
        renderTerms();
        showLoading(false);
        
        console.log(`Loaded ${dictionaryData.length} legal terms`);
    } catch (error) {
        console.error('Error loading dictionary data:', error);
        showError('Failed to load dictionary data. Please check if MyanmarEnglishLawDictionary.json exists.');
        showLoading(false);
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Search functionality
    elements.searchInput.addEventListener('input', handleSearch);
    elements.searchInput.addEventListener('focus', function() {
        if (elements.searchInput.value.length >= 2) {
            showSearchSuggestions(elements.searchInput.value.toLowerCase(), 'desktop');
        }
    });
    elements.clearSearch.addEventListener('click', clearSearch);
    
    // Mobile search functionality
    elements.searchInputMobile.addEventListener('input', handleSearchMobile);
    elements.searchInputMobile.addEventListener('focus', function() {
        if (elements.searchInputMobile.value.length >= 2) {
            showSearchSuggestions(elements.searchInputMobile.value.toLowerCase(), 'mobile');
        }
    });
    elements.clearSearchMobile.addEventListener('click', clearSearchMobile);
    
    elements.resetFilters.addEventListener('click', resetFilters);
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            elements.searchSuggestions.style.display = 'none';
            elements.searchSuggestionsMobile.style.display = 'none';
        }
    });
    
    // Filter dropdown
    document.querySelectorAll('[data-filter]').forEach(item => {
        item.addEventListener('click', handleFilterChange);
    });
    
    // Modal events
    elements.authenticateBtn.addEventListener('click', handleAuthentication);
    elements.passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleAuthentication();
        }
    });
    
    elements.deleteTermBtn.addEventListener('click', handleDeleteTerm);
    elements.addTermBtn.addEventListener('click', handleAddTerm);
    const editTermBtn = document.getElementById('editTermBtn');
    if (editTermBtn) {
        editTermBtn.addEventListener('click', function() {
            if (!isAuthenticated) {
                // Show password modal first
                const passwordModal = new bootstrap.Modal(elements.passwordModal);
                passwordModal.show();
            } else {
                // Directly show edit modal
                showEditModal();
            }
        });
    }
    
    // Edit modal form validation
    elements.editTermForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        handleSaveTerm();
    });
    
    // Save button click handler
    elements.saveTermBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Save button clicked');
        handleSaveTerm();
    });
    
    // Download functionality
    elements.downloadBtn.addEventListener('click', handleDownload);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Setup theme toggle functionality
 */
function setupThemeToggle() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    elements.themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

/**
 * Set application theme
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = elements.themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
}

/**
 * Handle search input
 */
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const query = elements.searchInput.value.toLowerCase().trim();
        filterTerms(query);
        showSearchSuggestions(query, 'desktop');
    }, 300); // Debounce search
}

/**
 * Handle mobile search input
 */
function handleSearchMobile() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const query = elements.searchInputMobile.value.toLowerCase().trim();
        filterTerms(query);
        showSearchSuggestions(query, 'mobile');
    }, 300); // Debounce search
}

/**
 * Show search suggestions
 */
function showSearchSuggestions(query, type = 'desktop') {
    const suggestionsElement = type === 'mobile' ? elements.searchSuggestionsMobile : elements.searchSuggestions;
    const inputElement = type === 'mobile' ? elements.searchInputMobile : elements.searchInput;
    
    if (!query || query.length < 2) {
        suggestionsElement.style.display = 'none';
        return;
    }
    
    // Get suggestions from dictionary data
    const suggestions = dictionaryData
        .filter(term => 
            term.word.toLowerCase().includes(query) || 
            term.definition.toLowerCase().includes(query)
        )
        .slice(0, 5) // Limit to 5 suggestions
        .map(term => ({
            text: term.word,
            type: term.type,
            definition: term.definition.substring(0, 60) + '...'
        }));
    
    if (suggestions.length === 0) {
        suggestionsElement.style.display = 'none';
        return;
    }
    
    // Build suggestions HTML
    const suggestionsHTML = suggestions.map(suggestion => `
        <div class="suggestion-item" data-text="${escapeHtml(suggestion.text)}">
            <div class="d-flex justify-content-between align-items-center">
                <strong>${escapeHtml(suggestion.text)}</strong>
                <span class="badge bg-primary">${escapeHtml(suggestion.type)}</span>
            </div>
            <small class="text-muted">${escapeHtml(suggestion.definition)}</small>
        </div>
    `).join('');
    
    suggestionsElement.innerHTML = suggestionsHTML;
    suggestionsElement.style.display = 'block';
    
    // Add click event listeners to suggestions
    suggestionsElement.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            const text = this.getAttribute('data-text');
            inputElement.value = text;
            suggestionsElement.style.display = 'none';
            filterTerms(text.toLowerCase());
        });
    });
}

/**
 * Clear search input
 */
function clearSearch() {
    elements.searchInput.value = '';
    elements.searchInput.focus();
    elements.searchSuggestions.style.display = 'none';
    filterTerms('');
}

/**
 * Clear mobile search input
 */
function clearSearchMobile() {
    elements.searchInputMobile.value = '';
    elements.searchInputMobile.focus();
    elements.searchSuggestionsMobile.style.display = 'none';
    filterTerms('');
}

/**
 * Reset all filters
 */
function resetFilters() {
    elements.searchInput.value = '';
    currentFilter = 'all';
    filteredData = [...dictionaryData];
    renderTerms();
    updateResultsInfo();
    
    // Update active filter in dropdown
    document.querySelectorAll('[data-filter]').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('[data-filter="all"]').classList.add('active');
}

/**
 * Handle filter change
 */
function handleFilterChange(e) {
    e.preventDefault();
    const filter = e.target.getAttribute('data-filter');
    currentFilter = filter;
    
    // Update active state
    document.querySelectorAll('[data-filter]').forEach(item => {
        item.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Apply filter
    const query = elements.searchInput.value.toLowerCase().trim();
    filterTerms(query);
}

/**
 * Filter terms based on search query and current filter
 */
function filterTerms(query) {
    filteredData = dictionaryData.filter(term => {
        // Apply search filter
        const matchesSearch = !query || 
            term.word.toLowerCase().includes(query) ||
            term.definition.toLowerCase().includes(query);
        
        // Apply category filter
        let matchesFilter = true;
        if (currentFilter !== 'all') {
            if (['v', 'n', 'adj', 'adv'].includes(currentFilter)) {
                matchesFilter = term.type === currentFilter;
            }
        }
        
        return matchesSearch && matchesFilter;
    });
    
    renderTerms();
    updateResultsInfo();
}

/**
 * Show skeleton loading cards
 */
function showSkeletonLoading() {
    const skeletonHTML = Array.from({ length: 6 }, () => `
        <div class="skeleton-card">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-badge"></div>
        </div>
    `).join('');
    
    elements.termsGrid.innerHTML = skeletonHTML;
    elements.emptyState.style.display = 'none';
}

/**
 * Render terms to the grid
 */
function renderTerms() {
    if (filteredData.length === 0) {
        elements.termsGrid.innerHTML = '';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    const termsHTML = filteredData.map((term, index) => `
        <div class="term-card fade-in" data-index="${index}" data-type="${escapeHtml(term.type).toLowerCase()}" tabindex="0" role="button" aria-label="View details for ${escapeHtml(term.word)}">
            <div class="card-body">
                <h5 class="card-title">${escapeHtml(term.word)}</h5>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge">${escapeHtml(term.type)}</span>
                </div>
                <p class="card-text myanmar-text mt-2">${escapeHtml(term.definition)}</p>
            </div>
        </div>
    `).join('');
    
    elements.termsGrid.innerHTML = termsHTML;
    
    // Add click event listeners to term cards
    elements.termsGrid.querySelectorAll('.term-card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Term card clicked');
            const index = parseInt(this.getAttribute('data-index'));
            console.log('Card index:', index);
            showTermDetail(index);
        });
        
        // Keyboard accessibility
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                console.log('Term card keypress');
                const index = parseInt(this.getAttribute('data-index'));
                console.log('Card index:', index);
                showTermDetail(index);
            }
        });
    });
}

/**
 * Show term detail modal
 */
function showTermDetail(index) {
    console.log('showTermDetail called with index:', index);
    const term = filteredData[index];
    console.log('Term found:', term);
    
    if (!term) {
        console.error('No term found at index:', index);
        return;
    }
    
    // Check if elements exist
    if (!elements.termDetailModal) {
        console.error('termDetailModal element not found');
        return;
    }
    
    elements.termDetailTitle.textContent = term.word;
    elements.termDetailEnglish.textContent = term.word;
    elements.termDetailMyanmar.textContent = term.definition;
    elements.termDetailType.textContent = term.type;
    elements.termDetailDirection.textContent = 'English → Myanmar';
    elements.termDetailDefinition.textContent = term.definition;
    
    // Hide example section since it's not in the data structure
    elements.termDetailExample.style.display = 'none';
    
    // Store the original index for editing
    currentEditingIndex = dictionaryData.findIndex(item => item === term);
    
    console.log('Showing modal for term:', term.word);
    const modal = new bootstrap.Modal(elements.termDetailModal);
    modal.show();
}

/**
 * Handle authentication
 */
function handleAuthentication() {
    const password = elements.passwordInput.value;
    
    // Check if CryptoJS is available, use fallback if not
    let hashedPassword;
    if (typeof CryptoJS !== 'undefined') {
        hashedPassword = CryptoJS.SHA256(password).toString();
    } else {
        // Fallback: simple password check (less secure but functional)
        console.warn('CryptoJS not available, using fallback authentication');
        if (password === 'admin123') {
            hashedPassword = PASSWORD_HASH; // Match the expected hash
        } else {
            hashedPassword = 'invalid';
        }
    }
    
    console.log('Password entered:', password);
    console.log('Hashed password:', hashedPassword);
    console.log('Expected hash:', PASSWORD_HASH);
    console.log('Hashes match:', hashedPassword === PASSWORD_HASH);
    
    if (hashedPassword === PASSWORD_HASH) {
        isAuthenticated = true;
        elements.passwordInput.classList.remove('is-invalid');
        elements.passwordError.textContent = '';
        
        // Close password modal
        const modal = bootstrap.Modal.getInstance(elements.passwordModal);
        modal.hide();
        
        // Show edit modal
        showEditModal();
        
        // Keep Add Term and Export buttons hidden
        elements.downloadBtn.style.display = 'none';
        elements.addTermBtn.style.display = 'none';
        
        console.log('User authenticated successfully');
    } else {
        elements.passwordInput.classList.add('is-invalid');
        elements.passwordError.textContent = 'Invalid password. Please try again.';
        elements.passwordInput.value = '';
        elements.passwordInput.focus();
        console.log('Authentication failed');
    }
}

/**
 * Show edit modal
 */
function showEditModal() {
    if (currentEditingIndex >= 0) {
        // Editing existing term
        const term = dictionaryData[currentEditingIndex];
        elements.editModalTitle.textContent = 'Edit Term';
        elements.editEnglish.value = term.word;
        elements.editMyanmar.value = term.word; // Myanmar term (same as English for now)
        elements.editType.value = term.type;
        elements.editDirection.value = 'en-my';
        elements.editDefinition.value = term.definition;
        elements.editExample.value = '';
        elements.deleteTermBtn.style.display = 'inline-block';
    } else {
        // Adding new term
        elements.editModalTitle.textContent = 'Add New Term';
        elements.editTermForm.reset();
        elements.deleteTermBtn.style.display = 'none';
    }
    
    const modal = new bootstrap.Modal(elements.editTermModal);
    modal.show();
}

/**
 * Handle add new term
 */
function handleAddTerm() {
    if (!isAuthenticated) {
        const modal = new bootstrap.Modal(elements.passwordModal);
        modal.show();
        return;
    }
    
    currentEditingIndex = -1;
    showEditModal();
}

/**
 * Handle save term
 */
function handleSaveTerm() {
    console.log('handleSaveTerm called');
    console.log('Current editing index:', currentEditingIndex);
    
    // Validate form
    if (!elements.editTermForm.checkValidity()) {
        console.log('Form validation failed');
        elements.editTermForm.reportValidity();
        return;
    }
    
    const termData = {
        word: elements.editEnglish.value.trim(),
        type: elements.editType.value,
        definition: elements.editDefinition.value.trim()
    };
    
    console.log('Term data to save:', termData);
    
    if (currentEditingIndex >= 0) {
        // Update existing term
        dictionaryData[currentEditingIndex] = termData;
        console.log('Updated term:', termData.word);
    } else {
        // Add new term
        dictionaryData.push(termData);
        console.log('Added new term:', termData.word);
    }
    
    // Refresh display
    console.log('Refreshing display...');
    filterTerms(elements.searchInput.value.toLowerCase().trim());
    
    // Close modal
    console.log('Closing modal...');
    const modal = bootstrap.Modal.getInstance(elements.editTermModal);
    if (modal) {
        modal.hide();
    }
    
    // Show success message
    console.log('Showing success message...');
    showSuccess(currentEditingIndex >= 0 ? 'Term updated successfully!' : 'Term added successfully!');
}

/**
 * Handle delete term
 */
function handleDeleteTerm() {
    if (currentEditingIndex >= 0 && confirm('Are you sure you want to delete this term?')) {
        dictionaryData.splice(currentEditingIndex, 1);
        
        // Refresh display
        filterTerms(elements.searchInput.value.toLowerCase().trim());
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(elements.editTermModal);
        modal.hide();
        
        showSuccess('Term deleted successfully!');
        console.log('Deleted term at index:', currentEditingIndex);
    }
}

/**
 * Handle download updated JSON
 */
function handleDownload() {
    if (!isAuthenticated) {
        const modal = new bootstrap.Modal(elements.passwordModal);
        modal.show();
        return;
    }
    
    const dataStr = JSON.stringify(dictionaryData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'MyanmarEnglishLawDictionary_updated.json';
    link.click();
    
    showSuccess('Dictionary exported successfully!');
    console.log('Downloaded updated dictionary');
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.searchInput.focus();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            const modal = bootstrap.Modal.getInstance(openModal);
            modal.hide();
        }
    }
}

/**
 * Update results info
 */
function updateResultsInfo() {
    const count = filteredData.length;
    const total = dictionaryData.length;
    
    if (count === total) {
        elements.resultsInfo.style.display = 'none';
    } else {
        elements.resultsInfo.style.display = 'block';
        elements.resultsCount.textContent = `${count} of ${total} terms found`;
    }
}

/**
 * Show/hide loading spinner
 */
function showLoading(show) {
    elements.loadingSpinner.style.display = show ? 'block' : 'none';
    elements.termsGrid.style.display = show ? 'none' : 'block';
}

/**
 * Show error message
 */
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('main').insertBefore(alert, elements.termsGrid);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('main').insertBefore(alert, elements.termsGrid);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Console helper for password hash generation
 */
console.log(`
🔐 Password Authentication Info
Current password: admin123
To generate a new password hash, run this in the browser console:
CryptoJS.SHA256('your_password_here').toString()

Current password hash: ${PASSWORD_HASH}
`);

// Visitor Counter Functions - Server-side tracking simulation
function initializeVisitorCounter() {
    // Simulate server-side visitor tracking
    // In a real application, this would make an API call to your server
    fetchVisitorCount();
}

async function fetchVisitorCount() {
    try {
        // Simulate API call to get visitor count
        // For demo purposes, we'll use a combination of localStorage and sessionStorage
        // to simulate different users
        
        // Check if this is a new session (different browser/device)
        const sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            // New session - increment visitor count
            const storedCount = localStorage.getItem('visitorCount');
            visitorCount = storedCount ? parseInt(storedCount) + 1 : 1;
            localStorage.setItem('visitorCount', visitorCount.toString());
            
            // Generate unique session ID
            const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', newSessionId);
            
            // Store session info
            const sessions = JSON.parse(localStorage.getItem('visitorSessions') || '[]');
            sessions.push({
                id: newSessionId,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent.substring(0, 100), // Truncate for storage
                ip: 'simulated_ip_' + Math.random().toString(36).substr(2, 8)
            });
            
            // Keep only last 50 sessions to prevent localStorage overflow
            if (sessions.length > 50) {
                sessions.splice(0, sessions.length - 50);
            }
            
            localStorage.setItem('visitorSessions', JSON.stringify(sessions));
        } else {
            // Existing session - get current count
            const storedCount = localStorage.getItem('visitorCount');
            visitorCount = storedCount ? parseInt(storedCount) : 0;
        }
        
        // Update display
        updateVisitorDisplay();
        
        // Simulate real-time updates (in a real app, this would be WebSocket or polling)
        setTimeout(() => {
            // Simulate occasional visitor count updates
            if (Math.random() < 0.1) { // 10% chance of update
                const storedCount = localStorage.getItem('visitorCount');
                if (storedCount) {
                    visitorCount = parseInt(storedCount);
                    updateVisitorDisplay();
                }
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error fetching visitor count:', error);
        // Fallback to localStorage
        const storedCount = localStorage.getItem('visitorCount');
        visitorCount = storedCount ? parseInt(storedCount) : 1;
        updateVisitorDisplay();
    }
}

function updateVisitorDisplay() {
    if (elements.visitorCount) {
        elements.visitorCount.textContent = visitorCount.toLocaleString();
    }
}

function getVisitorStats() {
    const sessions = JSON.parse(localStorage.getItem('visitorSessions') || '[]');
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(session => 
        new Date(session.timestamp).toDateString() === today
    );
    
    // Calculate unique users (approximate)
    const uniqueUsers = new Set(sessions.map(s => s.ip)).size;
    
    // Calculate this week's visits
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekSessions = sessions.filter(session => 
        new Date(session.timestamp) > weekAgo
    );
    
    return {
        totalVisits: visitorCount,
        uniqueUsers: uniqueUsers,
        todayVisits: todaySessions.length,
        thisWeekVisits: thisWeekSessions.length,
        totalSessions: sessions.length,
        lastVisit: sessions.length > 0 ? sessions[sessions.length - 1].timestamp : null
    };
}

// Export functions for debugging
window.MyanLawLexicon = {
    dictionaryData: () => dictionaryData,
    filteredData: () => filteredData,
    isAuthenticated: () => isAuthenticated,
    generatePasswordHash: (password) => CryptoJS.SHA256(password).toString(),
    getVisitorStats: getVisitorStats
};