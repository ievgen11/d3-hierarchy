const express = require("express");
const path = require("path");

const app = express();


app.use(express.static("./build"));
app.get("*", (req, res) => {
    res.sendFile(
        path.resolve(__dirname, ".", "build", "index.html")
    );
});

app.listen(process.env.PORT ? process.env.PORT : 3000, () => {
    console.log(
        `EXPRESS: Listening on PORT: ${
            process.env.PORT ? process.env.PORT : 3000
        }`
    );
});
