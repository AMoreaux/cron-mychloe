#!/usr/bin/env node

'use strict';

var http = require('http');
var CronJob = require('cron').CronJob;
var request = require('request');
var Chlore = require('./providers/chlore');
var Ph = require('./providers/ph');
var Temp = require('./providers/temp');
var async = require('async');
var users = [{
  mail:'nemesis98@hotmail.fr',
  password:'2590'
},{
  mail:'priou.eric@hotmail.com',
  password:'2590'
},{
  mail:'lionel.paulus@gmail.com',
  password:'2590'
},{
  mail:'sebastien.lebonbout@gmail.com',
  password:'2590'
}];


var job = new CronJob({
  cronTime: '00 00 00 * * 1-7',
  onTick: function() {
    async.eachSeries(users, function(item, cb){

      var options = {
        uri : 'http://api.mychloe.antoinemoreaux.fr/login',
        json : true,
        form:item
      };

      request.post(options, function(err, httpResponse, response){
        item.token = response.token;
        item.id = response.id;
        async.parallel({
          temp:function(cb){
            new Temp(item).index(cb);
          },
          chlore:function(cb){
            new Chlore(item).index(cb);
          },
          ph:function(cb){
            new Ph(item).index(cb);
          }
        }, function(err, result){
          console.log('>>>>>>>>>>>>> done for '+item.mail, result);
          cb(null);
        });
      });

    }, function(){
      console.log('>>>>>>>>>>>>> end');
    });


  },
  start: true,
  timeZone: "Europe/Paris"
});
job.start();
