import "reflect-metadata";
import dotenv from "dotenv";
import { Pool } from "../src/apiBase/pool";
import { Environment } from "../src/helpers/Environment";
import { DBCreator } from "../src/apiBase/tools/DBCreator"

const init = async () => {
  dotenv.config();
  console.log("Connecting");
  Environment.init(process.env.APP_ENV as string);
  Pool.initPool();
  await DBCreator.init(["Links", "Pages"]);



  const tables: { title: string, file: string }[] = [
    { title: "Services", file: "services.mysql" },
    { title: "Playlists", file: "playlists.mysql" },
    { title: "Sermons", file: "sermons.mysql" },
  ];
  await initTables("StreamingLive", tables);
};

const initTables = async (displayName: string, tables: { title: string, file: string }[]) => {
  console.log("");
  console.log("SECTION: " + displayName);
  for (const table of tables) await DBCreator.runScript(table.title, "./tools/dbScripts/" + table.file, false);
}

init()
  .then(() => { console.log("Database Created"); process.exit(0); })
  .catch((ex) => {
    console.log(ex);
    console.log("Database not created due to errors");
    process.exit(0);
  });