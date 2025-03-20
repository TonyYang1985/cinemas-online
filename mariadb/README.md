
Use "docker swarm init" or "docker swarm join" to connect this node to swarm and try again.

> docker swarm init
> docker swarm join-token manager
> docker swarm join-token worker
> docker network create -d overlay --attachable fotNet