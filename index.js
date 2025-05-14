import express from "express";
import fs from "fs";

//import { customersArr } from "./public/data/customers.json";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const allPaperPath = "./public/allpapers.json";

const app = express();
const port = 1999;

app.use(express.json());
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", {});
});

app.get("/stock", (req, res) => {
  const allpprs = JSON.parse(fs.readFileSync(allPaperPath, "utf8"));
  res.render("gts.ejs", { allpprs });
});

app.get("/qt", (req, res) => {
  res.render("qt.ejs", {});
});

app.post("/qt", (req, res) => {
  res.render("qt.ejs", {});
});
app.post("/additemx", (req, res) => {
  const { name, price } = req.body;

  fs.readFile(allPaperPath, "utf8", (err, json) => {
    if (err) return res.json({ success: false });

    let items = JSON.parse(json);
    items.push({ name, price });

    fs.writeFile(allPaperPath, JSON.stringify(items, null, 2), (err) => {
      if (err) return res.json({ success: false });
      res.json({ success: true });
    });
  });
});

app.listen(port, () => {
  console.log("listening...");
});
