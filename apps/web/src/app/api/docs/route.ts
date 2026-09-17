import { NextResponse } from 'next/server';
import { SWAGGER_CSS_URL, SWAGGER_JS_URL } from '@galaxy/shared';

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Galaxy of Beauty — API Docs</title>
  <link rel="stylesheet" href="${SWAGGER_CSS_URL}">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${SWAGGER_JS_URL}" crossorigin></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      defaultModelsExpandDepth: 1,
      docExpansion: 'list',
      defaultLanguage: 'ar',
      layout: 'BaseLayout',
    });
  </script>
</body>
</html>`;

export async function GET(): Promise<NextResponse> {
  return new NextResponse(swaggerHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
