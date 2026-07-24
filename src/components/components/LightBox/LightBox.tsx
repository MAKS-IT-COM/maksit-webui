import {
  type FC,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Masonry } from '../Masonry'

export interface LightBoxSlide {
  src: string
  alt?: string
  thumbnailSrc?: string
}

export interface LightBoxProps {
  slides: LightBoxSlide[]
  breakpoints?: number[]
  className?: string
}

const LightBox: FC<LightBoxProps> = ({
  slides,
  breakpoints = [350, 500, 750],
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const openAt = (slideIndex: number) => {
    setIndex(slideIndex)
    setIsOpen(true)
  }

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 < 0 ? slides.length - 1 : current - 1))
  }, [slides.length])

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1 > slides.length - 1 ? 0 : current + 1))
  }, [slides.length])

  useEffect(() => {
    if (!isOpen)
      return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape')
        close()
      else if (event.key === 'ArrowLeft')
        goPrev()
      else if (event.key === 'ArrowRight')
        goNext()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close, goPrev, goNext])

  if (slides.length === 0)
    return null

  const active = slides[index]

  return (
    <div className={className || undefined}>
      <Masonry breakpoints={breakpoints}>
        {slides.map((slide, slideIndex) => (
          <button
            key={`${slide.src}-${slideIndex}`}
            type={'button'}
            className={'block w-full overflow-hidden rounded focus:outline-none focus:ring-2 focus:ring-sky-500'}
            onClick={() => openAt(slideIndex)}
          >
            <img
              src={slide.thumbnailSrc ?? slide.src}
              alt={slide.alt ?? ''}
              className={'w-full cursor-pointer object-cover transition hover:opacity-90 hover:shadow-md'}
            />
          </button>
        ))}
      </Masonry>

      {isOpen && active ? (
        <div
          className={'fixed inset-0 z-50 flex flex-col bg-black/90'}
          role={'dialog'}
          aria-modal={true}
          aria-label={active.alt || 'Image viewer'}
        >
          <div className={'flex shrink-0 items-center justify-between px-4 py-3 text-white'}>
            <span className={'text-sm'}>
              {index + 1} / {slides.length}
            </span>
            <button
              type={'button'}
              className={'rounded p-1 hover:bg-white/10'}
              aria-label={'Close'}
              onClick={close}
            >
              <X className={'h-6 w-6'} />
            </button>
          </div>

          <div className={'relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-12'}>
            <button
              type={'button'}
              className={'absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20'}
              aria-label={'Previous image'}
              onClick={goPrev}
            >
              <ChevronLeft className={'h-7 w-7'} />
            </button>

            <img
              src={active.src}
              alt={active.alt ?? ''}
              className={'max-h-full max-w-full object-contain'}
            />

            <button
              type={'button'}
              className={'absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20'}
              aria-label={'Next image'}
              onClick={goNext}
            >
              <ChevronRight className={'h-7 w-7'} />
            </button>
          </div>

          {active.alt ? (
            <p className={'shrink-0 px-4 py-2 text-center text-sm text-gray-200'}>{active.alt}</p>
          ) : null}

          <div className={'shrink-0 border-t border-white/10 px-4 py-3'}>
            <div className={'flex gap-2 overflow-x-auto'}>
              {slides.map((slide, slideIndex) => (
                <button
                  key={`thumb-${slide.src}-${slideIndex}`}
                  type={'button'}
                  className={[
                    'h-16 w-24 shrink-0 overflow-hidden rounded border-2',
                    slideIndex === index ? 'border-sky-400' : 'border-transparent opacity-70 hover:opacity-100',
                  ].join(' ')}
                  onClick={() => setIndex(slideIndex)}
                >
                  <img
                    src={slide.thumbnailSrc ?? slide.src}
                    alt={slide.alt ?? ''}
                    className={'h-full w-full object-cover'}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { LightBox }
