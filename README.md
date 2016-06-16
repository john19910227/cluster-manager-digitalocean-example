# Sekando Cluster Manager Example

This project is a simple example of how to use Sekando Cluster Manager API to configure multiple application servers and a load balancer

## Installation

### Sekando account

First you need a Sekando account. Go to <https://sekando.com/cloud> and log in or sign up. After logging in, follow these steps to create a project an and API key.

 1. From the Sekando Cloud Console, click "Create a project" if you do not already have on.
 2. Go to your project page.
 3. Click "API keys".
 4. Click "Create an API key".
 5. The secret will only be displayed once, so save it somewhere so you can use it when configuring your servers.
 
### App servers

This project is designed to run on DigitalOcean droplets. Start by logging into your DigitalOcean account and creating two droplets with the following configuration:

1. Select "Ubuntu 14.04 LTS" as the distribution.
2. Under "One-click Apps", select node.
3. Select the 512MB machine type.
4. Choose whatever datacenter you want.
5. Enable Private Networking and User Data.
6. Paste the following into the User Data field, with your project and API Key filled in
````
#!/bin/sh
curl https://raw.githubusercontent.com/sekando/cluster-manager-digitalocean-example/39dfb481664ba8032fc1858e61a393f7a92281f6/scripts/init-droplet-app.sh | bash -s \
  <my-project-id> \
  <my-api-key> \
  <my-api-key-secret>
````
7. Create at least 2 droplets
 
This will create app servers that will send their metadata to Sekando Cluster Manager. After the server is installed, they should be serving HTTP requests on port 3000.

### Load balancer

The load balancer configuration is similar.

1. Select "Ubuntu 14.04 LTS" as the distribution.
2. Under "One-click Apps", select node.
3. Select the 512MB machine type.
4. Choose whatever datacenter you want.
5. Enable Private Networking and User Data.
6. Paste the following into the User Data field
````
#!/bin/sh
curl https://raw.githubusercontent.com/sekando/cluster-manager-digitalocean-example/39dfb481664ba8032fc1858e61a393f7a92281f6/scripts/init-droplet-load-balancer.sh | bash -s \
  <my-project-id> \
  <my-api-key> \
  <my-api-key-secret>
````
7. Create one droplet

The load balancer should proxy requests to port 3000 to the app servers created previously.

Refresh the page a bunch of times to see that the responses coming from each of app servers.