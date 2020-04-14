#! /bin/bash
docker build . --build-arg GITHUB_SSH_KEY="$(cat ~/.ssh/GITHUB_SSH_KEY)" -t registry.digitalocean.com/cpz/cpz-platform