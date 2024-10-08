"use client"

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const PhotoElm = () => {
  const params = useSearchParams();
  const [imageUrl, setImageUrl] = useState(loadingImgStr);

  useEffect(() => {
    const paramFileId = params.get('file_id')
    setImageUrl(loadingImgStr)
    if (paramFileId) {
      axios.post("/api/telegram/photo-url", {file_id: paramFileId}).then(resp => {
        setImageUrl(resp?.data?.url)
      }).catch(e => {
        setImageUrl("")
        console.error("Failed to fetch photo")
      })
    }
  }, [params]);

  return imageUrl === loadingImgStr ? <span>Tunggu sebentar ...</span>
  : <img src={imageUrl} alt="Preview Image" />
}

const loadingImgStr = "loading-image"
const PhotoPage = () => {
  

  return (
    <div className="bg-black p-4 text-white">
      <div className="mb-4 text-xs">Image Preview </div>
      <Suspense>
        <PhotoElm />
      </Suspense>
    </div>
  );
}

export default PhotoPage;
