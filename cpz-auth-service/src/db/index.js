const users = [
  {
    id: 1,
    email: "test1@email.ru",
    status: "pending",
    password: "123456",
    refreshToken: null
  },
  {
    id: 2,
    email: "test2@email.ru",
    password: "654321",
    status: "verified",
    refreshToken: null
  }
];
// DB METHOD
const findUserByEmail = email => {
  let user;
  const result = users.filter(u => u.email === email);
  if (result.length) user = [result];
  return user;
};

const isUserExist = email => {
  let decision = false;
  const result = users.filter(u => u.email === email);
  if (result.length) decision = true;
  return decision;
};

const addNewUser = async (email, pass, code) => {
  const id = Math.floor(Math.random() * (3 - 100)) + 3;
  const user = {
    id, // uniq Id
    email,
    password: pass,
    status: "pending",
    registrationCode: code
  };
  users.push(user);
  return user;
};

const updateRefreshToken = (userId, token) => {
  let result = false;
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].refreshToken = token;
    result = true;
  } else {
    console.error("Can't find user by id");
  }
  return result;
};

export { findUserByEmail, isUserExist, addNewUser, updateRefreshToken };
