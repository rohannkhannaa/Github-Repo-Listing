// Main Variables
var username ;
let usernameInput = document.getElementById("githubUsername");
let getButton = document.getElementById("submitButton");
const reposPerPage = 10;
let currentPage = 1;
// fetchRepos("fer", 1)
checkUserEntered();
async function checkUserEntered() {
  const username = document.getElementById("githubUsername").value;
  const reposListElement = document.getElementById("reposList");

  if (!username || username.length === 0) {
    const noReposMessage = document.createElement("div");
    noReposMessage.innerHTML = `<p class="text-center">Please enter your github username.</p>`;
    reposListElement.appendChild(noReposMessage);
  }
}


// Code to search for a particular username
getButton.onclick = function (event) {
  event.preventDefault(); // Prevents the form from submitting (and page reloading)
  username = usernameInput.value;
  console.log("Username: " + username);
  fetchRepos(username, currentPage);
};
async function fetchRepos(username, currentPage) {
  try {
    // Server-side pagination
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${reposPerPage}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("User not found. Please enter a valid GitHub username.");
      } else {
        throw new Error("An error occurred while fetching repositories.");
      }
    }

    const repos = await response.json();
    displayRepos(repos, username);
  } catch (error) {
    console.error("Error fetching repositories:", error);

    // Display an error message
    const reposListElement = document.getElementById("reposList");
    reposListElement.innerHTML = `<p class="text-center">${error.message || "Error fetching repositories."}</p>`;

    // You may want to clear the pagination as well
    const paginationElement = document.getElementById("pagination");
    paginationElement.innerHTML = "";
  }
}

// Fetch data based on page number
// async function fetchRepos(username, currentPage) {
//   try {
//     // Server-side pagination
//     const response = await fetch(
//       `https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${reposPerPage}`
//     );
//     const repos = await response.json();
//     displayRepos(repos, username);
//   } catch (error) {
//     console.log("Error fetching repositories:", error);
//   }
// }

// Fetch total no of repos
async function totalReposCount(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    const userData = await response.json();
    console.log("Total Repositories: " + userData.public_repos);
    return userData.public_repos;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return 0; // Default to 0 in case of an error
  }
}

function displayRepos(repos, username) {
  const reposListElement = document.getElementById("reposList");

  // Clear previous content
  reposListElement.innerHTML = "";

  // Display each repository in a grid
  let repoGridElement; // New variable to keep track of the grid

  if (!repos || repos.length === 0) {
    // If there are no repositories, display a message
    const noReposMessage = document.createElement("div");
    noReposMessage.innerHTML = `<p class="text-center">No repositories were found for this account.</p>`;
    reposListElement.appendChild(noReposMessage);
  } else {
    // Repositories are available, proceed with the grid layout
   // Repositories are available, proceed with the grid layout
repos?.forEach((repo, index) => {
  if (index % 2 === 0) {
    // Create a new row for every two repositories
    repoGridElement = document.createElement("div");
    repoGridElement.className = "row"; // Remove d-flex and flex-column classes
  }

  const repoElement = document.createElement("div");
  repoElement.className = "col-sm-6 mb-4"; // Add col-sm-6 class

  repoElement.innerHTML = `
    <div class="card">
      <div class="card-body">
        <a class="card-title" href="${repo.html_url}">${repo.name}</a>
        <p class="card-text">${repo.description || "No description provided"}</p>
        <div class="topic-boxes">${renderTopicBoxes(repo.topics)}</div>
      </div>
    </div>
  `;

  repoGridElement.appendChild(repoElement);

  if (index % 2 === 1 || index === repos.length - 1) {
    // If the index is odd or it's the last repository, append the row to the main container
    reposListElement.appendChild(repoGridElement);
  }
});

    // repos?.forEach((repo, index) => {
    //   if (index % 2 === 0) {
    //     // Create a new row for every two repositories
    //     repoGridElement = document.createElement("div");
    //     repoGridElement.className = "row";
    //   }

    //   const repoElement = document.createElement("div");
    //   repoElement.className = "col-sm-6 mb-4"; // Each repository takes half of the row with bottom margin

    //   repoElement.innerHTML = `
    //     <div class="card">
    //       <div class="card-body">
    //         <a class="card-title" href="${repo.html_url}">${repo.name}</a>
    //         <p class="card-text">${repo.description || "No description provided"}</p>
    //         <div class="topic-boxes">${renderTopicBoxes(repo.topics)}</div>
    //       </div>
    //     </div>
    //   `;

    //   repoGridElement.appendChild(repoElement);

    //   if (index % 2 === 1 || index === repos.length - 1) {
    //     // If the index is odd or it's the last repository, append the row to the main container
    //     reposListElement.appendChild(repoGridElement);
    //   }
    // });
  }

  updatePagination(username);
}

function renderTopicBoxes(topics) {
  if (!topics || topics.length === 0) {
    return ""; // No topics, return empty string
  }

  // Map each topic to a small box
  const topicBoxes = topics.map(topic => `<div class="topic-box">${topic}</div>`);

  // Join the topic boxes and return as a single string
  return topicBoxes.join("");
}

async function updatePagination(username) {
  const paginationElement = document.getElementById("pagination");

  try {
    const totalPages = await totalReposCount(username);
    const reqPages = Math.ceil(totalPages / reposPerPage); // Assuming reposPerPage items per page

    // Clear previous pagination
    paginationElement.innerHTML = "";

    // Create the navigation structure
    const navElement = document.createElement("nav");
    navElement.setAttribute("aria-label", "Page navigation example");

    const ulElement = document.createElement("ul");
    ulElement.className = "pagination justify-content-center"; // Center the pagination

    // Calculate the starting and ending page numbers to display (limit to 10 pages)
    let startPage = Math.max(1, currentPage - 4);
    let endPage = Math.min(reqPages, startPage + 9);

    // Adjust the startPage if the endPage is at the maximum limit
    startPage = Math.max(1, endPage - 9);

    // Create "Previous" button
    const previousLi = document.createElement("li");
    previousLi.className = "page-item";
    const previousLink = document.createElement("a");
    previousLink.className = "page-link";
    previousLink.href = "#";
    previousLink.innerHTML = "Previous";
    previousLink.onclick = () => changePage(currentPage - 1);
    previousLi.appendChild(previousLink);
    ulElement.appendChild(previousLi);

    // Create page links
    for (let i = startPage; i <= endPage; i++) {
      const liElement = document.createElement("li");
      liElement.className = "page-item";
      const pageLink = document.createElement("a");
      pageLink.className = "page-link";
      pageLink.href = "#";
      pageLink.innerHTML = i;

      // Add the 'active' class to the current page link
      if (i === currentPage) {
        liElement.className += " active";
      }

      pageLink.onclick = () => changePage(i);
      liElement.appendChild(pageLink);
      ulElement.appendChild(liElement);
    }

    // Create "Next" button
    const nextLi = document.createElement("li");
    nextLi.className = "page-item";
    const nextLink = document.createElement("a");
    nextLink.className = "page-link";
    nextLink.href = "#";
    nextLink.innerHTML = "Next";

    // Disable the "Next" button if on the last page
    if (currentPage === reqPages) {
      nextLi.className += " disabled";
      nextLink.removeAttribute("onclick");
    } else {
      nextLink.onclick = () => changePage(currentPage + 1);
    }

    nextLi.appendChild(nextLink);
    ulElement.appendChild(nextLi);

    // Append elements to the document
    navElement.appendChild(ulElement);
    paginationElement.appendChild(navElement);
  } catch (error) {
    console.error("Error updating pagination:", error);
  }
}






function changePage(page) {
  currentPage = page;
  let username = usernameInput.value; // Get the username again
  fetchRepos(username, currentPage);
}
