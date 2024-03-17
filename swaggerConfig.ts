import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "vSharee",
      version: "1.0.0",
      description: "Documentation for your API",
    },
    servers: [
      {
        url: "http://localhost:8000", // Change this to match your server URL
        description: "Development server",
      },
    ],
    securityDefinitions: {
      BearerAuth: {
        type: "apiKey",
        name: "Authorization",
        scheme: "bearer",
        in: "header",
      },
    },
  },
  apis: ["./routes/*.ts"], // Path to the files containing your API routes
};

const specs = swaggerJsdoc(options);

export default specs;
