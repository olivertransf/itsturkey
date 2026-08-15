export function multiPanelGuessMap(opts: {
  isActive: boolean
  playable: boolean
  isPanelDone: boolean
  hasBeenActive: boolean
}): { hideGuessMap: boolean; interactive: boolean } {
  if (opts.isPanelDone) {
    return { hideGuessMap: true, interactive: false }
  }

  return {
    hideGuessMap: !opts.isActive && !opts.hasBeenActive,
    interactive: opts.isActive && opts.playable,
  }
}
