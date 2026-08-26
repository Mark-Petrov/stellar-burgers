import { TIngredient } from '@utils-types';
import reducer, { fetchIngredients } from '@slices/ingredientsSlice';

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 125,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Magma Bull',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://code.s3.yandex.net/react/code/meat-01.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png'
  }
];

const initialState = {
  ingredients: [],
  isLoading: false,
  error: null
};

describe('ingredients reducer', () => {
  test('должен вернуть начальное состояние при undefined state и неизвестном экшене', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  test('должен обработать fetchIngredients.pending', () => {
    const state = reducer(initialState, fetchIngredients.pending(''));

    expect(state).toEqual({
      ...initialState,
      isLoading: true,
      error: null
    });
  });

  test('должен обработать fetchIngredients.fulfilled', () => {
    const state = reducer(
      { ...initialState, isLoading: true },
      fetchIngredients.fulfilled(mockIngredients, '', undefined)
    );

    expect(state).toEqual({
      ingredients: mockIngredients,
      isLoading: false,
      error: null
    });
  });

  test('должен обработать fetchIngredients.rejected', () => {
    const state = reducer(
      { ...initialState, isLoading: true },
      fetchIngredients.rejected(new Error('Ошибка'), '', undefined, 'Ошибка')
    );

    expect(state).toEqual({
      ...initialState,
      isLoading: false,
      error: 'Ошибка'
    });
  });
});
