import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchFeeds, setFeedData } from '@slices/feedSlice';
import { selectFeedLoading, selectFeedOrders } from '@selectors/feedSelectors';
import { TOrdersData } from '@utils-types';

const WS_URL = `${process.env.BURGER_API_URL?.replace(/^http/, 'ws')}/orders`;

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);
  const isLoading = useSelector(selectFeedLoading);

  useEffect(() => {
    dispatch(fetchFeeds());

    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      const data: TOrdersData & { success?: boolean } = JSON.parse(event.data);
      if (data.success) {
        dispatch(
          setFeedData({
            orders: data.orders,
            total: data.total,
            totalToday: data.totalToday
          })
        );
      }
    };

    return () => {
      ws.close();
    };
  }, [dispatch]);

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  return (
    <FeedUI orders={orders} handleGetFeeds={() => dispatch(fetchFeeds())} />
  );
};
