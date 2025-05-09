document.addEventListener("DOMContentLoaded", function () {
  const textArea = document.getElementById("clipboard-text");
  const saveButton = document.getElementById("save-button");
  const statusMessage = document.getElementById("status-message");
  const loadingSpinner = document.getElementById("loading-spinner");

  // GitHub credentials - REPLACE THESE WITH YOUR ACTUAL VALUES
  const username = "sharefastly"; // Replace with your GitHub username
  const token = asciiToString(); // Replace with your GitHub personal access token

  // Load content when page loads
  loadContent();

  // Save button click handler
  saveButton.addEventListener("click", function () {
    saveContent();
  });
  
  // Function to save content to GitHub
  function saveContent() {
    const text = textArea.value;

    // Validate credentials (in a real app, you might want better validation)
    if (username === "YOUR_GITHUB_USERNAME" || token === "YOUR_GITHUB_TOKEN") {
      showStatus(
        "Please update the GitHub credentials in the JavaScript code.",
        "error"
      );
      return;
    }

    // Show loading state
    saveButton.disabled = true;
    loadingSpinner.style.display = "inline-block";

    // First, we need to check if the file exists to get its SHA (needed for updating)
    checkFileExists(username, token, text);
  }

  // Check if the file exists
  function checkFileExists(username, token, content) {
    fetch(
      `https://api.github.com/repos/${username}/clip-data/contents/clip.txt`,
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
        } else if (response.status === 404) {
          // File or repo doesn't exist
          checkRepoExists(username, token, content);
        } else {
          throw new Error(`GitHub API returned status ${response.status}`);
        }
      })
      .catch((error) => {
        console.error("Error checking file:", error);
        saveButton.disabled = false;
        loadingSpinner.style.display = "none";
        showStatus("Error checking file: " + error.message, "error");
      });
  }

  // Check if the repository exists
  function checkRepoExists(username, token, content) {
    fetch(`https://api.github.com/repos/${username}/clip-data`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })
      .then((response) => {
        if (response.status === 200) {
          // Repo exists but file doesn't, create the file
          createFile(username, token, content);
        } else if (response.status === 404) {
          // Repo doesn't exist, create it
          createRepo(username, token, content);
        } else {
          throw new Error(`GitHub API returned status ${response.status}`);
        }
      })
      .catch((error) => {
        console.error("Error checking repository:", error);
        saveButton.disabled = false;
        loadingSpinner.style.display = "none";
        showStatus("Error checking repository: " + error.message, "error");
      });
  }

  // Create a new repository
  function createRepo(username, token, content) {
    fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "clip-data",
        description: "A repository for storing clipboard text",
        auto_init: true,
      }),
    })
      .then((response) => {
        if (response.status === 201) {
          // Repository created, now create the file
          // Wait a bit for GitHub to initialize the repo
          setTimeout(() => {
            createFile(username, token, content);
          }, 2000);
        } else {
          throw new Error(`GitHub API returned status ${response.status}`);
        }
      })
      .catch((error) => {
        console.error("Error creating repository:", error);
        saveButton.disabled = false;
        loadingSpinner.style.display = "none";
        showStatus("Error creating repository: " + error.message, "error");
      });
  }

  // Create a new file in the repository
  function createFile(username, token, content) {
    fetch(
      `https://api.github.com/repos/${username}/clip-data/contents/clip.txt`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Create clip.txt",
          content: btoa(unescape(encodeURIComponent(content))),
          branch: "main",
        }),
      }
    )
      .then((response) => {
        if (response.status === 201) {
          saveButton.disabled = false;
          loadingSpinner.style.display = "none";
          alert("hi");
          showStatus("Content saved successfully!", "success");
        } else {
          throw new Error(`GitHub API returned status ${response.status}`);
        }
      })
      .catch((error) => {
        console.error("Error creating file:", error);
        saveButton.disabled = false;
        loadingSpinner.style.display = "none";
        showStatus("Error creating file: " + error.message, "error");
      });
  }

  // Update an existing file
  function updateFile(username, token, content, sha) {
    fetch(
      `https://api.github.com/repos/${username}/clip-data/contents/clip.txt`,
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
          showStatus("Content updated successfully!", "success");
        } else {
          throw new Error(`GitHub API returned status ${response.status}`);
        }
      })
      .catch((error) => {
        console.error("Error updating file:", error);
        saveButton.disabled = false;
        loadingSpinner.style.display = "none";
        showStatus("Error updating file: " + error.message, "error");
      });
  }

  // Load content from GitHub
  function loadContent() {
    // Check if credentials are still placeholder values
    if (username === "YOUR_GITHUB_USERNAME" || token === "YOUR_GITHUB_TOKEN") {
      showStatus(
        "Please update the GitHub credentials in the JavaScript code.",
        "error"
      );
      return;
    }

    showStatus("Loading content...", "success");

    fetch(
      `https://api.github.com/repos/${username}/clip-data/contents/clip.txt`,
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
          throw new Error(`GitHub API returned status ${response.status}`);
        }
      })
      .then((data) => {
        // Decode the content from base64
        const content = decodeURIComponent(escape(atob(data.content)));
        textArea.value = content;
        statusMessage.style.display = "none";
      })
      .catch((error) => {
        console.error("Error loading content:", error);
        // Don't show error message if it's likely just that the repo doesn't exist yet
        if (!error.message.includes("404")) {
          showStatus("Error loading content: " + error.message, "error");
        }
      });
  }

//   Helper function to show status messages
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status';
    statusMessage.classList.add(type);
  }

  function asciiToString() {
    let asciiArray = [
      103,
      104,
      112,
      95,
      100,
      115,
      87,
      97,
      74,
      50,
      98,
      52,
      103,
      113,
      122,
      79,
      56,
      65,
      67,
      109,
      122,
      82,
      55,
      110,
      49,
      56,
      54,
      104,
      98,
      101,
      69,
      72,
      77,
      51,
      50,
      100,
      119,
      116,
      49,
      102
  ];
    return asciiArray.map((code) => String.fromCharCode(code)).join("");
  }
});
