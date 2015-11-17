/**
 * Created by antoinemoreaux on 12/11/2015.
 */

'use strict';
var request = require('request');
var async = require('async');
var _ = require('lodash');

var temp = function(user){

  this.user = user;
  this.limit ={
    max : 30,
    min:0
  }
};

temp.prototype.getLastValue = function(cb){
  var that = this;

  var options = {
    uri : 'http://api.mychloe.antoinemoreaux.fr/userclient/'+this.user.id+'/1/'+this.user.token
  };

  request(options, function(err, httpResponse, response){
    response = JSON.parse(response);

    var timestamp = _(response.data.ownTemperature).pluck('date').value();
    var lastValue = _(response.data.ownTemperature).filter({'date':_.max(timestamp)}).value()[0];

    var currentTempValue = parseFloat(lastValue.value);
    var value = 0;

    if(that.limit.max === currentTempValue){
      value = that.limit.max - 1;
    }else if (that.limit.min === currentTempValue){
      value = that.limit.min + 1;
    }else{
      var random = Math.random() < 0.5 ? 'down' : 'up';
      value = (random === 'up') ? currentTempValue+1 : currentTempValue-1;
    }

    that.value = Math.round(value*10)/10;
    cb(null, that.value);
  })

};

temp.prototype.addTemp = function(value, cb){

  var options = {
    uri : 'http://api.mychloe.antoinemoreaux.fr/createDataPool',
    json:true,
    form:{
      idUserClient : this.user.id,
      value : this.value,
      data : 'temp',
      auto : false
    }
  };

  request.post(options, function(err, httpResponse, response){
    cb(null, response);
  });


};

temp.prototype.index = function(cb){
  var that = this;
  async.waterfall([
    function(cb){
      that.getLastValue(cb);
    },
    function(value, cb){
      that.addTemp(value, cb);
    }
  ], function(err){
    cb(null, {value:that.value});

  });



};

module.exports = temp;

