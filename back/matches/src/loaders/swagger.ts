// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const { defaultMetadataStorage } = require('class-transformer/cjs/storage');
import * as swaggerUiExpress from 'swagger-ui-express';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllerOptions } from '../../config/routingControllerOptions';
import * as oa from 'openapi3-ts';
import express from 'express';

export default ({ app }: { app: express.Application }) => {
  const schemas = validationMetadatasToSchemas({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    classTransformerMetadataStorage: defaultMetadataStorage,
    refPointerPrefix: '#/components/schemas/'
  });

  const storage = getMetadataArgsStorage();
  const spec = routingControllersToSpec(storage, routingControllerOptions, {
    components: {
      schemas,
      securitySchemes: {
        basicAuth: {
          scheme: 'bearer',
          type: 'apiKey',
          in: 'headers',
          name: 'authorization'
        }
      }
    },
    info: {
      title: 'Documentation for the Matches API',
      version: '1.0.0'
    }
  });

  app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(spec));
};
