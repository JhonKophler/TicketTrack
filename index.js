const express = require("express");
const path = require("path");
const ticketRoutes = require("./routes/ticketsRoutes");
const userRoutes = require("./routes/usersRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const commentRoutes = require("./routes/commentsRoutes");

const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Debes agregar SESSION_SECRET en tu archivo .env
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // Cambia a true si se usa en produccion
  })
);

// Configurar EJS como el motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

// Middleware para servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "./public")));

// Usar las rutas de la API de tickets
app.use("/api-tickets", ticketRoutes);

// Usar las rutas de la API de usuarios
app.use("/api-users", userRoutes);

// Usar las rutas de la API de comentarios
app.use("/api-comments", commentRoutes);

// Usar las rutas de la API de dashboard
app.use("/dashboard", dashboardRoutes);

// Ruta para servir la vista home.ejs como principal desde la carpeta views
app.get("/", (req, res) => {
  req.session.editar = false;
  res.render("./home", {
    title: "Home",
    css: "./assets/css/home.css",
    session: req.session,
  });
});

// Ruta para servir la vista support.ejs desde la carpeta views
app.get("/faqs", (req, res) => {
  req.session.editar = false;
  res.render("./faqs", {
    title: "Faqs",
    css: "./assets/css/faqs.css",
    session: req.session,
  });
});

// Ruta para servir la vista login.ejs desde la carpeta views || sin css porque esta hecho con bootstrap
app.get("/login", (req, res) => {
  const message = req.session.message;
  delete req.session.message;
  res.render("./login", {
    title: "Login",
    css: "./assets/css/login-register.css",
    session: req.session,
    message: message,
  });
});

// Ruta para servir la vista register.ejs desde la carpeta views || sin css porque esta hecho con bootstrap
app.get("/register", (req, res) => {
  res.render("./register", {
    title: "Register",
    css: "./assets/css/login-register.css",
    session: req.session,
  });
});

app.use((req, res) => {
  req.session.editar = false;
  res
    .status(404)
    .render("./404", {
      title: "404",
      css: "./assets/css/404.css",
      session: req.session,
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
