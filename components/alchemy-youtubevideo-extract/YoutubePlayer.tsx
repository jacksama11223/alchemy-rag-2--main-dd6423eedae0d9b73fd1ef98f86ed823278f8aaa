import React from 'react';

interface YoutubePlayerProps {
    videoId: string;
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ videoId }) => {
    if (!videoId) return null;

    return (
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
            ></iframe>
        </div>
    );
};

export default YoutubePlayer;
