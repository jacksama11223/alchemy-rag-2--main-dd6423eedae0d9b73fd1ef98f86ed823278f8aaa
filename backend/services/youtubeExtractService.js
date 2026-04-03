const axios = require('axios');
const cheerio = require('cheerio');

// Hàm giải mã HTML Entities thường gặp trong file XML phụ đề youtube
function decodeEntities(encodedString) {
  const translate_re = /&(nbsp|amp|quot|lt|gt|#39);/g;
  const translate = {
    "nbsp": " ", "amp": "&", "quot": "\"", "lt": "<", "gt": ">", "#39": "'"
  };
  return encodedString.replace(translate_re, function(match, entity) {
    return translate[entity];
  }).replace(/&#(\d+);/gi, function(match, numStr) {
    var num = parseInt(numStr, 10);
    return String.fromCharCode(num);
  });
}

exports.fetchYoutubeData = async (videoId) => {
  let title = `YouTube Video: ${videoId}`;
  let subtitles = "";

  try {
    // 1. Fetch mã HTML gốc của trang YouTube
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await axios.get(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'vi,en;q=0.9'
      },
      timeout: 10000
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    const pageTitle = $('title').text();
    if (pageTitle) {
      title = pageTitle.replace(' - YouTube', '').trim();
    }

    // 2. Dùng Regex cạo trúng biến ytInitialPlayerResponse chứa tệp phụ đề
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!playerResponseMatch) {
      throw new Error('Could not find ytInitialPlayerResponse in page HTML');
    }

    const playerResponse = JSON.parse(playerResponseMatch[1]);
    
    // 3. Truy vết đường dẫn File XML
    const captionsNode = playerResponse.captions;
    if (!captionsNode || !captionsNode.playerCaptionsTracklistRenderer) {
      throw new Error('No captions available for this video');
    }

    const captionTracks = captionsNode.playerCaptionsTracklistRenderer.captionTracks;
    if (!captionTracks || captionTracks.length === 0) {
      throw new Error('No caption tracks found');
    }

    // Ưu tiên chọn Tiếng Việt > Tiếng Anh > Mặc định đầu tiên
    let selectedTrack = captionTracks.find(t => t.languageCode === 'vi') 
                     || captionTracks.find(t => t.languageCode === 'en')
                     || captionTracks[0];

    const subtitleUrl = selectedTrack.baseUrl;

    // 4. Fetch File XML và tách Text
    const xmlResponse = await axios.get(subtitleUrl);
    const xmlContent = xmlResponse.data;

    const textMatches = xmlContent.match(/<text[^>]*>(.*?)<\/text>/g);
    
    if (textMatches && textMatches.length > 0) {
      const texts = textMatches.map(tag => {
        const contentMatch = tag.match(/<text[^>]*>(.*?)<\/text>/);
        return (contentMatch && contentMatch[1]) ? decodeEntities(contentMatch[1]) : "";
      }).filter(text => text.trim() !== "");
      
      subtitles = texts.join(' ');
    } else {
      subtitles = "Không thể phân tách văn bản từ tệp phụ đề do YouTube mới cập nhật hệ thống Anti-Bot (poToken). Vui lòng copy tay Text từ YouTube paste vào.";
    }

  } catch (error) {
    console.error(`[YoutubeNativeExtractor] Error cho video ${videoId}:`, error.message);
    subtitles = "Tiến trình cào độ trễ (Anti-bot của YouTube) chặn truy xuất tự động. Vui lòng thử phương pháp copy Text thủ công.";
  }

  return { title, subtitles };
};
