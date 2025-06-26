// Product Image Optimizer - Generates 720px main + 320px thumbnail
// Chrome-only, no fallbacks needed

interface OptimizedImages {
  main: Blob;
  thumbnail: Blob;
  mainFileName: string;
  thumbnailFileName: string;
}

const PRODUCT_SIZES = {
  // Main carousel images: 720px for optimal quality in product pages
  // Based on analysis: ProductCarousel max-width ~448px but serves at higher DPI
  main: { width: 720, quality: 0.75 },
  
  // Thumbnails: 320px for sharp display in grid cards
  // Based on analysis: RelatedLayout cards ~208px but serves at higher DPI for retina
  thumbnail: { width: 320, quality: 0.65 }
} as const;

// Hero image sizes (940px main + 320px thumbnail for Posts/Resources)
const HERO_SIZES = {
  main: { width: 940, quality: 0.75 },
  thumbnail: { width: 320, quality: 0.65 }
} as const;

// Section image sizes (main only, no thumbnails needed)
const SECTION_SIZES = {
  main: { width: 720, quality: 0.75 }
} as const;

/**
 * Optimizes product images to exactly 2 sizes: 720px main + 320px thumbnail
 * Chrome-only implementation for admin CMS use
 */
export async function optimizeProductImage(file: File): Promise<OptimizedImages> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = async () => {
      try {
        // Generate both sizes in parallel
        const [mainBlob, thumbnailBlob] = await Promise.all([
          resizeToWebP(img, PRODUCT_SIZES.main.width, PRODUCT_SIZES.main.quality, file),
          resizeToWebP(img, PRODUCT_SIZES.thumbnail.width, PRODUCT_SIZES.thumbnail.quality, file)
        ]);

        // Generate file names based on actual blob type
        const baseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const mainExt = mainBlob.type === 'image/webp' ? '.webp' : '.jpg';
        const thumbExt = thumbnailBlob.type === 'image/webp' ? '.webp' : '.jpg';
        const mainFileName = `${baseName}-720${mainExt}`;
        const thumbnailFileName = `${baseName}-320${thumbExt}`;

        resolve({
          main: mainBlob,
          thumbnail: thumbnailBlob,
          mainFileName,
          thumbnailFileName
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Optimizes a single hero image to 940px main + 320px thumbnail
 * Chrome-only implementation for Posts/Resources hero images
 */
export async function optimizeHeroImage(file: File): Promise<OptimizedImages> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = async () => {
      try {
        // Generate both sizes in parallel
        const [mainBlob, thumbnailBlob] = await Promise.all([
          resizeToWebP(img, HERO_SIZES.main.width, HERO_SIZES.main.quality, file),
          resizeToWebP(img, HERO_SIZES.thumbnail.width, HERO_SIZES.thumbnail.quality, file)
        ]);

        // Generate file names based on actual blob type
        const baseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const mainExt = mainBlob.type === 'image/webp' ? '.webp' : '.jpg';
        const thumbExt = thumbnailBlob.type === 'image/webp' ? '.webp' : '.jpg';
        const mainFileName = `${baseName}-940${mainExt}`;
        const thumbnailFileName = `${baseName}-320${thumbExt}`;

        resolve({
          main: mainBlob,
          thumbnail: thumbnailBlob,
          mainFileName,
          thumbnailFileName
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Optimizes a single section image to 720px only (no thumbnail needed)
 * Chrome-only implementation for Posts/Resources section images
 */
export async function optimizeSectionImage(file: File): Promise<{ main: Blob; mainFileName: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = async () => {
      try {
        // Generate main size only
        const mainBlob = await resizeToWebP(img, SECTION_SIZES.main.width, SECTION_SIZES.main.quality, file);

        // Generate file name based on actual blob type
        const baseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const mainExt = mainBlob.type === 'image/webp' ? '.webp' : '.jpg';
        const mainFileName = `${baseName}-720${mainExt}`;

        resolve({
          main: mainBlob,
          mainFileName
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Smart resize with never upscale + WebP conversion only if smaller
 */
function resizeToWebP(img: HTMLImageElement, targetWidth: number, quality: number, originalFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    // Never upscale: use smaller of target width or original width
    const finalWidth = Math.min(targetWidth, img.width);
    const aspectRatio = img.height / img.width;
    const finalHeight = Math.round(finalWidth * aspectRatio);

    canvas.width = finalWidth;
    canvas.height = finalHeight;

    // Draw resized image
    ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

    // Convert to WebP first
    canvas.toBlob(
      async (webpBlob) => {
        if (!webpBlob) {
          reject(new Error('Failed to convert to WebP'));
          return;
        }

        // If WebP is smaller than original, use WebP
        if (webpBlob.size < originalFile.size) {
          console.log(`✅ WebP is smaller: ${webpBlob.size} < ${originalFile.size}, using WebP`);
          resolve(webpBlob);
        } else {
          // WebP is larger, create JPEG version instead
          console.log(`⚠️ WebP is larger: ${webpBlob.size} >= ${originalFile.size}, using JPEG`);
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) {
                resolve(jpegBlob);
              } else {
                // Fallback to WebP if JPEG fails
                resolve(webpBlob);
              }
            },
            'image/jpeg',
            quality
          );
        }
      },
      'image/webp',
      quality
    );
  });
}

/**
 * Optimizes an array of product gallery images for upload
 * Generates 720px main + 320px thumbnail for each image
 * Falls back to original files on any error
 */
export async function optimizeProductGallery(files: File[]): Promise<{ optimized: File[], original: File[] }> {
  const optimizedFiles: File[] = [];
  const originalFiles: File[] = [];

  for (const file of files) {
    try {
      const optimized = await optimizeProductImage(file);
      
      // Convert blobs to files with proper names
      const mainFile = new File([optimized.main], optimized.mainFileName, { type: 'image/webp' });
      const thumbnailFile = new File([optimized.thumbnail], optimized.thumbnailFileName, { type: 'image/webp' });
      
      optimizedFiles.push(mainFile, thumbnailFile);
      console.log(`✅ Optimized ${file.name} → ${optimized.mainFileName} + ${optimized.thumbnailFileName}`);
    } catch (error) {
      console.warn(`⚠️ Failed to optimize ${file.name}, using original:`, error);
      originalFiles.push(file);
    }
  }

  return {
    optimized: optimizedFiles,
    original: originalFiles
  };
}

/**
 * Optimizes a single hero image for Posts/Resources
 * Generates 940px main + 320px thumbnail
 * Falls back to original file on any error
 */
export async function optimizeHeroImageSafe(file: File): Promise<{ optimized: File[], original: File[] }> {
  const optimizedFiles: File[] = [];
  const originalFiles: File[] = [];

  try {
    const optimized = await optimizeHeroImage(file);
    
    // Convert blobs to files with proper names
    const mainFile = new File([optimized.main], optimized.mainFileName, { type: 'image/webp' });
    const thumbnailFile = new File([optimized.thumbnail], optimized.thumbnailFileName, { type: 'image/webp' });
    
    optimizedFiles.push(mainFile, thumbnailFile);
    console.log(`✅ Optimized hero ${file.name} → ${optimized.mainFileName} + ${optimized.thumbnailFileName}`);
  } catch (error) {
    console.warn(`⚠️ Failed to optimize hero ${file.name}, using original:`, error);
    originalFiles.push(file);
  }

  return {
    optimized: optimizedFiles,
    original: originalFiles
  };
}

/**
 * Optimizes an array of section images for Posts/Resources
 * Generates 720px main only (no thumbnails)
 * Falls back to original files on any error
 */
export async function optimizeSectionImages(files: File[]): Promise<{ optimized: File[], original: File[] }> {
  const optimizedFiles: File[] = [];
  const originalFiles: File[] = [];

  for (const file of files) {
    try {
      const optimized = await optimizeSectionImage(file);
      
      // Convert blob to file with proper name
      const mainFile = new File([optimized.main], optimized.mainFileName, { type: 'image/webp' });
      
      optimizedFiles.push(mainFile);
      console.log(`✅ Optimized section ${file.name} → ${optimized.mainFileName}`);
    } catch (error) {
      console.warn(`⚠️ Failed to optimize section ${file.name}, using original:`, error);
      originalFiles.push(file);
    }
  }

  return {
    optimized: optimizedFiles,
    original: originalFiles
  };
}

/**
 * Simple wrapper for backward compatibility - falls back to original upload on error
 */
export async function optimizeProductImageSafe(file: File): Promise<OptimizedImages | null> {
  try {
    return await optimizeProductImage(file);
  } catch (error) {
    console.warn('Image optimization failed, falling back to original upload:', error);
    return null;
  }
} 