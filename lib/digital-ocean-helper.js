'use strict';
const fetch = require('node-fetch')

var digitalOceanHelper = {}

module.exports = digitalOceanHelper

digitalOceanHelper.getMetadata = function(){
  console.log('Fetching metadata...')
  const metadata = {}
  return Promise.all([
    fetchTextIfFound('http://169.254.169.254/metadata/v1/interfaces/private/0/ipv4/address')
      .then(privateIp => metadata.privateIp = privateIp),
    fetchTextIfFound('http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address')
      .then(publicIp => metadata.publicIp = publicIp),
    fetchTextIfFound('http://169.254.169.254/metadata/v1/id')
      .then(id => metadata.id = id),
    fetchTextIfFound('http://169.254.169.254/metadata/v1/region')
      .then(region => metadata.region = region)
  ]).then(_ => {
    console.log('Fetched metadata: ',metadata)
    return metadata
  })
}

//fetch the response body and return it, or null if not found
function fetchTextIfFound(url){
  return fetch(url,{timeout:1000})
    .then((res) => {
      if(res.status == 200){
        return res.text()
          .then(function(text){
            return text
          })
      }
      return null
    })
    .catch((err) => {
      // console.log(err)
      return null
    })
}