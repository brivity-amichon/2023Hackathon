import { useState, useRef } from "react";
import { YoutubeList } from "./YoutubeList";
import "./App.css";
import loadingGif from "./loading3.gif";

const MAX_FILE_SIZE = 200000;

function App() {
  const [selectedImages, setSelectedImages] = useState(null);
  const [gptResponse, setGptResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState(null);
  const [text, setText] = useState("How can I fix this?");

  const calcSize = () => {
    let total = 0;
    for (const image of selectedImages || []) {
      total += image.size;
    }

    return total <= MAX_FILE_SIZE;
  };

  const validSize = calcSize();

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

        {!validSize && (
          <div
            style={{
              position: "relative",
              backgroundColor: "red",
              color: "white",
              padding: "10px 20px",
              marginTop: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              cursor: "pointer",
              width: "98%",
              textAlign: "center",
            }}
          >
            Image(s) too large. Please select fewer or smaller image(s).
          </div>
        )}

        {/* Image preview section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "50vh",
          }}
        >
          {selectedImages && (
            <div
              style={{
                overflow: "hidden visible",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {(selectedImages || []).map((image, idx) => (
                <div
                  style={{
                    padding: "20px",
                    width: "300px",
                    height: "350px",
                  }}
                  key={idx}
                >
                  <img
                    alt="Preview"
                    width={"300px"}
                    height={"300px"}
                    src={URL.createObjectURL(image)}
                  />
                  <br />
                  <button
                    disabled={loading}
                    style={{
                      position: "relative",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      marginTop: "10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      width: "300px",
                      transition: "background-color 0.3s",
                    }}
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
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <div>
            {selectedImages?.length !== 0 && (
              <input
                type="textarea"
                placeholder="Enter text"
                style={{ width: "300px" }}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <button
              className="button"
              disabled={loading}
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

            {/* Action buttons */}
            <button
              className="button"
              onClick={() => {
                setGptResponse(null);
                setYoutubeVideos(null);
                encodeImageFileAsURL(selectedImages);
              }}
              disabled={!selectedImages || !validSize}
            >
              Help
            </button>
          </div>
        </div>

        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <img
              style={{ width: "200px", height: "200px" }}
              src={loadingGif}
              alt="Loading..."
            />
          </div>
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
