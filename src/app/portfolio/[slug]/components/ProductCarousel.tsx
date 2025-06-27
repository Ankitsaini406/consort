'use client';

import { Carousel, CarouselContent, CarouselDots, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { ImageRouter } from "@/utils/imageRouter";

interface ProductCarouselProps {
    images: string[];
    productName: string;
}

export default function ProductCarousel({ images, productName }: ProductCarouselProps) {
    if (!images || images.length === 0) {
        return (
            <div className="max-h-[280px] w-full grow shrink-0 basis-0 rounded-md bg-neutral-100 flex items-center justify-center mb-3 mobile:max-h-[156px]">
                <span className="text-neutral-500">No images available</span>
            </div>
        );
    }

    // For single image, don't use carousel
    if (images.length === 1) {
        return (
            <div className="relative max-h-[280px] w-full rounded-md mb-3 mobile:max-h-[200px] aspect-[4/3] overflow-hidden">
                <Image
                    className="object-contain w-full h-full p-6 mobile:p-1"
                    src={ImageRouter.forCarousel(images[0])}
                    alt={`${productName} - Product Image`}
                    fill
                    sizes="(max-width: 768px) 100vw, 448px"
                    priority
                />
            </div>
        );
    }

    return (
        <Carousel 
            className="w-full"
            opts={{
                align: "start",
                loop: true,
            }}
            plugins={[
                Autoplay({
                    delay: 3500,
                    stopOnInteraction: false,
                    stopOnMouseEnter: false,
                }),
            ]}
        >
            <CarouselContent>
                {images.map((image, index) => (
                    <CarouselItem key={index}>
                        <div className="relative max-h-[280px] w-full rounded-md mb-3 mobile:max-h-[200px] aspect-[4/3] overflow-hidden">
                            <Image
                                className="object-contain w-full h-full p-6 mobile:p-1"
                                src={ImageRouter.forCarousel(image)}
                                alt={`${productName} - Image ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 448px"
                                priority={index === 0}
                            />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselDots />
        </Carousel>
    );
} 