import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "My API",
    description: "Desc",
  },
  host: "localhost:3000",
};

const outputFile = "./swagger-output1.json";
// const routes = [
//   "./routers/user.router.js",
//   "./routers/post.router.js",
//   "./routers/follower.router.js",
// ];
const routes = ["./index.js"];

swaggerAutogen(outputFile, routes, doc);
