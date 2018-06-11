#!/bin/bash

#change to mafia-game directoy
cd ~/Desktop/Coding/Github/mafia-game

#change to front-end
cd front-end
npm run build
cd .. 

# push update to github
read -p "Commit description: " desc
git add -A && \
git commit -m "$desc" && \
git push origin master

#change to the directory where the mafia-pem key file is
cd ~/Downloads/

#stop server, push update, restart server
ssh -i "mafia-key.pem" ec2-user@ec2-18-191-123-240.us-east-2.compute.amazonaws.com << EOF
	pm2 stop all
	cd mafia-game
	git pull
	pm2 restart Mafia
EOF
