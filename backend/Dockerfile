# Stage 1: Build
FROM gradle:8.7-jdk21 AS builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Kopiere nur die für den Build nötigen Dateien (Optimierung fürs Caching)
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY src ./src

# Baue das Spring Boot JAR
RUN gradle clean bootJar --no-daemon

# Stage 2: Runtime Image mit JRE 21
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Kopiere das fertige JAR aus der Builder-Stage
COPY --from=builder /app/build/libs/*.jar ./app.jar

# Expose Port 8080
EXPOSE 8080

# Starte die Spring Boot Anwendung
ENTRYPOINT ["java", "-jar", "app.jar"]
