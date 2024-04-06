const express = require("express")
const cors = require("cors")
const { connect } = require("mongoose")
require("dotenv").config()
const upload = require("express-fileupload")

const userRoutes = require("./routes/userRoutes")
const postRoutes = require("./routes/postRoutes")
const { notFound, errorHandler } = require("./middleware/errorMiddleware")

const app = express()
app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }))

// added render link
// app.use(cors({ credentials: true, origin: "http://localhost:3000" }))
app.use(cors({ credentials: true, origin: "https://mern-blog-frontend-h12e.onrender.com" }))

app.use(upload())
app.use("/uploads", express.static( __dirname+"/uploads"))


// --------------------------test

// app.use(cors({ 
//   credentials: true, 
//   origin: "https://mern-blog-frontend-app.netlify.app", 
//   methods: "GET,POST,PUT,PATCH,DELETE",
//   allowedHeaders: "Content-Type,Authorization"
// }));

// app.options("*", cors());

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Expose-Headers", "Custom-Header");
//   next();
// });

// ------------------------------test

// routes

app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)

app.use(notFound)
app.use(errorHandler)

connect(process.env.MONGO_URI)
  .then(
    app.listen(process.env.PORT || 5000, () =>
      console.log(`server started
on the port ${process.env.PORT}`)
    )
  )
  .catch((error) => {
    console.log(error)
  })

