import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

export default function LiveTimer({ status, startedAt, pausedSeconds = 0, baseMinute = 0, halfDuration = null, showSeconds = true, className = "" }) {
    const isLive = status === 'live';
    const isHalfTime = status === 'half_time';
    const isFullTime = status === 'full_time';

    const [secondsElapsed, setSecondsElapsed] = useState(0);

    // Wall-clock calculation: persistent across page reloads & browser restarts
    useEffect(() => {
        if (!isLive) {
            setSecondsElapsed(pausedSeconds || (baseMinute * 60));
            return;
        }

        const computeElapsed = () => {
            if (startedAt) {
                const startMs = new Date(startedAt).getTime();
                const nowMs = Date.now();
                const diffSec = Math.floor((nowMs - startMs) / 1000);
                return Math.max(0, (pausedSeconds || 0) + diffSec);
            }
            return (pausedSeconds || 0) || (baseMinute * 60);
        };

        setSecondsElapsed(computeElapsed());

        const interval = setInterval(() => {
            setSecondsElapsed(computeElapsed());
        }, 1000);

        return () => clearInterval(interval);
    }, [isLive, startedAt, pausedSeconds, baseMinute]);

    if (isHalfTime) {
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 ${className}`}>
                HT {halfDuration ? `(${halfDuration}')` : ''}
            </span>
        );
    }

    if (isFullTime) {
        return (
            <span className={`text-xs font-black text-gray-400 ${className}`}>
                FT
            </span>
        );
    }

    if (!isLive) {
        return null;
    }

    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-live-soft text-live border border-live/20 shadow-sm animate-pulse ${className}`}>
            <Flame className="w-3 h-3 mr-1 fill-live animate-bounce" />
            {showSeconds ? `${formattedMinutes}:${formattedSeconds}'` : `${minutes}'`}
        </span>
    );
}
