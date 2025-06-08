import express from "express";
import fs from "fs";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { debug } from "console";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 1999;

const paperStockPath = __dirname + "/public/paperStock.json";
const paperPricePath = __dirname + "/public/paperPrice.json";
const paperDataPath = __dirname + "/public/paperData.json";

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "my",
  password: " ",
  port: 1234,
});
db.connect();

let def_on_price = 0;
let def_on_stock = 0;

function GetIdsNames() {
  return db
    .query(
      `SELECT p.id, p.gsm,t.type, p.size_h, p.size_w, b.brand, c.color
      FROM papers p JOIN types  t ON p.type_  = t.type_id
      JOIN brands b ON p.brand_ = b.brand_id JOIN colors c ON p.color_ = c.color_id`
    )
    .then((result) => {
      const ids = result.rows.map((i) => i.id);
      const names = result.rows.map(
        (i) =>
          `${i.type} ${i.gsm}gsm ${i.size_h}x${i.size_w} ${i.brand} ${i.color}`
      );
      return { ids, names };
    });
}

app.get("/", (req, res) => res.render("index.ejs"));

app.get("/papers", async (req, res) => {
  const result = await db.query(`SELECT json_build_object(
    'types',  (SELECT array_agg(type)  FROM types),
    'colors', (SELECT array_agg(color) FROM colors),
   'brands', (SELECT array_agg(brand) FROM brands),
   'units', (SELECT array_agg(unit) FROM units)) AS result;`);
  const data = result.rows[0].result;
  const { ids, names } = await GetIdsNames();
  res.render("papers.ejs", { data, names });
});

app.post("/add_new_paper", async (req, res) => {
  try {
    let { type, color, brand, gsm, sizeH, sizeW, id, unitVal, unit } = req.body;
    await db.query("INSERT INTO papers VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [
      id,
      +type,
      +color,
      +gsm,
      +sizeH,
      +sizeW,
      +brand,
      +unitVal,
      +unit,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("DB Error:", err.message);
    if (err.code === "23505") {
      res.json({ success: false, message: "This paper already exists." });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

app.get("/price", async (req, res) => {
  const { ids, names } = await GetIdsNames();
  const result = await db.query(
    `SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date,price
    FROM paper_price JOIN papers ON papers.id = paper_price.price_id
    where price_id = $1 ORDER BY date ASC; `,
    [ids[def_on_price]]
  );
  res.render("paper_price.ejs", {
    ids,
    names,
    recs: result.rows,
    def: def_on_price,
  });
});

app.post("/def_on_price_x", (req, res) => {
  def_on_price = Number(req.body.data);
  res.sendStatus(200);
});

app.post("/rec_price", async (req, res) => {
  const { id, date, price } = req.body;
  try {
    await db.query(
      "INSERT INTO paper_price (price_id, date, price)VALUES ($1,$2,$3)",
      [id, date, +price]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("Error inserting price:", err.message);
    res.sendStatus(500);
  }
});
app.get("/stock", (req, res) => {
  const stockRecs = JSON.parse(fs.readFileSync(paperStockPath, "utf8"));
  res.render("paperStock.ejs", {
    stockRecs,
    slctPprHtml: GenAllPprHtml(),
    units: GetPprUnits(),
  });
});

app.get("/qt", (req, res) => {
  res.render("qt.ejs", { slctPprHtml: GenAllPprHtml() });
});

app.post("/qt", (req, res) => res.redirect("/qt"));

app.post("/recStock", (req, res) => {
  const { dt, des, diff, slctPaperId } = req.body;

  try {
    const json = fs.readFileSync(paperStockPath, "utf8");
    const items = JSON.parse(json);

    items[slctPaperId].push({ dt, des, diff: +diff });
    items[slctPaperId].sort((a, b) => new Date(a.dt) - new Date(b.dt));

    fs.writeFileSync(paperStockPath, JSON.stringify(items, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Stock error:", err);
    res.status(500).json({ success: false });
  }
});

function GenAllPprHtml() {
  const pr = JSON.parse(fs.readFileSync(paperPricePath, "utf8"));
  const pj = JSON.parse(fs.readFileSync(paperDataPath, "utf8"));
  return pj.weHave
    .map(
      (p) =>
        `<option data-pr='${pr[p.id][0]?.price}'data-id='${p.id}' data-un='${
          p.units
        }'>${pj.types[p.type]} ${pj.colors[p.color]} ${p.sizeH}x${p.sizeW} ${
          p.gsm
        }gsm ${pj.brands[p.brand]}</option>`
    )
    .join("");
}
function GetPprUnits() {
  const pj = JSON.parse(fs.readFileSync(paperDataPath, "utf8"));
  return pj.units;
}

app.listen(port, () => console.log("listening.."));
