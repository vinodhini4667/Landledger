 // Application State
        const state = {
            currentUser: null,
            users: JSON.parse(localStorage.getItem('users')) || [],
            lands: JSON.parse(localStorage.getItem('lands')) || [],
            transfers: JSON.parse(localStorage.getItem('transfers')) || [],
            isLoggedIn: false,
            currentVerificationLand: null
        };

        // Initialize with admin user if no users exist
        if (state.users.length === 0) {
            const adminUser = {
                id: 'admin_001',
                name: 'Administrator',
                email: 'admin@blockland.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            state.users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(state.users));
        }

        // DOM Elements
        const authPage = document.getElementById('auth-page');
        const dashboard = document.getElementById('dashboard');
        const registerLandPage = document.getElementById('register-land');
        const myLandsPage = document.getElementById('my-lands');
        const verificationPage = document.getElementById('verification');
        const transferPage = document.getElementById('transfer');
        const transferHistoryPage = document.getElementById('transfer-history');
        const profilePage = document.getElementById('profile');
        const adminPage = document.getElementById('admin');
        const mainNav = document.getElementById('main-nav');
        const userInfo = document.getElementById('user-info');
        const adminNav = document.getElementById('admin-nav');
        
        // Authentication Elements
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authTabs = document.querySelectorAll('.auth-tab');
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            initApp();
            setupEventListeners();
        });
        
        function initApp() {
            // Check if user is already logged in
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                state.currentUser = JSON.parse(savedUser);
                state.isLoggedIn = true;
                showAppPages();
            } else {
                showAuthPage();
            }
        }
        
        function setupEventListeners() {
            // Navigation
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (!state.isLoggedIn) return;
                    
                    // Update active nav link
                    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                    this.classList.add('active');
                    
                    const pageId = this.getAttribute('data-page');
                    showPage(pageId);
                });
            });
            
            // Auth tabs
            authTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    switchAuthTab(tabId);
                });
            });
            
            // Forms
            loginForm.addEventListener('submit', handleLogin);
            registerForm.addEventListener('submit', handleRegister);
            document.getElementById('landRegistrationForm').addEventListener('submit', handleLandRegistration);
            document.getElementById('verificationForm').addEventListener('submit', handleVerification);
            document.getElementById('transferForm').addEventListener('submit', handleTransfer);
            
            // Logout functionality
            document.addEventListener('click', function(e) {
                if (e.target.id === 'logout-btn') {
                    handleLogout();
                }
            });
            
            // User avatar click to go to profile
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('user-avatar') || e.target.parentElement.classList.contains('user-avatar')) {
                    showPage('profile');
                    // Update active nav link
                    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                    document.querySelector('nav a[data-page="profile"]').classList.add('active');
                }
            });
        }
        
        function switchAuthTab(tabId) {
            // Update active tab
            authTabs.forEach(tab => {
                if (tab.getAttribute('data-tab') === tabId) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            // Show corresponding form
            document.querySelectorAll('.auth-form').forEach(form => {
                if (form.id === `${tabId}-form`) {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
        }
        
        function handleLogin(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Find user
            const user = state.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                state.currentUser = user;
                state.isLoggedIn = true;
                localStorage.setItem('currentUser', JSON.stringify(user));
                showAppPages();
            } else {
                alert('Invalid email or password');
            }
        }
        
        function handleRegister(e) {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Validation
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            // Check if user already exists
            if (state.users.find(u => u.email === email)) {
                alert('User with this email already exists');
                return;
            }
            
            // Create new user
            const newUser = {
                id: generateId(),
                name,
                email,
                password,
                role: 'user',
                createdAt: new Date().toISOString()
            };
            
            state.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(state.users));
            
            // Auto login
            state.currentUser = newUser;
            state.isLoggedIn = true;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            showAppPages();
            
            alert('Registration successful!');
        }
        
        function handleLandRegistration(e) {
            e.preventDefault();
            
            const title = document.getElementById('land-title').value;
            const area = document.getElementById('land-area').value;
            const address = document.getElementById('land-address').value;
            const city = document.getElementById('land-city').value;
            const stateVal = document.getElementById('land-state').value;
            const country = document.getElementById('land-country').value;
            const pincode = document.getElementById('land-pincode').value;
            const coordinates = document.getElementById('land-coordinates').value;
            const description = document.getElementById('land-description').value;
            
            // Create new land record
            const newLand = {
                id: generateId(),
                title,
                area: parseInt(area),
                address,
                city,
                state: stateVal,
                country,
                pincode,
                coordinates,
                description,
                ownerId: state.currentUser.id,
                ownerName: state.currentUser.name,
                ownerEmail: state.currentUser.email,
                status: 'pending',
                nftId: null,
                verificationStep: 1,
                registeredAt: new Date().toISOString(),
                documents: [] // In a real app, this would contain file references
            };
            
            state.lands.push(newLand);
            localStorage.setItem('lands', JSON.stringify(state.lands));
            
            // Reset form
            e.target.reset();
            
            // Show success message and redirect to My Lands
            alert('Land registration submitted successfully!');
            showPage('my-lands');
        }
        
        function handleVerification(e) {
            e.preventDefault();
            
            const landId = document.getElementById('verify-land-id').value;
            const land = state.lands.find(l => l.id === landId);
            
            if (!land) {
                alert('Land not found');
                return;
            }
            
            // Set the current land for verification
            state.currentVerificationLand = land;
            
            // Enable the first step
            document.getElementById('doc-verify-btn').disabled = false;
            
            alert(`Verification process started for ${land.title}. Please complete each step in order.`);
        }
        
        function handleTransfer(e) {
            e.preventDefault();
            
            const landId = document.getElementById('transfer-land-id').value;
            const recipientEmail = document.getElementById('transfer-recipient').value;
            const amount = document.getElementById('transfer-amount').value;
            
            const land = state.lands.find(l => l.id === landId);
            
            if (!land) {
                alert('Land not found');
                return;
            }
            
            if (land.status !== 'verified') {
                alert('Only verified lands can be transferred');
                return;
            }
            
            // Check if recipient exists
            const recipient = state.users.find(u => u.email === recipientEmail);
            
            if (!recipient) {
                alert('Recipient email address not found in our system. Please check the email or ask the recipient to register.');
                return;
            }
            
            if (recipient.email === state.currentUser.email) {
                alert('You cannot transfer land to yourself');
                return;
            }
            
            // Create transfer record
            const transferRecord = {
                id: generateId(),
                landId: land.id,
                landTitle: land.title,
                fromUserId: state.currentUser.id,
                fromUserName: state.currentUser.name,
                fromUserEmail: state.currentUser.email,
                toUserId: recipient.id,
                toUserName: recipient.name,
                toUserEmail: recipient.email,
                amount: parseFloat(amount),
                currency: 'ETH',
                transferredAt: new Date().toISOString(),
                notes: document.getElementById('transfer-notes').value
            };
            
            state.transfers.push(transferRecord);
            localStorage.setItem('transfers', JSON.stringify(state.transfers));
            
            // Update land ownership
            land.ownerId = recipient.id;
            land.ownerName = recipient.name;
            land.ownerEmail = recipient.email;
            localStorage.setItem('lands', JSON.stringify(state.lands));
            
            // Update UI
            updateLandsTable();
            updateDashboard();
            updateTransferSelect();
            updateProfileDetails();
            updateTransferHistory();
            updateAdminTables();
            
            alert('Ownership transfer completed successfully!');
            e.target.reset();
        }
        
        function handleLogout() {
            state.currentUser = null;
            state.isLoggedIn = false;
            localStorage.removeItem('currentUser');
            showAuthPage();
        }
        
        function showAuthPage() {
            // Hide all app pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show auth page
            authPage.classList.add('active');
            
            // Hide navigation and user info
            mainNav.style.display = 'none';
            userInfo.style.display = 'none';
        }
        
        function showAppPages() {
            // Hide auth page
            authPage.classList.remove('active');
            
            // Show navigation and user info
            mainNav.style.display = 'block';
            userInfo.style.display = 'flex';
            
            // Show admin nav if user is admin
            if (state.currentUser.role === 'admin') {
                adminNav.style.display = 'block';
            }
            
            // Update user info
            userInfo.innerHTML = `
                <div class="user-avatar">${state.currentUser.name.charAt(0).toUpperCase()}</div>
                <span>${state.currentUser.name} ${state.currentUser.role === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}</span>
                <button id="logout-btn" class="btn btn-danger" style="margin-left: 10px;"><i class="fas fa-sign-out-alt"></i> Logout</button>
            `;
            
            // Update dashboard and show it
            updateDashboard();
            updateLandsTable();
            updateVerificationSelects();
            updateTransferSelect();
            updateTransferHistory();
            updateProfileDetails();
            updateAdminTables();
            showPage('dashboard');
        }
        
        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show selected page
            document.getElementById(pageId).classList.add('active');
            
            // Update page-specific data if needed
            if (pageId === 'dashboard') {
                updateDashboard();
            } else if (pageId === 'my-lands') {
                updateLandsTable();
            } else if (pageId === 'verification') {
                resetVerificationSteps();
            } else if (pageId === 'transfer-history') {
                updateTransferHistory();
            } else if (pageId === 'profile') {
                updateProfileDetails();
            } else if (pageId === 'admin') {
                updateAdminTables();
            }
        }
        
        function updateDashboard() {
            const userLands = state.lands.filter(land => land.ownerId === state.currentUser.id);
            const pendingLands = userLands.filter(land => land.status === 'pending');
            const verifiedLands = userLands.filter(land => land.status === 'verified');
            const nftLands = userLands.filter(land => land.nftId !== null);
            
            // Update stats
            document.getElementById('lands-count').textContent = userLands.length;
            document.getElementById('pending-count').textContent = pendingLands.length;
            document.getElementById('verified-count').textContent = verifiedLands.length;
            document.getElementById('nft-count').textContent = nftLands.length;
            
            // Update recent activity
            const recentActivity = document.getElementById('recent-activity');
            recentActivity.innerHTML = '';
            
            // Show latest 5 lands
            const recentLands = userLands
                .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
                .slice(0, 5);
            
            if (recentLands.length === 0) {
                recentActivity.innerHTML = '<tr><td colspan="5" style="text-align: center;">No land records found</td></tr>';
            } else {
                recentLands.forEach(land => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${land.id.substring(0, 8)}...</td>
                        <td>${land.city}, ${land.country}</td>
                        <td>${land.area} sq.m</td>
                        <td><span class="status-badge status-${land.status}">${land.status}</span></td>
                        <td>${new Date(land.registeredAt).toLocaleDateString()}</td>
                    `;
                    recentActivity.appendChild(row);
                });
            }
        }
        
        function updateTransferHistory() {
            const transferHistoryBody = document.getElementById('transfer-history-body');
            transferHistoryBody.innerHTML = '';
            
            // Get transfers involving current user
            let userTransfers = state.transfers;
            
            // If not admin, only show transfers involving current user
            if (state.currentUser.role !== 'admin') {
                userTransfers = state.transfers.filter(
                    transfer => transfer.fromUserId === state.currentUser.id || transfer.toUserId === state.currentUser.id
                );
            }
            
            if (userTransfers.length === 0) {
                transferHistoryBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No transfer history found</td></tr>';
            } else {
                // Sort by date (newest first)
                userTransfers.sort((a, b) => new Date(b.transferredAt) - new Date(a.transferredAt));
                
                userTransfers.forEach(transfer => {
                    const row = document.createElement('tr');
                    const isOutgoing = transfer.fromUserId === state.currentUser.id;
                    
                    row.innerHTML = `
                        <td>${transfer.landId.substring(0, 8)}...</td>
                        <td>${transfer.landTitle}</td>
                        <td>${isOutgoing ? 'You' : transfer.fromUserName}</td>
                        <td>${isOutgoing ? transfer.toUserName : 'You'}</td>
                        <td>${transfer.amount} ${transfer.currency}</td>
                        <td>${new Date(transfer.transferredAt).toLocaleDateString()}</td>
                    `;
                    transferHistoryBody.appendChild(row);
                });
            }
        }
        
        function updateLandsTable() {
            const tableBody = document.getElementById('lands-table-body');
            tableBody.innerHTML = '';
            
            const userLands = state.lands.filter(land => land.ownerId === state.currentUser.id);
            
            if (userLands.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No land records found</td></tr>';
            } else {
                userLands.forEach(land => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${land.id.substring(0, 8)}...</td>
                        <td>${land.title}</td>
                        <td>${land.city}, ${land.country}</td>
                        <td>${land.area} sq.m</td>
                        <td><span class="status-badge status-${land.status}">${land.status}</span></td>
                        <td>${land.nftId ? land.nftId.substring(0, 8) + '...' : 'Not minted'}</td>
                        <td class="action-buttons">
                            <button class="btn action-btn" onclick="viewLandDetails('${land.id}')"><i class="fas fa-eye"></i> View</button>
                            ${land.status === 'verified' ? `<button class="btn btn-success action-btn" onclick="transferLand('${land.id}')"><i class="fas fa-exchange-alt"></i> Transfer</button>` : ''}
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        }
        
        function updateVerificationSelects() {
            const verifySelect = document.getElementById('verify-land-id');
            verifySelect.innerHTML = '<option value="">-- Select Land --</option>';
            
            const userLands = state.lands.filter(land => 
                land.ownerId === state.currentUser.id && 
                land.status !== 'verified'
            );
            
            userLands.forEach(land => {
                const option = document.createElement('option');
                option.value = land.id;
                option.textContent = `${land.title} (${land.city})`;
                verifySelect.appendChild(option);
            });
        }
        
        function updateTransferSelect() {
            const transferSelect = document.getElementById('transfer-land-id');
            transferSelect.innerHTML = '<option value="">-- Select Land --</option>';
            
            const userLands = state.lands.filter(land => 
                land.ownerId === state.currentUser.id && 
                land.status === 'verified'
            );
            
            userLands.forEach(land => {
                const option = document.createElement('option');
                option.value = land.id;
                option.textContent = `${land.title} (${land.city})`;
                transferSelect.appendChild(option);
            });
        }
        
        function updateProfileDetails() {
            if (!state.currentUser) return;
            
            const userLands = state.lands.filter(land => land.ownerId === state.currentUser.id);
            const verifiedLands = userLands.filter(land => land.status === 'verified');
            
            // Update profile elements
            document.getElementById('profile-avatar').textContent = state.currentUser.name.charAt(0).toUpperCase();
            document.getElementById('profile-name').textContent = state.currentUser.name;
            document.getElementById('profile-email').textContent = state.currentUser.email;
            
            document.getElementById('profile-user-id').textContent = state.currentUser.id;
            document.getElementById('profile-full-name').textContent = state.currentUser.name;
            document.getElementById('profile-email-address').textContent = state.currentUser.email;
            document.getElementById('profile-created').textContent = new Date(state.currentUser.createdAt).toLocaleDateString();
            document.getElementById('profile-lands-count').textContent = userLands.length;
            document.getElementById('profile-verified-count').textContent = verifiedLands.length;
        }
        
        function updateAdminTables() {
            if (state.currentUser.role !== 'admin') return;
            
            // Update users table
            const adminUsersTable = document.getElementById('admin-users-table');
            adminUsersTable.innerHTML = '';
            
            state.users.forEach(user => {
                const userLands = state.lands.filter(land => land.ownerId === user.id);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id.substring(0, 8)}...</td>
                    <td>${user.name} ${user.role === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}</td>
                    <td>${user.email}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>${userLands.length}</td>
                    <td class="action-buttons">
                        <button class="btn btn-danger action-btn" onclick="deleteUser('${user.id}')" ${user.role === 'admin' ? 'disabled' : ''}><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
                adminUsersTable.appendChild(row);
            });
            
            // Update lands table
            const adminLandsTable = document.getElementById('admin-lands-table');
            adminLandsTable.innerHTML = '';
            
            state.lands.forEach(land => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${land.id.substring(0, 8)}...</td>
                    <td>${land.title}</td>
                    <td>${land.ownerName}</td>
                    <td>${land.city}, ${land.country}</td>
                    <td><span class="status-badge status-${land.status}">${land.status}</span></td>
                    <td>${new Date(land.registeredAt).toLocaleDateString()}</td>
                `;
                adminLandsTable.appendChild(row);
            });
        }
        
        function deleteUser(userId) {
            if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                // Remove user
                state.users = state.users.filter(user => user.id !== userId);
                
                // Remove user's lands
                state.lands = state.lands.filter(land => land.ownerId !== userId);
                
                // Update transfers to show deleted user
                state.transfers = state.transfers.map(transfer => {
                    if (transfer.fromUserId === userId) {
                        transfer.fromUserName = '[Deleted User]';
                    }
                    if (transfer.toUserId === userId) {
                        transfer.toUserName = '[Deleted User]';
                    }
                    return transfer;
                });
                
                localStorage.setItem('users', JSON.stringify(state.users));
                localStorage.setItem('lands', JSON.stringify(state.lands));
                localStorage.setItem('transfers', JSON.stringify(state.transfers));
                
                updateAdminTables();
                alert('User deleted successfully');
            }
        }
        
        function resetVerificationSteps() {
            // Reset all steps to locked state except the first one
            document.getElementById('step-1').classList.remove('completed', 'locked');
            document.getElementById('step-2').classList.remove('completed');
            document.getElementById('step-2').classList.add('locked');
            document.getElementById('step-3').classList.remove('completed');
            document.getElementById('step-3').classList.add('locked');
            document.getElementById('step-4').classList.remove('completed');
            document.getElementById('step-4').classList.add('locked');
            
            // Disable all buttons except the first one
            document.getElementById('doc-verify-btn').disabled = false;
            document.getElementById('enotary-btn').disabled = true;
            document.getElementById('zkp-btn').disabled = true;
            document.getElementById('nft-btn').disabled = true;
            
            // Reset current verification land
            state.currentVerificationLand = null;
        }
        
        function completeVerificationStep(stepNumber) {
            // Mark current step as completed
            document.getElementById(`step-${stepNumber}`).classList.add('completed');
            
            // Enable next step if exists
            if (stepNumber < 4) {
                document.getElementById(`step-${stepNumber + 1}`).classList.remove('locked');
                document.getElementById(`${getStepButtonId(stepNumber + 1)}`).disabled = false;
            }
            
            // Update land verification status
            if (state.currentVerificationLand) {
                state.currentVerificationLand.verificationStep = stepNumber + 1;
                
                // If all steps completed, mark as verified and mint NFT
                if (stepNumber === 4) {
                    state.currentVerificationLand.status = 'verified';
                    state.currentVerificationLand.nftId = generateNFTId();
                    alert('Verification completed! NFT minted successfully.');
                }
                
                localStorage.setItem('lands', JSON.stringify(state.lands));
                updateLandsTable();
                updateDashboard();
                updateVerificationSelects();
                updateProfileDetails();
                updateAdminTables();
            }
        }
        
        function getStepButtonId(stepNumber) {
            switch(stepNumber) {
                case 1: return 'doc-verify-btn';
                case 2: return 'enotary-btn';
                case 3: return 'zkp-btn';
                case 4: return 'nft-btn';
                default: return '';
            }
        }
        
        // Modal Functions
        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
        }
        
        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }
        
        function openEditProfileModal() {
            document.getElementById('edit-name').value = state.currentUser.name;
            document.getElementById('edit-email').value = state.currentUser.email;
            openModal('edit-profile-modal');
        }
        
        function saveProfileChanges() {
            const name = document.getElementById('edit-name').value;
            const email = document.getElementById('edit-email').value;
            
            // Check if email is already taken by another user
            const emailExists = state.users.find(u => u.email === email && u.id !== state.currentUser.id);
            if (emailExists) {
                alert('Email address already taken by another user');
                return;
            }
            
            // Update current user
            state.currentUser.name = name;
            state.currentUser.email = email;
            
            // Update user in users array
            const userIndex = state.users.findIndex(u => u.id === state.currentUser.id);
            if (userIndex !== -1) {
                state.users[userIndex] = state.currentUser;
            }
            
            // Update lands with new owner information
            state.lands.forEach(land => {
                if (land.ownerId === state.currentUser.id) {
                    land.ownerName = name;
                    land.ownerEmail = email;
                }
            });
            
            // Update transfers with new user information
            state.transfers.forEach(transfer => {
                if (transfer.fromUserId === state.currentUser.id) {
                    transfer.fromUserName = name;
                    transfer.fromUserEmail = email;
                }
                if (transfer.toUserId === state.currentUser.id) {
                    transfer.toUserName = name;
                    transfer.toUserEmail = email;
                }
            });
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
            localStorage.setItem('users', JSON.stringify(state.users));
            localStorage.setItem('lands', JSON.stringify(state.lands));
            localStorage.setItem('transfers', JSON.stringify(state.transfers));
            
            // Update UI
            updateProfileDetails();
            updateLandsTable();
            updateTransferHistory();
            updateAdminTables();
            
            // Update user info in header
            userInfo.innerHTML = `
                <div class="user-avatar">${state.currentUser.name.charAt(0).toUpperCase()}</div>
                <span>${state.currentUser.name} ${state.currentUser.role === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}</span>
                <button id="logout-btn" class="btn btn-danger" style="margin-left: 10px;"><i class="fas fa-sign-out-alt"></i> Logout</button>
            `;
            
            closeModal('edit-profile-modal');
            alert('Profile updated successfully!');
        }
        
        function viewLandDetails(landId) {
            const land = state.lands.find(l => l.id === landId);
            if (!land) return;
            
            const modalContent = document.getElementById('land-details-content');
            modalContent.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">${land.title}</h4>
                    <p style="color: var(--gray);">ID: ${land.id}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <div>
                        <strong>Location:</strong>
                        <p>${land.address}, ${land.city}, ${land.state}, ${land.country}</p>
                    </div>
                    <div>
                        <strong>Area:</strong>
                        <p>${land.area} sq. meters</p>
                    </div>
                    <div>
                        <strong>Coordinates:</strong>
                        <p>${land.coordinates || 'Not specified'}</p>
                    </div>
                    <div>
                        <strong>Postal Code:</strong>
                        <p>${land.pincode}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <strong>Description:</strong>
                    <p>${land.description || 'No description provided'}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <strong>Status:</strong>
                        <p><span class="status-badge status-${land.status}">${land.status}</span></p>
                    </div>
                    <div>
                        <strong>NFT ID:</strong>
                        <p>${land.nftId || 'Not minted'}</p>
                    </div>
                    <div>
                        <strong>Registered:</strong>
                        <p>${new Date(land.registeredAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <strong>Verification Step:</strong>
                        <p>${land.verificationStep}/4</p>
                    </div>
                </div>
            `;
            
            openModal('land-details-modal');
        }
        
        function transferLand(landId) {
            document.getElementById('transfer-land-id').value = landId;
            showPage('transfer');
        }
        
        // Verification Functions
        function startDocumentVerification() {
            if (!state.currentVerificationLand) {
                alert('Please select a land to verify first');
                return;
            }
            
            document.getElementById('verification-modal-title').textContent = 'Document Verification';
            document.getElementById('verification-modal-content').innerHTML = `
                <p>Upload the following documents for verification of <strong>${state.currentVerificationLand.title}</strong>:</p>
                <ul style="margin: 1rem 0; padding-left: 1.5rem;">
                    <li>Proof of Ownership</li>
                    <li>Land Survey Document</li>
                    <li>Identity Verification</li>
                    <li>Tax Receipts</li>
                </ul>
                <div class="form-group">
                    <label>Upload Documents</label>
                    <input type="file" id="document-upload" multiple>
                </div>
                <div id="upload-status" style="margin-top: 1rem;"></div>
            `;
            
            document.getElementById('verification-submit-btn').style.display = 'block';
            document.getElementById('verification-submit-btn').onclick = function() {
                const fileInput = document.getElementById('document-upload');
                if (fileInput.files.length === 0) {
                    document.getElementById('upload-status').innerHTML = '<p style="color: var(--danger);">Please upload at least one document</p>';
                    return;
                }
                
                document.getElementById('upload-status').innerHTML = '<p style="color: var(--success);">Documents uploaded successfully! Processing verification...</p>';
                
                // Simulate processing delay
                setTimeout(() => {
                    completeVerificationStep(1);
                    closeModal('verification-modal');
                    alert('Document verification completed! You can now proceed to E-Notary Authentication.');
                }, 2000);
            };
            
            openModal('verification-modal');
        }
        
        function startENotaryVerification() {
            if (!state.currentVerificationLand) {
                alert('Please complete document verification first');
                return;
            }
            
            document.getElementById('verification-modal-title').textContent = 'E-Notary Authentication';
            document.getElementById('verification-modal-content').innerHTML = `
                <p>Connect with a certified digital notary to authenticate your land documents for <strong>${state.currentVerificationLand.title}</strong>.</p>
                <div style="background: #f0f4f8; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
                    <h4 style="color: var(--primary); margin-bottom: 1rem;">Notary Session Details</h4>
                    <p><strong>Notary:</strong> Digital Notary Services Inc.</p>
                    <p><strong>Session ID:</strong> DN-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    <p><strong>Estimated Time:</strong> 15-30 minutes</p>
                </div>
                <div class="form-group">
                    <label>Schedule Appointment</label>
                    <input type="datetime-local" id="notary-schedule">
                </div>
            `;
            
            document.getElementById('verification-submit-btn').style.display = 'block';
            document.getElementById('verification-submit-btn').onclick = function() {
                const schedule = document.getElementById('notary-schedule').value;
                if (!schedule) {
                    alert('Please schedule an appointment');
                    return;
                }
                
                // Simulate processing delay
                document.getElementById('verification-modal-content').innerHTML += '<p style="color: var(--success); margin-top: 1rem;">Appointment scheduled! E-Notary authentication in progress...</p>';
                
                setTimeout(() => {
                    completeVerificationStep(2);
                    closeModal('verification-modal');
                    alert('E-Notary authentication completed! You can now proceed to ZKP Validation.');
                }, 3000);
            };
            
            openModal('verification-modal');
        }
        
        function startZKPVerification() {
            if (!state.currentVerificationLand) {
                alert('Please complete E-Notary authentication first');
                return;
            }
            
            document.getElementById('verification-modal-title').textContent = 'Zero-Knowledge Proof Validation';
            document.getElementById('verification-modal-content').innerHTML = `
                <p>Generate a zero-knowledge proof to validate your ownership of <strong>${state.currentVerificationLand.title}</strong> without revealing sensitive information.</p>
                <div style="background: #f0f4f8; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
                    <h4 style="color: var(--primary); margin-bottom: 1rem;">ZKP Parameters</h4>
                    <p><strong>Proof Type:</strong> zk-SNARK</p>
                    <p><strong>Circuit:</strong> Land Ownership Verification</p>
                    <p><strong>Privacy Level:</strong> High</p>
                    <p><strong>Estimated Generation Time:</strong> 2-5 minutes</p>
                </div>
                <div id="zkp-status"></div>
            `;
            
            document.getElementById('verification-submit-btn').style.display = 'block';
            document.getElementById('verification-submit-btn').onclick = function() {
                document.getElementById('zkp-status').innerHTML = '<p style="color: var(--success);">Generating Zero-Knowledge Proof... This may take a few minutes.</p>';
                
                // Simulate ZKP generation
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    document.getElementById('zkp-status').innerHTML = `<p style="color: var(--success);">Generating Zero-Knowledge Proof... ${progress}% complete</p>`;
                    
                    if (progress >= 100) {
                        clearInterval(interval);
                        completeVerificationStep(3);
                        closeModal('verification-modal');
                        alert('ZKP validation completed! You can now proceed to NFT Minting.');
                    }
                }, 500);
            };
            
            openModal('verification-modal');
        }
        
        function startNFTMinting() {
            if (!state.currentVerificationLand) {
                alert('Please complete ZKP validation first');
                return;
            }
            
            document.getElementById('verification-modal-title').textContent = 'NFT Minting';
            document.getElementById('verification-modal-content').innerHTML = `
                <p>Create a unique NFT representing your land ownership for <strong>${state.currentVerificationLand.title}</strong> on the blockchain.</p>
                <div style="background: #f0f4f8; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
                    <h4 style="color: var(--primary); margin-bottom: 1rem;">NFT Details</h4>
                    <p><strong>Blockchain:</strong> Ethereum</p>
                    <p><strong>Token Standard:</strong> ERC-721</p>
                    <p><strong>Gas Fee:</strong> ~0.002 ETH</p>
                    <p><strong>Network:</strong> Mainnet</p>
                </div>
                <div class="form-group">
                    <label>NFT Name</label>
                    <input type="text" id="nft-name" value="${state.currentVerificationLand.title} Land NFT">
                </div>
                <div class="form-group">
                    <label>NFT Description</label>
                    <textarea id="nft-description" rows="3">Digital representation of land property at ${state.currentVerificationLand.address}, ${state.currentVerificationLand.city}</textarea>
                </div>
                <div id="nft-status"></div>
            `;
            
            document.getElementById('verification-submit-btn').style.display = 'block';
            document.getElementById('verification-submit-btn').onclick = function() {
                document.getElementById('nft-status').innerHTML = '<p style="color: var(--success);">Minting NFT... This may take a few minutes.</p>';
                
                // Simulate NFT minting
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 20;
                    document.getElementById('nft-status').innerHTML = `<p style="color: var(--success);">Minting NFT... ${progress}% complete</p>`;
                    
                    if (progress >= 100) {
                        clearInterval(interval);
                        completeVerificationStep(4);
                        closeModal('verification-modal');
                    }
                }, 500);
            };
            
            openModal('verification-modal');
        }
        
        // Utility functions
        function generateId() {
            return 'id_' + Math.random().toString(36).substr(2, 9);
        }
        
        function generateNFTId() {
            return 'nft_' + Math.random().toString(36).substr(2, 9);
        }