const express = require('express');
const { sequelize, Categories, Products } = require('/skript jezici projekat/models');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Joi = require('joi');
const route_categories = express.Router();
route_categories.use(express.json());
route_categories.use(express.urlencoded({ extended: true }));


route_categories.get('/categories', (req, res) => {
    Categories.findAll({ include: categoryId })
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});


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


route_categories.use(authTokenHeader);

route_categories.post('/categories', (req, res) => {
    
    const sema = Joi.object().keys({
        name: Joi.string(),
        popularity: Joi.number().required(),
        description: Joi.string().max(120).required()
    });

    Joi.validate(req.body, sema, (err, result) => {
        if (err)
            res.send(err.details[0].message);
        else {
            const data = {
                name: req.body.name,
                popularity: req.body.popularity,
                description: req.body.description,
                quantity_of_product: 0
            }
            Categories.create(data)
                .then( row => res.json(row) )
                .catch( err => res.status(500).json(err) );
        }
    });

});


route_categories.put('/categories', (req, res) => {
    
    const sema = Joi.object().keys({
        name: Joi.string().required(),
        popularity: Joi.number().required(),
        description: Joi.string().max(120).required()
    });

    Joi.validate(req.body, sema, (err, result) => {
        if (err)
            res.send(err.details[0].message);
        else {
            Categories.findOne({ where: { name: req.body.name } })
            .then( ctgr => {
                ctgr.name = req.body.name
                ctgr.popularity = req.body.popularity
                ctgr.description = req.body.description
                ctgr.save()
                .then( rows => res.json(rows) )
                .catch( err => res.status(500).json(err) );
            })
            .catch( err => res.status(500).json(err) );  
        }
    });


});

route_categories.delete('/categories', (req, res) => {
    
    const sema = Joi.object().keys({
        id: Joi.number().required(),
    });

    Joi.validate(req.body, sema, (err, result) => {
        if (err)
            res.send(err.details[0].message);
        else {
            Categories.findOne({ where: { id: req.body.id } })
            .then( ctgr => {
                ctgr.destroy()
                .then( row => res.json(row) )
                .catch( err => res.status(500).json(err) );
            })
            .catch( err => res.status(500).json(err) );
        }
    });


        
});

module.exports = route_categories;