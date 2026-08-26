import { test, expect, Page } from '@playwright/test';
import path from 'path';

const harsDir = path.join(__dirname, 'hars');

const setupBackendMocks = async (page: Page, withAuth = false) => {
  await page.routeFromHAR(path.join(harsDir, 'ingredients.har'), {
    url: '**/api/ingredients',
    update: false
  });

  if (withAuth) {
    await page.routeFromHAR(path.join(harsDir, 'user.har'), {
      url: '**/api/auth/user',
      update: false
    });
    await page.routeFromHAR(path.join(harsDir, 'order.har'), {
      url: '**/api/orders',
      update: false
    });
  }
};

const openConstructorPage = async (page: Page, withAuth = false) => {
  await setupBackendMocks(page, withAuth);
  await page.goto('/');
  await expect(page.getByText('Соберите бургер')).toBeVisible();
};

test.describe('Добавление ингредиентов в конструктор', () => {
  test.beforeEach(async ({ page }) => {
    await openConstructorPage(page);
  });

  test('добавление булки, начинки и соуса в конструктор', async ({ page }) => {
    const bun = page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' });
    const main = page
      .locator('li')
      .filter({ hasText: 'Биокотлета из марсианской Magma Bull' });
    const sauce = page.locator('li').filter({ hasText: 'Соус Spicy-X' });

    await bun.getByRole('button', { name: 'Добавить' }).click();
    await main.getByRole('button', { name: 'Добавить' }).click();
    await sauce.getByRole('button', { name: 'Добавить' }).click();

    await expect(
      page.getByText('Краторная булка N-200i (верх)')
    ).toBeVisible();
    await expect(
      page.getByText('Краторная булка N-200i (низ)')
    ).toBeVisible();
    await expect(
      page.locator('.constructor-element__text', {
        hasText: 'Биокотлета из марсианской Magma Bull'
      })
    ).toBeVisible();
    await expect(
      page.locator('.constructor-element__text', { hasText: 'Соус Spicy-X' })
    ).toBeVisible();
  });
});

test.describe('Модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await openConstructorPage(page);
  });

  test('открытие и закрытие модального окна с описанием ингредиента', async ({
    page
  }) => {
    await page
      .getByRole('link', { name: 'Краторная булка N-200i' })
      .click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText('Краторная булка N-200i')).toBeVisible();

    await modal.locator('button').click();
    await expect(modal.getByText('Детали ингредиента')).not.toBeVisible();

    await page
      .getByRole('link', { name: 'Краторная булка N-200i' })
      .click();
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();

    await page
      .locator('#modals > div')
      .last()
      .click({ position: { x: 5, y: 5 } });
    await expect(modal.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test('отображение данных ингредиента, по которому произошёл клик', async ({
    page
  }) => {
    await page
      .getByRole('link', { name: 'Биокотлета из марсианской Magma Bull' })
      .click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(
      modal.getByText('Биокотлета из марсианской Magma Bull')
    ).toBeVisible();
    await expect(modal.getByText('4242')).toBeVisible();
    await expect(modal.getByText('420', { exact: true })).toBeVisible();
    await expect(modal.getByText('142', { exact: true })).toBeVisible();
    await expect(modal.getByText('242', { exact: true })).toBeVisible();

    await modal.locator('button').click();

    await page.getByRole('link', { name: 'Соус Spicy-X' }).click();
    await expect(modal.getByText('Соус Spicy-X')).toBeVisible();
    await expect(
      modal.locator('li').filter({ hasText: 'Калории, ккал' }).getByText('30')
    ).toBeVisible();
    await expect(
      modal.locator('li').filter({ hasText: 'Белки, г' }).getByText('30')
    ).toBeVisible();
    await expect(modal.getByText('20', { exact: true })).toBeVisible();
    await expect(modal.getByText('40', { exact: true })).toBeVisible();
  });
});

test.describe('Создание заказа', () => {
  test('создание заказа авторизованным пользователем', async ({
    page,
    context
  }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer test-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await setupBackendMocks(page, true);
    await page.goto('/');
    await expect(page.getByText('Соберите бургер')).toBeVisible();

    const bun = page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' });
    const main = page
      .locator('li')
      .filter({ hasText: 'Биокотлета из марсианской Magma Bull' });

    await bun.getByRole('button', { name: 'Добавить' }).click();
    await main.getByRole('button', { name: 'Добавить' }).click();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const modal = page.locator('#modals');
    await expect(modal.getByRole('heading', { name: '12345' })).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();

    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();

    await modal.locator('button').click();
    await expect(
      modal.getByRole('heading', { name: '12345' })
    ).not.toBeVisible();
  });
});
