# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install


# Bundle app source
COPY . .

# Set envinronment variables
# docker inspect \ -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' profile-info-postgres-1
ENV DATABASE_URL="postgresql://postgres:pass123@postgres:5432/personal?schema=public"

# Creates Prisma migration
RUN npm run prisma:deploy

# Creates a "dist" folder with the production build
RUN npm run build

# Expose the port on which the app will run
EXPOSE 8080

# Start the server using the production build
CMD ["npm", "run", "start"]