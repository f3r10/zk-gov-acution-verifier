"use client";

import { useEffect, useRef, useState } from "react";
import axios, { AxiosRequestConfig } from 'axios';
import { executeTransaction } from '@/lib/executeTransaction';


export const CreateAuctionComponent = () => {
  const [input0, setInput0] = useState("");
  const handleGenerateProofSendTransaction = async (e: any) => {
    e.preventDefault();

    const data = {
      input0,
    }
    console.log("data", data);
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
      }
    }
    try {
      const txResult = await executeTransaction(input0);
    } catch (err: any) {
    console.log("err", err)
      const statusCode = err?.response?.status;
      console.log("statusCode", statusCode)
      const errorMsg = err?.response?.data?.error;
      console.log("errorMsg", errorMsg)
    }
  };

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  return (
    <div className="max-w-5xl w-full flex items-center justify-between">
      <input
                      placeholder="Number between 0 and 5" 
                      value={input0} 
                      onChange={(e) => setInput0(e.currentTarget.value)}
      />

      <button className="btn" onClick={handleGenerateProofSendTransaction}>
        click here
      </button>
    </div>
  );
};
