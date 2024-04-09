const express = require("express")
const cors = require("cors")
const { connect } = require("mongoose")
require("dotenv").config()
const upload = require("express-fileupload")
const path = require("path")

const userRoutes = require("./routes/userRoutes")
const postRoutes = require("./routes/postRoutes")
const { notFound, errorHandler } = require("./middleware/errorMiddleware")

const app = express()

// Middleware to set cache control headers
app.use((req, res, next) => {
  // Set cache control headers for images in the /uploads directory
  if (req.url.startsWith("/uploads")) {
    res.setHeader("Cache-Control", "public, max-age=604800"); // Cache images for 7 days (604800 seconds)
  }
  next();
});


app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }))

// added render link
// app.use(cors({ credentials: true, origin: "http://localhost:3000" }))
// app.use(cors({ credentials: true, origin: "https://mern-blog-frontend-h12e.onrender.com" }))

const corsOptions = {
  origin: "https://mern-blog-frontend-h12e.onrender.com",
  credentials: true // Enable CORS credentials (e.g., cookies, authorization headers)
};

app.use(cors(corsOptions));
app.use(upload())
app.use("/uploads", express.static(path.join( __dirname,"/uploads")))


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

