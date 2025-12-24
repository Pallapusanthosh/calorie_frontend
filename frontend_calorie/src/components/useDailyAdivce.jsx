import { useEffect, useState } from "react";
import axios from "axios";

import { Api } from "../utils/API";
export default function useDailyAdvice() {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(true);
    let session = JSON.parse(localStorage.getItem('session'));
  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const res = await fetch(`${Api}/agent/daily-advice` , {
            method: "GET",
            headers: { 
              'Content-Type': 'application/json',   
                'Authorization': `Bearer ${session.token}`  
            },
            credentials: 'include',
        });
        const data = await res.json();
        setAdvice(data.answer);
      } catch (e){
        console.log("Error fetching daily advice:", e);
        setAdvice("Stay consistent today and focus on balanced meals.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, []);

  return { advice, loading };
}
