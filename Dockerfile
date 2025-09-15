# Usa una imagen oficial de Node.js
FROM node:18

# Define el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos de dependencias primero
COPY package*.json ./

# Instala dependencias
RUN npm install --only=production

# Copia el resto del código
COPY . .

# Expone el puerto 8080 (requerido por Cloud Run)
EXPOSE 8080

# Comando de inicio
CMD ["node", "index.js"]
