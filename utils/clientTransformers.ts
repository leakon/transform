/**
 * 客户端转换工具
 * 用于替代 API 路由，支持静态导出
 */

// HTML to Pug
export async function htmlToPug(value: string, settings: any): Promise<string> {
  // 动态导入 html2pug
  const html2pugModule = await import("html2pug");
  const html2pug = html2pugModule.default || html2pugModule;
  return html2pug(value, settings);
}

// Flow to JavaScript
export async function flowToJavaScript(value: string): Promise<string> {
  // 使用 @babel/standalone 在客户端运行
  const Babel = await import("@babel/standalone");
  const { transform } = Babel;
  const transformFlow = (await import("@babel/plugin-transform-flow-strip-types")).default;
  
  try {
    // 使用 Babel standalone 转换 Flow 代码
    const result = transform(value, {
      plugins: [transformFlow],
      presets: []
    });
    return result.code || value;
  } catch (e) {
    throw new Error(`转换失败: ${e.message}`);
  }
}

// TypeScript to JavaScript
export async function typescriptToJavaScript(value: string): Promise<string> {
  // 使用 @babel/standalone 在客户端运行
  const Babel = await import("@babel/standalone");
  const { transform } = Babel;
  const transformTypescript = (await import("@babel/plugin-transform-typescript")).default;
  
  try {
    const result = transform(value, {
      plugins: [transformTypescript],
      presets: []
    });
    return result.code || value;
  } catch (e) {
    throw new Error(`转换失败: ${e.message}`);
  }
}

// TypeScript to Flow
export async function typescriptToFlow(value: string): Promise<string> {
  try {
    const flowgen = await import("flowgen");
    const result = flowgen.compiler.compileDefinitionString(value);
    return flowgen.beautify(result);
  } catch (e) {
    throw new Error(`转换失败: ${e.message}`);
  }
}

// Flow to TypeScript
export async function flowToTypeScript(
  value: string,
  declarationOnly: boolean = false,
  isTS: boolean = false
): Promise<string> {
  try {
    const { convert } = await import("@khanacademy/flow-to-ts");
    const ts = await import("typescript");

    const tsCode = isTS ? value : convert(value);

    if (!declarationOnly) {
      return tsCode;
    }

    let output = "";

    const options = {
      allowJs: true,
      declaration: true,
      emitDeclarationOnly: true,
      jsx: ts.JsxEmit.React,
      skipDefaultLibCheck: true,
      skipLibCheck: true
    };

    const host = ts.createCompilerHost(options);

    host.getSourceFile = (filename: string) => {
      if (filename === "file.ts") {
        return ts.createSourceFile(filename, tsCode, undefined);
      }
      return ts.createSourceFile(filename, "", undefined);
    };

    host.writeFile = (_name: string, text: string) => {
      output = text;
    };

    const program = ts.createProgram(["file.ts"], options, host);
    program.emit();

    return output;
  } catch (e) {
    throw new Error(`转换失败: ${e.message}`);
  }
}

// TypeScript to JSON Schema
export async function typescriptToJsonSchema(_value: string): Promise<string> {
  // 这个功能需要服务器端 TypeScript 编译器，静态版本不支持
  throw new Error("TypeScript to JSON Schema conversion requires server-side processing. This feature is not available in static export mode.");
}

// JSON Schema to OpenAPI Schema
export async function jsonSchemaToOpenApiSchema(value: any): Promise<string> {
  try {
    const toOpenApi = (await import("@openapi-contrib/json-schema-to-openapi-schema")).default;
    const result = await toOpenApi(value, {
      cloneSchema: true
    });
    return JSON.stringify(result, null, 2);
  } catch (e) {
    throw new Error(`转换失败: ${e.message}`);
  }
}

// TypeScript to Zod
export async function typescriptToZod(_value: string, _settings?: any): Promise<string> {
  // 这个功能需要服务器端 TypeScript 编译器，静态版本不支持
  throw new Error("TypeScript to Zod conversion requires server-side processing. This feature is not available in static export mode.");
}

