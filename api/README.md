# Documentación Técnica: EDC-API (Spring Boot)

## Introducción

`EDC-api` es un servicio backend desarrollado en **Spring Boot** que forma parte del sistema de carga automatizada de datos financieros. Esta API se conecta a una base de datos PostgreSQL y expone endpoints REST que permiten consultar la información cargada por los scripts Python.

Forma parte de una arquitectura distribuida que incluye:

* `python-checker`: daemon que monitorea el sistema y activa la carga.
* `python-loader`: script que transforma y carga los datos a la base de datos.
* `postgres`: base de datos principal.

---

## Tecnologías Utilizadas

* Java 21
* Spring Boot 3+
* Spring Data JPA
* PostgreSQL
* Maven

---

## Estructura del Proyecto

```
edc-api/
├── src/
│   └── main/
│       ├── java/com/edc/api/
│       │   ├── controller/
│       │   ├── model/
│       │   ├── repository/
│       │   └── EDCApplication.java
│       └── resources/
│           ├── application.properties
│           └── ...
├── Dockerfile
├── mvnw / mvnw.cmd
└── pom.xml
```

---

## Configuración

El archivo `application.properties` debe contener:

```properties
spring.datasource.url=jdbc:postgresql://db:5432/finanzas
spring.datasource.username=root
spring.datasource.password=1234
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
```

---

## Endpoints REST

### `/api/cuentas`

* **Método:** `GET`
* **Descripción:** Retorna todas las transacciones cargadas en la tabla `finanzas`.
* **Respuesta:**

```json
[
  {
    "fechavalor": "2024-05-30",
    "descripcion": "TRANSFERENCIA",
    "ingreso": 150.0,
    "ingresoDolar": 4.23
  },
  ...
]
```

---

## Consideraciones

* Esta API está diseñada para funcionar en un contenedor Docker y comunicarse con los otros servicios mediante `docker-compose`.
* Las consultas se realizan mediante JPA y repositorios personalizados.
* Las entidades están mapeadas directamente a las tablas de la base de datos (`finanzas`, `valor_dolar`, `archivos_cargados`).

---

## Docker

### Dockerfile

```Dockerfile
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests
ENTRYPOINT ["java", "-jar", "target/api-0.0.1-SNAPSHOT.jar"]
```

### docker-compose (fragmento relevante)

```yaml
  spring-api:
    build:
      context: ./edc-api
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=finanzas
      - DB_USER=root
      - DB_PASSWORD=1234
    ports:
      - "8080:8080"
```


---

© 2025 - Proyecto EDC
