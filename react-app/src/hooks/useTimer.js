import { useState, useEffect, useRef } from 'react';

export const useTimer = (updateTaskTime) => {
  const [currentTrackingTaskId, setCurrentTrackingTaskId] = useState(null);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  
  const [totalSecondsToday, setTotalSecondsToday] = useState(() => {
    return parseInt(localStorage.getItem('evotrack_total_time')) || 0;
  });

  const timerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('evotrack_total_time', totalSecondsToday);
  }, [totalSecondsToday]);

  const startTracking = (task) => {
    if (currentTrackingTaskId) {
      stopTracking();
    }
    
    setCurrentTrackingTaskId(task.id);
    setCurrentSeconds(task.timeSpent || 0);

    timerRef.current = setInterval(() => {
      setCurrentSeconds(prev => {
        const newSec = prev + 1;
        
        // Sync to task every 10 seconds locally to avoid too many renders if we want,
        // but for accurate state we just update the specific task time every second.
        updateTaskTime(task.id, newSec);
        
        return newSec;
      });
      setTotalSecondsToday(prev => prev + 1);
    }, 1000);
  };

  const stopTracking = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentTrackingTaskId(null);
  };

  return {
    currentTrackingTaskId,
    currentSeconds,
    totalSecondsToday,
    startTracking,
    stopTracking
  };
};
