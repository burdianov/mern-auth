import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login';

import { showErrorMessage, showSuccessMessage } from '../../utils/notification';

import { dispatchLogin } from './../../../redux/actions/authAction';

const initialState = {
  email: '',
  password: '',
  error: '',
  success: ''
};

function Login() {
  const [user, setUser] = useState(initialState);

  const dispatch = useDispatch();
  const history = useHistory();

  const { email, password, error, success } = user;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value, error: '', success: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('/user/login', { email, password });
      setUser({
        ...user,
        error: '',
        success: res.data.msg
      });
      localStorage.setItem('firstLogin', true);
      dispatch(dispatchLogin());
      history.push('/');
    } catch (err) {
      err.response.data.msg &&
        setUser({
          ...user,
          error: err.response.data.msg,
          success: ''
        });
    }
  };

  const responseGoogle = async (response) => {
    try {
      const res = await axios.post('/user/google-login', {
        tokenId: response.tokenId
      });
      setUser({
        ...user,
        error: '',
        success: res.data.msg
      });
      localStorage.setItem('firstLogin', true);

      dispatch(dispatchLogin());
      history.push('/');
    } catch (err) {
      err.response.data.msg &&
        setUser({
          ...user,
          error: err.response.data.msg,
          success: ''
        });
    }
  };

  const responseFacebook = async (response) => {
    try {
      const { accessToken, userID } = response;

      const res = await axios.post('/user/facebook-login', {
        accessToken,
        userID
      });
      setUser({
        ...user,
        error: '',
        success: res.data.msg
      });
      localStorage.setItem('firstLogin', true);

      dispatch(dispatchLogin());
      history.push('/');
    } catch (err) {
      err.response.data.msg &&
        setUser({
          ...user,
          error: err.response.data.msg,
          success: ''
        });
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      {error && showErrorMessage(error)}
      {success && showSuccessMessage(success)}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email Address</label>
          <input
            type="text"
            placeholder="Enter email address"
            id="email"
            name="email"
            value={email}
            onChange={handleChangeInput}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            id="password"
            name="password"
            value={password}
            onChange={handleChangeInput}
          />
        </div>
        <div className="row">
          <button type="submit">Login</button>
          <Link to="/forgot-password">Forgot your password?</Link>
        </div>
      </form>

      <div className="hr">or login with</div>
      <div className="social">
        <GoogleLogin
          clientId="630666570299-a1e5njrsvb2mj883qnv6tnh4jla1bo89.apps.googleusercontent.com"
          buttonText="Login with Google"
          onSuccess={responseGoogle}
          cookiePolicy={'single_host_origin'}
        />
        <FacebookLogin
          appId="521722385476531"
          autoLoad={false}
          fields="name,email,picture"
          callback={responseFacebook}
        />
      </div>

      <p>
        Not yet registered? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;
