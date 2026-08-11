import { RootState } from '../store';

export const selectIngredients = (state: RootState) =>
  state.ingredients.ingredients;

export const selectIngredientsLoading = (state: RootState) =>
  state.ingredients.isLoading;

export const selectIngredientsError = (state: RootState) =>
  state.ingredients.error;

export const selectBuns = (state: RootState) =>
  state.ingredients.ingredients.filter((item) => item.type === 'bun');

export const selectMains = (state: RootState) =>
  state.ingredients.ingredients.filter((item) => item.type === 'main');

export const selectSauces = (state: RootState) =>
  state.ingredients.ingredients.filter((item) => item.type === 'sauce');

export const selectIngredientById = (id: string) => (state: RootState) =>
  state.ingredients.ingredients.find((item) => item._id === id);
