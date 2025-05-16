import express from "express";
import fs from "fs";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const allPapersPath = __dirname + "/public/allpapers.json";

const app = express();
const port = 1999;

app.use(express.json());
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", {});
});

app.get("/stock", (req, res) => {
  const allPapersJson = JSON.parse(fs.readFileSync(allPapersPath, "utf8"));
  res.render("gts.ejs", { allPapers: allPapersJson });
});

app.get("/qt", (req, res) => {
  const allPapersJson = JSON.parse(fs.readFileSync(allPapersPath, "utf8"));
  res.render("qt.ejs", { allPapers: allPapersJson });
});

app.post("/qt", (req, res) => {
  const allPapersJson = JSON.parse(fs.readFileSync(allPapersPath, "utf8"));
  res.render("qt.ejs", { allPapers: allPapersJson });
});
app.post("/additemx", (req, res) => {
  const { name, gsm, sizeH, sizeW, brand, stock, price } = req.body;

  fs.readFile(allPapersPath, "utf8", (err, json) => {
    if (err) {
      console.error("Error reading file: " + err);
      return;
    }

    let items = JSON.parse(json);
    items.push({ name, gsm, sizeH, sizeW, brand, stock, price });

    fs.writeFile(allPapersPath, JSON.stringify(items, null, 2), (err) => {
      if (err) {
        console.error("Error writing file: " + err);
        return;
      }
      res.json({ success: true });
    });
  });
});

app.listen(port, () => {
  console.log("listening... on port 1999");
});
