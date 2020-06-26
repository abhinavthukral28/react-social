const isEmpty = (string) => {
  return string.trim() === "" ? true : false;
};
const isEmail = (email) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(emailRegEx);
};
exports.validateSignUpData = (newUser) => {
  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = "Email is empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Not a valid email";
  }
  if (isEmpty(newUser.password)) {
    errors.password = "Password is empty";
  } else if (newUser.password !== newUser.confirmedPassword) {
    errors.confirmPassword = "passwords do not match";
  }
  if (isEmpty(newUser.handle)) {
    errors.handle = "Handle is empty";
  }
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateLogin = (userData) => {
  let errors = {};
  if (isEmpty(user.email)) errors.email = "Email cannot be empty";
  else if (!isEmail(user.email)) errors.email = "Invalid Email";
  if (isEmpty(user.password)) errors.password = "Password cannot be empty";
  return {
    valid: Object.keys(errors).length === 0 ? true : false,
    errors,
  };
};
