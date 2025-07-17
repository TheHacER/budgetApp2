const API_BASE_URL = '/api';

async function fetchApi(url, options = {}, isFile = false) {
  const token = localStorage.getItem('authToken');
  const headers = isFile ? {} : { 'Content-Type': 'application/json' };
  if (token) { headers['Authorization'] = `Bearer ${token}`; }
  
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const finalOptions = { ...options, headers };
  delete finalOptions.token;

  const response = await fetch(`${API_BASE_URL}${url}`, finalOptions);
  
  if (response.status === 204) return;

  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || 'An API error occurred.'); }
      return data;
  }
  
  if (response.ok && (contentType?.includes('application/x-sqlite3') || contentType?.includes('text/csv'))) {
      return await response.blob();
  }
  
  if (response.ok) {
    return response.text();
  }

  const textData = await response.text();
  throw new Error(textData || 'An API error occurred.');
}

// AUTH
export async function login(email, password) { return fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); }
export async function register(email, password) { return fetchApi('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }); }

// SETTINGS & PROFILES
export async function getAppSettings() { return fetchApi('/settings'); }
export async function saveAppSettings(settings, token) { return fetchApi('/settings', { method: 'POST', body: JSON.stringify(settings), token: token }); }
export async function refreshHolidays() { return fetchApi('/settings/refresh-holidays', { method: 'POST', }); }
export async function getAllImportProfiles() { return fetchApi('/import-profiles'); }
export async function createImportProfile(profileData) { return fetchApi('/import-profiles', { method: 'POST', body: JSON.stringify(profileData) }); }
export async function updateImportProfile(id, profileData) { return fetchApi(`/import-profiles/${id}`, { method: 'PUT', body: JSON.stringify(profileData) }); }
export async function deleteImportProfile(id) { return fetchApi(`/import-profiles/${id}`, { method: 'DELETE' }); }


// TRANSACTIONS
export async function uploadTransactionsFile(file, profileId) { 
    const formData = new FormData(); 
    formData.append('transactionsFile', file);
    formData.append('profileId', profileId);
    return fetchApi('/transactions/upload', { method: 'POST', body: formData }, true); 
}
export async function getAllTransactions() { return fetchApi('/transactions'); }
export async function categorizeTransaction(transactionId, data) { return fetchApi(`/transactions/${transactionId}/categorize`, { method: 'PUT', body: JSON.stringify(data) }); }
export async function splitTransaction(transactionId, data) { return fetchApi(`/transactions/${transactionId}/split`, { method: 'POST', body: JSON.stringify({ splits: data.splits, vendor_id: data.vendor_id }) }); }
export async function getIgnoredTransactions() { return fetchApi('/transactions/ignored'); }
export async function reinstateTransaction(id) { return fetchApi(`/transactions/ignored/${id}/reinstate`, { method: 'POST', }); }
export async function purgeIgnoredTransactions() { return fetchApi('/transactions/ignored/purge', { method: 'DELETE', }); }
export async function applyCategorizationRules() { return fetchApi('/transactions/apply-rules', { method: 'POST', }); }

// DASHBOARD & FORECAST
export async function getDashboardData() { return fetchApi('/dashboard'); }
export async function getForecast() { return fetchApi('/forecast/cashflow'); }

// DATA MANAGEMENT
export async function getCategoriesWithSubcategories() { return fetchApi('/categories?with_subcategories=true'); }
export async function createCategory(name) { return fetchApi('/categories', { method: 'POST', body: JSON.stringify({ name }) }); }
export async function updateCategory(id, data) { return fetchApi(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export async function deleteCategory(id) { return fetchApi(`/categories/${id}`, { method: 'DELETE', }); }
export async function createSubcategory(categoryId, name) { return fetchApi(`/categories/${categoryId}/subcategories`, { method: 'POST', body: JSON.stringify({ name }) }); }
export async function deleteSubcategory(categoryId, subcategoryId) { return fetchApi(`/categories/${categoryId}/subcategories/${subcategoryId}`, { method: 'DELETE', }); }
export async function getAllSubcategories() { return fetchApi('/subcategories/all'); }
export async function getAllVendors() { return fetchApi('/vendors'); }
export async function createVendor(vendorData) { return fetchApi('/vendors', { method: 'POST', body: JSON.stringify(vendorData) }); }
export async function updateVendor(id, vendorData) { return fetchApi(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(vendorData) }); }
export async function deleteVendor(id) { return fetchApi(`/vendors/${id}`, { method: 'DELETE', }); }
export async function getActiveRecurringBills() { return fetchApi('/recurring-bills'); }
export async function createRecurringBill(billData) { return fetchApi('/recurring-bills', { method: 'POST', body: JSON.stringify(billData) }); }
export async function updateRecurringBill(id, billData) { return fetchApi(`/recurring-bills/${id}`, { method: 'PUT', body: JSON.stringify(billData) }); }
export async function deactivateRecurringBill(id) { return fetchApi(`/recurring-bills/${id}`, { method: 'DELETE', }); }

// BUDGETS
export async function getBudgetsByMonth(year, month) { return fetchApi(`/budgets/${year}/${month}`); }
export async function setBudgetsBulk(budgets) { return fetchApi('/budgets/bulk', { method: 'POST', body: JSON.stringify({ budgets }) }); }
export async function getBudgetTemplate() { return fetchApi('/budgets/template', {}, true); }
export async function uploadBudget(file) { const formData = new FormData(); formData.append('budgetFile', file); return fetchApi('/budgets/upload', { method: 'POST', body: formData }, true); }

// PLANNED INCOME
export async function getActivePlannedIncome() { return fetchApi('/planned-income'); }
export async function createPlannedIncome(incomeData) { return fetchApi('/planned-income', { method: 'POST', body: JSON.stringify(incomeData) }); }
export async function updatePlannedIncome(id, incomeData) { return fetchApi(`/planned-income/${id}`, { method: 'PUT', body: JSON.stringify(incomeData) }); }
export async function deactivatePlannedIncome(id) { return fetchApi(`/planned-income/${id}`, { method: 'DELETE', }); }

// SAVINGS
export async function getAllSavingsAccounts() { return fetchApi('/savings/accounts'); }
export async function createSavingsAccount(accountData) { return fetchApi('/savings/accounts', { method: 'POST', body: JSON.stringify(accountData) }); }
export async function updateSavingsAccount(id, accountData) { return fetchApi(`/savings/accounts/${id}`, { method: 'PUT', body: JSON.stringify(accountData) }); }
export async function deleteSavingsAccount(id) { return fetchApi(`/savings/accounts/${id}`, { method: 'DELETE' }); }
export async function createSavingsGoal(goalData) { return fetchApi('/savings/goals', { method: 'POST', body: JSON.stringify(goalData) }); }
export async function updateSavingsGoal(id, goalData) { return fetchApi(`/savings/goals/${id}`, { method: 'PUT', body: JSON.stringify(goalData) }); }
export async function deleteSavingsGoal(id) { return fetchApi(`/savings/goals/${id}`, { method: 'DELETE' }); }
export async function withdrawFromSavingsGoal(id, withdrawalData) { return fetchApi(`/savings/goals/${id}/withdraw`, { method: 'POST', body: JSON.stringify(withdrawalData) }); }

// BACKUP
export async function downloadBackup() {
    const blob = await fetchApi('/backup/create', {}, true);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_backup_${new Date().toISOString().split('T')[0]}.db`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export async function restoreBackup(file) {
    const formData = new FormData();
    formData.append('backupFile', file);
    return fetchApi('/backup/restore', { method: 'POST', body: formData }, true);
}