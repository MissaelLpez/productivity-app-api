# Productivity App GraphQL API

![image](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![image](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![image](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![image](https://img.shields.io/badge/Apollo%20GraphQL-311C87?&style=for-the-badge&logo=Apollo%20GraphQL&logoColor=white)
![image](https://img.shields.io/badge/GraphQl-E10098?style=for-the-badge&logo=graphql&logoColor=white)

Este es el backend de la aplicación Productivity App, construido con NestJS, Prisma ORM, Apollo, y GraphQL. Esta API proporciona los endpoints necesarios para gestionar tareas y datos.

## Tecnologías Utilizadas

- **NestJS**: Un framework de Node.js para construir aplicaciones del lado del servidor eficientes y escalables.
- **Prisma ORM**: Un ORM moderno y de tipo seguro para TypeScript y Node.js, utilizado para gestionar la base de datos.
- **Apollo Server**: Una implementación de servidor GraphQL que permite construir un API flexible y escalable.
- **GraphQL**: Un lenguaje de consulta para tu API que permite obtener solo los datos necesarios.

## Requisitos Previos

- Node.js y npm instalados.
- Una base de datos PostgreSQL (u otro tipo soportado por Prisma) configurada y accesible.

## Instalación y Configuración

Para configurar y ejecutar este proyecto localmente, sigue los siguientes pasos:

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/MissaelLpez/productivity-app-api.git
   cd api-repo
   ```

2. **Configurar las variables de entorno:**

   Crea un archivo `.env` en la raíz del proyecto y agrega la URL de conexión de tu base de datos:

   ```bash
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_base_datos"
   ```

   Asegúrate de reemplazar con tus credenciales de base de datos reales.

3. **Instalar las dependencias:**

   ```bash
   npm install
   ```

4. **Ejecutar las migraciones de la base de datos:**

   ```bash
   npx prisma migrate deploy
   ```

   Esto aplicará todas las migraciones necesarias a la base de datos configurada.

5. **Ejecutar la aplicación en modo desarrollo:**

   ```bash
   npm run start:dev
   ```

   La API estará disponible en http://localhost:3000/graphql.

## Prueba la Aplicación Frontend

El repositorio del frontend de la Productivity App que utiliza esta API está disponible en el siguiente enlace:

[Repositorio del Frontend - Productivity App](https://github.com/MissaelLpez/productivity-app-client)

## Contacto

Si tienes alguna pregunta o sugerencia, no dudes en contactarme a missaellpez@gmail.com
