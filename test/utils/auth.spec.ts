import { roleToAccesValue, getAccessValue } from "../../utils/auth";
import { cpz } from "../../@types";

describe("Test 'auth' utils", () => {
  describe("Test 'roleToAccesValue'", () => {
    it("Should return correct value for anonymous role", () => {
      const result = roleToAccesValue(cpz.UserRoles.anonymous);
      expect(result).toBe(20);
    });
    it("Should return correct value for user role", () => {
      const result = roleToAccesValue(cpz.UserRoles.user);
      expect(result).toBe(15);
    });
    it("Should return correct value for vip role", () => {
      const result = roleToAccesValue(cpz.UserRoles.vip);
      expect(result).toBe(10);
    });
    it("Should return correct value for admin role", () => {
      const result = roleToAccesValue(cpz.UserRoles.admin);
      expect(result).toBe(5);
    });
  });
  describe("Test 'getAccessValue'", () => {
    it("Should return correct value for anonymous role", () => {
      const result = getAccessValue({
        roles: {
          allowedRoles: [cpz.UserRoles.anonymous]
        }
      });
      expect(result).toBe(20);
    });
    it("Should return correct value for user role", () => {
      const result = getAccessValue({
        roles: {
          allowedRoles: [cpz.UserRoles.user]
        }
      });
      expect(result).toBe(15);
    });
    it("Should return correct value for user and vip role", () => {
      const result = getAccessValue({
        roles: {
          allowedRoles: [cpz.UserRoles.user, cpz.UserRoles.vip]
        }
      });
      expect(result).toBe(10);
    });
    it("Should return correct value for user and admin role", () => {
      const result = getAccessValue({
        roles: {
          allowedRoles: [cpz.UserRoles.user, cpz.UserRoles.admin]
        }
      });
      expect(result).toBe(5);
    });
  });
});
