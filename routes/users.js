const express = require('express');
const { sequelize, Users } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Joi = require('joi');
const route_users = express.Router();
const bcrypt = require('bcrypt');
route_users.use(express.json());
route_users.use(express.urlencoded({ extended: true }));


route_users.get('/users', (req, res) => {

    Users.findAll()
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});

function authTokenHeader(req, res, next) {
   
    const authHeader = req.headers['authorization'];
   
    const token = authHeader && authHeader.split(' ')[1];
   
    if (token == null) return res.status(401).json({ msg: "Korisnik nema token " });
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    
        if (err) return res.status(403).json({ msg: "Korisnikov token nije dobar" });
    
        req.user = user;
    
        next();
    });
}

route_users.use(authTokenHeader);


route_users.post('/users', (req, res) => {

    const sema = Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().trim().email().required(),
        role: Joi.boolean(),
        quantityOfMoney: Joi.number().required(),
        password: Joi.string().min(4).max(12).required()
    });
    
    Joi.validate(req.body, sema, (err, result) => {
        if (err)
            res.send(err.details[0].message);
        else{
            const obj = {
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                role: req.body.role,
                email: req.body.email,
                quantity_of_money: req.body.quantityOfMoney,
                password: bcrypt.hashSync(req.body.password, 10)
            }
            Users.create(obj)
            .then( row => res.json(row) )
            .catch( err => res.status(500).json(err) ); 
        }
    });

});

route_users.put('/users', (req, res) => {

    const sema = Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().trim().email().required(),
        role: Joi.boolean(),
        quantityOfMoney: Joi.number().required(),
        password: Joi.string().min(4).max(12).required()
    });
    
    Joi.validate(req.body, sema, (err, result) => {
        if (err)
            res.send(err.details[0].message);
        else{
            console.log(req.user);
            Users.findOne({ where : { id: req.user.userId} })
            .then( usr => {
                 console.log(usr.role);
                if(usr.role == 1){
                    Users.findOne({ where : { email: req.body.email} })
                    .then(userToUpdate => {
                        userToUpdate.first_name = req.body.firstName
                        userToUpdate.last_name = req.body.lastName
                        userToUpdate.role = req.body.role
                        userToUpdate.email = req.body.email
                        userToUpdate.quantity_of_money = req.body.quantityOfMoney
                        userToUpdate.password = bcrypt.hashSync(req.body.password, 10)
                        userToUpdate.save()
                        .then( rows => res.json(rows) )
                        .catch( err => res.status(500).json({msg: `Korisnik sa emailom ${req.body.email} ne moze da se promeni`}) );
                    })
                    .catch( err => res.status(500).json({msg: `Korisnik sa emailom ${req.body.email} ne mozfdssdfeni`}));     
                }else{
                     res.status(403).json({msg: `Korisnik ${usr.first_name} nije autorizavan za operaciju`})
                }
            })
            .catch( err => res.status(500).json({msg: `Korisnik sa id  ${req.user.userId} ${err}ne moze da se nadje u bazi`}) )
        }
    });
});

route_users.delete('/users', (req, res) => {

    const sema = Joi.object().keys({
        email: Joi.string().trim().email().required()
    });
    
    Joi.validate(req.body, sema, (err, result) => {
        if (err)
        res.status(403).json({msg: `Greska za joi u validate delete Useres`})
        else{
            
            Users.findOne({ where : { id: req.user.userId} })
            .then( usr => {
                console.log(usr.role);
                if(usr.role == 1){
                    Users.findOne({ where: { email: req.body.email }} )
                        .then( usr => {
                            usr.destroy()
                                .then( rows => res.json(rows) )
                                .catch( err => console.log("neuspelo brisanje usera sa destroy") );
                        })
                        .catch( err => res.status(500).json({msg: `Nije pronadjenj user koji zeli da brise`}) );
                }else{
                    res.status(403).json({msg: `Korisnik ${usr.first_name} nije autorizavan za operaciju`})
                }
            })
            .catch( err => console.log("Nije nadjen usr koji zeli da brise") );         
        }
    });
});

module.exports = route_users;