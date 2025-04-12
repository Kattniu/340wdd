const jwt = require("jsonwebtoken");
require("dotenv").config();
const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 * - Gets all classifications from DB
 * - Builds a <ul> navigation list with links to each classification
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications(); //(invmodel.getclass..)aqui se llama a la base de datos 
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' + row.classification_id + '" title="See our inventory of ' +
      row.classification_name + ' vehicles">' +
      row.classification_name + "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Builds a <select> dropdown of classifications
 * - Selects the current classification if passed
 ************************************ */
Util.buildClassificationDropdown = async function (classification_id) {
  let selectedOption = classification_id;
  let data = await invModel.getClassifications();
  let classDropOptions = "";
  data.rows.forEach((row) => {
    if (row.classification_id == selectedOption) {
      classDropOptions += `<option value="${row.classification_id}" selected>${row.classification_name}</option>`;
    } else {
      classDropOptions += `<option value="${row.classification_id}">${row.classification_name}</option>`;
    }
  });
  return classDropOptions;
};

/* **************************************
*BUILD THE CLASSIFICATION VIEW HTML
 * Builds the vehicle list grid for a classification
 * - Displays thumbnail, make, model, price, miles
 * Muestra una lista de vehículos de una misma categoría o clasificación (como SUVs, sedanes, etc).
 ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += `<li><div>
        <div class="class_lists__image">
        <a href="/inv/detail/${vehicle.inv_id}" title="View ${
        vehicle.inv_make
      } ${vehicle.inv_model} details">
        <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${
        vehicle.inv_model
      } on CSE Motors" />
        </a>
        </div>
        <hr>
        <div class="namePrice">
          <h2> <a href="/inv/detail/${vehicle.inv_id}" title="View ${
        vehicle.inv_make
      } ${vehicle.inv_model} details">
          ${vehicle.inv_make} ${vehicle.inv_model}</a></h2>
          <div>
          <span>$${new Intl.NumberFormat("en-US").format(
            vehicle.inv_price
          )}</span>|<span>${vehicle.inv_miles.toLocaleString()}</span>
          </div>
        </div>
        </div>
        </li>`;
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Builds the inventory grid for a single vehicle
 * - Displays full details of the vehicle
 * Muestra los detalles completos de un solo vehículo.
 ************************************ */
Util.buildInventoryGrid = async function (data) {
  let grid;
  let vehicle = data[0];
  switch (data.length) {
    case 0:
      grid = `<p>Sorry, we can't find any matching vehicles could be found.</p>`;
      break;
    case 1:
      grid = `
            <div id="inv_page__detail">
              <div class="inv__image">
                <img src="${vehicle.inv_image}" alt="Image of ${
        vehicle.inv_color
      } ${vehicle.inv_make} ${vehicle.inv_model}"></div>
              <div class="inv__details"> 
                <h2> ${vehicle.inv_model} ${vehicle.inv_make} details</h2>
                <ul class="inv__details-content">
                  <li><span>Price:</span> <span>$ ${vehicle.inv_price.toLocaleString()}</span></li>
                  <li><span>Miles:</span> <span>${vehicle.inv_miles.toLocaleString()}</span></li>
                 <li><span>Color:</span> <span>${vehicle.inv_color}</span></li>
                 <li class="inv__details-content_description" ><span>Description: </span><span>${
                   vehicle.inv_description
                 }</span></li></ul>
              </div>
            </div>`;
      break;
    default:
      grid = "<p>Sorry, no matching vehicles could be found.</p";
  }
  return grid;
};

/* ****************************************
 * Error Handling Middleware
 * - Wraps async functions to catch errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(err);
    next(err);
  });

/* ****************************************
 * Middleware to check for valid JWT
 * - Verifies token
 * - If valid, sets user data in res.locals
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, user) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          res.locals.loggedin = 0;
          res.locals.user = "";
          return res.redirect("/account/login");
        }
        res.locals.user = user;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 * Forces logout and redirect to login
 * - Used if authorization fails
 **************************************** */
Util.accountFail = (req, res, next) => {
  req.flash("notice", "Please log in.");
  res.clearCookie("jwt");
  res.locals.loggedin = 0;
  res.locals.user = "";
  return res.redirect("/account/login");
};

/* ****************************************
 * Middleware to check user type
 * - Only allows Admin, Employee or Client types
 **************************************** */
Util.accountTypeCheck = (req, res, next) => {
  try {
    if (
      res.locals.loggedin &&
      req.cookies.jwt &&
      !(
        res.locals.user.account_type === "Admin" ||
        res.locals.user.account_type === "Employee" ||
        res.locals.user.account_type === "Client"
      )
    ) {
      req.flash(
        "notice",
        "You are not have sufficient permission to access this resource. Please log into an authorized account."
      );
      return res.redirect("/account/login");
    }
    next();
  } catch (error) {
    checkJWTToken(req, res, next);
  }
};

/* ****************************************
 * Checks if user is logged in (JWT valid)
 **************************************** */
Util.checkLogin = (req, res, next) => {
  try {
    const decoded = jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET
    );
    if (res.locals.loggedin && req.cookies.jwt && decoded) {
      res.locals.user = decoded;
      next();
    } else {
      Util.accountFail(req, res, next);
    }
  } catch (error) {
    Util.accountFail(req, res, next);
  }
};

/* ****************************************
 * Checks if user is "Owner" type
 * - Used to restrict resources to owners only
 **************************************** */
Util.checkOwnership = (req, res, next) => {
  try {
    if (
      res.locals.loggedin &&
      req.cookies.jwt &&
      res.locals.user.account_type !== "Owner"
    ) {
      req.flash(
        "notice",
        "You are not have sufficient permission to access this resource. Please log into an authorized account."
      );
      return res.redirect("/account/login");
    }
    next();
  } catch (error) {
    checkJWTToken(req, res, next);
  }
};

/* ****************************************
 * Sorts users by account_id in ascending order
 **************************************** */
Util.sortUsersById = async function (data){
  sortedData = await data.sort((a, b) => a.account_id - b.account_id);
  return sortedData;
}

module.exports = Util;
