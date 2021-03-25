import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

import {
  showErrorMessage,
  showSuccessMessage
} from './../../utils/notification';

function EditUser() {
  const { id } = useParams();
  const history = useHistory();

  const [editUser, setEditUser] = useState([]);
  const [checkAdmin, setCheckAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [num, setNum] = useState(0);

  const users = useSelector((state) => state.users);
  const token = useSelector((state) => state.token);

  useEffect(() => {
    if (users.length) {
      users.forEach((user) => {
        if (user._id === id) {
          setEditUser(user);
          setCheckAdmin(user.role === 1);
        }
      });
    } else {
      history.push('/profile');
    }
  }, [users, id, history]);

  const handleUpdate = async () => {
    try {
      if (num % 2 !== 0) {
        const res = await axios.patch(
          `/user/update-role/${editUser._id}`,
          {
            role: checkAdmin ? 1 : 0
          },
          {
            headers: {
              Authorization: token
            }
          }
        );
        setSuccess(res.data.msg);
        setNum(0);
      }
    } catch (err) {
      err.response.data.msg && setError(err.response.data.msg);
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const handleCheck = () => {
    setSuccess('');
    setError('');
    setCheckAdmin(!checkAdmin);
    setNum(num + 1);
  };

  return (
    <div className="profile-page edit-user">
      <div className="row">
        <button onClick={handleGoBack} className="go-back">
          <i className="fas fa-long-arrow-alt-left"></i> Go Back
        </button>
      </div>
      <div className="col-left">
        <h2>Edit User</h2>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            defaultValue={editUser.name}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            name="email"
            defaultValue={editUser.email}
            disabled
          />
        </div>
        <div className="form-group">
          <input
            type="checkbox"
            id="isAdmin"
            checked={checkAdmin}
            onChange={handleCheck}
          />
          <label htmlFor="isAdmin">isAdmin</label>
        </div>
        <button onClick={handleUpdate}>Update</button>

        {error && showErrorMessage(error)}
        {success && showSuccessMessage(success)}
      </div>
    </div>
  );
}

export default EditUser;
