const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Note = require('../models/Note');
const AlchemyStorage = require('../models/AlchemyStorage');
const SavedUrl = require('../models/SavedUrl');
const SavedYoutubeVideo = require('../models/SavedYoutubeVideo');
const SavedRecording = require('../models/SavedRecording');
const PastedText = require('../models/PastedText');
const BackgroundWorker = require('../services/backgroundWorker');

const syncVectorStore = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const worker = new BackgroundWorker();

    console.log('--- Bắt đầu đồng bộ Notes ---');
    const notes = await Note.find();
    for (const note of notes) {
      console.log(`Đang xử lý Note: ${note.title}`);
      const textContent = `${note.title || ''}\n\n${note.content || ''}`.trim();
      if (textContent) {
        await worker.embedAndStoreDocument(textContent, note.user, 'note', note._id, note.title);
      }
    }

    console.log('--- Bắt đầu đồng bộ Alchemy ---');
    const alchemyItems = await AlchemyStorage.find();
    for (const item of alchemyItems) {
      console.log(`Đang xử lý Alchemy: ${item.title}`);
      const textContent = `${item.title || ''}\n\n${item.content || ''}`.trim();
      if (textContent) {
        await worker.embedAndStoreDocument(textContent, item.user, 'alchemy', item._id, item.title);
      }
    }

    console.log('--- Bắt đầu đồng bộ Saved URLs ---');
    const urls = await SavedUrl.find();
    for (const url of urls) {
      console.log(`Đang xử lý URL: ${url.title}`);
      const contentToEmbed = `${url.title || ''}\n\n${url.url || ''}\n\n${url.summary || ''}`.trim();
      if (contentToEmbed) {
        await worker.embedAndStoreDocument(contentToEmbed, url.user, 'web', url._id, url.title);
      }
    }

    console.log('--- Bắt đầu đồng bộ Saved Youtube Videos ---');
    const videos = await SavedYoutubeVideo.find();
    for (const video of videos) {
      console.log(`Đang xử lý Video: ${video.title}`);
      const textContent = `${video.title || ''}\n\n${video.summary || ''}`.trim();
      if (textContent) {
        await worker.embedAndStoreDocument(textContent, video.user, 'youtube', video._id, video.title);
      }
    }

    console.log('--- Bắt đầu đồng bộ Saved Recordings ---');
    const recordings = await SavedRecording.find();
    for (const recording of recordings) {
      console.log(`Đang xử lý Recording: ${recording.title}`);
      const textContent = `${recording.title || ''}\n\n${recording.transcript || ''}`.trim();
      if (textContent) {
        await worker.embedAndStoreDocument(textContent, recording.user, 'voice', recording._id, recording.title);
      }
    }

    console.log('--- Bắt đầu đồng bộ Pasted Texts ---');
    const texts = await PastedText.find();
    for (const text of texts) {
      console.log(`Đang xử lý Pasted Text: ${text.title}`);
      const textContent = `${text.title || ''}\n\n${text.content || ''}`.trim();
      if (textContent) {
        await worker.embedAndStoreDocument(textContent, text.user, 'pasted_text', text._id, text.title);
      }
    }

    console.log('✅ Hoàn tất đồng bộ toàn bộ dữ liệu vào VectorStore!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi đồng bộ:', error);
    process.exit(1);
  }
};

syncVectorStore();
