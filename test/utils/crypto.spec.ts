import dotenv from "dotenv";
dotenv.config();
import { encrypt, decrypt } from "../../utils/crypto";

describe("Test 'crypto' utils", () => {
  describe("Test 'encrypt' and 'decrypt", () => {
    it("Should encrypt and decrypt data", async () => {
      const userId = "a0d3c927-405e-4505-b001-4607e033678f";
      const data = "a56032f0-88ed-4193-8158-81432912517a";

      const encrypted = await encrypt(userId, data);
      console.log(encrypted);
      const decrypted = await decrypt(userId, encrypted);
      console.log(decrypted);
      expect(decrypted).toBe(data);
    });
  });
});
