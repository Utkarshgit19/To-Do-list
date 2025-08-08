import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

db.connect();

async function getList() {
  const result=await db.query("SELECT * FROM items");
  return result.rows;
}

app.get("/", async (req, res) => {
  const items=await getList();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add",async (req, res) => {
  const item = req.body.newItem;
  if(item.length>0){
    try{
      await db.query("INSERT INTO items (title) VALUES ($1);",[item]);
      res.redirect("/");
    }catch(err){
      console.log(err);
      res.redirect("/");
    }
  }
  else{
    res.redirect("/");
  }
});

app.post("/edit",async (req, res) => {
  const id=req.body.updatedItemId;
  const newTitle=req.body.updatedItemTitle;
  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = ($2);",[newTitle,id]);
    res.redirect("/");
  } catch (error) {
    console.log(err);
    res.redirect("/");
  }
});

app.post("/delete",async (req, res) => {
  const id=req.body.deleteItemId;
  try{
    await db.query("DELETE FROM items WHERE id=($1);",[id]);
    res.redirect("/");
  }
  catch(err){
    console.log(err);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
