const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validateResponse = (res, message, data) => {
    return res.status(400).json({
        success: false,
        message: String(message),
        data: data ?? {}
    })
  }

  
module.exports = {
    validateEmail,
    validateResponse
}