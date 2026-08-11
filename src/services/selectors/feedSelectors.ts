import { RootState } from '../store';

export const selectFeedOrders = (state: RootState) => state.feed.orders;

export const selectFeedStats = (state: RootState) => ({
  total: state.feed.total,
  totalToday: state.feed.totalToday
});

export const selectFeedLoading = (state: RootState) => state.feed.isLoading;
