import React from 'react';

export default function Candle() {
  return (
    <div className="flex items-center justify-center min-h-[500px] select-none absolute inset-0 overflow-hidden">
      
      <div className="relative scale-[0.35] origin-center left-[40%] top-[40%]">
        
        {/* Candle Holder - Original Dimensions */}
        <div className="relative w-[150px] h-[400px]">
          
          {/* Candle Body */}
          <div className="candle-body absolute bottom-0 w-[150px] h-[300px]">
            
            {/* Blinking Glow Behind Flame */}
            <div className="blinking-glow absolute left-1/2 -top-[55%] -translate-x-1/2 w-[100px] h-[180px] rounded-full bg-[#ff6000] blur-[60px] pointer-events-none" />

            {/* Blue/Warm Base Glow */}
            <div className="candle-glow absolute left-1/2 -top-[48px] -translate-x-1/2 w-[26px] h-[60px] bg-[rgba(0,133,255,0.7)]" />

            {/* Wick / Thread */}
            <div className="candle-thread absolute left-1/2 -top-[17px] -translate-x-1/2 w-[6px] h-[36px] z-10" />

            {/* Flame */}
            <div className="candle-flame absolute left-1/2 bottom-full w-[24px] h-[120px]" />
            
          </div>
        </div>
      </div>

      {/* Original Complex Gradients & Custom Keyframes (කිසිම දෙයක් වෙනස් කරේ නෑ) */}
      <style>{`
        /* Candle cylindrical body gradient & inner shadows */
        .candle-body {
          border-radius: 150px / 40px;
          width:70px;
          box-shadow: inset 20px -30px 50px 0 rgba(0, 0, 0, 0.4), 
                      inset -20px 0 50px 0 rgba(0, 0, 0, 0.4);
          background: linear-gradient(#e48825, #e78e0e, #833c03, #4c1a03 50%, #1c0900);
        }

        /* Top surface rim */
        .candle-body::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #d47401;
          background: radial-gradient(#eaa121, #8e4901 45%, #b86409 80%);
        }

        /* Depressed melted wax center */
        .candle-body::after {
          content: "";
          position: absolute;
          width: 34px;
          height: 10px;
          left: 50%;
          top: 14px;
          transform: translateX(-50%);
          border-radius: 50%;
          box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.5);
          background: radial-gradient(rgba(0, 0, 0, 0.6), transparent 45%);
        }

        /* Thread styling */
        .candle-thread {
          border-radius: 40% 40% 0 0;
          background: linear-gradient(#d6994a, #4b232c, #121212, black, #e8bb31 90%);
        }

        /* Glow effects */
        .candle-glow {
          border-radius: 50% 50% 35% 35%;
          box-shadow: 0 -40px 30px 0 #dc8a0c, 
                      0 40px 50px 0 #dc8a0c, 
                      inset 3px 0 2px 0 rgba(0, 133, 255, 0.6), 
                      inset -3px 0 2px 0 rgba(0, 133, 255, 0.6);
        }
        .candle-glow::before {
          content: "";
          position: absolute;
          width: 70%;
          height: 60%;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.35);
        }

        /* Flame animation & styling */
        .candle-flame {
          transform-origin: 50% 100%;
          border-radius: 50% 50% 20% 20%;
          background: linear-gradient(white 80%, transparent);
          animation: moveFlame 6s linear infinite, enlargeFlame 5s linear infinite;
        }
        .candle-flame::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50% 50% 20% 20%;
          box-shadow: 0 0 15px 0 rgba(247, 93, 0, 0.4), 
                      0 -6px 4px 0 rgba(247, 128, 0, 0.7);
        }

        /* Blinking Animation */
        .blinking-glow {
          animation: blinkIt 0.1s infinite;
        }

        @keyframes moveFlame {
          0%, 100% { transform: translateX(-50%) rotate(-2deg); }
          50% { transform: translateX(-50%) rotate(2deg); }
        }

        @keyframes enlargeFlame {
          0%, 100% { height: 120px; }
          50% { height: 140px; }
        }

        @keyframes blinkIt {
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}