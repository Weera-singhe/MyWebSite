import express from "express";
import fs from "fs";

//import { customersArr } from "./public/data/customers.json";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 1999;

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", {});
  //console.log(customersArr);
});

app.get("/stock", (req, res) => {
  res.render("gts.ejs", {});
});

app.get("/qt", (req, res) => {
  res.render("qt.ejs", {});
});

app.post("/qt", (req, res) => {
  res.render("qt.ejs", {});
});

app.listen(port, () => {
  console.log("listening...");
});
