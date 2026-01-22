import React from 'react';
import { useTextScale } from './../../context/TextScaleContext';

const TextScaleButton = () => {
  const { scale, setScale } = useTextScale();

  return (
    <div className="flex items-center gap-3">

      <button 
        onClick={() => setScale('small')}
        className={`${scale === 'small' ? 'font-bold underline' : ''} cursor-pointer`}
      >
        <span className="text-xs">A</span>
      </button>

      <button 
        onClick={() => setScale('normal')}
        className={`${scale === 'normal' ? 'font-bold underline' : ''} cursor-pointer`}
      >
        <span className="text-sm">A</span>
      </button>

      <button 
        onClick={() => setScale('large')}
        className={`${scale === 'large' ? 'font-bold underline' : ''} cursor-pointer`}
      >
        <span className="text-lg">A</span>
      </button>

    </div>
  );
};

export default TextScaleButton;
