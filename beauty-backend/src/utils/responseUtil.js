class ApiResponse {
  static success(data = null, msg = 'Success') {
    return {
      code: '000000',
      statusCode: 200,
      msg,
      data,
      timestamp: new Date().toFormat('YYYY-MM-DD HH24:MI:SS.MS')
    };
  }

  static error(statusCode = 500, code = 'A00001', msg = 'Internal Server Error') {
    return {
      code,
      statusCode,
      msg,
      data: null,
      timestamp: new Date().toFormat('YYYY-MM-DD HH24:MI:SS.MS')
    };
  }
}

module.exports = ApiResponse; 