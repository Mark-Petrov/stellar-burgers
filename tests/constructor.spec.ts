import { test, expect, Page, Locator } from '@playwright/test';
import path from 'path';
import { getIngredientByName } from './helpers/ingredientsFromHar';

const harsDir = path.join(__dirname, 'hars');

const expectIngredientNutritionInModal = async (
  modal: Locator,
  ingredient: {
    calories: number;
    proteins: number;
    fat: number;
    carbohydrates: number;
  }
) => {
  await expect(
    modal
      .locator('li')
      .filter({ hasText: 'Калории, ккал' })
      .getByText(String(ingredient.calories))
  ).toBeVisible();
  await expect(
    modal
      .locator('li')
      .filter({ hasText: 'Белки, г' })
      .getByText(String(ingredient.proteins))
  ).toBeVisible();
  await expect(
    modal
      .locator('li')
      .filter({ hasText: 'Жиры, г' })
      .getByText(String(ingredient.fat))
  ).toBeVisible();
  await expect(
    modal
      .locator('li')
      .filter({ hasText: 'Углеводы, г' })
      .getByText(String(ingredient.carbohydrates))
  ).toBeVisible();
};

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
      page.locator('.constructor-element__text', {
        hasText: 'Краторная булка N-200i (верх)'
      })
    ).toBeVisible();
    await expect(
      page.locator('.constructor-element__text', {
        hasText: 'Краторная булка N-200i (низ)'
      })
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
    const main = getIngredientByName('Биокотлета из марсианской Magma Bull');
    const sauce = getIngredientByName('Соус Spicy-X');

    await page.getByRole('link', { name: main.name }).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText(main.name)).toBeVisible();
    await expectIngredientNutritionInModal(modal, main);

    await modal.locator('button').click();

    await page.getByRole('link', { name: sauce.name }).click();
    await expect(modal.getByText(sauce.name)).toBeVisible();
    await expectIngredientNutritionInModal(modal, sauce);
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

    const constructor = page.getByTestId('burger-constructor');
    await expect(constructor.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();

    await modal.locator('button').click();
    await expect(
      modal.getByRole('heading', { name: '12345' })
    ).not.toBeVisible();
  });
});
