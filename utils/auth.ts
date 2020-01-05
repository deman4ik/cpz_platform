import { cpz } from "../@types";

function roleToAccesValue(role: cpz.UserRoles) {
  switch (role) {
    case cpz.UserRoles.anonymous:
      return 20;
    case cpz.UserRoles.user:
      return 15;
    case cpz.UserRoles.vip:
      return 10;
    case cpz.UserRoles.admin:
      return 5;
    default:
      return 20;
  }
}

function getAccessValue(user: {
  roles: {
    allowedRoles: cpz.UserRoles[];
  };
}): number {
  const {
    roles: { allowedRoles }
  } = user;
  const accessValues = allowedRoles.map(role => roleToAccesValue(role));
  return Math.min(...accessValues);
}

export { roleToAccesValue, getAccessValue };
