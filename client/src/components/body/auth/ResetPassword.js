import { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import { showErrorMessage, showSuccessMessage } from '../../utils/notification';
import { isTooShort, isMatch } from '../../utils/validation';

const initialState = {
  password: '',
  confirmPassword: '',
  error: '',
  success: ''
};

function ResetPassword() {
  const [data, setData] = useState(initialState);

  const { token } = useParams();

  const { password, confirmPassword, error, success } = data;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setData({ ...data, [name]: value, error: '', success: '' });
  };

  const handleResetPassword = async () => {
    if (isTooShort(password)) {
      return setData({
        ...data,
        error: 'Password must have at least 6 characters',
        success: ''
      });
    }
    if (!isMatch(password, confirmPassword)) {
      return setData({
        ...data,
        error: 'Passwords must match',
        success: ''
      });
    }
    try {
      const res = await axios.post(
        '/user/reset-password',
        { password },
        { headers: { Authorization: token } }
      );
      return setData({
        ...data,
        error: '',
        success: res.data.msg
      });
    } catch (err) {
      err.response.data.msg &&
        setData({ ...data, error: err.response.data.msg, success: '' });
    }
  };

  return (
    <div className="reset-password">
      <h2>Reset your password</h2>

      <div className="row">
        {error && showErrorMessage(error)}
        {success && showSuccessMessage(success)}

        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={handleInputChange}
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={confirmPassword}
          onChange={handleInputChange}
        />

        <button onClick={handleResetPassword}>Reset password</button>
      </div>
    </div>
  );
}

export default ResetPassword;
