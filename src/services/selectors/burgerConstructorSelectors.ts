import { RootState } from '../store';

export const selectConstructorItems = (state: RootState) => ({
  bun: state.burgerConstructor.bun,
  ingredients: state.burgerConstructor.ingredients
});

export const selectOrderRequest = (state: RootState) =>
  state.burgerConstructor.orderRequest;

export const selectOrderModalData = (state: RootState) =>
  state.burgerConstructor.orderModalData;
