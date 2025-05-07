FROM maven:3.9-eclipse-temurin-17

WORKDIR /app

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