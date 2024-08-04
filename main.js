/* AIzaSyA3V6taBpSpgdt5yTg4NBTk1peAy3gT2fc */
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// 🔥🔥 FILL THIS OUT FIRST! 🔥🔥
// Get your Gemini API key by:
// - Selecting "Add Gemini API" in the "Project IDX" panel in the sidebar
// - Or by visiting https://g.co/ai/idxGetGeminiKey
let API_KEY = 'AIzaSyA3V6taBpSpgdt5yTg4NBTk1peAy3gT2fc';  // Reemplaza con tu clave de API

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');
let imageUpload = document.getElementById('imageUpload');
let uploadedImage = document.getElementById('uploadedImage');

imageUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    uploadedImage.src = event.target.result;
    uploadedImage.style.display = 'block';
  }

  if (file) {
    reader.readAsDataURL(file);
  }
});

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    // Load the image as a base64 string
    let imageBase64 = uploadedImage.src.split(',')[1];

    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
          { text: promptInput.value }
        ]
      }
    ];

    // Call the multimodal model, and get a stream of results
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      temperature: 0.2,
      maxOutputTokens: 1024,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });

    // Read from the stream and interpret the output as markdown
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      // Actualizar el contenido de output con cada fragmento de texto
      output.innerHTML = md.render(response.text());
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};