import fs from 'fs';
import path from 'path';

type TIngredientMock = {
  name: string;
  type: string;
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
};

const ingredientsHarPath = path.join(__dirname, '../hars/ingredients.har');

export const getIngredientsFromHar = (): TIngredientMock[] => {
  const har = JSON.parse(fs.readFileSync(ingredientsHarPath, 'utf-8'));
  const responseText = har.log.entries[0].response.content.text as string;
  const { data } = JSON.parse(responseText) as { data: TIngredientMock[] };

  return data;
};

export const getIngredientByName = (name: string): TIngredientMock => {
  const ingredient = getIngredientsFromHar().find((item) => item.name === name);

  if (!ingredient) {
    throw new Error(`Ingredient not found in HAR: ${name}`);
  }

  return ingredient;
};
