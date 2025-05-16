function formatAiResponse(output: string) {
  let result = {
    markdown: "",
    title: "",
    verdict: false,
    followUpQuestions: [],
    thinking:""
  };
  try {
    let mainBody:any = output,
      isThinking = output.indexOf("<think>");
    if (isThinking != -1) {
      const thinking = output.slice(isThinking, output.indexOf("</think>") + 9);
      mainBody = output.slice(output.indexOf("</think>") + 9);
    }
    mainBody = JSON.parse(mainBody)
    // result.markdown = (mainBody.shortAnswer.startsWith("## Short Answer") ? "" : "## Short Answer\n") + mainBody.shortAnswer + "\n\n" + (mainBody.detailedAnswer.startsWith("## Detailed Answer") ? "" : "## Detailed Answer")  + mainBody.detailedAnswer;
    result.markdown = mainBody.shortAnswer + "\n" +  mainBody.detailedAnswer;
    result.followUpQuestions = mainBody.followUpQuestions,
    result.verdict = mainBody.verdict,
    result.title = mainBody.title
    return result;
  } catch (err) {
    console.log(err);
    return result
  }
}

export default formatAiResponse;
