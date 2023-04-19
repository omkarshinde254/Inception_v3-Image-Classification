import React, { useState } from "react";

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState([]);

  function handleImageUpload(event) {
    const image = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      setUploadedImage(event.target.result);
      setImageName(image.name);
    };

    reader.readAsDataURL(image);
  }

  function handlePredictClick() {
    if (!uploadedImage) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);
    let dots = "";
    const intervalId = setInterval(() => {
      if (dots.length === 3) {
        dots = "";
      } else {
        dots += ".";
      }
      setPrediction(`Loading${dots}`);
    }, 500);

    let bs64 = uploadedImage.split(";")[1].split(",")[1];
    fetch("https://omkarshinde254.pythonanywhere.com/get_classification/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: bs64
      })
    })
      .then((response) => response.json())
      .then((data) => {
        clearInterval(intervalId);
        setLoading(false);
        // setPrediction(data.prediction);
        setPrediction(data.prediction);
      })
      .catch((error) => {
        clearInterval(intervalId);
        setLoading(false);
        console.log(error);
      });
  }
  return (
    <div className="grid grid-cols-10 h-screen">
      <div className="col-span-8 bg-gray-100 flex justify-center items-center">
        {loading ? (
          <p className="text-lg font-medium">{prediction}</p>
        ) : uploadedImage ? (
          <img
            src={uploadedImage}
            alt="Uploaded"
            style={{ width: "100%", height: "99vh" }}
            className="w-full h-full object-fit-none"
          />
        ) : (
          <p className="text-lg font-medium">
            Upload an image to display it here
          </p>
        )}
      </div>
      <div className="col-span-2 bg-gray-200 flex flex-col justify-between">
        <div className="py-4 px-2">
          <div htmlFor="image-upload" className="pb-1 font-bold text-lg">
            Upload Image
          </div>
          <p className="text-base font-normal mb-2">
            <span className="font-semibold">Name: </span>
            {imageName ? imageName : "No image uploaded"} <br />
            <span className="font-semibold">Top Predictions: </span>
            {prediction ? prediction : "No prediction"}
          </p>
          <input
            type="file"
            id="image-upload"
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="pb-4 px-2 flex-grow absolute bottom-2 right-2 w-72">
          <button
            onClick={() => document.getElementById("image-upload").click()}
            className="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-700 mb-2"
          >
            Choose File
          </button>
          <button
            onClick={handlePredictClick}
            className="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Predict
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
