import swaggerDocs from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    openapi: "1.0.0",
    definition: {
        components: { },
        info: {
            title: "Tuura Rent Management System",
            description:
                "Tuura is a rent management system that will help property owners to manage their tenants and be able to showcase and rent their properties easily \n\nMade with ❤️ by Tuura RMS Backend Developers",
            version: "1.0.0",
        },
        consumes: ["application/x-www-form-urlencoded", "application/json", "multipart/form-data"],
        produces: ["application/json"],
        basePath: "/",
    },
    apis: ["./routes/*.js"],
};

const swaggerJsdoc = swaggerDocs(options);

const _swaggerJsdoc = swaggerJsdoc;
export { _swaggerJsdoc as swaggerJsdoc };
const _swaggerUi = swaggerUi;
export { _swaggerUi as swaggerUi };
