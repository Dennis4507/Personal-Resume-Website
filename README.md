# Personal Resume Website

A modern, responsive personal resume website built with HTML, CSS, and JavaScript, featuring dynamic integrations with AWS (visitor counter, contact form), social media links, and a professional portfolio carousel.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Cloning the Repository](#cloning-the-repository)
  - [Local Development](#local-development)
- [Project Structure](#project-structure)
- [Key Customizations & Features](#key-customizations--features)
  - [Sidebar & Responsive Design](#sidebar--responsive-design)
  - [Visitor Counter (AWS Lambda)](#visitor-counter-aws-lambda)
  - [Contact Form (AWS Lambda)](#contact-form-aws-lambda)
  - [Social Media Integration](#social-media-integration)
  - [Portfolio Carousel](#portfolio-carousel)
- [GitHub Actions & CI/CD](#github-actions--cicd)
- [AWS Integrations](#aws-integrations)
- [Deployment](#deployment)
- [Credits](#credits)
- [License](#license)

---

## Project Overview

This project is a personal resume website designed to showcase professional experience, skills, and portfolio projects. It is fully responsive, features a collapsible sidebar for mobile, and integrates with AWS for dynamic visitor counting and contact form submissions.

---

## Features

- Responsive sidebar with contact info, social links, and visitor counter
- Experience timeline with nested responsibilities and clean bullet formatting
- Portfolio carousel with project previews
- Visitor counter powered by AWS Lambda & API Gateway
- Contact form that sends emails via AWS Lambda & API Gateway
- GitHub Actions for automated workflows
- Modern, accessible design

---

## Getting Started

### Cloning the Repository

```bash
git clone https://github.com/YOUR-USERNAME/Personal-Resume-Website.git
cd Personal-Resume-Website
```

### Local Development

For best results, use a local server (e.g., [VS Code Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)):

- Open the folder in VS Code
- Right-click `index.html` and select **"Open with Live Server"**

This ensures all JavaScript fetch requests (e.g., visitor counter, contact form) work correctly.

---

## Project Structure

```
Personal-Resume-Website/
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── images/
│   └── js/
│       └── script.js
├── index.html
├── Resume.html
├── Contact.html
├── portfolio.html
├── README.md
└── ...
```

---

## Key Customizations & Features

### Sidebar & Responsive Design

- The sidebar contains contact info, social links, and the visitor counter.
- On desktop, the sidebar is always visible and stretches to fit all content.
- On mobile, the sidebar is collapsible; content (including the visitor counter and social links) is visible only when expanded.
- CSS media queries adjust font sizes and spacing for optimal mobile display.

### Visitor Counter (AWS Lambda)

- The visitor counter is displayed in the sidebar, showing the total number of site visits.
- Powered by an AWS Lambda function behind an API Gateway endpoint.
- JavaScript fetches the count and updates the DOM on page load.
- Responsive CSS ensures the counter is visible and styled appropriately on all devices.

**Example integration:**
```html
<p class="visitor-counter">
  Total visitors: <span id="visitor-count">Loading...</span>
</p>
```
```javascript
// In assets/js/script.js
document.addEventListener("DOMContentLoaded", function() {
  const visitorCount = document.getElementById('visitor-count');
  if (visitorCount) {
    fetch('https://your-api-id.execute-api.region.amazonaws.com/prod/count')
      .then(response => response.json())
      .then(data => {
        visitorCount.innerText = data.visits;
      })
      .catch(error => {
        visitorCount.innerText = "Error";
        console.error('Visitor count failed:', error);
      });
  }
});
```

### Contact Form (AWS Lambda)

- The contact form collects name, email, and message.
- On submit, data is sent via POST to an AWS Lambda/API Gateway endpoint, which then emails the message.
- User receives a confirmation alert on success or error.

**Example integration:**
```javascript
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message")
      };
      try {
        await fetch("https://your-api-id.execute-api.region.amazonaws.com/prod/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        alert("Message sent!");
        contactForm.reset();
      } catch (error) {
        alert("There was an error sending your message.");
        console.error("Contact form error:", error);
      }
    });
  }
});
```

### Social Media Integration

- Social links (LinkedIn, GitHub, Xing, etc.) are displayed in the sidebar using Ionicons.
- Icons are styled for visibility and accessibility.
- Example:
  ```html
  <ul class="social-list">
    <li class="social-item">
      <a href="https://github.com/YOUR-GITHUB-USERNAME" class="social-link" target="_blank" rel="noopener">
        <ion-icon name="logo-github"></ion-icon>
      </a>
    </li>
    <!-- Add more social links as needed -->
  </ul>
  ```

### Portfolio Carousel

- The portfolio section uses a horizontal carousel to showcase projects.
- Each project includes an image, title, and category.
- Carousel auto-scrolls and is responsive.

---

## GitHub Actions & CI/CD

- GitHub Actions are set up for automated workflows (e.g., linting, deployment).
- On each push or pull request, workflows ensure code quality and can trigger deployment to hosting services (e.g., GitHub Pages, AWS S3).

---

## AWS Integrations

- **Visitor Counter:**  
  - AWS Lambda function increments and returns a visit count.
  - API Gateway exposes the Lambda as a REST endpoint.
  - CORS is enabled for browser access.
- **Contact Form:**  
  - AWS Lambda receives POST requests, validates input, and sends emails (e.g., via SES).
  - API Gateway exposes the Lambda as a REST endpoint.
  - CORS is enabled for browser access.

---

## Deployment

- For local development, use VS Code Live Server or any static file server.
- For production, deploy to GitHub Pages, AWS S3/CloudFront, Netlify, or your preferred static hosting.
- Ensure your AWS endpoints are live and CORS-enabled for production use.

---

## Credits

- [Ionicons](https://ionicons.com/) for iconography
- [AWS Lambda & API Gateway](https://aws.amazon.com/lambda/) for serverless backend
- [GitHub Actions](https://github.com/features/actions) for CI/CD
- [VS Code Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for local development

---

## License

This project is licensed under the MIT License.  
See [LICENSE](LICENSE) for details.

---

## Notes

- Remember to replace all placeholder API URLs with your actual AWS endpoints.
- For privacy, do not expose sensitive AWS keys or credentials in the repository.
- For further customization, refer to the comments in the CSS and JS files.

---

**Professional, modern, and fully integrated—this resume website is ready for your next career move!**