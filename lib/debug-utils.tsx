// Debug utilities for the analyze page
export function debugDocumentData(documentData: any) {
  if (!documentData) {
    console.log('DEBUG: No document data provided')
    return
  }
  
  console.log('DEBUG: Document Data Structure:', {
    id: documentData.id,
    filename: documentData.filename,
    hasAnalysis: !!documentData.analysis,
    analysisKeys: documentData.analysis ? Object.keys(documentData.analysis) : [],
    riskScore: documentData.analysis?.riskScore,
    keyRisksType: Array.isArray(documentData.analysis?.keyRisks) ? 'array' : typeof documentData.analysis?.keyRisks,
    keyRisksLength: documentData.analysis?.keyRisks?.length,
    obligationsType: Array.isArray(documentData.analysis?.obligations) ? 'array' : typeof documentData.analysis?.obligations,
    rightsType: Array.isArray(documentData.analysis?.rights) ? 'array' : typeof documentData.analysis?.rights,
    keyTermsType: Array.isArray(documentData.analysis?.keyTerms) ? 'array' : typeof documentData.analysis?.keyTerms,
    recommendationsType: Array.isArray(documentData.analysis?.recommendations) ? 'array' : typeof documentData.analysis?.recommendations,
  })
  
  // Sample data from each array
  if (documentData.analysis?.keyRisks?.length > 0) {
    console.log('DEBUG: First key risk:', documentData.analysis.keyRisks[0])
  }
  if (documentData.analysis?.obligations?.length > 0) {
    console.log('DEBUG: First obligation:', documentData.analysis.obligations[0])
  }
  if (documentData.analysis?.rights?.length > 0) {
    console.log('DEBUG: First right:', documentData.analysis.rights[0])
  }
}

export function safeRenderArray<T>(
  items: T[] | undefined | null,
  renderItem: (item: T, index: number) => React.ReactNode,
  fallback?: React.ReactNode
): React.ReactNode {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback || null
  }
  
  return items.map((item, index) => {
    try {
      return renderItem(item, index)
    } catch (error) {
      console.error(`Error rendering item at index ${index}:`, error, item)
      return (
        <div key={index} className="text-red-500 text-sm p-2 border border-red-300 rounded">
          Error rendering item: {JSON.stringify(item)}
        </div>
      )
    }
  })
}
