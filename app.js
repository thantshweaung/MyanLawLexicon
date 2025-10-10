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

// Password hash for authentication (admin123$)
const PASSWORD_HASH = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';

// DOM elements
const elements = {
    loadingSpinner: document.getElementById('loadingSpinner'),
    termsGrid: document.getElementById('termsGrid'),
    emptyState: document.getElementById('emptyState'),
    resultsInfo: document.getElementById('resultsInfo'),
    resultsCount: document.getElementById('resultsCount'),
    searchInput: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    resetFilters: document.getElementById('resetFilters'),
    themeToggle: document.getElementById('themeToggle'),
    downloadBtn: document.getElementById('downloadBtn'),
    addTermBtn: document.getElementById('addTermBtn'),
    
    // Modals
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
    deleteTermBtn: document.getElementById('deleteTermBtn')
};

/**
 * Initialize the application
 */
$(document).ready(function() {
    initializeApp();
});

/**
 * Initialize all app functionality
 */
function initializeApp() {
    loadDictionaryData();
    setupEventListeners();
    setupThemeToggle();
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
    elements.clearSearch.addEventListener('click', clearSearch);
    elements.resetFilters.addEventListener('click', resetFilters);
    
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
    
    elements.saveTermBtn.addEventListener('click', handleSaveTerm);
    elements.deleteTermBtn.addEventListener('click', handleDeleteTerm);
    elements.addTermBtn.addEventListener('click', handleAddTerm);
    
    // Edit modal form validation
    elements.editTermForm.addEventListener('submit', function(e) {
        e.preventDefault();
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
    }, 300); // Debounce search
}

/**
 * Clear search input
 */
function clearSearch() {
    elements.searchInput.value = '';
    elements.searchInput.focus();
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
        card.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            showTermDetail(index);
        });
        
        // Keyboard accessibility
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const index = parseInt(this.getAttribute('data-index'));
                showTermDetail(index);
            }
        });
    });
}

/**
 * Show term detail modal
 */
function showTermDetail(index) {
    const term = filteredData[index];
    if (!term) return;
    
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
    
    const modal = new bootstrap.Modal(elements.termDetailModal);
    modal.show();
}

/**
 * Handle authentication
 */
function handleAuthentication() {
    const password = elements.passwordInput.value;
    const hashedPassword = CryptoJS.SHA256(password).toString();
    
    if (hashedPassword === PASSWORD_HASH) {
        isAuthenticated = true;
        elements.passwordInput.classList.remove('is-invalid');
        elements.passwordError.textContent = '';
        
        // Close password modal
        const modal = bootstrap.Modal.getInstance(elements.passwordModal);
        modal.hide();
        
        // Show edit modal
        showEditModal();
        
        // Show authenticated UI elements
        elements.downloadBtn.style.display = 'inline-block';
        elements.addTermBtn.style.display = 'block';
        
        console.log('User authenticated successfully');
    } else {
        elements.passwordInput.classList.add('is-invalid');
        elements.passwordError.textContent = 'Invalid password. Please try again.';
        elements.passwordInput.value = '';
        elements.passwordInput.focus();
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
        elements.editMyanmar.value = term.definition;
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
    // Validate form
    if (!elements.editTermForm.checkValidity()) {
        elements.editTermForm.reportValidity();
        return;
    }
    
    const termData = {
        word: elements.editEnglish.value.trim(),
        type: elements.editType.value,
        definition: elements.editMyanmar.value.trim()
    };
    
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
    filterTerms(elements.searchInput.value.toLowerCase().trim());
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(elements.editTermModal);
    modal.hide();
    
    // Show success message
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
🔐 Password Hash Generator
To generate a new password hash, run this in the browser console:
CryptoJS.SHA256('your_password_here').toString()

Current password hash: ${PASSWORD_HASH}
`);

// Export functions for debugging
window.MyanLawLexicon = {
    dictionaryData: () => dictionaryData,
    filteredData: () => filteredData,
    isAuthenticated: () => isAuthenticated,
    generatePasswordHash: (password) => CryptoJS.SHA256(password).toString()
};