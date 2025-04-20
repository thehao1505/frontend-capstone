'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ImageData {
  src: string;
}

interface LoadedImage extends ImageData {
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
}

export default function HorizontalImageGallery({
  images,
}: {
  images: ImageData[];
}) {
  const [loadedImages, setLoadedImages] = useState<LoadedImage[]>([]);

  const fixedHeight = 280;

  useEffect(() => {
    const fetchImageSizes = async () => {
      const results = await Promise.all(
        images.map(
          (img) =>
            new Promise<LoadedImage>((resolve) => {
              const image = new window.Image();
              image.src = img.src;
              image.onload = () => {
                const ratio = image.width / image.height;
                resolve({
                  ...img,
                  width: image.width,
                  height: image.height,
                  displayHeight: fixedHeight,
                  displayWidth: fixedHeight * ratio,
                });
              };
              image.onerror = () =>
                resolve({
                  ...img,
                  width: 1,
                  height: 1,
                  displayHeight: fixedHeight,
                  displayWidth: fixedHeight,
                });
            })
        )
      );

      setLoadedImages(results);
    };

    fetchImageSizes();
  }, [images]);

  return (
    <div className='overflow-x-auto flex gap-1.5'>
      {loadedImages.map((img, idx) => (
        <div
          key={idx}
          style={{
            width: img.displayWidth,
            height: img.displayHeight,
          }}
          className='relative flex-shrink-0 rounded-md overflow-hidden bg-neutral-900'
        >
          <Image
            src={img.src}
            alt={`image-${idx}`}
            fill
            className='object-contain'
            sizes='(max-width: 768px) 100vw'
          />
        </div>
      ))}
    </div>
  );
}
