/** Official map removed from hub pickers (no deck / not offered). */
export const FAMOUS_LANDMARKS_MAP_ID = '6185dfd47b54baf63473a540'

export const MAP_PICKER_EXCLUDED_IDS = new Set<string>([FAMOUS_LANDMARKS_MAP_ID])

export const isMapExcludedFromPicker = (mapId: string): boolean => MAP_PICKER_EXCLUDED_IDS.has(mapId)
