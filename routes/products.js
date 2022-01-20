const express = require('express');
const { sequelize, Products,Users } = require('/skript jezici projekat/models');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Joi = require('joi');
const route_products = express.Router();
route_products.use(express.json());
route_products.use(express.urlencoded({ extended: true }));


function authTokenHeader(req, res, next) {
    const authHeader = req.headers['authorization'];
   
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.status(401).json({ msg: "Korisnik nema token iz product.jsa" });
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    
        if (err) return res.status(403).json({ msg: "Korisnikov token nije dobar iz product.jsa" });
    
        req.user = user;
    
        next();
    });
}

route_products.use(authTokenHeader);


route_products.get('/products', (req, res) => {
    Products.findAll()
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});

route_products.post('/products', (req, res) => {

    const sema = Joi.object().keys({
        name: Joi.string().required(),
        price: Joi.number().required(),
        description: Joi.string().max(120).required(),
        category: Joi.number().required(),
        rate: Joi.number().min(0).max(5).required()
    });
    
    Joi.validate(req.body, sema, (err, result) => {
        if (err)
            res.send(err.details[0].message);
        else {
            
            const obj = {
                name:req.body.name,
                price:req.body.price,
                description: req.body.description,
                categoryId: req.body.category,
                rate: req.body.rate
            }
            console.log(obj);
            Users.findOne({ where : { id: req.user.userId} })
            .then( usr => {
                if(usr.role == 1){
                    Products.create(obj)
                        .then( row => res.json(row) )
                        .catch( err => res.status(500).json(err) ); 
                }else{
                    res.status(403).json({msg: `Korisnik ${usr.first_name} nije autorizavan za operaciju`});
                }
            })
            .catch( err => res.status(500).json({msg: `Greska u bazi nije pronadjen korisnik koji zeli da izvrsi operaciju`}) ); 
        }
    });

    
});

route_products.put('/products', (req, res) => {

    const sema = Joi.object().keys({
        name: Joi.string().required(),
        price: Joi.number().required(),
        description: Joi.string().max(120).required(),
        category: Joi.number().required(),
        rate: Joi.number().min(0).max(5).required()
    });
    
    Joi.validate(req.body, sema, (err, result) => {
        if (err){
            res.send(err.details[0].message);
        }
        else {
            Products.findOne({ where : { name: req.body.name} })
            .then( product => {
                product.name = req.body.name
                product.price = req.body.price
                product.description = req.body.description
                product.categoryId = req.body.category
                product.rate = req.body.rate
                product.save()
                .then( rows => res.json(rows) )
                .catch( err => res.status(500).json(err) );
            })
            .catch( err => res.status(500).json(err) ) 
            
        }
    });


});

route_products.delete('/products', (req, res) => {

    const sema = Joi.object().keys({
        id: Joi.number().required()
    });
    
    Joi.validate(req.body, sema, (err, result) => {
        if (err)
            res.send(err.details[0].message);
        else{
        
            Products.findOne({ where: { id: req.body.id } })
            .then( product => {
                product.destroy()
                .then( row => res.json(row) )
                .catch( err => res.status(500).json(err) );
            })
            .catch( err => res.status(500).json(err) );
        }
    });

 
});

module.exports = route_products;