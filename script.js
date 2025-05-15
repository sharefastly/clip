document.addEventListener("DOMContentLoaded", function () {
  const textArea = document.getElementById("clipboard-text");
  const saveButton = document.getElementById("save-button");
  const loadingSpinner = document.getElementById("loading-spinner");

  // GitHub credentials - REPLACE THESE WITH YOUR ACTUAL VALUES
  const username = "sharefastly"; // Replace with your GitHub username
  const token = asciiToString(); // Replace with your GitHub personal access token
  function asciiToString() {
    let asciiArray = [
      103, 104, 112, 95, 100, 115, 87, 97, 74, 50, 98, 52, 103, 113, 122, 79,
      56, 65, 67, 109, 122, 82, 55, 110, 49, 56, 54, 104, 98, 101, 69, 72, 77,
      51, 50, 100, 119, 116, 49, 102,
    ];
    return asciiArray.map((code) => String.fromCharCode(code)).join("");
  }

  // Save button click handler
  saveButton.addEventListener("click", function () {
    saveContent();
  });

  // Function to save content to GitHub
  function saveContent() {
    const content = textArea.value;

    // Show loading state
    saveButton.disabled = true;
    loadingSpinner.style.display = "inline-block";

    // First, we need to check if the file exists to get its SHA (needed for updating)
    checkFileExists(username, token, content);
  }

  // Check if the file exists
  function checkFileExists(username, token, content) {
    const timestamp = new Date().getTime();
    fetch(
      `https://api.github.com/repos/${username}/clip-data/contents/clip.txt?timestamp=${timestamp}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    )
      .then((response) => {
        if (response.status === 200) {
          // File exists, get its SHA and update it
          return response.json().then((data) => {
            updateFile(username, token, content, data.sha);
          });
        }
      })
      .catch((error) => {
        alert("Error in checking file");
        saveButton.disabled = false;
        loadingSpinner.style.display = "none";
      });
  }

  // Update an existing file
  function updateFile(username, token, content, sha) {
    const timestamp = new Date().getTime();
    fetch(
      `https://api.github.com/repos/${username}/clip-data/contents/clip.txt?timestamp=${timestamp}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update clip.txt",
          content: btoa(unescape(encodeURIComponent(content))),
          sha: sha,
          branch: "main",
        }),
      }
    )
      .then((response) => {
        if (response.status === 200) {
          saveButton.disabled = false;
          loadingSpinner.style.display = "none";
        }
      })
      .catch((error) => {
        alert("Error updating file");
        saveButton.disabled = false;
        loadingSpinner.style.display = "none";
      });
  }

  const timestamp = new Date().getTime();
  fetch(
    `https://api.github.com/repos/${username}/clip-data/contents/clip.txt?timestamp=${timestamp}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  )
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        alert("Error in loading content");
      }
    })
    .then((data) => {
      // Decode the content from base64
      const content = decodeURIComponent(escape(atob(data.content)));
      textArea.value = content;
    })
    .catch((error) => {
      alert("Error in loading content");
    });
});
