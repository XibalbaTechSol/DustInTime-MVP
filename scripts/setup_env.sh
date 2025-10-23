#!/bin/bash

if [ -f ../.env ]; then
    echo ".env file already exists."
else
    echo "Creating .env file."
    echo "JWT_SECRET=003c26f84126fcde3cdbbe64aedfd63ca656d4ba6f35c261f65b9f43d23b2293" > ../.env
    echo ".env file created successfully."
fi