import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { showErrorMessage, showSuccessMessage } from '../../utils/notification';

import { isEmpty, isEmail, isTooShort, isMatch } from '../../utils/validation';

const initialState = {
  name: '',
  email: '',
  password: '',
  confirm_password: '',
  error: '',
  success: ''
};

function Register() {
  const [user, setUser] = useState(initialState);

  const { name, email, password, confirm_password, error, success } = user;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value, error: '', success: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmpty(name) || isEmpty(password)) {
      return setUser({
        ...user,
        error: 'Fields cannot be empty',
        success: ''
      });
    }
    if (!isEmail(email)) {
      return setUser({
        ...user,
        error: 'Invalid email',
        success: ''
      });
    }
    if (isTooShort(password)) {
      return setUser({
        ...user,
        error: 'Password must have at least 6 characters',
        success: ''
      });
    }
    if (!isMatch(password, confirm_password)) {
      return setUser({
        ...user,
        error: 'Passwords must match',
        success: ''
      });
    }
    try {
      const res = await axios.post('/user/register', {
        name,
        email,
        password
      });
      setUser({
        ...user,
        error: '',
        success: res.data.msg
      });
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
      <h2>Register</h2>
      {error && showErrorMessage(error)}
      {success && showSuccessMessage(success)}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            id="name"
            name="name"
            value={name}
            onChange={handleChangeInput}
          />
        </div>
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
        <div>
          <label htmlFor="confirm_password">Confirm password</label>
          <input
            type="password"
            placeholder="Confirm password"
            id="confirm_password"
            name="confirm_password"
            value={confirm_password}
            onChange={handleChangeInput}
          />
        </div>
        <div className="row">
          <button type="submit">Register</button>
        </div>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;
