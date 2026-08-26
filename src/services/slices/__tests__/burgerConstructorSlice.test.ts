jest.mock('uuid', () => ({
  v4: () => 'test-uuid'
}));

import { TConstructorIngredient, TIngredient } from '@utils-types';
import reducer, {
  addIngredient,
  closeOrderModal,
  createOrder,
  initialState,
  moveIngredient,
  removeIngredient
} from '@slices/burgerConstructorSlice';

const mockBun: TIngredient = {
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
};

const mockMain: TIngredient = {
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
};

const mockConstructorMain: TConstructorIngredient = {
  ...mockMain,
  id: 'main-id'
};

const mockOrderResponse = {
  success: true,
  name: 'Space флюоресцентный бургер',
  order: {
    _id: '643d69a5c3f7b9001cfa0945',
    status: 'done',
    name: 'Space флюоресцентный бургер',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    number: 12345,
    price: 764,
    owner: {
      email: 'user@example.com',
      name: 'Иван Иванов',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  }
};

describe('burgerConstructor reducer', () => {
  test('должен вернуть начальное состояние при undefined state и неизвестном экшене', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  test('должен обработать addIngredient для булки', () => {
    const state = reducer(initialState, addIngredient(mockBun));

    expect(state.bun).toEqual({ ...mockBun, id: 'test-uuid' });
    expect(state.ingredients).toEqual([]);
  });

  test('должен обработать addIngredient для начинки', () => {
    const state = reducer(initialState, addIngredient(mockMain));

    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([{ ...mockMain, id: 'test-uuid' }]);
  });

  test('должен обработать removeIngredient', () => {
    const state = reducer(
      { ...initialState, ingredients: [mockConstructorMain] },
      removeIngredient('main-id')
    );

    expect(state.ingredients).toEqual([]);
  });

  test('должен обработать moveIngredient вверх', () => {
    const secondMain: TConstructorIngredient = {
      ...mockMain,
      _id: '643d69a5c3f7b9001cfa0943',
      id: 'second-id'
    };

    const state = reducer(
      {
        ...initialState,
        ingredients: [mockConstructorMain, secondMain]
      },
      moveIngredient({ index: 1, direction: 'up' })
    );

    expect(state.ingredients).toEqual([secondMain, mockConstructorMain]);
  });

  test('должен обработать moveIngredient вниз', () => {
    const secondMain: TConstructorIngredient = {
      ...mockMain,
      _id: '643d69a5c3f7b9001cfa0943',
      id: 'second-id'
    };

    const state = reducer(
      {
        ...initialState,
        ingredients: [mockConstructorMain, secondMain]
      },
      moveIngredient({ index: 0, direction: 'down' })
    );

    expect(state.ingredients).toEqual([secondMain, mockConstructorMain]);
  });

  test('должен обработать closeOrderModal', () => {
    const state = reducer(
      {
        bun: { ...mockBun, id: 'bun-id' },
        ingredients: [mockConstructorMain],
        orderRequest: true,
        orderModalData: mockOrderResponse.order
      },
      closeOrderModal()
    );

    expect(state.orderModalData).toBeNull();
    expect(state.orderRequest).toBe(false);
    expect(state.bun).toEqual({ ...mockBun, id: 'bun-id' });
    expect(state.ingredients).toEqual([mockConstructorMain]);
  });

  test('должен обработать createOrder.pending', () => {
    const state = reducer(initialState, createOrder.pending('', []));

    expect(state.orderRequest).toBe(true);
  });

  test('должен обработать createOrder.fulfilled', () => {
    const state = reducer(
      {
        bun: { ...mockBun, id: 'bun-id' },
        ingredients: [mockConstructorMain],
        orderRequest: true,
        orderModalData: null
      },
      createOrder.fulfilled(mockOrderResponse, '', ['bun-id', 'main-id'])
    );

    expect(state).toEqual({
      bun: null,
      ingredients: [],
      orderRequest: false,
      orderModalData: mockOrderResponse.order
    });
  });

  test('должен обработать createOrder.rejected', () => {
    const state = reducer(
      { ...initialState, orderRequest: true },
      createOrder.rejected(new Error('Ошибка'), '', [])
    );

    expect(state.orderRequest).toBe(false);
  });
});
