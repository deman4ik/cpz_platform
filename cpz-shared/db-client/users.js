import ServiceError from "../error";
import DB from "./index";

async function createUser(id, email, pwdhash, code) {
  let request;
  let createdUser;
  const query = `mutation createUser($user: [cpz_userlist_insert_input!]!) {
  insert_cpz_userlist(objects: $user) {
    returning {
      id
      email
    }
  }
}`;
  const variables = {
    user: [
      {
        id,
        email,
        pwdhash,
        reg_code: code.toString(),
        status: 2,
        userroles: { data: { role_id: "user" } }
      }
    ]
  };
  try {
    request = await DB.client.request(query, variables);
    createdUser = {
      id: request.insert_cpz_userlist.returning[0].id,
      email: request.insert_cpz_userlist.returning[0].email
    };
    return createdUser;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to create User in DB"
    );
  }
}

async function findUserByEmail(email) {
  let request;
  let user;
  const query = `query findUserByEmail($email: String!) {
  cpz_userlist(
  where: {email :{_eq: $email}}
  )
  {
  id
  email
  status
  pwdhash
  bad_login_count
  userroles{
  role_id
  }
  }
}`;
  try {
    request = await DB.client.request(query, { email });
    if (request.cpz_userlist.length) {
      user = {
        id: request.cpz_userlist[0].id,
        refresh_tokens: request.cpz_userlist[0].refresh_tokens,
        email: request.cpz_userlist[0].email,
        status: request.cpz_userlist[0].status,
        pwdhash: request.cpz_userlist[0].pwdhash,
        bad_login_count: request.cpz_userlist[0].bad_login_count,
        role: request.cpz_userlist[0].userroles[0].role_id
      };
    }
    return user;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to find User by email in DB"
    );
  }
}

async function findUserByCode(id, code) {
  let request;
  let user;
  const query = `query findUserByCode($id: uuid $code: String){
  cpz_userlist(
  where: {id : {_eq: $id} reg_code: {_eq: $code}}) 
  {
  id
  refresh_tokens
  email
  reg_code
  bad_regcode_count
  userroles{
        role_id
      }
  }}`;
  try {
    request = await DB.client.request(query, { id, code });
    if (request.cpz_userlist.length) {
      user = {
        id: request.cpz_userlist[0].id,
        refresh_tokens: request.cpz_userlist[0].refresh_tokens,
        email: request.cpz_userlist[0].email,
        reg_code: request.cpz_userlist[0].reg_code,
        bad_regcode_count: request.cpz_userlist[0].bad_regcode_count,
        role: request.cpz_userlist[0].userroles[0].role_id
      };
    }
    return user;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to find User by code in DB"
    );
  }
}

async function findUserById(id) {
  let request;
  let user;
  const query = `query findUserById($id: uuid) {
  cpz_userlist(
  where: {id : {_eq: $id}}) 
  {
  id
  refresh_tokens 
  email
  userroles{
        role_id
      }
  }} `;
  try {
    request = await DB.client.request(query, { id });
    if (request.cpz_userlist.length) {
      user = {
        id: request.cpz_userlist[0].id,
        refresh_tokens: request.cpz_userlist[0].refresh_tokens,
        email: request.cpz_userlist[0].email,
        role: request.cpz_userlist[0].userroles[0].role_id
      };
    }
    return user;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to find User by id in DB"
    );
  }
}

async function updateRefreshToken(id, token) {
  let request;
  let updatedToken;
  const query = `mutation updateRefreshToken($id: uuid $token: String) {
  update_cpz_userlist(
  where: {id : {_eq: $id}},
  _set: { 
    refresh_tokens: $token
    bad_login_count: 0
  })
  {
   affected_rows
   returning {
   id
   refresh_tokens
  }}}`;
  try {
    request = await DB.client.request(query, { id, token });
    if (request.update_cpz_userlist.length) {
      updatedToken = request.update_cpz_userlist[0].refreshToken;
    }
    return updatedToken;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to update refreshToken in DB"
    );
  }
}

async function finalizeRegistration(id, token) {
  let request;
  let updatedToken;
  const query = `mutation updateUserRegFin($id: uuid $token: String) {
  update_cpz_userlist(
  where: {id : {_eq: $id}},
  _set: { 
    refresh_tokens: $token
    status: 1
    reg_code: ""
    bad_regcode_count: 0
  })
  {
   affected_rows
   returning {
   id
   refresh_tokens
  }}}`;
  try {
    request = await DB.client.request(query, { id, token });
    if (request.update_cpz_userlist.length) {
      updatedToken = request.update_cpz_userlist[0].refreshToken;
    }
    return updatedToken;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to update refreshToken in DB"
    );
  }
}

async function setCode(id, code) {
  const query = `mutation updateUserRegCode($id: uuid $code: String) {
  update_cpz_userlist(
  where: {id : {_eq: $id}},
  _set: {
    reg_code: $code
  })
  {
   affected_rows
   returning {
   id
   refresh_tokens
  }}}`;
  try {
    await DB.client.request(query, { id, code });
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to update code in DB"
    );
  }
}

async function updateRegCodeCount(id, value) {
  const query = `mutation updateUserRegCodeCount($id: uuid, $value: Int) {
  update_cpz_userlist(
    where: { id: { _eq: $id } }
    _inc: { bad_regcode_count: $value }
  ) {
    affected_rows
  }
}`;
  try {
    await DB.client.request(query, { id, value });
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to update RegCodeCount in DB"
    );
  }
}

async function updateLoginCount(id, value) {
  const query = `mutation updateUserLoginCount($id: uuid, $value: Int) {
  update_cpz_userlist(
    where: { id: { _eq: $id } }
    _inc: { bad_login_count: $value }
  ) {
    affected_rows
  }
}`;
  try {
    await DB.client.request(query, { id, value });
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to update LoginCount in DB"
    );
  }
}

async function blockUser(id) {
  const query = `mutation blockUser($id: uuid) {
  update_cpz_userlist(
    where: { id: { _eq: $id } }
    _set: { status: 0}
  ) {
    affected_rows
  }
}`;
  try {
    await DB.client.request(query, { id });
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to update LoginCount in DB"
    );
  }
}

async function setNewPass(id, password) {
  const query = `mutation updateUserPass($id: uuid, $password: String) {
  update_cpz_userlist(
    where: { id: { _eq: $id } }
    _set: { pwdhash: $password}
  ) {
    affected_rows
  }
}`;
  try {
    await DB.client.request(query, { id, password });
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to update password in DB"
    );
  }
}

async function deleteRefreshToken(id) {
  let request;
  let success = false;
  const query = `mutation updateUserRefreshToken($id: String) {
  update_cpz_userlist(
  where: {id : {_eq: $id}, 
  _set: {
  refreshTokens: ""
  ) {
   affected_rows
   returning {
   id
   refreshTokens
   }
  }
  } `;
  try {
    request = await DB.client.request(query, { id });
    if (request.cpz_userlist.length) {
      success = true;
    }
    return success;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to delete refreshToken in DB"
    );
  }
}

export {
  findUserByEmail,
  createUser,
  finalizeRegistration,
  findUserByCode,
  updateRefreshToken,
  findUserById,
  deleteRefreshToken,
  updateRegCodeCount,
  blockUser,
  updateLoginCount,
  setCode,
  setNewPass
};
