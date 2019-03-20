import bcrypt from "bcrypt";


const users = [
  {
    id: 1,
    email: "test1@email.ru",
    password: "123456",
    refreshToken: null
  },
  {
    id: 2,
    email: "test2@email.ru",
    password: "654321",
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

const addNewUser = async (email, pass) => {
  const passwordHash = await bcrypt.hash(pass, 10);
  const id = Math.floor(Math.random() * (3 - 100)) + 3
  users.push({
    id, // uniq Id
    email,
    password: passwordHash
  });
  return id;
};

export { findUserByEmail, isUserExist, addNewUser };
