const express = require('express');
const { sequelize, Orders,Users,Products } = require('/skript jezici projekat/models');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Joi = require('joi');
const route_orders = express.Router();
route_orders.use(express.json());
route_orders.use(express.urlencoded({ extended: true }));


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

route_orders.use(authTokenHeader);

route_orders.get('/orders', (req, res) => {
    Orders.findAll()
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});


route_orders.post('/create/order', (req, res) => {

    const obj = {
        userId: req.user.userId,
        current_value:req.body.price,
        discount: "0",
        type_of_delivery: "kolima",
        urgent: false
    }
   
    Orders.create(obj)
        .then( row => res.json(row) )
        .catch( err => res.status(500).json(err) ); 
});

route_orders.post('/orders', (req, res) => {

    const sema = Joi.object().keys({
        userId: Joi.number().required(),
        current_value: Joi.number().required(),
        discount: Joi.number().required(),
        type_of_delivery: Joi.string().required(),
        urgent: Joi.boolean()
    });
    
    Joi.validate(req.body, sema, (err, result) => {
        if (err)
            res.send(err.details[0].message);
        else {
            const obj = {
                userId: req.body.userId,
                current_value:req.body.current_value,
                discount: req.body.discount,
                type_of_delivery: req.body.type_of_delivery,
                urgent: req.body.urgent
            }
            Users.findOne({ where : { id: req.user.userId} })
            .then( usr => {
                if(usr.role == 1){
                    Orders.create(obj)
                        .then( row => res.json(row) )
                        .catch( err => res.status(500).json(err) ); 
                }else{
                    res.status(403).json({msg: `Korisnik ${usr.first_name} nije autorizavan za operaciju`})
                }
            })
            .catch( err => res.status(500).json(err) ) 
        }
    });

});

route_orders.put('/orders', (req, res) => {

    const sema = Joi.object().keys({
        userId: Joi.number().required(),
        current_value: Joi.number().required(),
        discount: Joi.number().required(),
        type_of_delivery: Joi.string().required(),
        urgent: Joi.boolean(),
        updateId: Joi.number().required()
    });

    
    Joi.validate(req.body, sema, (err, result) => {
        if (err)
            res.send(err.details[0].message);
        else {
            Orders.findOne({ where : { id: req.body.updateId} })
            .then( order => {
                order.userId = req.body.userId
                order.current_value = req.body.current_value
                order.discount = req.body.discount
                order.type_of_delivery = req.body.type_of_delivery
                order.urgent = req.body.urgent
                order.save()
                .then( rows => res.json(rows) )
                .catch( err => res.status(500).json(err) );
            })
            .catch( err => res.status(500).json(err) ) 
        }
    });


});

route_orders.delete('/orders', (req, res) => {

    const sema = Joi.object().keys({
        id: Joi.number().required()
    });
    
    Joi.validate(req.body, sema, (err, result) => {
        if (err)
            res.send(err.details[0].message);
        else{
            Orders.findOne({ where: { id: req.body.id } })
            .then( order => {
                order.destroy()
                .then( row => res.json(row) )
                .catch( err => res.status(500).json(err) );
            })
            .catch( err => res.status(500).json(err) );
        }
    });
});

module.exports = route_orders;