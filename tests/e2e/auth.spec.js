import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /SecureAuth/i })).toBeVisible();
  });

  test('should keep the submit button disabled for invalid phone input', async ({ page }) => {
    await page.goto('/login');
    const input = page.locator('input[type="tel"]');
    const submitButton = page.getByRole('button', { name: /Request Access OTP/i });
    
    // Initially disabled (empty)
    await expect(submitButton).toBeDisabled();

    // Still disabled with invalid length
    await input.fill('123');
    await expect(submitButton).toBeDisabled();

    // Enabled with 10 digits
    await input.fill('1234567890');
    await expect(submitButton).toBeEnabled();
  });

  test("should display dashboard statistics while showing 'No recent security events.' when history is empty", async ({ page }) => {
    await page.route('**/src/context/AuthProvider.jsx', async (route) => {
      const response = await route.fetch();
      let text = await response.text();
      text = text.replace(/onAuthStateChanged\(\s*auth\s*,/g, `((a, cb) => {
        cb({
          uid: 'mock-uid-123',
          email: 'mockuser@example.com',
          phoneNumber: '+919876543210',
          displayName: 'Mock User',
          providerData: [{ providerId: 'google.com', email: 'mockuser@example.com' }],
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
          }
        });
        return () => {};
      })(auth,`);
      await route.fulfill({
        contentType: 'application/javascript',
        body: text
      });
    });

    await page.route('**/src/services/firestore.js', async (route) => {
      await route.fulfill({
        contentType: 'application/javascript',
        body: `
          export const getUserDoc = async () => ({ exists: () => false });
          export const createUserProfile = async () => {};
          export const updateUserProfile = async () => {};
          export const getUserSubcollection = async () => [];
          export const getUserSessions = async () => [];
          export const addUserSubcollectionDoc = async () => ({ id: 'mock-doc-id' });
          export const setUserDoc = async () => {};
          export const deleteUserDoc = async () => {};
          export const logAuditEvent = async () => {};
          export const getAuditLogs = async () => ({ logs: [], lastVisible: null });
        `
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('sa_history', '[]');
      window.localStorage.setItem('sa_sessions', '[]');
    });

    await page.goto('/dashboard');

    await expect(page.getByText('System Overview')).toBeVisible();
    await expect(page.getByText('Security Score')).toBeVisible();
    await expect(page.getByText('Total Logins')).toBeVisible();
    await expect(page.getByText('Active Sessions')).toBeVisible();
    await expect(page.getByText('No recent security events.')).toBeVisible();
  });
});
