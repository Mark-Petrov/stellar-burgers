import { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '../../services/store';
import { selectIsAuthChecked, selectUser } from '@selectors/userSelectors';
import { Preloader } from '@ui';

type TProtectedRouteProps = {
  children: ReactElement;
  onlyUnAuth?: boolean;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
  children,
  onlyUnAuth = false
}) => {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (onlyUnAuth && user) {
    return <Navigate to='/' replace />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
};
