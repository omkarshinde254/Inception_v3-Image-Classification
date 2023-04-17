import React, { useState } from "react";

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageName, setImageName] = useState("");

  function handleImageUpload(event) {
    const image = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      setUploadedImage(event.target.result);
      setImageName(image.name);
    };

    reader.readAsDataURL(image);
  }

  return (
    <div className="grid grid-cols-10 h-screen">
      <div className="col-span-8 bg-gray-100 flex justify-center items-center">
        {uploadedImage ? (
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
          </div> <br></br>
          <p className="text-base font-normal mb-2">
            <span className="font-semibold">Name: </span>{imageName ? imageName : "No image uploaded"} <br></br>
            <span className="font-semibold">Prediction: </span>None
          </p>
          <input
            type="file"
            id="image-upload"
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="pb-4 px-2">
          <button
            onClick={() => document.getElementById("image-upload").click()}
            className="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Choose File
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
