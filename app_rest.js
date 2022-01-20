const express = require('express');
const { sequelize, Users, Categories, Products, Messages} = require('./models');
const products = require('./routes/products');
const users = require('./routes/users');
const categories = require('./routes/categories');
const orders = require('./routes/orders');
const app = express();
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const cors = require('cors');
app.use(express.json());



var corsOptions = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}


app.use(cors(corsOptions));

app.post('/register', (req, res) => {

    const obj = {
        first_name: req.body.name,
        last_name: req.body.name,
        email: req.body.email,
        role : req.body.role,
        quantity_of_money: 0,
        password: bcrypt.hashSync(req.body.password, 10)
    };


     Users.create(obj).then( row => {
         res.json(row);
     }).catch( err => {res.status(500).json(err);
                      console.log(err)});

});
app.get('/categories', (req, res) => {
    Categories.findAll()
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});

app.get('/categories/:id', (req, res) => {
    Categories.findOne({ where: { id: req.params.id } })
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});

app.get('/products/category/:id', (req, res) => {
    Products.findAll({ where : { categoryId: req.params.id} })
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});

app.get('/comments', (req, res) => {
    Messages.findAll({ include: ['user'] })
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});

app.post('/comments', (req, res) => {
    
    const data = {
        body:"primer neke poruke",
        userId: 1
    }

    Messages.create(data)
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});


app.use('/admin', users);
app.use('/admin', products);
app.use('/admin', categories);
app.use('/admin', orders);

app.listen({ port: 8080 }, async () => {
    await sequelize.authenticate();
    console.log(`pokrenuta na portu 8080 rest servis`)
});