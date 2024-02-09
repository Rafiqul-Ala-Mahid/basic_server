# Use an official Node.js runtime as a base image
FROM node:14

# Create and set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./


# Copy the application code into the container
COPY . .


# Install app dependencies
RUN npm i
RUN node db.js

RUN node station_db.js
RUN node stops_db.js
RUN node train_db.js
RUN node user_db.js

# Expose the port that the app will run on
EXPOSE 8000

# Define the command to run your application
CMD [ "node", "app.js" ]