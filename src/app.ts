import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./app/config";
import router from "./app/routes";
// import globalErrorHandler from "./app/middlewares/globalErrorhandler";
import globalErrorHandler from "./app/middlewares/globalErrorhandler";
import notFound from "./app/middlewares/notFound";


const app: Application = express();

app.use(express.json());
app.use(cookieParser());
// app.use(cors({ origin: [config.server_url as string] }));
app.use(cors({ origin: [config.client_url as string], credentials: true }));

app.use("/api/v1", router);

// @ts-ignore
app.use(globalErrorHandler);

// @ts-ignore
app.use(notFound);

export default app;
