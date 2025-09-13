# Utiliser Node 22 (même que Railway)
FROM node:22-slim

# Installer ffmpeg + fonts + yt-dlp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    fonts-dejavu-core \
    python3 \
    python3-pip \
    && pip3 install yt-dlp \
    && rm -rf /var/lib/apt/lists/*

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers package.json pour installer les deps
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste du code
COPY . .

# Build TypeScript
RUN npm run build

# Lancer l'app
CMD ["node", "dist/index.js"]
