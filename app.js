import express, { json, urlencoded } from "express";
import bodyParser from "body-parser";

const app = express();
import { config } from "dotenv";
config({ path: "./.env" });
import "./utils/db_connection.js";
const PORT = process.env.PORT;
import cors from "cors";
import {swaggerUi } from "./utils/swagger.js";
import { corsFunction } from "./utils/cors.js";
import production from "./utils/production.js";
import authenticate from './middlewares/auth.middleware.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const swaggerJson = require("./swagger.json");

//routes
import userRoutes from "./routes/user.routes.js";


app.use(cors());
app.use(corsFunction);
app.use(bodyParser.json({limit: "50mb"}))
app.use(bodyParser.urlencoded({limit: "50mb", extended: true}))
production(app);

app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerJson));
app.use(userRoutes);


app.listen(process.env.PORT || PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
