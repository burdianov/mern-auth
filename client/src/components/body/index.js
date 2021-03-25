import { Switch, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Login from './auth/Login';
import Register from './auth/Register';
import EmailActivation from './auth/EmailActivation';
import NotFound from '../utils/NotFound';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import Profile from './profile';
import EditUser from './profile/EditUser';
import Home from './home';

function Body() {
  const auth = useSelector((state) => state.auth);
  const { isLoggedIn, isAdmin } = auth;

  return (
    <section>
      <Switch>
        <Route path="/" component={Home} exact />
        <Route path="/login" component={isLoggedIn ? NotFound : Login} exact />
        <Route
          path="/register"
          component={isLoggedIn ? NotFound : Register}
          exact
        />
        <Route
          path="/user/activate/:activation_token"
          component={EmailActivation}
          exact
        />
        <Route
          path="/forgot-password"
          component={isLoggedIn ? NotFound : ForgotPassword}
          exact
        />
        <Route
          path="/user/reset-password/:token"
          component={isLoggedIn ? NotFound : ResetPassword}
          exact
        />
        <Route
          path="/profile"
          component={isLoggedIn ? Profile : NotFound}
          exact
        />
        <Route
          path="/edit-user/:id"
          component={isAdmin ? EditUser : NotFound}
          exact
        />
      </Switch>
    </section>
  );
}

export default Body;
