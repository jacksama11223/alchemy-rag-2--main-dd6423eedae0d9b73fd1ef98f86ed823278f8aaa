export type AssetType = 'HTML_SNIPPET' | 'DRAWING_CANVAS' | 'AI_RESPONSE' | 'TEXT_NOTE' | 'KNOWLEDGE_NODE' | 'FILE_ASSET' | 'YOUTUBE_VIDEO' | 'VOICE_RECORDING';

export interface IncomingAsset {
  id: string;
  dataType: AssetType;
  payload: any; // The actual content (text, html, image url, etc.)
  title?: string;
}

export const handleIncomingData = (
  incomingAsset: IncomingAsset, 
  targetType: 'NOTE' | 'GRAPH' | 'TUTOR' | 'AIR_ROOM' | 'ALCHEMY',
  targetActions: any,
  action?: string
) => {
  console.log(`Handling incoming data: ${incomingAsset.dataType} -> ${targetType} with action: ${action}`);
  
  // Handle specific actions first
  if (action) {
    switch (action) {
      case 'NOTES_ATTACH_FILE':
        if (targetActions.attachFile) {
          targetActions.attachFile(incomingAsset.id, incomingAsset.title || 'File đính kèm');
        }
        return;
      case 'NOTES_EXTRACT_TEXT':
      case 'NOTES_APPEND_TEXT':
        if (targetActions.appendNoteContent) {
          targetActions.appendNoteContent(`\n\n### ${incomingAsset.title || 'Nguồn dữ liệu'}\n${incomingAsset.payload}`);
        }
        return;
      case 'NOTES_ATTACH_DRAWING':
        if (targetActions.attachCanvasToNote) {
          targetActions.attachCanvasToNote(incomingAsset.id, incomingAsset.payload);
        }
        return;
      case 'TUTOR_SAVE_KB':
        if (targetActions.saveToKnowledgeBase) {
          targetActions.saveToKnowledgeBase(incomingAsset);
        }
        return;
      case 'TUTOR_SEND_CHAT':
        if (targetActions.sendToTutor) {
          targetActions.sendToTutor(`Phân tích nội dung này: ${incomingAsset.payload}`);
        }
        return;
      case 'ALCHEMY_SAVE_TEMP':
        if (targetActions.saveToTemp) {
          targetActions.saveToTemp(incomingAsset);
        }
        return;
      case 'ALCHEMY_CREATE_FLASHCARD':
        if (targetActions.createFlashcards) {
          targetActions.createFlashcards(incomingAsset);
        }
        return;
      case 'ALCHEMY_ATTACH_TO_DOC':
        if (targetActions.attachToDocument) {
          targetActions.attachToDocument(incomingAsset);
        }
        return;
    }
  }

  // Fallback to default behavior based on dataType and targetType
  switch (incomingAsset.dataType) {
    case 'HTML_SNIPPET':
    case 'TEXT_NOTE':
    case 'FILE_ASSET':
    case 'YOUTUBE_VIDEO':
    case 'VOICE_RECORDING':
      const textContent = incomingAsset.payload;
      if (targetType === 'NOTE' && targetActions.appendNoteContent) {
        targetActions.appendNoteContent(`\n\n### ${incomingAsset.title || 'Nguồn dữ liệu'}\n${textContent}`);
      } else if (targetType === 'GRAPH' && targetActions.addNode) {
        targetActions.addNode({ title: incomingAsset.title || 'New Node', content: textContent });
      } else if (targetType === 'TUTOR' && targetActions.sendToTutor) {
        targetActions.sendToTutor(`Phân tích nội dung này: ${textContent}`);
      } else if (targetType === 'AIR_ROOM' && targetActions.sendToRoom) {
        targetActions.sendToRoom(`[Chia sẻ tài liệu: ${incomingAsset.title || 'Nguồn dữ liệu'}]\n${textContent}`);
      }
      break;
      
    case 'DRAWING_CANVAS':
      const imageUrl = incomingAsset.payload;
      if (targetType === 'NOTE' && targetActions.attachCanvasToNote) {
        targetActions.attachCanvasToNote(incomingAsset.id, imageUrl);
      } else if (targetType === 'GRAPH' && targetActions.addNode) {
        targetActions.addNode({ title: incomingAsset.title || 'Bản vẽ', image: imageUrl });
      } else if (targetType === 'TUTOR' && targetActions.sendImageToTutor) {
        targetActions.sendImageToTutor(imageUrl);
      } else if (targetType === 'AIR_ROOM' && targetActions.sendToRoom) {
        targetActions.sendToRoom(`[Chia sẻ bản vẽ: ${incomingAsset.title || 'Bản vẽ'}]\n${imageUrl}`);
      }
      break;
      
    case 'KNOWLEDGE_NODE':
      if (targetType === 'NOTE' && targetActions.appendNoteContent) {
        targetActions.appendNoteContent(`\n\n**Node: ${incomingAsset.title}**\n${incomingAsset.payload.summary || ''}`);
      } else if (targetType === 'TUTOR' && targetActions.sendToTutor) {
        targetActions.sendToTutor(`Giải thích thêm về khái niệm này: ${incomingAsset.title}`);
      } else if (targetType === 'AIR_ROOM' && targetActions.sendToRoom) {
        targetActions.sendToRoom(`[Chia sẻ Node: ${incomingAsset.title}]\n${incomingAsset.payload.summary || ''}`);
      }
      break;
      
    case 'AI_RESPONSE':
      if (targetType === 'NOTE' && targetActions.appendNoteContent) {
        targetActions.appendNoteContent(`\n\n> ${incomingAsset.payload.text}`);
      } else if (targetType === 'GRAPH' && targetActions.addNode) {
        targetActions.addNode({ title: 'AI Insight', content: incomingAsset.payload.text });
      } else if (targetType === 'AIR_ROOM' && targetActions.sendToRoom) {
        targetActions.sendToRoom(`[Chia sẻ AI Insight]\n${incomingAsset.payload.text}`);
      }
      break;
      
    default:
      console.warn("Loại dữ liệu chưa được hỗ trợ!", incomingAsset.dataType);
  }
};
