/**
 * Created by antoinemoreaux on 12/11/2015.
 */

  'use strict';
var request = require('request');
var async = require('async');
var _ = require('lodash');

var chlore = function(user){

  this.user = user;
  this.limit ={
    max : 3,
    min:1
  }
};

chlore.prototype.getLastValue = function(cb){
  var that = this;

  var options = {
    uri : 'http://api.mychloe.antoinemoreaux.fr/userclient/'+this.user.id+'/1/'+this.user.token
  };

  request(options, function(err, httpResponse, response){
    response = JSON.parse(response);

    var timestamp = _(response.data.ownChlore).pluck('date').value();
    var lastValue = _(response.data.ownChlore).filter({'date':_.max(timestamp)}).value()[0];

    var currentChloreValue = parseFloat(lastValue.value);
    var value = 0;

    if(that.limit.max === currentChloreValue){
      value = that.limit.max - 0.1;
    }else if (that.limit.min === currentChloreValue){
      value = that.limit.min + 0.1;
    }else{
      var random = Math.random() < 0.5 ? 'down' : 'up';
      value = (random === 'up') ? currentChloreValue+0.1 : currentChloreValue-0.1;
    }

    that.value = Math.round(value*10)/10;
    cb(null, that.value);
  })

};

chlore.prototype.addChlore = function(value, cb){

  var options = {
    uri : 'http://api.mychloe.antoinemoreaux.fr/createDataPool',
    json:true,
    form:{
      idUserClient : this.user.id,
      value : this.value,
      data : 'chlore',
      auto : false
    }
  };

  request.post(options, function(err, httpResponse, response){
    cb(null, response);
  });


};

chlore.prototype.index = function(cb){
  var that = this;
  async.waterfall([
    function(cb){
      that.getLastValue(cb);
    },
    function(value, cb){
      that.addChlore(value, cb);
    }
  ], function(err){
    cb(null, {value:that.value});

  });



};

module.exports = chlore;

