import { useState, useRef } from "react";
import { YoutubeList } from "./YoutubeList";
import "./App.css";
import loadingGif from "./loading3.gif";

function App() {
  const [selectedImages, setSelectedImages] = useState(null);
  const [gptResponse, setGptResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState(null);
  const [text, setText] = useState("How can I fix this?");
  const [encondedfiles, setEncondedfiles] = useState(null);

  const postToBackend = async (base64Imgs, text) => {
    setLoading(true);
    const response = await fetch("http://localhost:3000/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify({ image: base64Imgs, text }),
    });
    setLoading(false);
    const data = await response.json();
    return data;
  };

  const encodeImageFileAsURL = async (files) => {
    const encodedFiles = [];

    for (const file of files) {
      const promise = new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
      });

      encodedFiles.push(promise);
    }

    try {
      const allEncodedFiles = await Promise.all(encodedFiles);
      setEncondedfiles(allEncodedFiles);

      const response = await postToBackend(allEncodedFiles, text);
      console.log("response", response);
      setGptResponse(response.aiResponse.choices[0].message.content);
      setYoutubeVideos(response.youtubeResponse);
    } catch (error) {
      console.error("Error encoding files", error);
    }
  };

  const fileInputRef = useRef(null);

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>2023 Hackathon</h1>
        <h2>Upload Image(s) (JPEG or PNG)</h2>

        {/* Image preview section */}
        <div className="selected-images">
          {selectedImages && (
            <div className="image-preview-container">
              {(selectedImages || []).map((image, idx) => (
                <div className="image-preview" key={idx}>
                  <img
                    alt="Preview"
                    width={"250px"}
                    src={URL.createObjectURL(image)}
                  />
                  <br />
                  <button
                    className="button"
                    onClick={() => {
                      setSelectedImages((prev) => {
                        const newPrev = [...prev];
                        const index = newPrev.indexOf(image);
                        if (index > -1) {
                          newPrev.splice(index, 1);
                        }
                        return newPrev;
                      });
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input fields */}
        <div className="text-input-wrapper">
          <div className="text-input">
            <input
              type="text"
              placeholder="Enter text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>

        <div className="file-upload">
          <button
            className="button"
            onClick={() => {
              handleFileButtonClick();
            }}
          >
            Upload Image(s)
          </button>
          <input
            type="file"
            name="myImage"
            multiple
            ref={fileInputRef}
            accept="image/png, image/jpeg"
            className="file-upload-input"
            onChange={(event) => {
              setSelectedImages((prev) => {
                let newPrev = [...(prev || [])];
                newPrev = newPrev.concat(
                  Object.keys(event.target.files).map(
                    (key) => event.target.files[key]
                  )
                );
                return newPrev;
              });
            }}
          />
        </div>

        <br />
        {/* Action buttons */}
        <button
          className="button"
          onClick={() => {
            setGptResponse(null);
            setYoutubeVideos(null);
            encodeImageFileAsURL(selectedImages);
          }}
          disabled={!selectedImages}
        >
          Help
        </button>

        {loading && (
          <p className="loading">
            <img
              style={{ width: "100px", height: "100px" }}
              src={loadingGif}
              alt="Loading..."
            />
          </p>
        )}
      </header>

      {/* AI Response */}
      {gptResponse && (
        <div>
          <h2>Response from Awesome AI</h2>
          <div dangerouslySetInnerHTML={{ __html: gptResponse }} />
        </div>
      )}

      <br />

      {/* Youtube List Component */}
      <YoutubeList youtubeVideos={youtubeVideos} />
    </div>
  );
}

export default App;
