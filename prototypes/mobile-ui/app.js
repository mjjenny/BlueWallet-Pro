// THE BLUE - Mobile UI Prototype Application Logic
// Handles navigation, screen transitions, and mock data interactions
// Prototype-only: No connection to real IndexedDB or app data

(function() {
    'use strict';

    // Mock Data for Prototype
    const mockDocuments = [
        {
            id: 1,
            title: 'LAST PASSPORT',
            type: 'Passport',
            category: 'passport',
            number: 'L9886082',
            expiry: '2024-06-15',
            status: 'expired',
            quality: 'Good',
            notes: 'Needs immediate renewal before next contract',
            versions: ['v1.0', 'v1.1']
        },
        {
            id: 2,
            title: 'PASSPORT (ACTIVE)',
            type: 'Passport',
            category: 'passport',
            number: 'Z7179776',
            expiry: '2033-08-28',
            status: 'valid',
            quality: 'Excellent',
            notes: 'Valid for all regions',
            versions: ['v1.0']
        },
        {
            id: 3,
            title: 'CDC',
            type: 'CDC',
            category: 'cdc',
            number: 'CDC-2024-8891',
            expiry: '2026-03-10',
            status: 'valid',
            quality: 'Good',
            notes: '',
            versions: ['v1.0']
        },
        {
            id: 4,
            title: 'STCW BASIC TRAINING',
            type: 'Certificate',
            category: 'certificates',
            number: 'STCW-BT-2023-445',
            expiry: '2028-01-20',
            status: 'valid',
            quality: 'Excellent',
            notes: 'All modules completed',
            versions: ['v1.0']
        },
        {
            id: 5,
            title: 'COC CHIEF OFFICER',
            type: 'COC',
            category: 'coc',
            number: 'COC-IND-7719',
            expiry: '2027-12-12',
            status: 'valid',
            quality: 'Good',
            notes: 'Flag endorsement checked',
            versions: ['v1.0']
        },
        {
            id: 6,
            title: 'USA C1-D VISA',
            type: 'Visa',
            category: 'visa',
            number: '20231847850001',
            expiry: '2028-07-02',
            status: 'valid',
            quality: 'Good',
            notes: 'Ready for travel pack',
            versions: ['v1.0']
        },
        {
            id: 7,
            title: 'MEDICAL FITNESS',
            type: 'Certificate',
            category: 'certificates',
            number: 'MED-2026-041',
            expiry: '2026-10-14',
            status: 'expiring',
            quality: 'Needs review',
            notes: 'Renewal reminder should be surfaced',
            versions: ['v1.0']
        },
        {
            id: 8,
            title: 'DANGEROUS CARGO ENDORSEMENT',
            type: 'Certificate',
            category: 'certificates',
            number: 'Missing',
            expiry: '',
            status: 'missing',
            quality: 'Not uploaded',
            notes: 'Required for tanker joining pack',
            versions: []
        }
    ];

    const mockTimelineEvents = [
        { id: 1, type: 'certificate', title: 'STCW Basic Training', date: '2023-01-20', status: 'completed' },
        { id: 2, type: 'sea-time', title: 'MV Ocean Star - AB', date: '2023-06-15', duration: '180 days', status: 'completed' },
        { id: 3, type: 'vaccine', title: 'Yellow Fever', date: '2024-02-10', status: 'valid' },
        { id: 4, type: 'certificate', title: 'Advanced Firefighting', date: '2024-05-12', status: 'completed' },
        { id: 5, type: 'sea-time', title: 'MV Pacific Voyager - Bosun', date: '2024-08-01', duration: '120 days', status: 'ongoing' }
    ];

    const mockVaccines = [
        { id: 1, name: 'Yellow Fever', date: '2024-02-10', validUntil: '2034-02-10', status: 'valid' },
        { id: 2, name: 'Hepatitis A', date: '2023-11-05', validUntil: '2025-11-05', status: 'valid' },
        { id: 3, name: 'Typhoid', date: '2022-08-20', validUntil: '2025-08-20', status: 'valid' },
        { id: 4, name: 'Tetanus', date: '2019-03-15', validUntil: '2024-03-15', status: 'expired' }
    ];

    const mockPacks = [
        { 
            id: 1, 
            name: 'STCW Pack', 
            description: 'Essential certificates for joining',
            total: 8, 
            completed: 6, 
            documents: ['STCW Basic', 'Advanced Firefighting', 'Medical First Aid', 'Survival Craft', 'Security Awareness', 'Designated Security Duties'] 
        },
        { 
            id: 2, 
            name: 'Visa Travel Pack', 
            description: 'Documents for US visa application',
            total: 5, 
            completed: 3, 
            documents: ['Passport', 'Photo', 'Bank Statement'] 
        },
        { 
            id: 3, 
            name: 'Medical Pack', 
            description: 'Health certificates and vaccines',
            total: 6, 
            completed: 5, 
            documents: ['ENG1 Medical', 'Yellow Fever', 'Hepatitis A', 'Typhoid', 'Dental Checkup'] 
        }
    ];

    // State Management
    let currentScreen = 'vault';
    let selectedDocument = null;
    let activeCategoryFilter = 'all';
    let activeStatusFilter = 'all';
    let activeAddStep = 0;

    // DOM Elements
    const screens = {
        vault: document.getElementById('screen-vault'),
        detail: document.getElementById('screen-detail'),
        add: document.getElementById('screen-add'),
        timeline: document.getElementById('screen-timeline'),
        vaccines: document.getElementById('screen-vaccines'),
        packs: document.getElementById('screen-packs'),
        profile: document.getElementById('screen-profile')
    };

    const navItems = document.querySelectorAll('.nav-item');
    const floatingAddBtn = document.querySelector('.floating-add-btn, .floating-add-button');
    const backButtons = document.querySelectorAll('.back-btn, .back-button');
    const documentCards = document.querySelectorAll('.document-card');
    const saveDocumentBtn = document.getElementById('save-document-btn');
    const cancelAddBtn = document.getElementById('cancel-add-btn');
    const searchInput = document.getElementById('vault-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const toast = document.getElementById('prototype-toast');

    // Initialize
    function init() {
        setupNavigation();
        setupEventListeners();
        renderVault();
        renderTimeline();
        renderVaccines();
        renderPacks();
        renderProfile();
    }

    // Navigation Setup
    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.dataset.screen;
                navigateTo(target);
            });
        });

        backButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                navigateTo('vault');
            });
        });

        if (floatingAddBtn) {
            floatingAddBtn.addEventListener('click', () => {
                navigateTo('add');
            });
        }

        if (cancelAddBtn) {
            cancelAddBtn.addEventListener('click', () => {
                navigateTo('vault');
            });
        }

        if (saveDocumentBtn) {
            saveDocumentBtn.addEventListener('click', () => {
                showFeedback('Prototype only: document would be saved here.');
                navigateTo('vault');
            });
        }
    }

    // Event Listeners
    function setupEventListeners() {
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                if (clearSearchBtn) clearSearchBtn.hidden = searchInput.value.length === 0;
                renderVault();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', clearSearch);
        }

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', resetVaultFilters);
        }

        document.querySelectorAll('[data-filter]').forEach(chip => {
            chip.addEventListener('click', () => {
                const filterType = chip.dataset.filter;
                const filterValue = chip.dataset.value || 'all';
                if (filterType === 'category') activeCategoryFilter = filterValue;
                if (filterType === 'status') activeStatusFilter = filterValue;
                document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(peer => {
                    peer.classList.toggle('active', peer === chip);
                });
                renderVault();
            });
        });

        document.querySelectorAll('[data-action-feedback]').forEach(button => {
            button.addEventListener('click', () => {
                showFeedback(button.dataset.actionFeedback);
            });
        });

        document.querySelectorAll('[data-pack-toggle]').forEach(button => {
            button.addEventListener('click', () => {
                const card = button.closest('.pack-card');
                if (card) card.classList.toggle('expanded');
            });
        });

        const addForm = document.querySelector('.add-form');
        if (addForm) {
            addForm.addEventListener('submit', event => event.preventDefault());
        }

        document.addEventListener('click', event => {
            const choice = event.target.closest('.choice-card');
            if (choice) {
                document.querySelectorAll('.choice-card').forEach(card => card.classList.remove('selected'));
                choice.classList.add('selected');
            }

            const packAction = event.target.closest('.pack-action-btn');
            if (packAction) {
                showFeedback(`${packAction.textContent.trim()} is prototype-only in this concept.`);
            }
        });

        setupAddFlow();

        documentCards.forEach(card => {
            card.addEventListener('click', () => {
                const docId = parseInt(card.dataset.docId);
                const doc = mockDocuments.find(d => d.id === docId);
                if (doc) {
                    showDocumentDetail(doc);
                }
            });
        });
    }

    // Navigation Function
    function navigateTo(screenName) {
        // Hide all screens
        Object.values(screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
                screen.setAttribute('aria-hidden', 'true');
            }
        });

        // Update nav active state
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.screen === screenName) {
                item.classList.add('active');
            }
        });

        // Show target screen
        if (screens[screenName]) {
            screens[screenName].classList.add('active');
            screens[screenName].setAttribute('aria-hidden', 'false');
            currentScreen = screenName;
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Hide floating add button on certain screens
        if (floatingAddBtn) {
            floatingAddBtn.style.display = (screenName === 'vault' || screenName === 'packs') ? 'flex' : 'none';
        }
    }
    window.navigateTo = navigateTo;

    // Render Vault Screen
    function renderVault() {
        const cardsContainer = document.querySelector('.document-cards');
        const emptyState = document.getElementById('empty-state');
        if (!cardsContainer) return;

        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const filteredDocuments = mockDocuments.filter(doc => {
            const searchText = [
                doc.title,
                doc.type,
                doc.category,
                doc.number,
                doc.status,
                doc.notes
            ].join(' ').toLowerCase();
            const categoryMatch = activeCategoryFilter === 'all' || doc.category === activeCategoryFilter;
            const statusMatch = activeStatusFilter === 'all' || doc.status === activeStatusFilter;
            const queryMatch = !query || searchText.includes(query);
            return categoryMatch && statusMatch && queryMatch;
        });

        if (emptyState) {
            emptyState.hidden = filteredDocuments.length > 0;
        }

        cardsContainer.innerHTML = filteredDocuments.map(doc => {
            const isExpired = doc.status === 'expired';
            const isExpiring = doc.status === 'expiring';
            const isMissing = doc.status === 'missing';
            const statusText = getStatusLabel(doc.status);
            const expiryText = doc.expiry ? formatDate(doc.expiry) : 'No file uploaded';
            const footerText = isExpired
                ? 'Joining risk: expired'
                : isExpiring
                    ? 'Renewal needed soon'
                    : isMissing
                        ? 'Missing from joining pack'
                        : 'Ready for use';
            return `
            <div class="document-card ${doc.status}" data-doc-id="${doc.id}" data-category="${doc.category}" data-status="${doc.status}" tabindex="0" role="button" aria-label="View ${doc.title}">
                <div class="card-status-bar"></div>
                <div class="card-content">
                    <div class="card-header">
                        <div class="card-title-group">
                            <h3 class="card-title">${doc.title}</h3>
                            <div class="card-status-badge ${doc.status}">
                                <svg class="status-icon" viewBox="0 0 24 24" fill="currentColor">
                                    ${getStatusIcon(doc.status)}
                                </svg>
                                <span>${statusText}</span>
                            </div>
                        </div>
                        <p class="card-document-number">${doc.type} No. ${doc.number}</p>
                    </div>
                    <div class="card-details">
                        <div class="detail-row">
                            <svg class="detail-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                            <span class="detail-label">Expiry:</span>
                            <span class="detail-value ${getStatusTextClass(doc.status)}">${expiryText}</span>
                        </div>
                        ${isExpired || isExpiring || isMissing
                            ? `<div class="card-risk-warning ${doc.status}">
                                <svg class="warning-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                                </svg>
                                <span>${footerText}</span>
                            </div>`
                            : `<div class="card-ready-indicator">
                                <svg class="check-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                <span>${footerText}</span>
                            </div>`}
                    </div>
                </div>
            </div>
        `}).join('');

        // Re-attach click listeners to new cards
        document.querySelectorAll('.document-card').forEach(card => {
            card.addEventListener('click', () => {
                const docId = parseInt(card.dataset.docId);
                const doc = mockDocuments.find(d => d.id === docId);
                if (doc) showDocumentDetail(doc);
            });
        });
    }

    // Show Document Detail
    function showDocumentDetail(doc) {
        selectedDocument = doc;
        
        // Populate detail screen
        const detailTitle = document.getElementById('detail-title');
        const detailNumber = document.getElementById('detail-number');
        const detailStatus = document.getElementById('detail-status');
        const detailExpiry = document.getElementById('detail-expiry');
        const detailQuality = document.getElementById('detail-quality');
        const detailNotes = document.getElementById('detail-notes');
        const detailVersions = document.getElementById('detail-versions');
        const previewPlaceholder = document.getElementById('doc-preview-placeholder');

        if (detailTitle) detailTitle.textContent = doc.title;
        if (detailNumber) detailNumber.textContent = `${doc.type} No. ${doc.number}`;
        if (detailStatus) {
            detailStatus.className = `card-status-badge ${doc.status}`;
            detailStatus.innerHTML = `
                <svg class="status-icon" viewBox="0 0 24 24" fill="currentColor">
                    ${getStatusIcon(doc.status)}
                </svg>
                <span>${getStatusLabel(doc.status)}</span>
            `;
        }
        if (detailExpiry) detailExpiry.textContent = doc.expiry ? formatDate(doc.expiry) : 'No expiry recorded';
        if (detailQuality) detailQuality.textContent = doc.quality;
        if (detailNotes) detailNotes.textContent = doc.notes || 'No notes';
        if (detailVersions) {
            detailVersions.innerHTML = doc.versions.map(v => 
                `<span class="version-tag">${v}</span>`
            ).join('') || '<span class="version-tag">No versions</span>';
        }
        if (previewPlaceholder) {
            previewPlaceholder.className = `preview-placeholder ${doc.status}`;
        }

        navigateTo('detail');
    }

    function clearSearch() {
        if (!searchInput) return;
        searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.hidden = true;
        renderVault();
        searchInput.focus();
    }

    function resetVaultFilters() {
        activeCategoryFilter = 'all';
        activeStatusFilter = 'all';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.hidden = true;
        document.querySelectorAll('[data-filter]').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.value === 'all');
        });
        renderVault();
    }

    function setupAddFlow() {
        const steps = Array.from(document.querySelectorAll('.add-step'));
        const progress = Array.from(document.querySelectorAll('.add-progress-step'));
        const backStepBtn = document.getElementById('add-step-back');
        const nextStepBtn = document.getElementById('add-step-next');
        const cancelBtn = document.getElementById('cancel-add-btn');
        const saveBtn = document.getElementById('save-document-btn');

        if (!steps.length) return;

        function renderStep() {
            steps.forEach((step, index) => {
                step.classList.toggle('active', index === activeAddStep);
            });
            progress.forEach((step, index) => {
                step.classList.toggle('active', index <= activeAddStep);
            });
            if (backStepBtn) backStepBtn.disabled = activeAddStep === 0;
            if (nextStepBtn) nextStepBtn.hidden = activeAddStep === steps.length - 1;
            if (saveBtn) saveBtn.hidden = activeAddStep !== steps.length - 1;
        }

        if (backStepBtn) {
            backStepBtn.addEventListener('click', () => {
                activeAddStep = Math.max(0, activeAddStep - 1);
                renderStep();
            });
        }
        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => {
                activeAddStep = Math.min(steps.length - 1, activeAddStep + 1);
                renderStep();
            });
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                activeAddStep = 0;
                renderStep();
            });
        }

        renderStep();
    }

    function showFeedback(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.hidden = false;
        window.clearTimeout(showFeedback.timeoutId);
        showFeedback.timeoutId = window.setTimeout(() => {
            toast.hidden = true;
        }, 2200);
    }

    function getStatusLabel(status) {
        const labels = {
            expired: 'EXPIRED',
            expiring: 'EXPIRING',
            valid: 'VALID',
            missing: 'MISSING'
        };
        return labels[status] || status.toUpperCase();
    }

    function getStatusTextClass(status) {
        if (status === 'expired' || status === 'missing') return 'expired-text';
        if (status === 'expiring') return 'expiring-text';
        return 'valid-text';
    }

    function getStatusIcon(status) {
        if (status === 'expired' || status === 'expiring' || status === 'missing') {
            return '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>';
        }
        return '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';
    }

    // Render Timeline
    function renderTimeline() {
        const timelineContainer = document.getElementById('timeline-events');
        if (!timelineContainer) return;

        timelineContainer.innerHTML = mockTimelineEvents.map(event => `
            <div class="timeline-item ${event.type}">
                <div class="timeline-marker ${event.status}"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h4 class="timeline-title">${event.title}</h4>
                        <span class="timeline-date">${formatDate(event.date)}</span>
                    </div>
                    ${event.duration ? `<p class="timeline-detail">${event.duration}</p>` : ''}
                    <span class="timeline-status ${event.status}">${event.status}</span>
                </div>
            </div>
        `).join('');
    }

    // Render Vaccines
    function renderVaccines() {
        const vaccinesContainer = document.getElementById('vaccines-list');
        if (!vaccinesContainer) return;

        vaccinesContainer.innerHTML = mockVaccines.map(vaccine => `
            <div class="vaccine-card ${vaccine.status}">
                <div class="vaccine-header">
                    <h4 class="vaccine-name">${vaccine.name}</h4>
                    <span class="vaccine-status ${vaccine.status}">${vaccine.status}</span>
                </div>
                <div class="vaccine-details">
                    <div class="vaccine-detail-row">
                        <svg class="vaccine-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                        <span>Administered: ${formatDate(vaccine.date)}</span>
                    </div>
                    <div class="vaccine-detail-row">
                        <svg class="vaccine-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        <span>Valid until: ${formatDate(vaccine.validUntil)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render Packs
    function renderPacks() {
        const packsContainer = document.getElementById('packs-list');
        if (!packsContainer) return;

        packsContainer.innerHTML = mockPacks.map(pack => {
            const percentage = Math.round((pack.completed / pack.total) * 100);
            return `
                <div class="pack-card">
                    <div class="pack-header">
                        <h4 class="pack-name">${pack.name}</h4>
                        <span class="pack-progress">${percentage}% complete</span>
                    </div>
                    <p class="pack-description">${pack.description}</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="pack-documents">
                        <p class="pack-documents-title">Documents (${pack.completed}/${pack.total})</p>
                        <div class="pack-documents-list">
                            ${pack.documents.map(doc => `
                                <span class="pack-doc-tag">${doc}</span>
                            `).join('')}
                        </div>
                    </div>
                    <button class="pack-action-btn" type="button">Review Pack</button>
                </div>
            `;
        }).join('');
    }

    // Render Profile
    function renderProfile() {
        // Static profile data for prototype
        const profileName = document.getElementById('profile-name');
        const profileRank = document.getElementById('profile-rank');
        const syncStatus = document.getElementById('sync-status');
        const backupStatus = document.getElementById('backup-status');
        const themeSelector = document.getElementById('theme-selector');

        if (profileName) profileName.textContent = 'John Doe';
        if (profileRank) profileRank.textContent = 'Able Seafarer';
        if (syncStatus) syncStatus.innerHTML = '<span class="status-dot valid"></span>Last synced: 2 hours ago';
        if (backupStatus) backupStatus.innerHTML = '<span class="status-dot valid"></span>Backup: 5 days ago';
        
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                document.documentElement.dataset.prototypeTheme = e.target.value;
                showFeedback(`Prototype theme preview: ${e.target.value}`);
            });
        }
    }

    // Utility: Format Date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    // Start the app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
