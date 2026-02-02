import { useEffect } from 'react'

export function useModuleCss(loaders: (() => Promise<unknown>)[]) {
  useEffect(() => {
    const before = new Set(
      Array.from(document.querySelectorAll('style'))
    )

    Promise.all(loaders.map((l) => l()))

    return () => {
      const after = Array.from(document.querySelectorAll('style'))

      after.forEach((style) => {
        if (!before.has(style)) {
          style.remove()
        }
      })
    }
  }, [])
}
