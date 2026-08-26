import { RootState } from '../store';

export const selectOrderDetails = (state: RootState) =>
  state.orderDetails.order;

export const selectOrderDetailsLoading = (state: RootState) =>
  state.orderDetails.isLoading;
