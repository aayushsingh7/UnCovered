function formatAiResponse(rawContent: string): {
  markdown: string;
  sources: any;
  tasks: any;
  followUpQuestions: any;
  verdict: any;
  title: any;
  thinking?: string;
} {
  let thinking: string | undefined;

  if (rawContent.startsWith("```")) {
    rawContent = rawContent
      .replace(/^```[a-zA-Z]*\n?/, "")
      .replace(/```/, "");
  }

  console.log(rawContent);

  if (rawContent.startsWith("<think>")) {
    thinking = rawContent
      .slice(
        rawContent.indexOf("<think>") + 7,
        rawContent.lastIndexOf("</think>")
      )
      .trim()
      .split("\n")
      .filter((pera) => pera != "")
      .map((pera) => "> " + pera)
      .join("\n\n");

    rawContent = rawContent.slice(rawContent.indexOf("</think>") + 9);
  }

  if (
    (rawContent.startsWith('"') && rawContent.endsWith('"')) ||
    (rawContent.startsWith("'") && rawContent.endsWith("'"))
  ) {
    rawContent = rawContent.slice(1, -1);
  }

  const rawParsed: any[] = JSON.parse(rawContent);

  return {
    markdown: rawParsed[0],
    sources: rawParsed[1]?.sources,
    tasks: rawParsed[2]?.tasks,
    followUpQuestions: rawParsed[3]?.followUpQuestions,
    verdict: rawParsed[4]?.verdict,
    title: rawParsed[5]?.title,
    thinking,
  };
}

export default formatAiResponse;
