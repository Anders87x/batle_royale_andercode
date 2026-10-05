const path = require("path");
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const CLIENT_PATH = path.join(__dirname, "..", "client");

app.get("/", (_req, res) => {
  res.sendFile(path.join(CLIENT_PATH, "index.html"));
});

app.use(express.static(CLIENT_PATH));

app.listen(PORT, () => {
  console.log(`AnderCode Battle Royale ejecutándose en http://localhost:${PORT}`);
});
