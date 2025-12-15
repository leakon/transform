import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import { flowToTypeScript } from "@utils/clientTransformers";

export default function TypescriptToTypescriptDeclaration() {
  const transformer = useCallback(
    ({ value }) => flowToTypeScript(value, true, true),
    []
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="TypeScript"
      editorLanguage="typescript"
      resultTitle="TypeScript"
      resultLanguage="typescript"
    />
  );
}
