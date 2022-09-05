const useOnScroll = useCallback((e, ref) => {
  ref.current = MathUtils.clamp(
    MathUtils.mapLinear(window.scrollY, 0, windowHeight * 3, 1, 0),
    0,
    3
  )
}, [])
