import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import { flowToJavaScript } from "@utils/clientTransformers";

export default function FlowToJavascript() {
  const transformer = useCallback(
    ({ value }) => flowToJavaScript(value),
    []
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="Flow"
      editorLanguage="plaintext"
      editorDefaultValue="flow"
      resultTitle="JavaScript"
      resultLanguage={"javascript"}
    />
  );
}
