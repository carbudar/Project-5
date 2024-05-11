let isSpeaking = false;

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/NKj1N0Bgf/";

let model, webcam, labelContainer, maxPredictions;
let currentPrediction = ""; // Variable to store the current prediction

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(450, 700, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("camera").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// Define description text for each class
const descriptions = {
    "Vitamin C": "<strong>Function:</strong> <ul> <li> Form collagen to make skin, tendonds, ligaments, and blood vessel</li> <li>Heal wounds and forming scar tissues</li> <li>Repair and maintain cartilage, bone, and teeth</li> <li>Aid in the absorption of iron</li> <li></ul><strong>Recommended daily serving:</strong> <ul><li>Women: 75 milligrams. </li><li>Men: 90 milligrams.</li></ul>",
    "Omega 3": "<strong>Function:</strong>  <ul><li>Reducing the risk of heart disease</li> <li>Reduction of blood pressure</li> <li>Reducing cholesterol level and blood tryclyceride levels</li><li>Help reduce pain and relieve joint tenderness</li> </ul> <strong>Recommended daily serving:</strong><ul><li> High blood pressure: 3000 milligrams.</li><li>Hypertension: 5000 milligrams.</li><li> Average: 1000-1500 milligrams.</li></ul>",
    "Vitamin D": "<strong>Function:</strong> <ul><li>Help absorb calcium</li> <li> Strengthen immune system</li> </ul><strong>Recommended daily serving:</strong><br> Adults: 600 IU.",
    "Vitamin E": "<strong>Function:</strong>  <ul><li>Important for the vision, reproduction, and the health of blood, brain, and skin</li> <li>Delay the progress of Alzheimer's deseas</li> </ul><strong>Recommended daily serving:</strong> <br>Adults: 15 milligrams.",
    "Probiotics": "<strong>Function:</strong> <ul><li>Help body maintain healthy microorganisms</li> <li>Influence body's immune response</li> </ul> <strong> Recommended daily serving:</strong><br> Average: 10-20 CF.",
    "Liver Detox": "<strong>Function:</strong> <ul><li>Enhanced bile production</li> <li>Optimized metabolism</li> <li>Enhancing detoxification properties</li> <li>Supporting liver regeneration</li> <li>Supporting liver cell function</li> </ul><strong> Recommended daily serving:</strong> <br>Refer to a doctor.",
    "Collagen": "Function: <ul><li>Healthy joints</li> <li>Promotes skin elasticity</li> </ul>Recommended daily serving: <br>2500-15000 milligrams.",
    "Not Detected": "Point camera towards supplement bottle to scan."
};

// Function to display description text based on the predicted class
function displayDescription(predictionClass) {
    const descriptionElement = document.getElementById("description");
    if (predictionClass in descriptions) {
        const descriptionMarkup = descriptions[predictionClass];
        // Create a temporary div element to render the HTML markup
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = descriptionMarkup;
        // Append the inner HTML of the temporary div to the description element
        descriptionElement.innerHTML = tempDiv.innerHTML;
    } else {
        descriptionElement.innerText = "No description available.";
    }
}

// Modify predict() function to call displayDescription()
async function predict() {
    // predict can take in an image, video, or canvas HTML element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
        
        // Check if prediction probability is greater than 80%
        if (prediction[i].probability > 0.8) {
            // Store the current prediction
            currentPrediction = prediction[i].className;
            // Show the text associated with the predicted class only if not speaking
            if (!isSpeaking) {
                document.getElementById("kind").innerText = currentPrediction;
                // Call displayDescription() with the predicted class
                displayDescription(currentPrediction);
            }
        }
    }
}

// Function to reset the prediction
function resetPrediction() {
    currentPrediction = ""; // Reset the current prediction
    document.getElementById("kind").innerText = ""; // Clear the text in the element
}

// Call init() when the DOM content is loaded
document.addEventListener("DOMContentLoaded", init);

// Function to trigger text-to-speech
function speak() {
    // Get the description text
    const descriptionText = document.getElementById("description").innerText;

    // Check if there's description text available
    if (descriptionText) {
        isSpeaking = true; // Set isSpeaking to true
        // Create a new SpeechSynthesisUtterance object
        const utterance = new SpeechSynthesisUtterance(descriptionText);

        // Get available voices
        const voices = speechSynthesis.getVoices();
        // Set the voice (optional)
        utterance.voice = voices[0];

        // Speak the description
        speechSynthesis.speak(utterance);

        // When speech ends, set isSpeaking to false
        utterance.onend = function() {
            isSpeaking = false;
        };
    } else {
        // If no description text is available, provide a message
        console.log("No description available.");
    }
}

function stopSpeech() {
    speechSynthesis.cancel(); // Stop the speech
    isSpeaking = false; // Reset isSpeaking to false
}

// Add an event listener to the restart button
document.getElementById("stop").addEventListener("click", stopSpeech);



// Add an event listener to the restart button
document.getElementById("stop").addEventListener("click", stopSpeech);

