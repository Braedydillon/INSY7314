import app from "./app.js";
import config from "./config/env.js";

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});