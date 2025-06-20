import express from "express";
import fs from "fs";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { debug } from "console";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 1999;

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "my",
  password: "123456",
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
      JOIN brands b ON p.brand_ = b.brand_id JOIN colors c ON p.color_ = c.color_id
      ORDER BY p.id ASC`
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
function GetUnits() {
  return db
    .query(
      `SELECT p.unit_val, u.unit FROM papers p 
      JOIN units  u ON p.unit_  = u.unit_id ORDER BY p.id ASC`
    )
    .then((result) => {
      const unit_vals = result.rows.map((i) => i.unit_val);
      const units = result.rows.map((i) => i.unit);
      return { unit_vals, units };
    });
}
function GetPrices() {
  return db
    .query(
      `SELECT pp.price FROM papers p LEFT JOIN (SELECT DISTINCT ON (price_id)
      price_id,price FROM paper_price ORDER BY price_id, date DESC)
      pp ON p.id = pp.price_id ORDER BY p.id ASC;`
    )
    .then((result) => {
      const prices = result.rows.map((i) => i.price);
      return { prices };
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
  /*const resss = await db.query(
    "SELECT date,change  FROM public.paper_stock where stock_id = '001010800880010006'"
  );
  console.log(resss.rows);*/
  GetPrices();

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

app.get("/stock", async (req, res) => {
  const { ids, names } = await GetIdsNames();
  const { unit_vals, units } = await GetUnits();
  const result = await db.query(
    `SELECT TO_CHAR(paper_stock.date, 'YYYY-MM-DD') AS date,des,change
    FROM paper_stock JOIN papers ON papers.id = paper_stock.stock_id
    where stock_id = $1 ORDER BY paper_stock.date ASC; `,
    [ids[def_on_stock]]
  );
  res.render("paper_stock.ejs", {
    ids,
    names,
    recs: result.rows,
    def: def_on_stock,
    def_unit_val: unit_vals[def_on_stock],
    def_unit: units[def_on_stock],
  });
});
app.post("/def_on_stk_x", (req, res) => {
  def_on_stock = Number(req.body.data);
  res.sendStatus(200);
});

app.post("/rec_stock", async (req, res) => {
  const { id, date, des, change } = req.body;
  try {
    await db.query(
      "INSERT INTO paper_stock (stock_id, date,des, change)VALUES ($1,$2,$3,$4)",
      [id, date, des, Number(change)]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("Error inserting price:", err.message);
    res.sendStatus(500);
  }
});

app.get("/qt", async (req, res) => {
  const { ids, names } = await GetIdsNames();
  const { unit_vals, units } = await GetUnits();
  const { prices } = await GetPrices();
  res.render("qt.ejs", {
    names,
    unit_vals,
    units,
    prices,
  });
});

app.post("/qt", (req, res) => res.redirect("/qt"));

app.listen(port, () => console.log("listening.."));
