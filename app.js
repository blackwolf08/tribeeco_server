const express = require("express");
const app = express();
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://4dbcf003f80d4d7a84930f8a2c3f8efb@sentry.io/1378918"
});
app.use(Sentry.Handlers.requestHandler());


app.get("/", function mainHandler(req, res) {
  throw new Error("Broke!");
});

app.use(Sentry.Handlers.errorHandler());                

const bodyParser = require("body-parser");
const UserRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var cors = require("cors");

app.use(cors());
app.options("*", cors());

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Expose-Headers", "x-auth");
  //    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With,content-type, Accept , x-auth"
  );

  next();
});
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey('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');
// const msg = {
//   to: 'shobhitagarwal@gmail.com',
//   from: 'yashky47@gmail.com',
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   cc:'yashky47@gmail.com',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };
// sgMail.send(msg).catch((err)=>{
//   console.log(err.response.body.errors);
// });

app.use("/", UserRoutes);
app.use("/", postRoutes);
module.exports = app;
