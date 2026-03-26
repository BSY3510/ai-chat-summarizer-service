# [Build Stage] Gradle 환경에서 Spring Boot 앱을 빌드합니다.
FROM gradle:8.5-jdk17 AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src src
RUN gradle clean build -x test

# [Run Stage] 가벼운 JRE 환경에서 빌드된 결과물(.jar)만 가져와서 실행합니다.
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/build/libs/*SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]