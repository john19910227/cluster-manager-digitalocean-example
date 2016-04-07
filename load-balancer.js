var http = require('http')
var request = require('request')
var Queue = require('queue')
var httpProxy = require('http-proxy');

var digitalOceanHelper = require('./lib/digital-ocean-helper')

// We aren't going to make a load balancer cluster in this example, but we're going to get the same metadata as app servers so we know what region we're in and stuff
var metadata = {}

// This is an array of app servers' metadata
var appServers = []

// This gets the cluster members and checks which are healthy
function getAppServers(callback){
  var appServersUrl = 'https://api.sekando.com/api/v1/projects/ricky-test-project/clusters/test-app-cluster/members/'
  request.get({
    url: appServersUrl,
    headers: {
      'x-api-key': process.env.SEKANDO_API_KEY,
      'x-api-secret': process.env.SEKANDO_API_SECRET,
    }
  },function(err,res,body){
    // We are going to check if the server is working OK, then add it to an array of servers that the load balancer can forward requests to
    var healthCheckQueue = Queue()
    if(!err && body){
      var data = JSON.parse(body)
      var servers = []
      data.forEach(function(member){
        if(member.metadata){
          healthCheckQueue.push(function(next){
            var server = JSON.parse(member.metadata)
            //send a request to the server's public IP and added to the list if we get an OK response
            request.get('http://'+server.publicIp+':'+server.port+'/',function(err,res,body){
              if(!err && res.statusCode == 200){
                servers.push(server)
              }
              next()
            })
          })
        }
      })
      healthCheckQueue.on('end',function(){
        // Overwite our existing server list with the new one (if it isn't empty)
        if(servers.length > 0){
          appServers = servers
        }
        console.log('Healthy app servers:')
        console.log(appServers)
        if(callback){
          callback()
        }
      })
      healthCheckQueue.start()
    }
  })
}


// check for new app servers every 60 seconds
getAppServers()
setInterval(getAppServers,60000)

// set up our reverse proxy

function getTargetServer(){
  var index = Math.floor(Math.random()*appServers.length)
  console.log(index,appServers.length)
  var server = appServers[index]
  if(!server){
    return null;
  }
  return server
}

var proxy = httpProxy.createProxyServer({})

proxy.on('error',function(err){
  console.log(err)
})

var server = http.createServer(function(req,res){
  var server = getTargetServer()
  if(!server){
    res.write('Could not find any targets')
    res.end()
    return;
  }
  var ip = server.publicIp
  if(server.region == metadata.region){
    ip = server.privateIp
  }
  var target = 'http://'+ip+':'+server.port
  console.log(target)
  console.log(ip)
  proxy.web(req, res, { target: target , headers: {host: ip}});
})

digitalOceanHelper.getMetadata(metadata)

server.listen(3000)
