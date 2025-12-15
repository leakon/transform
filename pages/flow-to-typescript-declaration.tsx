import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import { flowToTypeScript } from "@utils/clientTransformers";

export default function FlowToTypescriptDeclaration() {
  const transformer = useCallback(
    ({ value }) => flowToTypeScript(value, true, false),
    []
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="Flow"
      editorLanguage="plaintext"
      editorDefaultValue="flow"
      resultTitle="TypeScript Declarations"
      resultLanguage={"typescript"}
    />
  );
}
