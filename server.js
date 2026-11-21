require("dotenv").config();
const app = require("./src/app");
const pool = require("./config/database");

const port = Number(process.env.PORT || 3000);

const server = app.listen(port, "0.0.0.0", () => {
    console.log(`ShopNest API listening on port ${port}`);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received; shutting down...");

    server.close(() => {
        process.exit(0);
    });
});