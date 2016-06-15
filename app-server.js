const http = require('http')

const digitalOceanHelper = require('./lib/digital-ocean-helper')
const cluster = require('./lib/cluster')

// Get information about the droplet such as IP
digitalOceanHelper.getMetadata()
  .then((metadata) => {
    metadata.port = 3000
    var id = metadata.id
    
    
    console.log('Sending metadata to Cluster Manager...')
    cluster.getMemberWithId(id)
      .then(member => member.setMetadata(JSON.stringify(metadata)))
      .then(_ => console.log('Metadata sent!'))
      .catch(_err => console.log(err))
    // This is a simple HTTP server that just sends the metadata
    var server = http.createServer(function(req,res){
      res.setHeader('content-type','text/plain')
      res.write('Member id: '+metadata.id+'\n'+JSON.stringify(metadata))
      res.end()
    }).listen(3000)
  })
  .catch((err) => console.log(err))
