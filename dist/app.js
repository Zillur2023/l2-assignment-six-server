"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("./app/config"));
const routes_1 = __importDefault(require("./app/routes"));
// import globalErrorHandler from "./app/middlewares/globalErrorhandler";
const globalErrorhandler_1 = __importDefault(require("./app/middlewares/globalErrorhandler"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// app.use(cors({ origin: [config.server_url as string] }));
app.use((0, cors_1.default)({ origin: [config_1.default.client_url], credentials: true }));
app.use("/api/v1", routes_1.default);
// @ts-ignore
app.use(globalErrorhandler_1.default);
// @ts-ignore
app.use(notFound_1.default);
exports.default = app;
