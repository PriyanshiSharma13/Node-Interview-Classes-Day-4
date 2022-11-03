const router = require("express").Router();
const { check , validationResult } = require("express-validator");
const {users} = require("../db");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

router.post("/signup", [
    check("email","Please provide a valid email")
        .isEmail(),
    check("password","Please provide a password that is greater than 5 characters")
        .isLength({
            min: 6
        })
] , async (req,res) => {
    const { password , email } = req.body;

    // VALIDATED THE INPUT
    const errors = validationResult(req);

    console.log(password,email);

    if(password.length < 6);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        });
    }

    // VALIDATE IF USER DOESN'T ALREADY EXIST

    let user = users.find((user) => {
        return user.email === email;
    });

    if(user){
        return res.status(400).json({
            "errors": [
                {
                    "msg" : "This user already exists"
                }
            ]
        })
    }

    const hashedPassword = await bcrypt.hash(password,10);

    users.push({
        email,
        password: hashedPassword
    })
    
    const token = await JWT.sign({
        email
    },"jehfshekf47259834wsjjkgvnd", {
        expiresIn: 3600000
    });

    res.json({
        token
    })

});

router.post('/login', async (req,res) => {
    const {password,email} = req.body;

    let user = users.find((user) => {
        return user.email === email;
    });

    if(!user){
        return res.status(400).json({
            "errors": [
                {
                    "msg" : "Invalid Credentials"
                }
            ]
        })
    };

    let isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        return res.status(400).json({
            "errors": [
                {
                    "msg" : "Invalid Credentials"
                }
            ]
        })
    };

    const token = await JWT.sign({
        email
    },"jehfshekf47259834wsjjkgvnd", {
        expiresIn: 3600000
    });

    res.json({
        token
    })

});

router.get('/all' , (req,res) => {
    res.json(users);
})

module.exports = router;