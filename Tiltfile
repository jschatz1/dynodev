docker_build('almond-node-api-image', './packages/api/')
k8s_yaml('./packages/api/kubernetes.yaml')
k8s_resource('almond-node-api', port_forwards=8000)