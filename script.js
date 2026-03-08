const MODEL_URL = "./model/";

let model;
const imageUpload = document.getElementById("imageUpload");
const preview = document.getElementById("preview");
const predictBtn = document.getElementById("predictBtn");
const topPrediction = document.getElementById("topPrediction");
const allPredictions = document.getElementById("allPredictions");

async function loadModel() {
  const modelURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
  console.log("Model loaded");
}

imageUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = "block";
    topPrediction.textContent = "Image ready. Click Check Image.";
    allPredictions.innerHTML = "";
  };
  reader.readAsDataURL(file);
});

predictBtn.addEventListener("click", async () => {
  if (!model) {
    topPrediction.textContent = "Model still loading.";
    return;
  }

  if (!preview.src) {
    topPrediction.textContent = "Please upload an image first.";
    return;
  }

  const predictions = await model.predict(preview);
  predictions.sort((a, b) => b.probability - a.probability);

  const best = predictions[0];
  const percent = (best.probability * 100).toFixed(1);

  if (best.probability < 0.75) {
    topPrediction.textContent = `Low confidence: ${best.className} (${percent}%)`;
  } else {
    topPrediction.textContent = `Top result: ${best.className} (${percent}%)`;
  }

  allPredictions.innerHTML = "";
  predictions.forEach((p) => {
    const row = document.createElement("div");
    row.className = "prediction-row";
    row.innerHTML = `
      <span>${p.className}</span>
      <span>${(p.probability * 100).toFixed(1)}%</span>
    `;
    allPredictions.appendChild(row);
  });
});

loadModel().catch((err) => {
  console.error(err);
  topPrediction.textContent = "Failed to load model.";
});