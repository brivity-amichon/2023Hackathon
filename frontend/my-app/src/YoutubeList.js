export const YoutubeList = ({ youtubeVideos }) => {
  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      color: "#333",
    },
    videoContainer: {
      maxWidth: "1600px",
      margin: "0 auto",
      textAlign: "center",
    },
    heading: {
      color: "#444",
      marginBottom: "20px",
    },
    videosWrapper: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-around",
    },
    videoCard: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: "10px",
      width: "250px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      padding: "10px",
      borderRadius: "4px",
      transition: "transform 0.3s ease-in-out",
    },
    videoLink: {
      display: "block",
      maxWidth: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      color: "#007bff",
      textDecoration: "none",
      marginBottom: "8px",
      "&:hover": {
        color: "#0056b3",
      },
    },
    thumbnail: {
      width: "100%",
      borderRadius: "4px",
      "&:hover": {
        opacity: "0.8",
      },
    },
  };

  console.log("youtubeVideos", youtubeVideos);

  return (
    <div style={styles.container}>
      {youtubeVideos && (
        <>
          <hr />
          <div style={styles.videoContainer}>
            <h2 style={styles.heading}>Related Videos</h2>
            <div style={styles.videosWrapper}>
              {youtubeVideos.map((video) => (
                <div key={video.id.videoId} style={styles.videoCard}>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                    style={styles.videoLink}
                    title={video.snippet.title}
                  >
                    {video.snippet.title}
                  </a>
                  <img
                    src={video.snippet.thumbnails.default.url}
                    alt=""
                    style={styles.thumbnail}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
