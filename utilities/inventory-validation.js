const { body, validationResult } = require("express-validator");

const inventoryValidate = {
  // Validation rules for adding a new classification
  classificationRules: () => [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Classification name is required.")
      .isLength({ min: 3 })
      .withMessage("Classification name must be at least 3 characters long.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Provide a correct classification name."),
  ],

  // Validation middleware to handle classification data errors
  checkClassificationData: async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect("/add-classification");
    }
    next();
  },

  // Validation rules for adding a new vehicle
  vehicleRules: () => [
    body("classification")
      .notEmpty()
      .withMessage("Classification is required."),
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Make is required.")
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters long."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Model is required.")
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters long."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description is required."),
    body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .withMessage(
        "Image path is required. It must follow the format: /images/vehicles/no-image.png"
      ),
    body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .withMessage(
        "Thumbnail is required. It must follow the format: /images/vehicles/no-image.png"
      ),
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Price is required.")
      .isFloat({ min: 0 })
      .withMessage("Price must be greater than 0."),
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Year is required.")
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be between 1900 and 2099."),
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Miles are required.")
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative number."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Color is required."),
  ],

  // Validation middleware to handle vehicle data errors
  checkVehicleData: async (req, res, next) => {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect("/add-inventory");
    }
    next();
  },
};

module.exports = inventoryValidate;