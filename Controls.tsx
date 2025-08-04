import React from 'react';
import { VisualizationType } from '../types';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';

interface ControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    isRecording: boolean;
    onRecordToggle: () => void;
    isLoading: boolean;
    visualizationType: VisualizationType;
    onVisualizationChange: (type: VisualizationType) => void;
    customText: string;
    onTextChange: (text: string) => void;
    audioFile: File | null;
    videoUrl: string;
    videoExtension: string;
}

const Button: React.FC<React.PropsWithChildren<{ onClick?: () => void; className?: string; disabled?: boolean }>> = ({ children, onClick, className = '', disabled=false }) => (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const Controls: React.FC<ControlsProps> = ({
    isPlaying,
    onPlayPause,
    isRecording,
    onRecordToggle,
    isLoading,
    visualizationType,
    onVisualizationChange,
    customText,
    onTextChange,
    audioFile,
    videoUrl,
    videoExtension
}) => {
    return (
        <div className="w-full max-w-4xl p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-2 flex-wrap">
            <div className="flex items-center space-x-2">
                <Button onClick={onPlayPause} className="bg-cyan-600 hover:bg-cyan-500 text-white w-12 h-12 text-2xl !p-0">
                    <Icon path={isPlaying ? ICON_PATHS.PAUSE : ICON_PATHS.PLAY} className="w-6 h-6" />
                </Button>
                 <Button onClick={onRecordToggle} className={`w-12 h-12 text-2xl !p-0 ${isRecording ? 'bg-red-500 hover:bg-red-400 animate-pulse' : 'bg-gray-600 hover:bg-gray-500'}`}>
                    {isLoading ? 
                        <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> 
                        : <Icon path={isRecording ? ICON_PATHS.RECORD_STOP : ICON_PATHS.RECORD_START} className="w-6 h-6" />}
                </Button>
            </div>
            
            <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                    <label htmlFor="vis-select" className="text-sm text-gray-400 mb-1">Style</label>
                    <select 
                        id="vis-select"
                        value={visualizationType} 
                        onChange={(e) => onVisualizationChange(e.target.value as VisualizationType)}
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                        {Object.values(VisualizationType).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                 <div className="flex flex-col items-center">
                    <label htmlFor="text-input" className="text-sm text-gray-400 mb-1">Center Text</label>
                    <input
                        id="text-input"
                        type="text"
                        value={customText}
                        onChange={(e) => onTextChange(e.target.value)}
                        placeholder="Your Text Here"
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none w-36 text-center"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-3">
                 {audioFile && (
                    <a href={URL.createObjectURL(audioFile)} download={audioFile.name} className="px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-white">
                        <Icon path={ICON_PATHS.DOWNLOAD} />
                        <span>Music</span>
                    </a>
                )}
                {videoUrl && (
                    <a href={videoUrl} download={`${audioFile?.name.replace(/\.[^/.]+$/, "") || 'visualization'}.${videoExtension}`} className="px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white">
                        <Icon path={ICON_PATHS.DOWNLOAD} />
                        <span>Video</span>
                    </a>
                )}
            </div>
        </div>
    );
};


export default Controls;