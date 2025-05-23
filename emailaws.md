Great! If you want to build your own backend to receive contact form messages via email using AWS, the most common, scalable, and cost-effective way is to use AWS Lambda with Amazon SES (Simple Email Service) and API Gateway.

Here’s a step-by-step guide:

1. Set Up Amazon SES
Go to the SES Console.
Verify your email address (the one you want to receive messages at).
If you want to send from your domain, verify your domain as well.
Make sure your SES is out of the sandbox (if you want to receive from any email).
2. Create a Lambda Function
Go to the Lambda Console.
Click Create function.
Choose Author from scratch.
Name your function (e.g., ContactFormHandler).
Choose a runtime (Node.js is common, but Python works too).
Click Create function.
Example Node.js Lambda code:




// Lambda handler for contact form
const AWS = require('aws-sdk');
const ses = new AWS.SES();

exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  const params = {
    Destination: {
      ToAddresses: ['your@email.com'], // Replace with your verified email
    },
    Message: {
      Body: {
        Text: { Data: `Name: ${body.name}\nEmail: ${body.email}\nMessage: ${body.message}` }
      },
      Subject: { Data: "New Contact Form Submission" }
    },
    Source: 'your@email.com', // Must be a verified SES email
  };

  try {
    await ses.sendEmail(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully!' }),
      headers: { "Access-Control-Allow-Origin": "*" }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send email', error: err.message }),
      headers: { "Access-Control-Allow-Origin": "*" }
    };
  }
};

Replace your@email.com with your SES-verified email address.

3. Add Permissions
Attach the AmazonSESFullAccess policy to your Lambda’s execution role (or a more restrictive policy if you prefer)


4. Create an API Gateway Endpoint
Go to API Gateway.
Create a new HTTP API.
Add a POST route (e.g., /contact).
Integrate it with your Lambda function.
Deploy the API and note the endpoint URL.



5. Update Your Contact Form
HTML Example:

<form id="contact-form">
  <input type="text" name="name" required placeholder="Your Name">
  <input type="email" name="email" required placeholder="Your Email">
  <textarea name="message" required placeholder="Your Message"></textarea>
  <button type="submit">Send</button>
</form>
<script>
document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value
  };
  const response = await fetch('https://your-api-id.execute-api.region.amazonaws.com/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (response.ok) {
    alert('Message sent!');
    form.reset();
  } else {
    alert('Failed to send message.');
  }
});
</script>

Replace the fetch URL with your API Gateway endpoint.

6. Test Everything
Fill out your contact form and submit.
You should receive an email at your specified address.

Let me know if you want a detailed step for any part, or if you want a ready-to-deploy Lambda ZIP or CloudFormation template!
