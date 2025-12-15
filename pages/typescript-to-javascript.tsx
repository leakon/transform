import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import { typescriptToJavaScript } from "@utils/clientTransformers";

export default function TypescriptToJavascript() {
  const transformer = useCallback(
    ({ value }) => typescriptToJavaScript(value),
    []
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="TypeScript"
      editorLanguage="typescript"
      editorDefaultValue="typescript"
      resultTitle="JavaScript"
      resultLanguage={"javascript"}
    />
  );
}
