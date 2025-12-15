import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import { typescriptToFlow } from "@utils/clientTransformers";

export default function TypescriptToFlow() {
  const transformer = useCallback(
    ({ value }) => typescriptToFlow(value),
    []
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="TypeScript"
      editorLanguage="typescript"
      resultTitle="Flow"
      resultLanguage={"plaintext"}
    />
  );
}
