import { TCreatedOrder } from '@api';

export type BurgerConstructorUIProps = {
  constructorItems: any;
  orderRequest: boolean;
  price: number;
  orderModalData: TCreatedOrder | null;
  onOrderClick: () => void;
  closeOrderModal: () => void;
};
