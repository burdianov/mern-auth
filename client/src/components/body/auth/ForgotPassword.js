import { useState } from 'react';
import axios from 'axios';
import { isEmail } from '../../utils/validation';
import { showErrorMessage, showSuccessMessage } from '../../utils/notification';

const initialState = {
  email: '',
  error: '',
  success: ''
};

function ForgotPassword() {
  const [data, setData] = useState(initialState);

  const { email, error, success } = data;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setData({ ...data, [name]: value, error: '', success: '' });
  };

  const recoverPassword = async () => {
    if (!isEmail(email)) {
      setData({ ...data, error: 'Invalid email', success: '' });
      return;
    }
    try {
      const res = await axios.post('/user/forgot-password', { email });
      return setData({ ...data, error: '', success: res.data.msg });
    } catch (err) {
      err.response.data.msg &&
        setData({ ...data, error: err.response.data.msg, success: '' });
    }
  };

  return (
    <div className="forgot-password">
      <h2>Forgot your password?</h2>

      <div className="row">
        {error && showErrorMessage(error)}
        {success && showSuccessMessage(success)}

        <label htmlFor="email">Enter your email address</label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={handleInputChange}
        />
        <button onClick={recoverPassword}>Verify your email</button>
      </div>
    </div>
  );
}

export default ForgotPassword;
