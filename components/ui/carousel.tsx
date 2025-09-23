"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import type { EmblaOptionsType, EmblaCarouselType } from "embla-carousel"
import { cn } from "@/lib/utils"

type CarouselProps = {
  opts?: EmblaOptionsType
  className?: string
  children: React.ReactNode
}

export function Carousel({ opts, className, children }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(opts)

  return (
    <CarouselContext.Provider value={{ emblaApi }}>
      <div className={cn("overflow-hidden relative", className)} ref={emblaRef}>
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

type CarouselContentProps = {
  className?: string
  children: React.ReactNode
}

export function CarouselContent({ className, children }: CarouselContentProps) {
  return <div className={cn("flex", className)}>{children}</div>
}

type CarouselItemProps = {
  className?: string
  children: React.ReactNode
}

export function CarouselItem({ className, children }: CarouselItemProps) {
  return (
    <div className={cn("flex-[0_0_100%] min-w-0", className)}>
      {children}
    </div>
  )
}

/* -------------------- CONTEXT -------------------- */
type CarouselContextType = {
  emblaApi: EmblaCarouselType | undefined
}

const CarouselContext = React.createContext<CarouselContextType>({
  emblaApi: undefined,
})

function useCarousel() {
  return React.useContext(CarouselContext)
}

/* -------------------- BUTTONS -------------------- */
export function CarouselPrevious({ className }: { className?: string }) {
  const { emblaApi } = useCarousel()

  const handleClick = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  return (
    <button
      onClick={handleClick}
      className={cn(
        "absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full",
        className
      )}
    >
      ‹
    </button>
  )
}

export function CarouselNext({ className }: { className?: string }) {
  const { emblaApi } = useCarousel()

  const handleClick = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <button
      onClick={handleClick}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full",
        className
      )}
    >
      ›
    </button>
  )
}
