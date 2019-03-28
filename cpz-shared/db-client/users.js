import ServiceError from "cpz/error";

async function createUser(id, email, pwdhash, code) {
  let request;
  let createdUser;
  const query = `mutation insert_userlist($objects: [cpz_userlist_insert_input!]! ) {
  insert_cpz_userlist(objects: $objects) {
    returning {
      id
    }
  }
}`;
  const variables = {
    objects: [
      {
        id,
        email,
        pwdhash,
        reg_code: code.toString(),
        status: 2
      }
    ]
  };
  try {
    request = await this.client.request(query, variables);
    createdUser = {
      id: request.insert_cpz_userlist.returning[0].id,
      email: request.insert_cpz_userlist.returning[0].email
    };
    return createdUser;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
  const query = `query($email: String!) {
  cpz_userlist(
  where: {email :{_ilike: $email}}
  )
  {
  id
  email
  pwdhash
  bad_login_count
  }}`;
  try {
    request = await this.client.request(query, { email });
    if (request.cpz_userlist.length) {
      [user] = request.cpz_userlist;
    }
    return user;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
  const query = `query findByCode($id: uuid $code: String){
  cpz_userlist(
  where: {id : {_eq: $id} reg_code: {_eq: $code}}) 
  {
  id
  refresh_tokens
  email
  reg_code
  bad_regcode_count
  }}`;
  try {
    request = await this.client.request(query, { id, code });
    console.log("REQUEST", request);
    if (request.cpz_userlist.length) {
      [user] = request.cpz_userlist;
    }
    return user;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
  const query = `query findByCode($id: uuid) {
  cpz_userlist(
  where: {id : {_eq: $id}}) 
  {
  id
  refresh_tokens 
  email
  }} `;
  try {
    request = await this.client.request(query, { id });
    if (request.cpz_userlist.length) {
      [user] = request.cpz_userlist;
    }
    return user;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
  const query = `mutation update_userlist($id: uuid $token: String) {
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
    request = await this.client.request(query, { id, token });
    console.log("REQUEST", request);
    if (request.update_cpz_userlist.length) {
      updatedToken = request.update_cpz_userlist[0].refreshToken;
    }
    return updatedToken;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
  const query = `mutation update_userlist($id: uuid $token: String) {
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
    request = await this.client.request(query, { id, token });
    if (request.update_cpz_userlist.length) {
      updatedToken = request.update_cpz_userlist[0].refreshToken;
    }
    return updatedToken;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
  const query = `mutation update_userlist($id: uuid $code: String) {
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
    await this.client.request(query, { id, code });
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
  const query = `mutation update_userlist($id: uuid, $value: Int) {
  update_cpz_userlist(
    where: { id: { _eq: $id } }
    _inc: { bad_regcode_count: $value }
  ) {
    affected_rows
  }
}`;
  try {
    await this.client.request(query, { id, value });
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
  const query = `mutation update_userlist($id: uuid, $value: Int) {
  update_cpz_userlist(
    where: { id: { _eq: $id } }
    _inc: { bad_login_count: $value }
  ) {
    affected_rows
  }
}`;
  try {
    await this.client.request(query, { id, value });
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
  const query = `mutation update_userlist($id: uuid) {
  update_cpz_userlist(
    where: { id: { _eq: $id } }
    _set: { status: 0}
  ) {
    affected_rows
  }
}`;
  try {
    await this.client.request(query, { id });
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
  const query = `mutation update_userlist($id: uuid, $password: String) {
  update_cpz_userlist(
    where: { id: { _eq: $id } }
    _set: { pwdhash: $password}
  ) {
    affected_rows
  }
}`;
  try {
    await this.client.request(query, { id, password });
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
  const query = `mutation update_userlist($id: String) {
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
    request = await this.client.request(query, { id });
    if (request.cpz_userlist.length) {
      success = true;
    }
    return success;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
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
