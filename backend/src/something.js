const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const { google } = require("googleapis");

require("dotenv").config();

const app = express();
const port = 3000;

// gapi.server.setApiKey("");
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cors());

const youtube = google.youtube({
  version: "v3",
  auth: process.env.GOOGLE_API_KEY,
});

// Route to handle POST request
app.post("/image", async (req, res) => {
  try {
    // Extract data from the request body
    const { text, image } = req.body;

    const imageMessages = image.map((image) => ({
      type: "image_url",
      image_url: {
        url: image,
        detail: "high",
      },
    }));

    // OpenAI API request data
    const data = {
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Format response in html. Do not give instructions. Only use style and content tags. Do not reference the image you receive. At the end, give a list of materials needed to fullfil the repair. Give a cost breakdown. Remove any ```HTML from response." +
                text,
            },
            ...imageMessages,
          ],
        },
      ],
      max_tokens: 1000,
    };

    // API headers
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    };

    // Make a POST request to OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      data,
      { headers }
    );

    const call2 = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `based on ${response.data.choices[0].message.content} this response. Give me one action item to search on youtube. Have it 3-5 words long.`,
        },
      ],
      max_tokens: 700,
    };

    const headers2 = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAi}`,
    };

    // Make a POST request to OpenAI API
    const response2 = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      call2,
      { headers }
    );

    const youtubeText = response2.data.choices[0].message.content;

    // Use Google API to search for videos about plumbers
    // const youtubeResponse = await youtube.search.list({
    //   part: "snippet",
    //   q: youtubeText,
    //   maxResults: 1,
    // });

    // Combine both responses
    const combinedResponse = {
      aiResponse: response.data,
      youtubeResponse: [],
      //   youtubeResponse: youtubeResponse.data.items || [],
    };

    // Send back the response
    res.json(combinedResponse);
  } catch (error) {
    console.error("Error making API request", error);
    res.status(500).send("An error occurred");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
