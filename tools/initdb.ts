
import dotenv from "dotenv";
import { Pool } from "../src/apiBase/pool";
import { DBCreator } from "../src/apiBase/tools/DBCreator"

const init = async () => {
  dotenv.config();
  console.log("Connecting");
  Pool.initPool();
  await DBCreator.init(["Links", "Pages"])
  await DBCreator.runScript("Services", "./dbScripts/services.mysql");
  await DBCreator.runScript("Settings", "./dbScripts/settings.mysql");
};

init()
  .then(() => { console.log("Database Created"); process.exit(0); })
  .catch((ex) => {
    console.log(ex);
    console.log("Database not created due to errors");
    process.exit(0);
  });
