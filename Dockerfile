FROM node:20-alpine

# Install localtunnel globally
RUN npm install -g localtunnel

WORKDIR /app

# Expose port for localtunnel dashboard (optional)
EXPOSE 4040

# Default command: forward localhost:3000
CMD ["lt", "--port", "3000"]
