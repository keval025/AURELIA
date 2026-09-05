'use client'

import { createElement, useEffect, useRef, useState } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

type RevealTag = 'div' | 'section' | 'article' | 'footer'

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: RevealTag
  delay?: number
  children: ReactNode
}

/**
 * Wraps children in a fade-in-on-scroll effect driven by IntersectionObserver.
 * Pure CSS transition (see `[data-reveal]` in globals.css) — no animation
 * dependency. Respects `prefers-reduced-motion` via the CSS media query.
 */
export function Reveal({ as = 'div', delay = 0, children, className, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const revealStyle: CSSProperties = delay ? { ...style, '--reveal-delay': `${delay}ms` } as CSSProperties : style ?? {}

  return createElement(
    as,
    { ref, 'data-reveal': visible, className, style: revealStyle, ...rest },
    children,
  )
}
