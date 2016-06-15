const SekandoCloudClient = require('sekando-cloud-client')

const client = new SekandoCloudClient({
  apiKey: process.env.SEKANDO_API_KEY,
  apiSecret: process.env.SEKANDO_API_SECRET,
  projectId: process.env.SEKANDO_PROJECT_ID
})
const clusterManager = client.clusterManager()

// the cluster that will contain our servers' data
const cluster = clusterManager.clusterWithId('test-app-cluster')

module.exports = cluster