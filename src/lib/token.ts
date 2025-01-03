import jwt from "jsonwebtoken";

export const verifyJWT = async (token: string): Promise<{ userId: string }> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
