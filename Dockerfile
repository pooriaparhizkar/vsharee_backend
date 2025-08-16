FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

# Generate Prisma client after deps are installed
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 5000
CMD ["node", "dist/index.js"]