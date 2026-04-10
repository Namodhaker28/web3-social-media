"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

export interface PostImagesProps {
  /** When set, no images are shown (video takes precedence). */
  videoUrl?: string | null
  imageUrls?: string[] | null
  imageUrl?: string | null
  /** Feed cards use taller media; profile lists use compact height. */
  variant?: "feed" | "compact"
  className?: string
}

/**
 * Renders post still images: a single image, or an Embla carousel when there are multiple URLs.
 */
export function PostImages({
  videoUrl,
  imageUrls,
  imageUrl,
  variant = "feed",
  className,
}: PostImagesProps) {
  const urls = React.useMemo(() => {
    if (videoUrl) return []
    if (imageUrls?.length) return imageUrls
    if (imageUrl) return [imageUrl]
    return []
  }, [videoUrl, imageUrls, imageUrl])

  const imgClass =
    variant === "compact"
      ? "max-h-48 w-full rounded-lg object-cover"
      : "max-h-96 w-full rounded-lg object-cover"

  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!carouselApi) return
    const onSelect = () => setCurrent(carouselApi.selectedScrollSnap())
    onSelect()
    carouselApi.on("reInit", onSelect)
    carouselApi.on("select", onSelect)
    return () => {
      carouselApi.off("select", onSelect)
      carouselApi.off("reInit", onSelect)
    }
  }, [carouselApi])

  if (urls.length === 0) return null

  // Single image: no carousel chrome
  if (urls.length === 1) {
    return (
      <img
        src={urls[0]}
        alt=""
        className={cn("mt-3", imgClass, className)}
      />
    )
  }

  return (
    <div className={cn("mt-3", className)}>
      <Carousel
        setApi={setCarouselApi}
        opts={{ align: "start", loop: false }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {urls.map((url, i) => (
            <CarouselItem key={`${url}-${i}`} className="basis-full pl-0">
              <img src={url} alt="" className={imgClass} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          variant="secondary"
          className="left-2 top-1/2 h-8 w-8 -translate-y-1/2 border bg-background/90 shadow-sm"
        />
        <CarouselNext
          variant="secondary"
          className="right-2 top-1/2 h-8 w-8 -translate-y-1/2 border bg-background/90 shadow-sm"
        />
      </Carousel>
      {/* Dot indicators for slide position */}
      <div
        className="mt-2 flex justify-center gap-1.5"
        role="tablist"
        aria-label="Image slides"
      >
        {urls.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to image ${i + 1} of ${urls.length}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === current
                ? "w-4 bg-primary"
                : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
            )}
            onClick={() => carouselApi?.scrollTo(i)}
          />
        ))}
      </div>
    </div>
  )
}
