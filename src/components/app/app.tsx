import { useEffect } from 'react';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';

import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';
import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute
} from '@components';
import { useDispatch, useSelector } from '../../services/store';
import { fetchIngredients } from '@slices/ingredientsSlice';
import { checkUserAuth, setAuthChecked } from '@slices/userSlice';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading
} from '@selectors/ingredientsSelectors';
import { selectIsAuthChecked } from '@selectors/userSelectors';
import { Preloader } from '@ui';
import { getCookie } from '../../utils/cookie';

import '../../index.css';
import styles from './app.module.css';

const IngredientModal = () => {
  const navigate = useNavigate();

  return (
    <Modal title='Детали ингредиента' onClose={() => navigate(-1)}>
      <IngredientDetails />
    </Modal>
  );
};

const OrderModal = () => {
  const navigate = useNavigate();
  const { number } = useParams<{ number: string }>();

  return (
    <Modal
      title={`#${String(number).padStart(6, '0')}`}
      onClose={() => navigate(-1)}
    >
      <OrderInfo />
    </Modal>
  );
};

const IngredientPage = () => (
  <main className={`${styles.title} pt-10`}>
    <h1 className='text text_type_main-large pl-10 mb-3'>Детали ингредиента</h1>
    <IngredientDetails />
  </main>
);

const OrderPage = () => {
  const { number } = useParams<{ number: string }>();

  return (
    <main className={`${styles.title} pt-10 pl-10 pr-10`}>
      <h1 className='text text_type_main-large mb-3'>
        #{String(number).padStart(6, '0')}
      </h1>
      <OrderInfo />
    </main>
  );
};

const ConstructorRoute = () => {
  const isIngredientsLoading = useSelector(selectIngredientsLoading);
  const ingredients = useSelector(selectIngredients);
  const error = useSelector(selectIngredientsError);

  if (isIngredientsLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <div className={`${styles.error} text text_type_main-medium pt-4`}>
        {error}
      </div>
    );
  }

  if (ingredients.length > 0) {
    return <ConstructorPage />;
  }

  return (
    <div className={`${styles.title} text text_type_main-medium pt-4`}>
      Нет ингредиентов
    </div>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const background = location.state?.background;

  useEffect(() => {
    dispatch(fetchIngredients());
    if (getCookie('accessToken')) {
      dispatch(checkUserAuth());
    } else {
      dispatch(setAuthChecked());
    }
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      {!isAuthChecked ? (
        <Preloader />
      ) : (
        <>
          <Routes location={background || location}>
            <Route path='/' element={<ConstructorRoute />} />
            <Route path='/feed' element={<Feed />} />
            <Route
              path='/login'
              element={
                <ProtectedRoute onlyUnAuth>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path='/register'
              element={
                <ProtectedRoute onlyUnAuth>
                  <Register />
                </ProtectedRoute>
              }
            />
            <Route
              path='/forgot-password'
              element={
                <ProtectedRoute onlyUnAuth>
                  <ForgotPassword />
                </ProtectedRoute>
              }
            />
            <Route
              path='/reset-password'
              element={
                <ProtectedRoute onlyUnAuth>
                  <ResetPassword />
                </ProtectedRoute>
              }
            />
            <Route
              path='/profile'
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path='/profile/orders'
              element={
                <ProtectedRoute>
                  <ProfileOrders />
                </ProtectedRoute>
              }
            />
            <Route path='/ingredients/:id' element={<IngredientPage />} />
            <Route path='/feed/:number' element={<OrderPage />} />
            <Route
              path='/profile/orders/:number'
              element={
                <ProtectedRoute>
                  <OrderPage />
                </ProtectedRoute>
              }
            />
            <Route path='*' element={<NotFound404 />} />
          </Routes>

          {background && (
            <Routes>
              <Route path='/ingredients/:id' element={<IngredientModal />} />
              <Route path='/feed/:number' element={<OrderModal />} />
              <Route
                path='/profile/orders/:number'
                element={
                  <ProtectedRoute>
                    <OrderModal />
                  </ProtectedRoute>
                }
              />
            </Routes>
          )}
        </>
      )}
    </div>
  );
};

export default App;
