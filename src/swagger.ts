import { Express, Request, Response } from "express";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Match 4 Action API Docs",
      version: "2.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js.map", "./schemas/*.js.map", "./routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

import fs from 'fs';

function listarArquivosEmDiretorio(caminhoDoDiretorio: string): string[] {
  try {
    // Leitura dos arquivos no diretório
    const arquivos = fs.readdirSync(caminhoDoDiretorio);

    // Filtrar apenas os arquivos (excluindo subdiretórios)
    const arquivosFiltrados = arquivos.filter((arquivo) =>
      fs.statSync(`${caminhoDoDiretorio}/${arquivo}`).isFile()
    );

    return arquivosFiltrados;
  } catch (error) {
    console.error(`Erro ao listar arquivos: ${error}`);
    return [];
  }
}




function swaggerDocs(app: Express, port: number) {
  // Swagger page
  console.log('meu dir em swaggerdocs  ' + __dirname);
  app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCssUrl: CSS_URL }));
  // Docs in JSON format
  app.get("/api-doc.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Exemplo de uso
  const diretorioParaListar = '/var/task/src/routes';
  const arquivosEncontrados = listarArquivosEmDiretorio(diretorioParaListar);

  console.log('Arquivos no diretório:');
  console.log(arquivosEncontrados);

  console.log(process.cwd());
}

export default swaggerDocs;
