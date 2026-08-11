import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { getCookie } from '../../utils/cookie';
import { useDispatch, useSelector } from '../../services/store';
import { fetchUserOrders, setUserOrders } from '@slices/ordersSlice';
import {
  selectUserOrders,
  selectUserOrdersLoading
} from '@selectors/ordersSelectors';
import { Preloader } from '@ui';
import { TOrder } from '@utils-types';

const WS_URL = `${process.env.BURGER_API_URL?.replace(/^http/, 'ws')}/orders`;

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectUserOrders);
  const isLoading = useSelector(selectUserOrdersLoading);

  useEffect(() => {
    dispatch(fetchUserOrders());

    const token = getCookie('accessToken')?.replace(/^Bearer\s*/, '') || '';
    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onmessage = (event) => {
      const data: { success?: boolean; orders?: TOrder[] } = JSON.parse(
        event.data
      );
      if (data.success && data.orders) {
        dispatch(setUserOrders(data.orders));
      }
    };

    return () => {
      ws.close();
    };
  }, [dispatch]);

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  return <ProfileOrdersUI orders={orders} />;
};
