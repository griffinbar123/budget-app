// app/api/finance.js
const API_BASE_URL = '/api';

async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : undefined,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage += ` - ${errorData.message}`;
            } catch (jsonError) { /* Ignore */ }
            throw new Error(errorMessage);
        }

        // Handle 204 No Content (common for DELETE)
        if (response.status === 204) {
          return; // Return nothing for 204
        }
        return await response.json(); // Parse JSON for other successful responses

    } catch (error) {
        if (error.message.startsWith('HTTP error')) {
            throw error;
        } else {
            throw new Error('Network error. Please check your internet connection.');
        }
    }
}

// --- Transactions ---
export async function getTransactions() {
    return apiRequest('/transactions');
}

export async function addTransaction(transaction) {
    return apiRequest('/transactions', 'POST', transaction);
}

export async function updateTransaction(transaction) {
    return apiRequest(`/transactions/${transaction.id}`, 'PUT', transaction);
}

export async function deleteTransaction(transactionId) {
    return apiRequest(`/transactions/${transactionId}`, 'DELETE');
}

// --- Categories ---
export async function getCategories() {
  return apiRequest('/categories');
}

export async function addCategory(category) {
  return apiRequest('/categories', 'POST', category);
}

export async function updateCategory(category) {
  return apiRequest(`/categories/${category.id}`, 'PUT', category)
}

export async function deleteCategory(categoryId) {
  return apiRequest(`/categories/${categoryId}`, 'DELETE');
}
// --- Income Sources ---

export async function getIncomeSources() {
    return apiRequest('/income-sources');
}

export async function addIncomeSource(incomeSource) {
  return apiRequest('/income-sources', 'POST', incomeSource)
}

export async function updateIncomeSource(incomeSource) {
  return apiRequest(`/income-sources/${incomeSource.id}`, 'PUT', incomeSource)
}
export async function deleteIncomeSource(incomeSourceId) {
  return apiRequest(`/income-sources/${incomeSourceId}`, 'DELETE');
}

// --- Plaid ---
// These stay as they were, as they interact with the Plaid API directly.
export async function createLinkToken() {
  const response = await fetch('/api/plaid/create-link-token', { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Failed to create link token: ${response.status}`);
  }
  return await response.json();
}

export async function exchangePublicToken(publicToken) {
    const response = await fetch('/api/plaid/exchange-public-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_token: publicToken }),
    });

    if (!response.ok) {
        const errorText = await response.text(); // Get error text
        throw new Error(`Token exchange failed with status ${response.status}: ${errorText}`);
      }
    return await response.json();
  }
export async function getPlaidInfo() {
    return apiRequest('/user/plaid-info'); // New endpoint
}
export async function disconnectPlaidAccount () {
    return apiRequest('/user/disconnect-plaid', "DELETE");
}
export async function syncTransactions() {
  return apiRequest('/transactions/sync', 'POST'); //  Use POST for sync
}

export async function getUncategorizedCategory() {
  return apiRequest('/categories/uncategorized'); // New endpoint
}