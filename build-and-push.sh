# Configuration - change this to your Docker Hub username
DOCKER_USERNAME="jkarenzi"
TAG="dev"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Building and pushing LMS Docker images =====${NC}"

# Check if logged in to Docker Hub
echo -e "${YELLOW}Checking Docker Hub login status...${NC}"
if ! docker info | grep -q "Username"; then
  echo -e "${YELLOW}Please login to Docker Hub:${NC}"
  docker login
fi

# Create a new builder instance with multi-platform support if not exists
echo -e "${YELLOW}Setting up Docker Buildx for multi-platform builds...${NC}"
if ! docker buildx inspect multiplatform-builder &>/dev/null; then
  docker buildx create --name multiplatform-builder --use
else
  docker buildx use multiplatform-builder
fi
docker buildx inspect --bootstrap

# Build and push frontend
echo -e "\n${YELLOW}===== Building frontend image =====${NC}"
cd frontend
if docker buildx build --platform linux/amd64,linux/arm64 -t $DOCKER_USERNAME/lms-frontend:$TAG --push .; then
  echo -e "${GREEN}Frontend image built and pushed successfully${NC}"
else
  echo -e "${RED}Failed to build and push frontend image${NC}"
fi

# Back to root directory
cd ..

# Build and push auth service
echo -e "\n${YELLOW}===== Building auth service image =====${NC}"
cd authservice
if docker buildx build --platform linux/amd64,linux/arm64 -t $DOCKER_USERNAME/lms-auth-service:$TAG --push .; then
  echo -e "${GREEN}Auth service image built and pushed successfully${NC}"
else
  echo -e "${RED}Failed to build and push auth service image${NC}"
fi

# Back to root directory
cd ..

# Build and push leave service (note the space in directory name)
echo -e "\n${YELLOW}===== Building leave service image =====${NC}"
cd "leave service"
if docker buildx build --platform linux/amd64,linux/arm64 -t $DOCKER_USERNAME/lms-leave-service:$TAG --push .; then
  echo -e "${GREEN}Leave service image built and pushed successfully${NC}"
else
  echo -e "${RED}Failed to build and push leave service image${NC}"
fi

# Back to root directory
cd ..

echo -e "\n${GREEN}===== All images built and pushed successfully =====${NC}"
echo -e "${YELLOW}You can now run 'docker-compose up' to start the application${NC}"