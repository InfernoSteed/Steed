/**
 * Project Bins - Folder organization for media assets
 */

export interface Bin {
    id: string;
    name: string;
    color?: string;
    parentId?: string | null; // null for root bins
    assetIds: string[];
    createdAt: number;
    isExpanded?: boolean;
}

const STORAGE_KEY = 'gldnsteed_project_bins';

/**
 * Create a new bin
 */
export function createBin(name: string, parentId?: string, color?: string): Bin {
    return {
        id: `bin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        color,
        parentId: parentId || null,
        assetIds: [],
        createdAt: Date.now(),
        isExpanded: true
    };
}

/**
 * Load all bins
 */
export function loadBins(): Bin[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [createBin('Media', undefined, '#3B82F6')];
}

/**
 * Save bins
 */
export function saveBins(bins: Bin[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bins));
}

/**
 * Add bin
 */
export function addBin(bins: Bin[], bin: Bin): Bin[] {
    return [...bins, bin];
}

/**
 * Delete bin (and move assets to parent or root)
 */
export function deleteBin(bins: Bin[], binId: string): Bin[] {
    const binToDelete = bins.find(b => b.id === binId);
    if (!binToDelete) return bins;

    // Move assets to parent or root
    const parentBin = binToDelete.parentId
        ? bins.find(b => b.id === binToDelete.parentId)
        : bins.find(b => b.parentId === null);

    if (parentBin) {
        parentBin.assetIds.push(...binToDelete.assetIds);
    }

    // Delete bin and its children
    return bins.filter(b => b.id !== binId && b.parentId !== binId);
}

/**
 * Move asset between bins
 */
export function moveAssetToBin(
    bins: Bin[],
    assetId: string,
    fromBinId: string,
    toBinId: string
): Bin[] {
    return bins.map(bin => {
        if (bin.id === fromBinId) {
            return {
                ...bin,
                assetIds: bin.assetIds.filter(id => id !== assetId)
            };
        }
        if (bin.id === toBinId) {
            return {
                ...bin,
                assetIds: [...bin.assetIds, assetId]
            };
        }
        return bin;
    });
}

/**
 * Add asset to bin
 */
export function addAssetToBin(bins: Bin[], assetId: string, binId: string): Bin[] {
    return bins.map(bin => {
        if (bin.id === binId && !bin.assetIds.includes(assetId)) {
            return {
                ...bin,
                assetIds: [...bin.assetIds, assetId]
            };
        }
        return bin;
    });
}

/**
 * Remove asset from bin
 */
export function removeAssetFromBin(bins: Bin[], assetId: string, binId: string): Bin[] {
    return bins.map(bin => {
        if (bin.id === binId) {
            return {
                ...bin,
                assetIds: bin.assetIds.filter(id => id !== assetId)
            };
        }
        return bin;
    });
}

/**
 * Get bin by ID
 */
export function getBinById(bins: Bin[], binId: string): Bin | undefined {
    return bins.find(b => b.id === binId);
}

/**
 * Get child bins
 */
export function getChildBins(bins: Bin[], parentId: string | null): Bin[] {
    return bins.filter(b => b.parentId === parentId);
}

/**
 * Get root bins
 */
export function getRootBins(bins: Bin[]): Bin[] {
    return bins.filter(b => b.parentId === null);
}

/**
 * Search bins by name
 */
export function searchBins(bins: Bin[], query: string): Bin[] {
    const lowerQuery = query.toLowerCase();
    return bins.filter(b => b.name.toLowerCase().includes(lowerQuery));
}

/**
 * Toggle bin expansion
 */
export function toggleBinExpansion(bins: Bin[], binId: string): Bin[] {
    return bins.map(bin => {
        if (bin.id === binId) {
            return {
                ...bin,
                isExpanded: !bin.isExpanded
            };
        }
        return bin;
    });
}

/**
 * Rename bin
 */
export function renameBin(bins: Bin[], binId: string, newName: string): Bin[] {
    return bins.map(bin => {
        if (bin.id === binId) {
            return {
                ...bin,
                name: newName
            };
        }
        return bin;
    });
}

/**
 * Change bin color
 */
export function changeBinColor(bins: Bin[], binId: string, color: string): Bin[] {
    return bins.map(bin => {
        if (bin.id === binId) {
            return {
                ...bin,
                color
            };
        }
        return bin;
    });
}
