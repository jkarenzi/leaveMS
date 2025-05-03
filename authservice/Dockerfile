FROM maven:3.9-eclipse-temurin-17

WORKDIR /app

# Set environment variables
ENV DB_URL=jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:5432/postgres
ENV DB_USERNAME=postgres.ruxoxiizylnopjpkbghh
ENV DB_PASSWORD=BKk9xDeaoXjnUZlr
ENV JWT_SECRET=DUIFNBVDFOV548N04V8VN043V5I845N80N485048N5V90485NV04N5
ENV GOOGLE_CLIENT_ID=1047104665535-v37vqapk98318nlf31clfokb1jeikld9.apps.googleusercontent.com
ENV FRONTEND_URL=http://localhost:5173
ENV SPRING_PROFILES_ACTIVE=dev

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Expose ports
EXPOSE 4000
EXPOSE 5005

# Run with remote debugging enabled
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments='-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005'"]