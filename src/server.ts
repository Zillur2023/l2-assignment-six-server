import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let server: Server;

// main().catch(err => console.log(err));

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    server = app.listen(config.port, () => {
      console.log(` app listening on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
