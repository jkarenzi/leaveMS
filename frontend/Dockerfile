FROM node:20-alpine

WORKDIR /app

# Set environment variables
ENV VITE_AUTH_URL=http://localhost:4000/api
ENV VITE_LEAVE_URL=http://localhost:3000/api
ENV VITE_CLOUDINARY_UPLOAD_PRESET=pdf_upload
ENV VITE_CLOUDINARY_NAME=ditrc0kph
ENV VITE_PUSHER_CLUSTER=mt1
ENV VITE_PUSHER_KEY=c258e3921e7482efc971
ENV VITE_GOOGLE_CLIENT_ID=1047104665535-v37vqapk98318nlf31clfokb1jeikld9.apps.googleusercontent.com

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose development port
EXPOSE 5173

# Start development server with host set to 0.0.0.0 to allow external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]