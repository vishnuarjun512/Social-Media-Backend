import jwt from "jsonwebtoken";

const getTokenData = async (req) => {
  const token = req.cookies.auth_token;
  const data = jwt.verify(token, process.env.JWT_SECRET);
  return data;
};

export default getTokenData;
