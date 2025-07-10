const API_BASE_URL = '/api';

async function fetchApi(url, options = {}, isFile = false) {
  const token = localStorage.getItem('authToken');
  const headers = isFile ? {} : { 'Content-Type': 'application/json' };
  if (token) { headers['Authorization'] = `Bearer ${token}`; }
  const finalOptions = { ...options, headers };
  const response = await fetch(`${API_BASE_URL}${url}`, finalOptions);
  if (response.status === 204) return;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || 'An API error occurred.'); }
      return data;
  }
  const textData = await response.text();
  if (!response.ok) {
    const errorMatch = textData.match(/<pre>(.*?)<br>/);
    const errorMessage = errorMatch ? errorMatch[1] : 'An API error occurred.';
    throw new Error(errorMessage);
  }
  return { message: textData };
}

export async function uploadTransactionsFile(file) { const formData = new FormData(); formData.append('transactionsFile', file); return fetchApi('/transactions/upload', { method: 'POST', body: formData }, true); }
export async function login(email, password) { return fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); }
export async function getAppSettings() { return fetchApi('/settings'); }
export async function saveAppSettings(settings) { return fetchApi('/settings', { method: 'POST', body: JSON.stringify(settings) }); }
export async function refreshHolidays() { return fetchApi('/settings/refresh-holidays', { method: 'POST' }); }
export async function getDashboardSummary() { return fetchApi('/dashboard/monthly-summary'); }
export async function getForecast() { return fetchApi('/forecast/cashflow'); }
export async function getAllTransactions() { return fetchApi('/transactions'); }
export async function categorizeTransaction(transactionId, subcategoryId) { return fetchApi(`/transactions/${transactionId}/categorize`, { method: 'PUT', body: JSON.stringify({ subcategory_id: subcategoryId }) }); }
export async function updateTransactionVendor(transactionId, vendorId) { return fetchApi(`/transactions/${transactionId}/vendor`, { method: 'PUT', body: JSON.stringify({ vendor_id: vendorId }) }); }
export async function splitTransaction(transactionId, splits) { return fetchApi(`/transactions/${transactionId}/split`, { method: 'POST', body: JSON.stringify({ splits }) }); }
export async function getCategoriesWithSubcategories() { return fetchApi('/categories?with_subcategories=true'); }
export async function createCategory(name) { return fetchApi('/categories', { method: 'POST', body: JSON.stringify({ name }) }); }
export async function deleteCategory(id) { return fetchApi(`/categories/${id}`, { method: 'DELETE' }); }
export async function createSubcategory(categoryId, name) { return fetchApi(`/categories/${categoryId}/subcategories`, { method: 'POST', body: JSON.stringify({ name }) }); }
export async function deleteSubcategory(categoryId, subcategoryId) { return fetchApi(`/categories/${categoryId}/subcategories/${subcategoryId}`, { method: 'DELETE' }); }
export async function getAllSubcategories() { return fetchApi('/subcategories/all'); }
export async function getAllVendors() { return fetchApi('/vendors'); }
export async function createVendor(vendorData) { return fetchApi('/vendors', { method: 'POST', body: JSON.stringify(vendorData) }); }
export async function updateVendor(id, vendorData) { return fetchApi(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(vendorData) }); }
export async function deleteVendor(id) { return fetchApi(`/vendors/${id}`, { method: 'DELETE' }); }
export async function getActiveRecurringBills() { return fetchApi('/recurring-bills'); }
export async function createRecurringBill(billData) { return fetchApi('/recurring-bills', { method: 'POST', body: JSON.stringify(billData) }); }
export async function updateRecurringBill(id, billData) { return fetchApi(`/recurring-bills/${id}`, { method: 'PUT', body: JSON.stringify(billData) }); }
export async function deactivateRecurringBill(id) { return fetchApi(`/recurring-bills/${id}`, { method: 'DELETE' }); }
export async function getBudgetsByMonth(year, month) { return fetchApi(`/budgets/${year}/${month}`); }
export async function setBudgetsBulk(budgets) { return fetchApi('/budgets/bulk', { method: 'POST', body: JSON.stringify({ budgets }) }); }
export async function getAllSavingsAccounts() { return fetchApi('/savings/accounts'); }
export async function createSavingsAccount(accountData) { return fetchApi('/savings/accounts', { method: 'POST', body: JSON.stringify(accountData) }); }
export async function updateSavingsAccount(id, accountData) { return fetchApi(`/savings/accounts/${id}`, { method: 'PUT', body: JSON.stringify(accountData) }); }
export async function deleteSavingsAccount(id) { return fetchApi(`/savings/accounts/${id}`, { method: 'DELETE' }); }
export async function createSavingsGoal(goalData) { return fetchApi('/savings/goals', { method: 'POST', body: JSON.stringify(goalData) }); }
export async function updateSavingsGoal(id, goalData) { return fetchApi(`/savings/goals/${id}`, { method: 'PUT', body: JSON.stringify(goalData) }); }
export async function deleteSavingsGoal(id) { return fetchApi(`/savings/goals/${id}`, { method: 'DELETE' }); }
export async function withdrawFromSavingsGoal(id, withdrawalData) { return fetchApi(`/savings/goals/${id}/withdraw`, { method: 'POST', body: JSON.stringify(withdrawalData) }); }
export async function getIgnoredTransactions() { return fetchApi('/transactions/ignored'); }
export async function reinstateTransaction(id) { return fetchApi(`/transactions/ignored/${id}/reinstate`, { method: 'POST' }); }
export async function purgeIgnoredTransactions() { return fetchApi('/transactions/ignored/purge', { method: 'DELETE' }); }