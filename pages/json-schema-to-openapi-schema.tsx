import ConversionPanel, { Transformer } from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import { jsonSchemaToOpenApiSchema } from "@utils/clientTransformers";

export default function JsonSchemaToOpenapiSchema() {
  const transformer = useCallback<Transformer>(async ({ value }) => {
    const json = JSON.parse(value);
    return jsonSchemaToOpenApiSchema(json);
  }, []);

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON Schema"
      editorLanguage="json"
      editorDefaultValue="jsonSchema"
      resultTitle="Open API Schema"
      resultLanguage={"json"}
    />
  );
}
