'use strict';
const http = require('http')
const httpProxy = require('http-proxy');
const fetch = require('node-fetch')

const cluster = require('./lib/cluster')

// this will give us our server's metadata
const digitalOceanHelper = require('./lib/digital-ocean-helper')

// This is goint to be an array of app servers' metadata
let appServers = []

// This gets the cluster members and checks which are healthy
function getAppServers(callback){
  // We will fill this up with the current servers, and overwrite appServers
  const servers = []
  return cluster.getMembers()
    .then((members) => {
      // Parse the servers' metadata
      members.forEach(function(member){
        if(member.metadata){
          const server = JSON.parse(member.metadata)
          servers.push(server)
        }
      })
      // We will check the status of the servers in parallel
      const healthCheckPromises = []
      //check if the servers respond within 1 second
      servers.forEach(function(server){
        const promise = getServerHealth(server)
        healthCheckPromises.push(promise)
      })
      return Promise.all(healthCheckPromises)
        .then(_ => servers.filter(server => server.healthy))
    })
    .then(healthyServers => {
      //set our new appServers
      appServers = healthyServers
      console.log('Servers: ',appServers)
    })
    .catch(function(err){
      console.log(err)
    })
}

function getServerHealth(server){
  const healthCheckUrl = 'http://'+server.publicIp+':'+server.port+'/'
  const fetchOptions = {timeout:1000}
  return fetch(healthCheckUrl,fetchOptions)
    .then(function(response){
      server.healthy = response.status == 200
    })
    .catch((err) => {
      server.healthy = false
    })
}


// check for new app servers every 60 seconds
getAppServers()
setInterval(getAppServers,60000)

// set up our reverse proxy

function getTargetServer(){
  const index = Math.floor(Math.random()*appServers.length)
  console.log(index,appServers.length)
  const server = appServers[index]
  if(!server){
    return null;
  }
  return server
}

const proxy = httpProxy.createProxyServer({})

proxy.on('error',function(err){
  console.log(err)
})

digitalOceanHelper.getMetadata()
  .then((metadata) => {
    http.createServer(function(req,res){
      const server = getTargetServer()
      if(!server){
        res.write('Could not find any targets')
        res.end()
        return;
      }
      let ip = server.publicIp
      // we can compare the app server and load balancers' metadata to know if
      // they are in the same region
      if(server.region == metadata.region && server.privateIp){
        ip = server.privateIp
      }
      const target = 'http://'+ip+':'+server.port
      console.log(target)
      console.log(ip)
      proxy.web(req, res, { target: target , headers: {host: ip}});
    }).listen(3000)
  })

