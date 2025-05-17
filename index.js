import express from "express";
import fs from "fs";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const StockRecordsPath = __dirname + "/public/stockRecords.json";
const paperDataPath = __dirname + "/public/paperData.json";

const app = express();
const port = 1999;

app.use(express.json());
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", {});
});

app.get("/papers", (req, res) => {
  const paperDataJson = JSON.parse(fs.readFileSync(paperDataPath, "utf8"));
  res.render("papers.ejs", { data: paperDataJson });
});
app.get("/stock", (req, res) => {
  const StockRecordsJson = JSON.parse(
    fs.readFileSync(StockRecordsPath, "utf8")
  );
  res.render("stock.ejs", { stockRecs: StockRecordsJson });
});

app.get("/qt", (req, res) => {
  const pj = JSON.parse(fs.readFileSync(paperDataPath, "utf8"));
  const apj = pj.weHave;
  var slctPprHtml = "";
  for (let i = 0; i < apj.length; i++) {
    slctPprHtml += `<option data-num='${apj[i].price}'>${
      pj.types[apj[i].type]
    } ${apj[i].sizeH}x${apj[i].sizeW} ${apj[i].gsm}gsm ${
      pj.brands[apj[i].brand]
    }</option>`;
  }
  res.render("qt.ejs", { slctPprHtml });
});

app.post("/qt", (req, res) => {
  res.redirect("/qt");
});
app.post("/recStock", (req, res) => {
  const { dtSTK, desSTK, chngSTK, dirSTK } = req.body;

  fs.readFile(StockRecordsPath, "utf8", (err, json) => {
    if (err) {
      console.error("Error reading file: " + err);
      return;
    }
    console.log(dtSTK);

    let items = JSON.parse(json);
    items.push({ dtSTK, desSTK, chngSTK, dirSTK });
    items.sort((a, b) => new Date(a.dtSTK) - new Date(b.dtSTK));

    fs.writeFile(StockRecordsPath, JSON.stringify(items, null, 2), (err) => {
      if (err) {
        console.error("Error writing file: " + err);
        return;
      }
      res.json({ success: true });
    });
  });
});
app.post("/additemx", (req, res) => {
  let { type, gsm, sizeH, sizeW, brand, price, id } = req.body;
  type = Number(type);
  brand = Number(brand);

  fs.readFile(paperDataPath, "utf8", (err, json) => {
    if (err) {
      console.error("Error reading file: " + err);
      return;
    }

    let items = JSON.parse(json);
    items.weHave.push({ type, gsm, sizeH, sizeW, brand, price, id });

    fs.writeFile(paperDataPath, JSON.stringify(items, null, 2), (err) => {
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
