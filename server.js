import app from "./index.js";
import DBconnect from "./db/dbConnection.js";

DBconnect();

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running at - http://localhost:${port}`);
  console.log(`Documentation running at - http://localhost:${port}/api-docs`);
});
