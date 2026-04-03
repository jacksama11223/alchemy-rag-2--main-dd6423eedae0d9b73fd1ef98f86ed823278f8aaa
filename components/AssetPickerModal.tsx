import React, { useState, useEffect } from 'react';
import { X, FileText, PenTool, Bot, Database, Video, Mic } from 'lucide-react';
import { AssetType, IncomingAsset } from '../utils/dataProcessor';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: IncomingAsset) => void;
}

export const AssetPickerModal: React.FC<AssetPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [activeTab, setActiveTab] = useState<AssetType>('TEXT_NOTE');
  const [assets, setAssets] = useState<IncomingAsset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen, activeTab]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/alchemy/storage/items');
      if (response.ok) {
        const data = await response.json();
        
        const mappedAssets: IncomingAsset[] = data.map((item: any) => {
          let dataType: AssetType = 'TEXT_NOTE';
          if (item.sourceType === 'drive' || item.type === 'file') dataType = 'FILE_ASSET';
          else if (item.sourceType === 'voice') dataType = 'VOICE_RECORDING';
          else if (item.sourceType === 'web') dataType = 'HTML_SNIPPET';

          return {
            id: item._id,
            dataType,
            title: item.title,
            payload: item.extractedText || item.originalContent || ''
          };
        });

        if (activeTab === 'FILE_ASSET') {
            setAssets(mappedAssets.filter(a => a.dataType === 'FILE_ASSET'));
        } else if (activeTab === 'TEXT_NOTE') {
            setAssets(mappedAssets.filter(a => a.dataType === 'TEXT_NOTE' || a.dataType === 'HTML_SNIPPET'));
        } else {
            setAssets(mappedAssets.filter(a => a.dataType === activeTab));
        }
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs: { id: AssetType; label: string; icon: React.ReactNode }[] = [
    { id: 'TEXT_NOTE', label: 'Ghi chú & Text', icon: <FileText size={16} /> },
    { id: 'DRAWING_CANVAS', label: 'Bản vẽ', icon: <PenTool size={16} /> },
    { id: 'AI_RESPONSE', label: 'AI', icon: <Bot size={16} /> },
    { id: 'FILE_ASSET', label: 'Tài liệu', icon: <Database size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Chọn dữ liệu</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex border-b border-gray-100 px-4 pt-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : assets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assets.map(asset => (
                <div 
                  key={asset.id}
                  onClick={() => {
                    onSelect(asset);
                    onClose();
                  }}
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
                >
                  <h3 className="font-medium text-gray-800 mb-2 truncate">{asset.title}</h3>
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {typeof asset.payload === 'string' ? asset.payload : JSON.stringify(asset.payload)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Database size={48} className="mb-4 opacity-20" />
              <p>Không tìm thấy dữ liệu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
