const VideoPlayerModal= ({videoUrl})=>{
    return(
        <video
            src={videoUrl}
            controls
            autoPlay
            style={{ width: "100%", borderRadius: 8 }}
        />
    );
}

export default VideoPlayerModal