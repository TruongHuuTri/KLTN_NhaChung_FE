"use client";

import { PostType } from "@/types/Post";

interface PostTypeSelectorProps {
  selectedType: PostType | null;
  onSelectType: (type: PostType) => void;
  disabled?: boolean;
}

export default function PostTypeSelector({ 
  selectedType, 
  onSelectType, 
  disabled = false 
}: PostTypeSelectorProps) {
  const postTypes = [
    {
      type: 'rent' as PostType,
      title: 'Cho thuê',
      description: 'Đăng bài cho thuê phòng trọ, chung cư, nhà nguyên căn',
      icon: '🏠',
      color: 'blue'
    },
    {
      type: 'roommate' as PostType,
      title: 'Tìm ở ghép',
      description: 'Tìm người ở ghép phòng trọ, chung cư',
      icon: '👥',
      color: 'green'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = "border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg";
    
    if (isSelected) {
      switch (color) {
        case 'blue':
          return `${baseClasses} border-blue-500 bg-blue-50 shadow-md`;
        case 'green':
          return `${baseClasses} border-green-500 bg-green-50 shadow-md`;
        default:
          return `${baseClasses} border-gray-500 bg-gray-50 shadow-md`;
      }
    } else {
      return `${baseClasses} border-gray-200 bg-white hover:border-gray-300`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn loại bài đăng</h2>
        <p className="text-gray-600">Bạn muốn đăng bài gì?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {postTypes.map(({ type, title, description, icon, color }) => (
          <div
            key={type}
            className={getColorClasses(color, selectedType === type)}
            onClick={() => !disabled && onSelectType(type)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                onSelectType(type);
              }
            }}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedType && (
        <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-teal-600 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-teal-800">
              <strong>Đã chọn:</strong> {postTypes.find(p => p.type === selectedType)?.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
