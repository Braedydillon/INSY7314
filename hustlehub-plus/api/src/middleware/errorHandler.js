const MESSAGES = {
  400: 'The request could not be understood.',
  404: 'Not found.',
  413: 'The request body is too large.',
};

export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    req.log.error({ err }, 'Unhandled error');
  } else {
    req.log.warn({ error: { message: err.message, type: err.type } }, 'Request error');
  }

  res.status(status).json({
    error:
      MESSAGES[status] ||
      (status >= 500 ? 'Something went wrong' : 'The request could not be completed.'),
    requestId: req.id,
  });
}
