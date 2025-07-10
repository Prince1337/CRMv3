# Stage 1: Dependencies (wird nur bei Änderungen an build.gradle neu gebaut)
FROM gradle:8.7-jdk21 AS deps
WORKDIR /app
COPY gradle gradle
COPY gradlew gradlew.bat ./
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew
RUN ./gradlew dependencies --no-daemon

# Stage 2: Build (nutzt Dependencies-Cache)
FROM deps AS builder
COPY src ./src
RUN ./gradlew clean bootJar --no-daemon

# Stage 3: Runtime
FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar ./app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"] 