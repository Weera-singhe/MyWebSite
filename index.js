import express from "express";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 1999;

const paperStockPath = __dirname + "/public/paperStock.json";
const paperPricePath = __dirname + "/public/paperPrice.json";
const paperDataPath = __dirname + "/public/paperData.json";

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.render("index.ejs"));

app.get("/papers", (req, res) => {
  const data = JSON.parse(fs.readFileSync(paperDataPath, "utf8"));
  res.render("paper.ejs", { data });
});

app.get("/stock", (req, res) => {
  const stockRecs = JSON.parse(fs.readFileSync(paperStockPath, "utf8"));
  res.render("paperStock.ejs", {
    stockRecs,
    slctPprHtml: GenAllPprHtml(),
    units: GetPprUnits(),
  });
});

app.get("/price", (req, res) => {
  const paperPriceJson = JSON.parse(fs.readFileSync(paperPricePath, "utf8"));
  res.render("paperPrice.ejs", {
    paperPriceJson,
    slctPprHtml: GenAllPprHtml(),
    units: GetPprUnits(),
  });
});

app.get("/qt", (req, res) => {
  res.render("qt.ejs", { slctPprHtml: GenAllPprHtml() });
});

app.post("/qt", (req, res) => res.redirect("/qt"));

app.post("/recStock", (req, res) => {
  const { dtSTK, desSTK, chngSTK, dirSTK, slctPaperIdSTK } = req.body;

  try {
    const json = fs.readFileSync(paperStockPath, "utf8");
    const items = JSON.parse(json);

    items[slctPaperIdSTK].push({ dtSTK, desSTK, chngSTK, dirSTK });
    items[slctPaperIdSTK].sort((a, b) => new Date(a.dtSTK) - new Date(b.dtSTK));

    fs.writeFileSync(paperStockPath, JSON.stringify(items, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Stock error:", err);
    res.status(500).json({ success: false });
  }
});
app.post("/recPrice", (req, res) => {
  const { date, price, slctPaperIdPrice } = req.body;

  try {
    const json = fs.readFileSync(paperPricePath, "utf8");
    const items = JSON.parse(json);

    items[slctPaperIdPrice].push({ date, price });
    items[slctPaperIdPrice].sort((b, a) => new Date(a.date) - new Date(b.date));

    fs.writeFileSync(paperPricePath, JSON.stringify(items, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Stock error:", err);
    res.status(500).json({ success: false });
  }
});

app.post("/addNewPaper", (req, res) => {
  let { type, color, gsm, sizeH, sizeW, brand, units, id } = req.body;

  try {
    const paperData = JSON.parse(fs.readFileSync(paperDataPath, "utf8"));
    paperData.weHave.push({
      type: +type,
      color: +color,
      gsm,
      sizeH,
      sizeW,
      brand: +brand,
      units,
      id,
    });
    paperData.weHave.sort((a, b) => a.id.localeCompare(b.id));
    fs.writeFileSync(paperDataPath, JSON.stringify(paperData, null, 2));

    const stockData = JSON.parse(fs.readFileSync(paperStockPath, "utf8"));
    if (!stockData[id]) stockData[id] = [];
    fs.writeFileSync(paperStockPath, JSON.stringify(stockData, null, 2));

    const priceData = JSON.parse(fs.readFileSync(paperPricePath, "utf8"));
    if (!priceData[id]) priceData[id] = [];
    fs.writeFileSync(paperPricePath, JSON.stringify(priceData, null, 2));

    res.json({ success: true });
  } catch (err) {
    console.error("Add paper error:", err);
    res.status(500).json({ success: false });
  }
});

function GenAllPprHtml() {
  const pj = JSON.parse(fs.readFileSync(paperDataPath, "utf8"));
  return pj.weHave
    .map(
      (p) =>
        `<option data-p='99999' data-id='${p.id}' data-un='${p.units}'>${
          pj.types[p.type]
        } ${pj.colors[p.color]} ${p.sizeH}x${p.sizeW} ${p.gsm}gsm ${
          pj.brands[p.brand]
        }</option>`
    )
    .join("");
}
function GetPprUnits() {
  const pj = JSON.parse(fs.readFileSync(paperDataPath, "utf8"));
  return pj.units;
}

app.listen(port, () => console.log("listening.."));

////////////////////////////////////////////////
/*
app.post("/addNewPaper", (req, res) => {
  let { type, color, gsm, sizeH, sizeW, brand, units, id } = req.body;
  type = Number(type);
  color = Number(color);
  brand = Number(brand);

  fs.readFile(paperDataPath, "utf8", (err, paperJson) => {
    if (err) {
      console.error("Error reading paper data: " + err);
      return res.status(500).json({ success: false });
    }

    let papers = JSON.parse(paperJson);
    papers.weHave.push({ type, color, gsm, sizeH, sizeW, brand, units, id });
    papers.weHave.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

    fs.writeFile(paperDataPath, JSON.stringify(papers, null, 2), (err) => {
      if (err) {
        console.error("Error writing paper data: " + err);
        return res.status(500).json({ success: false });
      }

      fs.readFile(paperStockPath, "utf8", (err, stockJson) => {
        if (err) {
          console.error("Error reading stock records: " + err);
          return res.status(500).json({ success: false });
        }

        let stockItems = JSON.parse(stockJson);
        if (!stockItems[id]) {
          stockItems[id] = [];
        }

        fs.writeFile(
          paperStockPath,
          JSON.stringify(stockItems, null, 2),
          (err) => {
            if (err) {
              console.error("Error writing stock records: " + err);
              return res.status(500).json({ success: false });
            }
            res.json({ success: true });
          }
        );
      });
    });
  });
});
*/
