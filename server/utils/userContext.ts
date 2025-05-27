export default function generateUserContext(
  selectedText: string,
  UPLOADED_DOCUMENTS: string[]
) {
  let userContext;

  if (selectedText) {
    userContext = selectedText;
  } else if (UPLOADED_DOCUMENTS.length > 0) {
    userContext = "Analyze all the given images & links to fulfill user query";
  } else {
    userContext = "No Additional Context Provided";
  }

  return userContext;
}
