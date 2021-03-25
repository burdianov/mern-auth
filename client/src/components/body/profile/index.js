import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { isTooShort, isMatch } from '../../utils/validation';
import { showErrorMessage, showSuccessMessage } from '../../utils/notification';
import {
  fetchAllUsers,
  dispatchGetAllUsers
} from '../../../redux/actions/usersAction';

const initialState = {
  name: '',
  password: '',
  confirmPassword: '',
  error: '',
  success: ''
};

function Profile() {
  const auth = useSelector((state) => state.auth);
  const token = useSelector((state) => state.token);
  const users = useSelector((state) => state.users);

  const [data, setData] = useState(initialState);
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [callback, setCallback] = useState(false);

  const { user, isAdmin } = auth;
  const { name, password, confirmPassword, error, success } = data;

  const dispatch = useDispatch();

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers(token).then((res) => {
        dispatch(dispatchGetAllUsers(res));
      });
    }
  }, [isAdmin, token, dispatch, callback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value, error: '', success: '' });
  };

  const updateInfo = () => {
    try {
      axios.patch(
        '/user/update',
        {
          name: name ? name : user.name,
          avatar: avatar ? avatar : user.avatar
        },
        { headers: { Authorization: token } }
      );
      setData({ ...data, error: '', success: 'Updated success' });
    } catch (err) {
      setData({ ...data, error: err.response.data.msg, success: '' });
    }
  };

  const updatePassword = () => {
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
      axios.post(
        '/user/reset-password',
        {
          password
        },
        { headers: { Authorization: token } }
      );
      setData({ ...data, error: '', success: 'Updated success' });
    } catch (err) {
      setData({ ...data, error: err.response.data.msg, success: '' });
    }
  };

  const handleUpdate = () => {
    if (name || avatar) {
      updateInfo();
    }
    if (password) {
      updatePassword();
    }
  };

  const changeAvatar = async (e) => {
    e.preventDefault();
    try {
      const file = e.target.files[0];
      if (!file) {
        return setData({
          ...data,
          error: 'No file was uploaded',
          success: ''
        });
      }
      if (file.size > 1024 * 1024) {
        return setData({
          ...data,
          error: 'Size too large',
          success: ''
        });
      }
      if (
        file.type !== 'image/jpeg' &&
        file.type !== 'image/jpg' &&
        file.type !== 'image/png'
      ) {
        return setData({
          ...data,
          error: 'Incorrect file format',
          success: ''
        });
      }
      let formData = new FormData();
      formData.append('file', file);

      setLoading(true);

      const res = await axios.post('api/upload-avatar', formData, {
        headers: {
          'content-type': 'multipart/form-data',
          Authorization: token
        }
      });
      setLoading(false);
      setAvatar(res.data.url);
    } catch (err) {
      setData({ ...data, error: err.response.data.msg, success: '' });
    }
  };

  const handleDelete = async (id) => {
    try {
      if (user._id !== id) {
        if (window.confirm('Are you sure you want to delete this account?')) {
          setLoading(true);
          await axios.delete(`/user/delete/${id}`, {
            headers: {
              Authorization: token
            }
          });
          setLoading(false);
          setCallback(!callback);
        }
      }
    } catch (err) {
      setData({ ...data, error: err.response.data.msg, success: '' });
    }
  };

  return (
    <>
      <div>{error && showErrorMessage(error)}</div>
      <div>{success && showSuccessMessage(success)}</div>
      <div>{loading && <h3>Loading...</h3>}</div>
      <div className="profile-page">
        <div className="col-left">
          <h2>{isAdmin ? 'Admin Profile' : 'User Profile'}</h2>
          <div className="avatar">
            <img src={avatar ? avatar : user.avatar} alt="" />
            <span>
              <i className="fas fa-camera"></i>
              <p>Change</p>
              <input
                type="file"
                name="fileUpload"
                id="fileUpload"
                onChange={changeAvatar}
              />
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={user.name}
              placeholder="Your name"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              id="email"
              defaultValue={user.email}
              placeholder="Your email address"
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">New password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Your password"
              value={password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div>
            <em style={{ color: 'crimson', fontSize: '10px' }}>
              * If you update your password here, you will not be able to login
              quickly using Google and Facebook
            </em>
          </div>
          <button disabled={loading} onClick={handleUpdate}>
            Update
          </button>
        </div>
        <div className="col-right">
          <h2>{isAdmin ? 'Users' : 'My Orders'}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="customers">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Admin</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td style={{ textAlign: 'center' }}>
                      {user.role === 1 ? (
                        <i className="fas fa-check" title="Admin"></i>
                      ) : (
                        <i className="fas fa-times" title="User"></i>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link to={`/edit-user/${user._id}`}>
                        <i className="fas fa-edit" title="Edit"></i>
                      </Link>
                      <i
                        className="fas fa-trash-alt"
                        title="Remove"
                        onClick={() => handleDelete(user._id)}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
