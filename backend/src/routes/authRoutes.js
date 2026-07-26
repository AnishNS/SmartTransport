const express = require("express");

const router = express.Router();

const { register } = require("../controllers/authController");

const { registerValidator } = require("../validators/authValidator");

const { validationResult } = require("express-validator");


// Middleware to handle validation errors

function validateRequest(req, res, next){

    const errors = validationResult(req);


    if(!errors.isEmpty()){

        return res.status(400).json({
            success:false,
            errors:errors.array()
        });

    }


    next();

}



// Register Route

router.post(
    "/register",
    registerValidator,
    validateRequest,
    register
);



module.exports = router;