import fs from "fs";
import https from "https";
import app from "./app.js";
import config from "./config/env.js";


const options = {
  key: fs.readFileSync("./certs/key.pem"),
  cert: fs.readFileSync("./certs/cert.pem")
};

https.createServer(options, app).listen(config.PORT, () => {
  console.log(`Server is running securely on https://localhost:${config.PORT}`);
});