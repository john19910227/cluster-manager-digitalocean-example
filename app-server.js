var http = require('http')
var request = require('request')

var digitalOceanHelper = require('./lib/digital-ocean-helper')

// We can put anything here, in this case what port we are listening on.
var metadata = {
  port: 3000
}

// Get information about the droplet such as IP
digitalOceanHelper.getMetadata(metadata,function(){
  var id = metadata.id
  var updatePath = 'https://api.sekando.com/api/v1/projects/ricky-test-project/clusters/test-app-cluster/members/'+id+'/set_metadata'
  console.log('Sending metadata to '+updatePath)
  console.log('Metadata: '+JSON.stringify(metadata))
  request.post({
    url: updatePath,
    headers: {
      'x-api-key': process.env.SEKANDO_APIKEY,
      'x-api-secret': process.env.SEKANDO_API_SECRET,
      'content-type': 'text/plain'
    },
    body: JSON.stringify(metadata)
  },function(e,r,b){
    if(e){
      console.log(e)
    }
    else{
      console.log('Metadata saved!')
    }
  })
})

// This is a simple HTTP server that just sends the metadata
var server = http.createServer(function(req,res){
  res.setHeader('content-type','text/plain')
  res.write('Member id: '+metadata.id+'\n'+JSON.stringify(metadata))
  res.end()
})
server.listen(3000)