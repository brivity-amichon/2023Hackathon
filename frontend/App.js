function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [gptResponse, setGptResponse] = useState(null);

  const postToBackend = async (base64Img) => {
    const response = await fetch("http://localhost:3000/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // {image, text}
      body: JSON.stringify({ image: base64Img, text }),
    });
    const data = await response.json();
    console.log(data);
    return data;
  };

  const encodeImageFileAsURL = async (element) => {
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
      console.log("RESULT", reader.result);
    };
    const base64Img = reader.readAsDataURL(file);

    const response = await postToBackend(base64Img);
    setGptResponse(response);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>2023 Hackathon</h1>
        <h1>Upload Image (JPEG or PNG)</h1>

        {selectedImage && (
          <div>
            <img
              alt="not found"
              width={"250px"}
              src={URL.createObjectURL(selectedImage)}
            />
            <br />
            <button onClick={() => setSelectedImage(null)}>Remove</button>
          </div>
        )}

        <br />

        <input
          type="file"
          name="myImage"
          onChange={(event) => {
            console.log(event.target.files[0]);
            setSelectedImage(event.target.files[0]);
            encodeImageFileAsURL(event.target.files[0]);
          }}
        />
      </header>

      {gptResponse && (
        <div>
          <h2>Response from Awesome AI</h2>
          <p>{gptResponse}</p>
        </div>
      )}
    </div>
  );
}
export default App;
