'use strict';

var mongoose = require('mongoose');
var express = require('express');
var config = require('config');
var model = require('./model');
var jade = require('./jade');

var app = express();

/**
 * Connect to database.
 */
// Connect to mongodb
var db = config.get('db.host') + "/" + config.get('db.name');
mongoose.connect("mongodb://" + db, {
    server: {
        socketOptions: {
            keepAlive: 1
        }
    }
});

process.on('SIGINT', function () {
    console.warn('Express exit');
    if (mongoose.connection.readyState === 1) {
        mongoose.connection.close();
    } else {
        process.exit(0);
    }
});

mongoose.connection.on('error', function (err) {
    console.error(err);
    console.info('Exit process');
    process.exit(1);
});

mongoose.connection.on('disconnected', function () {
    console.error('Database disconnected');
    console.info('Exit process');
    process.exit(1);
});

mongoose.connection.on('connected', function () {
    console.info('Database connected to ' + db);
    model.traverse(mongoose, jade.generate);
});
