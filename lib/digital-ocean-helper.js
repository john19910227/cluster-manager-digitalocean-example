var digitalOceanHelper = {}

module.exports = digitalOceanHelper

var request = require('request')
var Queue = require('queue')

digitalOceanHelper.getMetadata = function(metadata,callback){
  var queue = Queue()
  queue.push(function(next){
    request.get('http://169.254.169.254/metadata/v1/interfaces/private/0/ipv4/address',function(e,r,b){
      metadata.privateIp = b
      next()
    })
  })
  queue.push(function(next){
    request.get('http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address',function(e,r,b){
      metadata.publicIp = b
      next()
    })
  })
  queue.push(function(next){
    request.get('http://169.254.169.254/metadata/v1/id',function(e,r,b){
      metadata.id = b
      next()
    })
  })
  queue.push(function(next){
    request.get('http://169.254.169.254/metadata/v1/region',function(e,r,b){
      metadata.region = b
      next()
    })
  })
  queue.on('end',function(){
    if(callback){
      callback()
    }
  })
  queue.start()
}