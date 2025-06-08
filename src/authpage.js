import { useEffect } from 'react';

const MonetagAd = ({ dataZone }) => {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://fpyf8.com/88/tag.min.js"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://fpyf8.com/88/tag.min.js';
      script.setAttribute('data-zone', dataZone);
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.head.appendChild(script);
    }
    
    // Reinitialize for each ad unit
    if (window.Monetag && window.Monetag.load) {
      window.Monetag.load();
    }
    
    return () => {
      // Clean up if needed
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [dataZone]);

  return (
    <div className="monetag-ad-container" 
         data-zone={dataZone}
         style={{
           minHeight: '250px',
           margin: '20px 0',
           backgroundColor: '#f9f9f9',
           border: '1px dashed #ccc'
         }}>
      {/* Ad will render here automatically */}
    </div>
  );
};

export default MonetagAd;