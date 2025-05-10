// Function to fetch and display the selected content
function updateContent() {
    const textElement = document.getElementById('selected-text');
    const imageContainer = document.getElementById('selected-image-container');
    const imageElement = document.getElementById('selected-image');
    const noContentElement = document.getElementById('no-content');
    // const contentLabelElement = document.getElementById('content-label');
    const actionTagElement = document.getElementById('action-tag');
    const analyzeButton = document.getElementById('analyze-btn');
    const resultsContainer = document.getElementById('results-container');
    const resultsTitle = document.getElementById('results-title');
    const resultsContent = document.getElementById('results-content');
    
    // Hide all content elements initially
    textElement.style.display = 'none';
    imageContainer.style.display = 'none';
    noContentElement.style.display = 'none';
    // resultsContainer.style.display = 'none';
    
    // Request the content from the background script
    chrome.runtime.sendMessage({ action: "getContent" }, (response) => {
      if (chrome.runtime.lastError) {
        noContentElement.style.display = 'block';
        noContentElement.textContent = "Error retrieving content.";
        return;
      }
      
      // Update UI based on content type and action type
      if (response.contentType === "text" && response.text) {
        // Display text content
        // contentLabelElement.textContent = "Selected Content:";
        textElement.style.display = 'block';
        textElement.textContent = response.text;
        
        // Set the action tag and button text based on action type
        if (response.actionType === "deepResearch") {
          actionTagElement.textContent = "Deep Research";
          actionTagElement.className = "action-tag research";
          analyzeButton.textContent = "Research Deeply";
          resultsTitle.textContent = "Research Results:";
        } else {
          actionTagElement.textContent = "Fact Check";
          actionTagElement.className = "action-tag";
          analyzeButton.textContent = "Check Facts";
          resultsTitle.textContent = "Fact Check Results:";
        }
      } 
      else if (response.contentType === "image" && response.imageUrl) {
        // Display image content
        // contentLabelElement.textContent = "Selected Image:";
        imageContainer.style.display = 'block';
        imageElement.src = response.imageUrl;
        
        // Set the action tag and button text for image analysis
        actionTagElement.textContent = "Image Analysis";
        actionTagElement.className = "action-tag image";
        analyzeButton.textContent = "Analyze Image";
        resultsTitle.textContent = "Image Analysis Results:";
      } 
      else {
        // No content or unknown type
        noContentElement.style.display = 'block';
        noContentElement.textContent = "No content selected. Please select text or an image on a webpage, right-click, and choose a FactSnap option.";
        
        // Reset the action tag
        actionTagElement.textContent = "No Action";
        actionTagElement.className = "action-tag";
      }
    });
  }
  
  // Function to simulate processing (in a real app, this would call your API)
  function processContent(contentType, actionType, content) {
    return new Promise((resolve) => {
      // This is a placeholder for your actual processing logic
      setTimeout(() => {
        if (contentType === "text") {
          if (actionType === "deepResearch") {
            resolve(`Deep research results for: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"\n\n` + 
                   `This is a simulated in-depth analysis that would normally include:\n` +
                   `• Comprehensive background information\n` +
                   `• Multiple credible sources analysis\n` +
                   `• Historical context and developments\n` +
                   `• Expert opinions and relevant citations\n` +
                   `• Related perspectives and implications`);
          } else {
            resolve(`Fact check results for: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"\n\n` +
                   `This is a simulated fact check that would normally include:\n` +
                   `• Verification status: Mostly accurate\n` +
                   `• Source verification: 3 reliable sources\n` +
                   `• Notable discrepancies: Minor date inconsistency\n` +
                   `• Context analysis: Complete`);
          }
        } else if (contentType === "image") {
          resolve(`Image analysis results:\n\n` +
                 `This is a simulated image analysis that would normally include:\n` +
                 `• Content description\n` +
                 `• Detected objects and entities\n` +
                 `• Authenticity verification\n` +
                 `• Related image search results\n` +
                 `• Metadata analysis`);
        }
      }, 1000); // Simulate 1 second processing time
    });
  }
  
  // When the panel is loaded, request the selected content from the background script
  document.addEventListener('DOMContentLoaded', () => {
    // Initial content fetch
    updateContent();
    
    // Listen for content updates from the background script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "contentUpdated" || message.action === "textUpdated") {
        updateContent();
        
        // Hide the results container when new content is loaded
        // document.getElementById('results-container').style.display = 'none';
      }
    });
    
    // Add event listener for the analyze button
    document.getElementById('analyze-btn').addEventListener('click', () => {
      const resultsContainer = document.getElementById('results-container');
      const resultsContent = document.getElementById('results-content');
      const analyzeButton = document.getElementById('analyze-btn');
      
      // Show loading state
      analyzeButton.disabled = true;
      analyzeButton.textContent = "Processing...";
      resultsContainer.style.display = 'block';
      resultsContent.textContent = "Analyzing content...";
      
      chrome.runtime.sendMessage({ action: "getContent" }, async (response) => {
        if (response.contentType === "text" && response.text) {
          // Process text based on action type
          try {
            const result = await processContent("text", response.actionType, response.text);
            resultsContent.textContent = result;
          } catch (error) {
            resultsContent.textContent = "Error processing content: " + error.message;
          }
        } 
        else if (response.contentType === "image" && response.imageUrl) {
          // Process image
          try {
            const result = await processContent("image", "analyzeImage", response.imageUrl);
            resultsContent.textContent = result;
          } catch (error) {
            resultsContent.textContent = "Error analyzing image: " + error.message;
          }
        }
        else {
          resultsContent.textContent = "Please select content on a webpage first.";
        }
        
        // Reset button state
        analyzeButton.disabled = false;
        analyzeButton.textContent = response.actionType === "deepResearch" ? "Research Deeply" : 
                                   response.contentType === "image" ? "Analyze Image" : "Check Facts";
      });
    });
    
    // Add event listener for the copy button
    document.getElementById('copy-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "getContent" }, (response) => {
        if (response.contentType === "text" && response.text) {
          // Copy text to clipboard
          navigator.clipboard.writeText(response.text)
            .then(() => {
              alert("Text copied to clipboard!");
            })
            .catch(err => {
              alert("Failed to copy text: " + err);
            });
        } 
        else if (response.contentType === "image" && response.imageUrl) {
          // Copy image URL to clipboard
          navigator.clipboard.writeText(response.imageUrl)
            .then(() => {
              alert("Image URL copied to clipboard!");
            })
            .catch(err => {
              alert("Failed to copy image URL: " + err);
            });
        }
        else {
          alert("No content to copy.");
        }
      });
    });
  });
  
  // Listen for visibility changes - when the panel becomes visible again, refresh content
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      updateContent();
    }
  });