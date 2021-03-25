import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { showErrorMessage, showSuccessMessage } from '../../utils/notification';

function EmailActivation() {
  const { activation_token } = useParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (activation_token) {
      const activateEmail = async () => {
        try {
          const res = await axios.post('/user/activation', {
            activation_token
          });
          setSuccess(res.data.msg);
        } catch (err) {
          err.response.data.msg && setError(err.response.data.msg);
        }
      };
      activateEmail();
    }
  }, [activation_token]);

  return (
    <div className="active-page">
      {error && showErrorMessage(error)}
      {success && showSuccessMessage(success)}
    </div>
  );
}

export default EmailActivation;
