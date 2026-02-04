import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sengketa API',
      version: '1.0.0',
      description: 'API documentation for Sengketa project',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      schemas: {
        MenerimaSengketa: {
          type: 'object',
          properties: {
            idSengketa: {
              type: 'string',
            },
            pemohon: {
              type: 'string',
            },
            termohon: {
              type: 'string',
            },
          },
        },
        ValidasiSengketa: {
          type: 'object',
          properties: {
            idSengketa: {
              type: 'string',
            },
            jumlah: {
              type: 'string',
            },
            skpd: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        PembuatanSidangAwal: {
          type: 'object',
          properties: {
            idSengketa: {
              type: 'string',
            },
            idJadwal: {
              type: 'string',
            },
            agenda: {
              type: 'string',
            },
            tanggal: {
              type: 'string',
              format: 'date',
            },
            alamat: {
              type: 'string',
            },
          },
        },
        TambahSidang: {
          type: 'object',
          properties: {
            idSengketa: {
              type: 'string',
            },
            idJadwal: {
              type: 'string',
            },
            jenis: {
              type: 'string',
            },
            agenda: {
              type: 'string',
            },
            tanggal: {
              type: 'string',
              format: 'date',
            },
            alamat: {
              type: 'string',
            },
          },
        },
        TambahPutusan: {
          type: 'object',
          properties: {
            idSengketa: {
              type: 'string',
            },
            idJadwal: {
              type: 'string',
            },
            statusPutusan: {
              type: 'string',
            },
            cid: {
              type: 'string',
              format: 'binary',
              description: 'PDF file (optional)',
            },
            jdih: {
              type: 'string',
            },
          },
        },
        BatalCabutSengketa: {
          type: 'object',
          properties: {
            idSengketa: {
              type: 'string',
            },
            cid: {
              type: 'string',
              format: 'binary',
              description: 'PDF file (optional)',
            },
          },
        },
        ContractResponse: {
          type: 'object',
          properties: {
            hash: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../controllers/*.ts')], // Path to your controller file
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerDocs;
