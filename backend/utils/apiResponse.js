const successResponse = (res, statusCode = 200, message = "Success", data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode = 500, message = "Error", error = null) => {
  const response = {
    success: false,
    message,
  };
  if (error && process.env.NODE_ENV !== "production") {
    response.error = error;
  }
  return res.status(statusCode).json(response);
};

module.exports = { successResponse, errorResponse };
