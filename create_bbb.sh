#!/bin/bash
NAME="bbb-dev-01"  # change here if you want a different name
HOSTNAME="${NAME}.test"
IMAGE=imdt/bigbluebutton:2.4.x-develop_build_486
SCRIPT_DIR=$(cd $(dirname $0); pwd)

# retag the commit to force a lookup but keep in cache
docker image inspect $IMAGE &>/dev/null && ( docker image tag $IMAGE $IMAGE-previous ; docker image rm $IMAGE )

# kill/remove existing container
docker inspect $NAME &> /dev/null && (
    echo "Container with name $NAME already exists, removing."
    docker kill $NAME ;
    docker rm $NAME ;
)

if [ -d $SCRIPT_DIR/certs/ ] ; then
	echo "Directory certs already exists, not initializing."
else
	mkdir $SCRIPT_DIR/certs
	cd $SCRIPT_DIR/certs

	openssl rand -base64 48 > bbb-dev-ca.pass ;
	chmod 600 bbb-dev-ca.pass ;
	openssl genrsa -des3 -out bbb-dev-ca.key -passout file:bbb-dev-ca.pass 2048 ;

	openssl req -x509 -new -nodes -key bbb-dev-ca.key -sha256 -days 1460 -passin file:bbb-dev-ca.pass -out bbb-dev-ca.crt -subj "/C=CA/ST=BBB/L=BBB/O=BBB/OU=BBB/CN=BBB-DEV" ;
	echo "add trusted cert"
	security add-trusted-cert -d -r trustRoot -k "${HOME}/Library/Keychains/login.keychain-db" bbb-dev-ca.crt

	openssl genrsa -out ${HOSTNAME}.key 2048
	rm ${HOSTNAME}.csr ${HOSTNAME}.crt ${HOSTNAME}.key
	cat > ${HOSTNAME}.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = ${HOSTNAME}
EOF

	openssl req -nodes -newkey rsa:2048 -keyout ${HOSTNAME}.key -out ${HOSTNAME}.csr -subj "/C=CA/ST=BBB/L=BBB/O=BBB/OU=BBB/CN=${HOSTNAME}" -addext "subjectAltName = DNS:${HOSTNAME}" 

	openssl x509 -req -in ${HOSTNAME}.csr -CA bbb-dev-ca.crt -CAkey bbb-dev-ca.key -CAcreateserial -out ${HOSTNAME}.crt -days 825 -sha256 -passin file:bbb-dev-ca.pass -extfile ${HOSTNAME}.ext
	
	cat $HOSTNAME.crt > fullchain.pem
	cat bbb-dev-ca.crt >> fullchain.pem
	cat $HOSTNAME.key > privkey.pem
	cd $SCRIPT_DIR
fi

IP=127.0.0.2
if /sbin/ifconfig lo0 | grep ${IP} ; then
	echo "alias ${IP} is already created"
else
	echo "create alias ${IP}"
	sudo ifconfig lo0 alias ${IP} up
fi

docker run -d --name=$NAME --hostname=$HOSTNAME -p ${IP}:22:22 -p ${IP}:80:80 -p ${IP}:443:443 --env="NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt" --env="container=docker" --env="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" --env="DEBIAN_FRONTEND=noninteractive" --volume="/var/run/docker.sock:/var/run/docker.sock:rw" --cap-add="NET_ADMIN" --privileged --volume="$SCRIPT_DIR/certs/:/local/certs:rw" --volume="$SCRIPT_DIR/:/home/bigbluebutton/src:rw" --volume=docker_in_docker$NAME:/var/lib/docker -t $IMAGE
