// response를 위한 공통 응답
const handleSuccess = (res, statusCode, message, data = {}) => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

const handleError = (res, message, error) => {
  res.status(500).json({
    success: false,
    statusCode,
    message,
    error: error.message,
  });
};

module.exports = { handleSuccess, handleError };
