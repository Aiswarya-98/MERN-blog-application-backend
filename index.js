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
// added vercel link
app.use(cors({ credentials: true, origin: "https://mernblogapp-kappa.vercel.app" }))
app.use(upload())
app.use("/uploads", express.static(__dirname , "/uploads"))


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

