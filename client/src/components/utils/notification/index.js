import './notification.scss';

export const showErrorMessage = (msg) => {
  return <div className="error-message">{msg}</div>;
};

export const showSuccessMessage = (msg) => {
  return <div className="success-message">{msg}</div>;
};
