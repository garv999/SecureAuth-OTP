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
});
